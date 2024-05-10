use crate::{db::*, error::HttpError, AppState};
use ntex::web::{self, HttpResponse};
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};

#[derive(Serialize, Deserialize, Debug)]
struct MedicineInput {
	names: Vec<String>,
	id: String,
}

#[web::get("/")]
pub async fn get_all_medicine(state: web::types::State<Arc<Mutex<AppState>>>) -> Result<web::HttpResponse, HttpError> {
	let app_state = state.lock().unwrap();
	let medicine = app_state.db.medicine().find_many(vec![]).with(medicine::medicine_names::fetch(vec![])).exec().await.unwrap();
	Ok(HttpResponse::Ok().json(&medicine))
}

#[web::get("/{id}")]
pub async fn get_medicine(
	state: web::types::State<Arc<Mutex<AppState>>>,
	id: web::types::Path<String>,
) -> Result<web::HttpResponse, HttpError> {
	let app_state: std::sync::MutexGuard<AppState> = state.lock().unwrap();
	let medicine = app_state
		.db
		.medicine()
		.find_unique(medicine::id::equals(id.into_inner()))
		.with(medicine::medicine_names::fetch(vec![]))
		.exec()
		.await
		.unwrap();
	if medicine.is_none() {
		return Err(HttpError::not_found("Medicine not found"));
	}
	Ok(HttpResponse::Ok().json(&medicine))
}

#[web::post("/")]
pub async fn create_medicine(
	state: web::types::State<Arc<Mutex<AppState>>>,
	medicine: web::types::Json<MedicineInput>,
) -> Result<web::HttpResponse, HttpError> {
	let app_state = state.lock().unwrap();

	let name_creations =
		medicine.names.iter().map(|name| medicine_name::create_unchecked(name.to_string(), vec![])).collect::<Vec<_>>();

	let medicines_name = app_state.db.medicine_name().create_many(name_creations).exec().await;

	if medicines_name.is_err() {
		return Err(HttpError::internal_server_error("Error creating medicine names"));
	}

	let connect_params = medicine.names.iter().map(|name| medicine_name::name::equals(name.to_string())).collect::<Vec<_>>();
	let medicine_created = app_state
		.db
		.medicine()
		.create(medicine.id.clone(), vec![medicine::medicine_names::connect(connect_params)])
		.with(medicine::medicine_names::fetch(vec![]))
		.exec()
		.await;

	if medicine_created.is_err() {
		return Err(HttpError::internal_server_error("Error creating medicine"));
	}

	Ok(HttpResponse::Created().json(&medicine_created))
}

#[web::delete("/{id}")]
pub async fn delete_medicine(
	state: web::types::State<Arc<Mutex<AppState>>>,
	id: web::types::Path<String>,
) -> Result<web::HttpResponse, HttpError> {
	let app_state = state.lock().unwrap();

	let medicine = app_state
		.db
		.medicine()
		.delete(medicine::id::equals(id.into_inner()))
		.with(medicine::medicine_names::fetch(vec![]))
		.exec()
		.await;

	if medicine.is_err() {
		return Err(HttpError::not_found("Medicine not found"));
	}

	let medicine = medicine.unwrap();

	let delete_params = medicine
		.clone()
		.medicine_names
		.unwrap()
		.iter()
		.map(|data| medicine_name::name::equals(data.name.clone()))
		.collect::<Vec<_>>();

	for name in delete_params {
		app_state.db.medicine_name().delete(name).exec().await.unwrap();
	}

	Ok(HttpResponse::Ok().json(&medicine))
}

pub fn medicine_config(config: &mut web::ServiceConfig) {
	config.service(
		web::scope("/medicine").service(get_all_medicine).service(get_medicine).service(create_medicine).service(delete_medicine),
	);
}
