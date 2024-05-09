use std::convert::Infallible;

use cookie::{Cookie, CookieJar, Key, SameSite};
use ntex::http::header::{HeaderValue, SET_COOKIE};
use ntex::http::Payload;
use ntex::web::{ErrorRenderer, FromRequest, HttpRequest, WebResponse};
use serde_json::Error as JsonError;
use thiserror::Error;
use time::{Duration, OffsetDateTime};

#[derive(Debug, Clone)]
pub struct SessionInfo {
	user_id: Option<String>,
	session_id: String,
}

impl SessionInfo {
	pub fn new(user_id: Option<String>, session_id: String) -> Self {
		Self { user_id, session_id }
	}

	pub fn get_user_id(&self) -> Option<&String> {
		self.user_id.as_ref()
	}

	pub fn get_session_id(&self) -> &str {
		&self.session_id
	}
}

impl<Err: ErrorRenderer> FromRequest<Err> for SessionInfo {
	type Error = Infallible;

	#[inline]
	async fn from_request(req: &HttpRequest, _: &mut Payload) -> Result<SessionInfo, Infallible> {
		Ok(req.extensions().get::<SessionInfo>().unwrap().clone())
	}
}

#[derive(Error, Debug)]
pub enum CookieSessionError {
	#[error("Size of the serialized session is greater than 4000 bytes.")]
	Overflow,
	#[error("Failed to serialize session: {0}")]
	Serialize(#[from] JsonError),
	#[error("Error occurred: {0}")]
	Other(String),
}

#[derive(Clone)]
pub struct SessionCookie {
	key: Key,
	name: String,
	path: String,
	domain: Option<String>,
	secure: bool,
	http_only: bool,
	max_age: Option<Duration>,
	expires_in: Option<Duration>,
	same_site: Option<SameSite>,
}

impl SessionCookie {
	pub fn new(key: &[u8]) -> Self {
		Self {
			key: Key::derive_from(key),
			name: "session_id".to_owned(),
			path: "/".to_owned(),
			domain: None,
			secure: false,
			http_only: true,
			max_age: Some(Duration::days(1)),
			expires_in: Some(Duration::days(1)),
			same_site: None,
		}
	}

	pub fn name(mut self, name: &str) -> Self {
		self.name = name.to_owned();
		self
	}

	pub fn path(mut self, path: &str) -> Self {
		self.path = path.to_owned();
		self
	}

	pub fn domain(mut self, domain: &str) -> Self {
		self.domain = Some(domain.to_owned());
		self
	}

	pub fn secure(mut self, secure: bool) -> Self {
		self.secure = secure;
		self
	}

	pub fn http_only(mut self, http_only: bool) -> Self {
		self.http_only = http_only;
		self
	}

	pub fn max_age(mut self, max_age: Duration) -> Self {
		self.max_age = Some(max_age);
		self
	}

	pub fn expires_in(mut self, expires_in: Duration) -> Self {
		self.expires_in = Some(expires_in);
		self
	}

	pub fn same_site(mut self, same_site: SameSite) -> Self {
		self.same_site = Some(same_site);
		self
	}

	pub fn build(self) -> Self {
		self
	}

	pub fn get_key(&self) -> Key {
		self.key.clone()
	}

	pub fn get_name(&self) -> &str {
		&self.name
	}

	pub fn get_expires_in(&self) -> Option<Duration> {
		self.expires_in
	}

	pub fn set_to_header(&self, value: &str, res: &mut WebResponse) -> Result<(), CookieSessionError> {
		let mut cookie = Cookie::new(self.name.clone(), value.to_string());
		cookie.set_path(self.path.clone());
		cookie.set_secure(self.secure);
		cookie.set_http_only(self.http_only);
		cookie.set_max_age(self.max_age);
		cookie.set_same_site(self.same_site);

		if let Some(domain) = &self.domain {
			cookie.set_domain(domain.clone());
		}
		if let Some(expires_in) = self.expires_in {
			cookie.set_expires(OffsetDateTime::now_utc() + expires_in);
		}

		let mut jar = CookieJar::new();
		jar.private_mut(&self.key).add(cookie.clone());

		for cookie in jar.delta() {
			let val = HeaderValue::from_str(&cookie.to_string())
				.map_err(|e| CookieSessionError::Other(format!("Error setting cookie header: {}", e)))?;
			res.headers_mut().append(SET_COOKIE, val);
		}

		Ok(())
	}
}
