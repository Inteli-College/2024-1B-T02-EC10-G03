use crate::{error::HttpError, states::app::AppStateType};
use ntex::web::{self, HttpResponse};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
struct MedicineInput {
	id: String,
	names: Vec<String>,
}

#[web::get("/")]
pub async fn get_all_medicine(state: web::types::State<AppStateType>) -> Result<HttpResponse, HttpError> {
	let app_state = state.read().await;

	let medicines = match app_state.repositories.medicine.get_all().await {
		Ok(medicine) => medicine,
		Err(_) => return Err(HttpError::internal_server_error("Failed to get medicines")),
	};

	Ok(HttpResponse::Ok().json(&medicines))
}

#[web::get("/{id}")]
pub async fn get_medicine(
	state: web::types::State<AppStateType>,
	id: web::types::Path<String>,
) -> Result<HttpResponse, HttpError> {
	let app_state = state.read().await;

	let medicine = match app_state.repositories.medicine.get(id.into_inner()).await {
		Ok(medicine) => medicine,
		Err(_) => return Err(HttpError::internal_server_error("Failed to get medicine")),
	};

	match medicine {
		Some(medicine) => Ok(HttpResponse::Ok().json(&medicine)),
		None => Err(HttpError::not_found("Medicine not found")),
	}
}

#[web::post("/")]
pub async fn create_medicine(
	state: web::types::State<AppStateType>,
	medicine_input: web::types::Json<MedicineInput>,
) -> Result<HttpResponse, HttpError> {
	let app_state = state.read().await;

	let medicine = match app_state.repositories.medicine.create(medicine_input.id.clone(), medicine_input.names.clone()).await {
		Ok(medicine) => medicine,
		Err(_) => return Err(HttpError::internal_server_error("Failed to create medicine")),
	};

	Ok(HttpResponse::Created().json(&medicine))
}

#[web::delete("/{id}")]
pub async fn delete_medicine(
	state: web::types::State<AppStateType>,
	id: web::types::Path<String>,
) -> Result<HttpResponse, HttpError> {
	let app_state = state.read().await;

	let medicine = match app_state.repositories.medicine.delete(id.into_inner()).await {
		Ok(medicine) => medicine,
		Err(_) => return Err(HttpError::internal_server_error("Failed to delete medicine")),
	};

	Ok(HttpResponse::Ok().json(&medicine))
}

pub fn init(config: &mut web::ServiceConfig) {
	config.service(
		web::scope("/medicine").service(get_all_medicine).service(get_medicine).service(create_medicine).service(delete_medicine),
	);
}
