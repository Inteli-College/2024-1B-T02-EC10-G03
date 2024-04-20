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

	#[ntex::test]
	async fn test_get_users() -> QueryResult<()> {
		let (state, mock) = setup_mock().await;
		let app = App::new().state(state.clone()).service(get_users);
		let app = test::init_service(app).await;

		mock.expect(
			state.db.users().find_many(vec![]),
			vec![users::Data { id: 1, name: "ViniciosLugli".to_string(), email: "vinicioslugli@gmail.com".to_string() }],
		)
		.await;

		let req = test::TestRequest::get().uri("/user").to_request();
		let resp = app.call(req).await.unwrap();

		assert_eq!(resp.status(), http::StatusCode::OK);

		let bytes = test::read_body(resp).await;
		let users: Vec<User> = serde_json::from_slice(&bytes).unwrap();

		assert_eq!(users, vec![User { id: 1, name: "ViniciosLugli".to_string(), email: "vinicioslugli@gmail.com".to_string() }]);

		Ok(())
	}

	#[ntex::test]
	async fn test_create_user() -> QueryResult<()> {
		let (state, mock) = setup_mock().await;
		let app = App::new().state(state.clone()).service(create_user);
		let app = test::init_service(app).await;

		let new_user = UserInput { name: "ViniciosLugli".to_string(), email: "vinicioslugli@gmail.com".to_string() };

		mock.expect(
			state.db.users().create(new_user.name.clone(), new_user.email.clone(), vec![]),
			users::Data { id: 2, name: new_user.name.clone(), email: new_user.email.clone() },
		)
		.await;

		let req = test::TestRequest::post().uri("/user").set_json(&serde_json::to_value(&new_user).unwrap()).to_request();
		let resp = app.call(req).await.unwrap();

		assert_eq!(resp.status(), http::StatusCode::CREATED);

		let bytes = test::read_body(resp).await;
		let user: User = serde_json::from_slice(&bytes).unwrap();

		assert_eq!(user, User { id: 2, name: "ViniciosLugli".to_string(), email: "vinicioslugli@gmail.com".to_string() });

		Ok(())
	}

	#[ntex::test]
	async fn test_delete_user() -> QueryResult<()> {
		let (state, mock) = setup_mock().await;
		let app = App::new().state(state.clone()).service(delete_user);
		let app = test::init_service(app).await;

		let user_id = 1;

		mock.expect(
			state.db.users().delete(users::id::equals(user_id)),
			users::Data { id: 1, name: "ViniciosLugli".to_string(), email: "vinicioslugli@gmail.com".to_string() },
		)
		.await;

		let req = test::TestRequest::delete().uri(&format!("/user/{}", user_id)).to_request();
		let resp = app.call(req).await.unwrap();

		assert_eq!(resp.status(), http::StatusCode::OK);

		let bytes = test::read_body(resp).await;
		let user: User = serde_json::from_slice(&bytes).unwrap();

		assert_eq!(user, User { id: 1, name: "ViniciosLugli".to_string(), email: "vinicioslugli@gmail.com".to_string() });

		Ok(())
	}
}
