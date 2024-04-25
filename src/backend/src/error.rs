use ntex::{http, web};
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Clone, Debug, Serialize, Deserialize, ToSchema)]
pub struct HttpError {
	pub message: String,

	#[serde(skip)]
	pub status: http::StatusCode,
}

impl std::fmt::Display for HttpError {
	fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
		write!(f, "[{}] {}", self.status, self.message)
	}
}

impl std::error::Error for HttpError {}

impl web::WebResponseError for HttpError {
	fn error_response(&self, _: &web::HttpRequest) -> web::HttpResponse {
		web::HttpResponse::build(self.status).json(&self)
	}
}
