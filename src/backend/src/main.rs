extern crate pretty_env_logger;
#[macro_use]
extern crate log;

#[allow(warnings, unused)]
mod db;
mod error;
mod features;
mod middlewares;
mod routes;
mod utils;

mod auth;

use db::*;
use dotenvy_macro::dotenv;
use ntex::{
	http,
	web::{self, middleware, App, HttpRequest, HttpResponse},
};
use ntex_cors::Cors;
use redis;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::sync::{Arc, Mutex, MutexGuard};

pub struct AppState {
	db: PrismaClient,
	redis: redis::aio::MultiplexedConnection,
}

impl AppState {
	fn new(db: PrismaClient, redis: redis::aio::MultiplexedConnection) -> Self {
		Self { db, redis }
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

#[utoipa::path(
	get,
	path = "/",
	responses(
		(status = 200, description = "Success", body = IndexResponse),
		(status = 500, description = "Internal server error", body = HttpError)
	),
)]
#[web::get("/")]
async fn index(session_info: features::session::SessionInfo, req: HttpRequest) -> HttpResponse {
	info!("SessionInfo: {:?}", session_info);
	HttpResponse::Ok().json(&json!({ "message": "Hello world!" }))
}

async fn testing() -> HttpResponse {
	HttpResponse::Ok().json(&json!({ "message": "Hello world!" }))
}

#[ntex::main]
async fn main() -> std::io::Result<()> {
	dotenvy::dotenv().ok();
	pretty_env_logger::init();

	info!("Starting server...");
	let database = PrismaClient::_builder().build().await.unwrap();
	info!("Connected to database!");

	info!("Running migrations...");
	#[cfg(debug_assertions)]
	database._db_push().await.unwrap();
	#[cfg(not(debug_assertions))]
	database._migrate_deploy().await.unwrap();
	info!("Database schema is up to date!");

	let redis = redis::Client::open(dotenv!("REDIS_URL")).unwrap().get_multiplexed_async_connection().await.unwrap();

	let state = Arc::new(Mutex::new(AppState::new(database, redis)));

	info!("Server is running on http://0.0.0.0:3000");
	web::server(move || {
		App::new()
			.state(state.clone())
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
			.wrap(middlewares::session::SessionMiddlewareBuilder::new(&[0; 32]))
			.configure(routes::swagger::swagger_config)
			.configure(routes::pyxis::pyxis_config)
			.configure(routes::medicine::medicine_config)
			.configure(routes::inventory::inventory_config)
			.configure(routes::user::user_config)
			.service(index)
			.service(web::resource("/users")
				.route(web::get().to(testing))
				.wrap(auth::Login))
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
		let redis = redis::Client::open(dotenv!("REDIS_URL")).unwrap().get_multiplexed_async_connection().await.unwrap();
		let state = Arc::new(AppState::new(client, redis));
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
