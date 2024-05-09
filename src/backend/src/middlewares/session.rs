use crate::{
	features::session::{SessionCookie, SessionInfo},
	utils::session::generate_session_id,
	AppState,
};
use cookie::{Cookie, CookieJar};
use ntex::service::{Middleware, Service, ServiceCtx};
use ntex::web::{self};
use redis::AsyncCommands;
use std::sync::Arc;
use time::Duration;

pub struct SessionMiddleware<S> {
	service: S,
	session: SessionCookie,
}

pub struct SessionMiddlewareBuilder {
	session: SessionCookie,
}

impl SessionMiddlewareBuilder {
	pub fn new(key: &[u8]) -> Self {
		Self { session: SessionCookie::new(key) }
	}
}

impl<S> Middleware<S> for SessionMiddlewareBuilder {
	type Service = SessionMiddleware<S>;

	fn create(&self, service: S) -> Self::Service {
		SessionMiddleware { service, session: self.session.clone() }
	}
}

impl<S, Err> Service<web::WebRequest<Err>> for SessionMiddleware<S>
where
	S: Service<web::WebRequest<Err>, Response = web::WebResponse, Error = web::Error>,
	Err: web::ErrorRenderer,
{
	type Response = web::WebResponse;
	type Error = web::Error;

	ntex::forward_poll_ready!(service);

	async fn call(&self, req: web::WebRequest<Err>, ctx: ServiceCtx<'_, Self>) -> Result<Self::Response, Self::Error> {
		let app_state = req.app_state::<Arc<AppState>>().unwrap();
		let mut redis = app_state.redis.clone();

		let cookie_str = req.headers().get("cookie").map(|h| h.to_str().unwrap_or("").to_string());

		let mut session_id: Option<String> = None;
		let has_session_id = cookie_str.is_some();

		if has_session_id {
			if let Some(cookie_str) = cookie_str {
				let cookie = Cookie::parse(cookie_str).ok();
				let mut jar = CookieJar::new();
				if let Some(cookie) = cookie {
					jar.add_original(cookie);
					if let Some(decoded) = jar.private(&self.session.get_key()).get(&self.session.get_name()) {
						session_id = Some(decoded.value().to_string());
					}
				}
			}
		}
		if session_id.is_none() {
			session_id = Some(generate_session_id());

			req.extensions_mut().insert(SessionInfo::new(None, session_id.as_ref().unwrap().to_string()));
		} else {
			let _: () = redis.expire(session_id.as_ref().unwrap(), Duration::days(1).as_seconds_f64() as i64).await.unwrap();

			let user_id = redis.get(session_id.as_ref().unwrap()).await;
			req.extensions_mut().insert(SessionInfo::new(user_id.ok(), session_id.as_ref().unwrap().to_string()));
		}

		let mut res = ctx.call(&self.service, req).await?;

		if let Some(session_id) = session_id {
			if !has_session_id {
				if let Err(e) = self.session.set_to_header(&session_id, &mut res) {
					log::error!("Error setting cookie header: {}", e);
				} else {
					info!("Set cookie header: {}", session_id);
				}
			}
		}

		Ok(res)
	}
}
