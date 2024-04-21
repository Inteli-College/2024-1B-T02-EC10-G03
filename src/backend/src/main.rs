extern crate pretty_env_logger;
#[macro_use]
extern crate log;

#[allow(warnings, unused)]
mod db;

use db::*;
use ntex::{
	http,
	web::{self, middleware, App, HttpResponse},
};
use ntex_cors::Cors;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::sync::Arc;

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

	println!("Running migrations...");

	#[cfg(debug_assertions)]
	client._db_push().await.unwrap();

	println!("Migrating database...");

	#[cfg(not(debug_assertions))]
	client._migrate_deploy().await?;

	info!("Database schema is up to date!");

	let state = Arc::new(AppState::new(client));

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
	use prisma_client_rust::{queries::Result as QueryResult, MockStore};

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
