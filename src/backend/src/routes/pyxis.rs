use crate::{db::*, AppState};
use ntex::web::{self, HttpResponse};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

#[derive(Serialize, Deserialize, Debug)]
struct PyxisInput {
	floor: i32,
	block: String,
}

#[web::get("/")]
async fn get_all_pyxis(state: web::types::State<Arc<AppState>>) -> HttpResponse {
	let pyxis = state.db.pyxis().find_many(vec![]).exec().await.unwrap();
	HttpResponse::Ok().json(&pyxis)
}

#[web::get("/{id}")]
async fn get_pyxis(state: web::types::State<Arc<AppState>>, id: web::types::Path<String>) -> HttpResponse {
	let id_string = id.into_inner();
	let position = id_string.chars().position(|c| c.is_alphabetic()).unwrap();
	let (floor, block) = id_string.split_at(position);

	let pyxis = state
		.db
		.pyxis()
		.find_first(vec![pyxis::floor::equals(floor.parse().unwrap()), pyxis::block::equals(block.to_string())])
		.exec()
		.await
		.unwrap();
	HttpResponse::Ok().json(&pyxis)
}

#[web::post("/")]
async fn create_pyxis(state: web::types::State<Arc<AppState>>, pyxis: web::types::Json<PyxisInput>) -> HttpResponse {
	let pyxis = state.db.pyxis().create(pyxis.floor, pyxis.block.to_string().to_uppercase(), vec![]).exec().await.unwrap();
	HttpResponse::Created().json(&pyxis)
}

#[web::delete("/{id}")]
async fn delete_pyxis(state: web::types::State<Arc<AppState>>, id: web::types::Path<String>) -> HttpResponse {
	let id_string = id.into_inner();
	let position = id_string.chars().position(|c| c.is_alphabetic()).unwrap();
	let (floor, block) = id_string.split_at(position);

	let pyxis_uuid = state
		.db
		.pyxis()
		.find_first(vec![pyxis::floor::equals(floor.parse().unwrap()), pyxis::block::equals(block.to_string())])
		.exec()
		.await
		.unwrap()
		.unwrap()
		.uuid;

	let pyxis = state.db.pyxis().delete(pyxis::uuid::equals(pyxis_uuid)).exec().await.unwrap();
	HttpResponse::Ok().json(&pyxis)
}

pub fn pyxis_config(config: &mut web::ServiceConfig) {
	config.service(web::scope("/pyxis").service(get_all_pyxis).service(get_pyxis).service(create_pyxis).service(delete_pyxis));
}
