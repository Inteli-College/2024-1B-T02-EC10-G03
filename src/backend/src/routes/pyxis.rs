use crate::{db::*, AppState};
use ntex::web::{self, HttpResponse};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

#[derive(Serialize, Deserialize, Debug)]
struct PyxisInput {
	floor: i32,
	block: String,
}
#[web::get("/pyxis")]
pub async fn get_all_pyxis(state: web::types::State<Arc<AppState>>) -> HttpResponse {
	let pyxis = state.db.pyxis().find_many(vec![]).exec().await.unwrap();
	HttpResponse::Ok().json(&pyxis)
}
#[web::get("/pyxis/{uuid}")]
pub async fn get_pyxis(state: web::types::State<Arc<AppState>>, uuid: web::types::Path<String>) -> HttpResponse {
	let pyxis = state.db.pyxis().find_unique(pyxis::uuid::equals(uuid.into_inner())).exec().await.unwrap();
	HttpResponse::Ok().json(&pyxis)
}
#[web::post("/pyxis")]
pub async fn create_pyxis(state: web::types::State<Arc<AppState>>, pyxis: web::types::Json<PyxisInput>) -> HttpResponse {
	let pyxis = state.db.pyxis().create(pyxis.floor, pyxis.block.to_string(), vec![]).exec().await.unwrap();
	HttpResponse::Created().json(&pyxis)
}
#[web::delete("/pyxis/{uuid}")]
pub async fn delete_pyxis(state: web::types::State<Arc<AppState>>, uuid: web::types::Path<String>) -> HttpResponse {
	let pyxis = state.db.pyxis().delete(pyxis::uuid::equals(uuid.into_inner())).exec().await.unwrap();
	HttpResponse::Ok().json(&pyxis)
}
