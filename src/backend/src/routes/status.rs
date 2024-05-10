use ntex::web::{self, HttpResponse};
use serde_json::json;

use crate::error::HttpError;

#[web::get("/")]
async fn index() -> Result<HttpResponse, HttpError> {
	Ok(HttpResponse::Ok().json(&json!({ "status": "ok" })))
}

pub fn init(config: &mut web::ServiceConfig) {
	config.service(index);
}
