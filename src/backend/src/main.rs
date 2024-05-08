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

#[derive(Serialize, Deserialize, Debug)]
struct PyxisInput {
	floor: i32,
	block: String,
}

#[derive(Serialize, Deserialize, Debug)]
struct MedicineInput {
	name: String,
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
#[web::get("/pyxis")]
async fn get_all_pyxis(state: web::types::State<Arc<AppState>>) -> HttpResponse {
	let pyxis = state.db.pyxis().find_many(vec![]).exec().await.unwrap();
	HttpResponse::Ok().json(&pyxis)
}
#[web::get("/pyxis/{uuid}")]
async fn get_pyxis(state: web::types::State<Arc<AppState>>, uuid: web::types::Path<String>) -> HttpResponse {
	let pyxis = state.db.pyxis().find_unique(pyxis::uuid::equals(uuid.into_inner())).exec().await.unwrap();
	HttpResponse::Ok().json(&pyxis)
}
#[web::post("/pyxis")]
async fn create_pyxis(state: web::types::State<Arc<AppState>>, pyxis: web::types::Json<PyxisInput>) -> HttpResponse {
	let pyxis = state.db.pyxis().create(pyxis.floor, pyxis.block.to_string(), vec![]).exec().await.unwrap();
	HttpResponse::Created().json(&pyxis)
}
#[web::delete("/pyxis/{uuid}")]
async fn delete_pyxis(state: web::types::State<Arc<AppState>>, uuid: web::types::Path<String>) -> HttpResponse {
	let pyxis = state.db.pyxis().delete(pyxis::uuid::equals(uuid.into_inner())).exec().await.unwrap();
	HttpResponse::Ok().json(&pyxis)
}
#[web::get("/catalog")]
async fn get_all_catalog(state: web::types::State<Arc<AppState>>) -> HttpResponse {
	let medicine = state.db.medicine_name().find_many(vec![]).exec().await.unwrap();
	HttpResponse::Ok().json(&medicine)
}
#[web::get("/catalog/{uuid}")]
async fn get_catalog(state: web::types::State<Arc<AppState>>, uuid: web::types::Path<String>) -> HttpResponse {
	let medicine = state.db.medicine_name().find_unique(medicine_name::uuid::equals(uuid.into_inner())).exec().await.unwrap();
	HttpResponse::Ok().json(&medicine)
}
#[web::post("/catalog")]
async fn create_catalog(state: web::types::State<Arc<AppState>>, medicine: web::types::Json<MedicineInput>) -> HttpResponse {
	let medicine = state.db.medicine_name().create(medicine.name.to_string(), vec![]).exec().await.unwrap();
	HttpResponse::Created().json(&medicine)
}
#[web::delete("/catalog/{uuid}")]
async fn delete_catalog(state: web::types::State<Arc<AppState>>, uuid: web::types::Path<String>) -> HttpResponse {
	let medicine = state.db.medicine_name().delete(medicine_name::uuid::equals(uuid.into_inner())).exec().await.unwrap();
	HttpResponse::Ok().json(&medicine)
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
			
			.service(get_all_pyxis)
			.service(get_pyxis)
			.service(create_pyxis)
			.service(delete_pyxis)

			.service(get_all_catalog)
			.service(get_catalog)
			.service(create_catalog)
			.service(delete_catalog)
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
