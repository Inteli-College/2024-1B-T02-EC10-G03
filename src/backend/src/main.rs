extern crate pretty_env_logger;
#[macro_use]
extern crate log;

#[allow(warnings, unused)]
mod db;

mod error;

use db::*;
use error::HttpError;
use ntex::{
	http,
	util::Bytes,
	web::{self, middleware, App, HttpResponse},
};
use ntex_cors::Cors;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::sync::Arc;
use utoipa::{OpenApi, ToSchema};

struct AppState {
	db: PrismaClient,
}

impl AppState {
	fn new(db: PrismaClient) -> Self {
		Self { db }
	}
}

#[derive(Serialize, Deserialize, Debug)]
struct UserInput {
	name: String,
	email: String,
}

#[derive(Serialize, Deserialize, PartialEq, Debug)]
struct User {
	id: i32,
	name: String,
	email: String,
}

#[derive(ToSchema)]
struct IndexResponse {
	message: String,
}

#[derive(OpenApi)]
#[openapi(paths(index), components(schemas(IndexResponse, HttpError)))]
struct ApiDoc;

#[web::get("/{tail}*")]
async fn get_swagger(
	tail: web::types::Path<String>,
	openapi_conf: web::types::State<Arc<utoipa_swagger_ui::Config<'static>>>,
) -> Result<web::HttpResponse, HttpError> {
	if tail.as_ref() == "swagger.json" {
		let spec = ApiDoc::openapi().to_json().map_err(|err| HttpError {
			status: http::StatusCode::INTERNAL_SERVER_ERROR,
			message: format!("Error generating OpenAPI spec: {}", err),
		})?;
		return Ok(web::HttpResponse::Ok().content_type("application/json").body(spec));
	}
	let conf = openapi_conf.as_ref().clone();
	match utoipa_swagger_ui::serve(&tail, conf.into()).map_err(|err| HttpError {
		message: format!("Error serving Swagger UI: {}", err),
		status: http::StatusCode::INTERNAL_SERVER_ERROR,
	})? {
		None => Err(HttpError { status: http::StatusCode::NOT_FOUND, message: format!("path not found: {}", tail) }),
		Some(file) => Ok({
			let bytes = Bytes::from(file.bytes.to_vec());
			web::HttpResponse::Ok().content_type(file.content_type).body(bytes)
		}),
	}
}

pub fn ntex_swagger_config(config: &mut web::ServiceConfig) {
	let swagger_config = Arc::new(utoipa_swagger_ui::Config::new(["/swagger/swagger.json"]).use_base_layout());
	config.service(web::scope("/swagger/").state(swagger_config).service(get_swagger));
}

#[utoipa::path(
	get,
	path = "/",
	responses(
		(status = 200, description = "Success", body = IndexResponse),
		(status = 500, description = "Internal server error", body = HttpError)
	),
)]
#[web::get("/")]
async fn index() -> HttpResponse {
	HttpResponse::Ok().json(&json!({ "message": "Hello world!" }))
}

#[ntex::main]
async fn main() -> std::io::Result<()> {
	dotenvy::dotenv().ok();
	pretty_env_logger::init();

	info!("Starting server...");
	let client = PrismaClient::_builder().build().await.unwrap();
	info!("Connected to database!");

	info!("Running migrations...");
	#[cfg(debug_assertions)]
	client._db_push().await.unwrap();
	#[cfg(not(debug_assertions))]
	client._migrate_deploy().await.unwrap();
	info!("Database schema is up to date!");

	let state = Arc::new(AppState::new(client));

	info!("Server is running on http://0.0.0.0:3000");
	web::server(move || {
		App::new()
			.state(state.clone())
			.configure(ntex_swagger_config)
			.wrap(middleware::Logger::default())
			.wrap(
				Cors::new()
					.allowed_origin("*")
					.allowed_methods(vec!["GET", "POST", "DELETE"])
					.allowed_headers(vec![http::header::ACCEPT])
					.allowed_header(http::header::CONTENT_TYPE)
					.max_age(3600)
					.finish(),
			)
			.service(index)
	})
	.bind("0.0.0.0:3000")?
	.run()
	.await
}
#[cfg(test)]
mod tests {
	use super::*;
	use ntex::web::{test, App, Error};
	use prisma_client_rust::MockStore;

	async fn setup_mock() -> (Arc<AppState>, MockStore) {
		let (client, mock) = PrismaClient::_mock();
		let state = Arc::new(AppState::new(client));
		(state, mock)
	}

	#[ntex::test]
	async fn test_index() -> Result<(), Error> {
		let app = App::new().service(index);
		let app = test::init_service(app).await;

		let req = test::TestRequest::get().uri("/").to_request();
		let resp = app.call(req).await.unwrap();

		assert_eq!(resp.status(), http::StatusCode::OK);

		let bytes = test::read_body(resp).await;

		let json = serde_json::from_slice::<serde_json::Value>(&bytes)?;
		assert_eq!(json, json!({ "message": "Hello world!" }));

		Ok(())
	}
}
