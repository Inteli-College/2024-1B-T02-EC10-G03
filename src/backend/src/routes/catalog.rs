use crate::{db::*, AppState};
use ntex::web::{self, HttpResponse};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

#[derive(Serialize, Deserialize, Debug)]
struct MedicineInput {
	name: String,
}

#[web::get("/catalog")]
pub async fn get_all_catalog(state: web::types::State<Arc<AppState>>) -> HttpResponse {
	let medicine = state.db.medicine_name().find_many(vec![]).exec().await.unwrap();
	HttpResponse::Ok().json(&medicine)
}
#[web::get("/catalog/{uuid}")]
pub async fn get_catalog(state: web::types::State<Arc<AppState>>, uuid: web::types::Path<String>) -> HttpResponse {
	let medicine = state.db.medicine_name().find_unique(medicine_name::uuid::equals(uuid.into_inner())).exec().await.unwrap();
	HttpResponse::Ok().json(&medicine)
}
#[web::post("/catalog")]
pub async fn create_catalog(state: web::types::State<Arc<AppState>>, medicine: web::types::Json<MedicineInput>) -> HttpResponse {
	let medicine = state.db.medicine_name().create(medicine.name.to_string(), vec![]).exec().await.unwrap();
	HttpResponse::Created().json(&medicine)
}
#[web::delete("/catalog/{uuid}")]
pub async fn delete_catalog(state: web::types::State<Arc<AppState>>, uuid: web::types::Path<String>) -> HttpResponse {
	let medicine = state.db.medicine_name().delete(medicine_name::uuid::equals(uuid.into_inner())).exec().await.unwrap();
	HttpResponse::Ok().json(&medicine)
}
