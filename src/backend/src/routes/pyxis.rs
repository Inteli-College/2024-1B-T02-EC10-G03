use crate::{db::*, error::HttpError, AppState};
use ntex::web::{self, HttpResponse};
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};

#[derive(Serialize, Deserialize, Debug)]
struct PyxisInput {
	floor: i32,
	block: String,
}

#[web::get("/")]
async fn get_all_pyxis(state: web::types::State<Arc<Mutex<AppState>>>) -> Result<HttpResponse, HttpError> {
	let app_state = state.lock().unwrap();

	let pyxis = app_state.db.pyxis().find_many(vec![]).exec().await.unwrap();
	Ok(HttpResponse::Ok().json(&pyxis))
}

#[web::get("/{id}")]
async fn get_pyxis(
	state: web::types::State<Arc<Mutex<AppState>>>,
	id: web::types::Path<String>,
) -> Result<HttpResponse, HttpError> {
	let app_state = state.lock().unwrap();

	let id_string = id.into_inner();
	let position = id_string.chars().position(|c| c.is_alphabetic()).unwrap();
	let (floor, block) = id_string.split_at(position);

	let pyxis = app_state
		.db
		.pyxis()
		.find_first(vec![pyxis::floor::equals(floor.parse().unwrap()), pyxis::block::equals(block.to_string())])
		.exec()
		.await
		.unwrap();

	if pyxis.is_none() {
		return Err(HttpError::not_found("Pyxis not found"));
	}

	Ok(HttpResponse::Ok().json(&pyxis))
}

#[web::post("/")]
async fn create_pyxis(
	state: web::types::State<Arc<Mutex<AppState>>>,
	pyxis: web::types::Json<PyxisInput>,
) -> Result<HttpResponse, HttpError> {
	let app_state = state.lock().unwrap();
	let pyxis = app_state.db.pyxis().create(pyxis.floor, pyxis.block.to_string().to_uppercase(), vec![]).exec().await;
	if pyxis.is_err() {
		return Err(HttpError::internal_server_error("Error creating pyxis"));
	}
	Ok(HttpResponse::Created().json(&pyxis.unwrap()))
}

#[web::delete("/{id}")]
async fn delete_pyxis(
	state: web::types::State<Arc<Mutex<AppState>>>,
	id: web::types::Path<String>,
) -> Result<HttpResponse, HttpError> {
	let app_state = state.lock().unwrap();
	let id_string = id.into_inner();
	let position = id_string.chars().position(|c| c.is_alphabetic()).unwrap();
	let (floor, block) = id_string.split_at(position);

	let pyxis = app_state
		.db
		.pyxis()
		.find_first(vec![pyxis::floor::equals(floor.parse().unwrap()), pyxis::block::equals(block.to_string())])
		.exec()
		.await
		.unwrap();

	let pyxis_uuid = match pyxis {
		Some(pyxis) => pyxis.uuid,
		None => return Err(HttpError::not_found("Pyxis not found")),
	};

	let pyxis = app_state.db.pyxis().delete(pyxis::uuid::equals(pyxis_uuid)).exec().await.unwrap();
	Ok(HttpResponse::Ok().json(&pyxis))
}

pub fn init(config: &mut web::ServiceConfig) {
	config.service(web::scope("/pyxis").service(get_all_pyxis).service(get_pyxis).service(create_pyxis).service(delete_pyxis));
}
