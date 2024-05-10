use std::sync::Arc;

use crate::error::HttpError;
use ntex::{
	http,
	util::Bytes,
	web::{self, HttpResponse},
};
use utoipa::{OpenApi, ToSchema};

#[derive(OpenApi)]
#[openapi(components(schemas(HttpError)))]
struct ApiDoc;

#[web::get("/{tail}*")]
async fn get_swagger(
	tail: web::types::Path<String>,
	openapi_conf: web::types::State<Arc<utoipa_swagger_ui::Config<'static>>>,
) -> Result<HttpResponse, HttpError> {
	if tail.as_ref() == "swagger.json" {
		let spec = ApiDoc::openapi()
			.to_json()
			.map_err(|err| HttpError::internal_server_error(&format!("Error generating OpenAPI spec: {}", err)))?;
		return Ok(HttpResponse::Ok().content_type("application/json").body(spec));
	}
	let conf = openapi_conf.as_ref().clone();
	match utoipa_swagger_ui::serve(&tail, conf.into())
		.map_err(|err| HttpError::internal_server_error(&format!("Error serving Swagger UI: {}", err)))?
	{
		None => Err(HttpError::not_found(&format!("File not found: {}", tail))),
		Some(file) => Ok({
			let bytes = Bytes::from(file.bytes.to_vec());
			HttpResponse::Ok().content_type(file.content_type).body(bytes)
		}),
	}
}

pub fn init(config: &mut web::ServiceConfig) {
	let swagger_config = Arc::new(utoipa_swagger_ui::Config::new(["/swagger/swagger.json"]).use_base_layout());
	config.service(web::scope("/swagger/").state(swagger_config).service(get_swagger));
}
