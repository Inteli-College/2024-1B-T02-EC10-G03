extern crate pretty_env_logger;
#[macro_use]
extern crate log;

#[allow(warnings, unused)]
mod db;
mod error;
mod features;
mod middlewares;
mod repositories;
mod routes;
mod states;
mod utils;

use crate::states::app::AppState;
use db::*;
use ntex::{
	http,
	web::{self, middleware, App},
};
use ntex_cors::Cors;
use redis;
use std::env;
use std::sync::Arc;
use tokio::sync::RwLock;

#[ntex::main]
async fn main() -> std::io::Result<()> {
	dotenvy::dotenv().ok();
	pretty_env_logger::init();

	info!("Starting server...");
	let database = PrismaClient::_builder().build().await.expect("Failed to connect to database");
	info!("Connected to database!");

	info!("Running migrations...");
	#[cfg(debug_assertions)]
	database._db_push().await.expect("Failed to push database schema");
	//#[cfg(not(debug_assertions))]
	//database._migrate_deploy().await.expect("Failed to migrate database schema");
	//info!("Database schema is up to date!");

	let redis = redis::Client::open(env::var("REDIS_URL").expect("REDIS_URL must be set"))
		.expect("Failed to connect to Redis")
		.get_multiplexed_async_connection()
		.await
		.expect("Failed to get Redis connection");

	let database = Arc::new(database);
	let repositories = repositories::Repositories::new(database.clone());

	let state = Arc::new(RwLock::new(AppState::new(database, redis, repositories)));

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
			.configure(routes::swagger::init)
			.configure(routes::pyxis::init)
			.configure(routes::medicine::init)
			.configure(routes::inventory::init)
			.configure(routes::user::init)
			.configure(routes::status::init)
			.configure(routes::patient_report::init)
			.configure(routes::transaction::init)
			.configure(routes::pyxis_report::init)
	})
	.bind("0.0.0.0:3000")?
	.run()
	.await
}
