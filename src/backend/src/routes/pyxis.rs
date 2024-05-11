use crate::{error::HttpError, states::app::AppStateType, utils::parser::split_pyxis_id};
use ntex::web::{self, HttpResponse};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
struct PyxisInput {
	floor: i32,
	block: String,
}

#[web::get("/")]
async fn get_all_pyxis(state: web::types::State<AppStateType>) -> Result<HttpResponse, HttpError> {
	let app_state = state.read().await;

	let pyxis = match app_state.repositories.pyxis.get_all().await {
		Ok(pyxis) => pyxis,
		Err(_) => return Err(HttpError::internal_server_error("Failed to get pyxis")),
	};

	Ok(HttpResponse::Ok().json(&pyxis))
}

#[web::get("/{id}")]
async fn get_pyxis(state: web::types::State<AppStateType>, id: web::types::Path<String>) -> Result<HttpResponse, HttpError> {
	let app_state = state.read().await;

	let (floor, block) = split_pyxis_id(id.to_string());

	let pyxis = match app_state.repositories.pyxis.get_by_floor_block(floor, block).await {
		Ok(pyxis) => pyxis,
		Err(_) => return Err(HttpError::internal_server_error("Failed to get pyxis")),
	};

	match pyxis {
		Some(pyxis) => Ok(HttpResponse::Ok().json(&pyxis)),
		None => Err(HttpError::not_found("Pyxis not found")),
	}
}

#[web::post("/")]
async fn create_pyxis(
	state: web::types::State<AppStateType>,
	pyxis_input: web::types::Json<PyxisInput>,
) -> Result<HttpResponse, HttpError> {
	let app_state = state.read().await;

	let pyxis = match app_state.repositories.pyxis.create(pyxis_input.floor, pyxis_input.block.clone()).await {
		Ok(pyxis) => pyxis,
		Err(_) => return Err(HttpError::internal_server_error("Failed to create pyxis")),
	};

	Ok(HttpResponse::Created().json(&pyxis))
}

#[web::delete("/{id}")]
async fn delete_pyxis(state: web::types::State<AppStateType>, id: web::types::Path<String>) -> Result<HttpResponse, HttpError> {
	let app_state = state.read().await;

	let (floor, block) = split_pyxis_id(id.to_string());
	let uuid = match app_state.repositories.pyxis.get_by_floor_block(floor, block).await {
		Ok(Some(pyxis)) => pyxis.uuid,
		Ok(None) => return Err(HttpError::not_found("Pyxis not found")),
		Err(_) => return Err(HttpError::internal_server_error("Failed to get pyxis")),
	};

	let pyxis = match app_state.repositories.pyxis.delete(uuid).await {
		Ok(pyxis) => pyxis,
		Err(_) => return Err(HttpError::internal_server_error("Failed to delete pyxis")),
	};

	Ok(HttpResponse::Ok().json(&pyxis))
}

pub fn init(config: &mut web::ServiceConfig) {
	config.service(web::scope("/pyxis").service(get_all_pyxis).service(get_pyxis).service(create_pyxis).service(delete_pyxis));
}
