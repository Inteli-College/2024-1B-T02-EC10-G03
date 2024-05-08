use std::rc::Rc;

use crate::AppData;
use cookie::Cookie;
use ntex::service::{Middleware, Service, ServiceCtx};
use ntex::web;
pub struct Session;

impl<S> Middleware<S> for Session {
	type Service = SessionMiddleware<S>;

	fn create(&self, service: S) -> Self::Service {
		SessionMiddleware { service }
	}
}

pub struct SessionMiddleware<S> {
	service: S,
}

impl<S, Err> Service<web::WebRequest<Err>> for SessionMiddleware<S>
where
	S: Service<web::WebRequest<Err>, Response = web::WebResponse, Error = web::Error>,
	Err: web::ErrorRenderer,
{
	type Response = web::WebResponse;
	type Error = web::Error;

	ntex::forward_poll_ready!(service);

	async fn call(&self, mut req: web::WebRequest<Err>, ctx: ServiceCtx<'_, Self>) -> Result<Self::Response, Self::Error> {
		let redis = req.app_state::<Rc<AppData>>().unwrap().redis;

		let user_id: Option<usize> = None;

		if let Some(cookie_header) = req.headers().get("cookie") {
			if let Ok(cookie_str) = cookie_header.to_str() {
				if let Ok(cookie) = Cookie::parse(cookie_str) {
					let session_id: String = cookie.value().to_owned();

					req.extensions_mut().insert(session_id);
				}
			}
		}

		let res = ctx.call(&self.service, req).await?;
		Ok(res)
	}
}
