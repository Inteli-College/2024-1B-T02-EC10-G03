use crate::{error::HttpError, states::app::AppStateType, utils::parser::split_pyxis_id};
use ntex::web::{self, HttpResponse};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
struct ModifyInventoryInput {
	quantity: i32,
}

#[web::post("/add/{pyxis_id}/{medicine_id}")]
pub async fn add_to_inventory(
	state: web::types::State<AppStateType>,
	params: web::types::Path<(String, String)>,
	add: web::types::Json<ModifyInventoryInput>,
) -> Result<HttpResponse, HttpError> {
	let app_state = state.read().await;
	let (pyxis_id, medicine_id) = params.into_inner();
	let (floor, block) = split_pyxis_id(pyxis_id.to_string());

	let pyxis = match app_state.repositories.pyxis.get_by_floor_block(floor, block).await {
		Ok(Some(pyxis)) => pyxis,
		Ok(None) => return Err(HttpError::not_found("Pyxis not found")),
		Err(_) => return Err(HttpError::internal_server_error("Failed to get pyxis")),
	};

	let inventory = match app_state.repositories.inventory.add_to_pyxis(pyxis.uuid, medicine_id.clone(), add.quantity).await {
		Ok(inventory) => inventory,
		Err(_) => return Err(HttpError::internal_server_error("Failed to add to inventory")),
	};

	Ok(HttpResponse::Ok().json(&inventory))
}

#[web::post("/remove/{pyxis_id}/{medicine_id}")]
pub async fn remove_from_inventory(
	state: web::types::State<AppStateType>,
	params: web::types::Path<(String, String)>,
	remove: web::types::Json<ModifyInventoryInput>,
) -> Result<HttpResponse, HttpError> {
	let app_state = state.read().await;
	let (pyxis_id, medicine_id) = params.into_inner();
	let (floor, block) = split_pyxis_id(pyxis_id.to_string());

	let quantity = match app_state.repositories.pyxis.get_medicine(floor.clone(), block.clone(), medicine_id.clone()).await {
		Ok(Some(pyxis)) => match pyxis.inventory {
			Some(inventories) => match inventories.into_iter().next() {
				Some(inventory) => inventory.quantity,
				None => return Err(HttpError::not_found("Medicine not found in inventory")),
			},
			None => return Err(HttpError::not_found("Medicine not found in inventory")),
		},
		Ok(None) => return Err(HttpError::not_found("Medicine not found in inventory")),
		Err(_) => return Err(HttpError::internal_server_error("Failed to get medicine from inventory")),
	};

	if quantity < remove.quantity {
		return Err(HttpError::bad_request("Quantity to remove is greater than quantity in inventory"));
	}

	let pyxis = match app_state.repositories.pyxis.get_by_floor_block(floor, block).await {
		Ok(Some(pyxis)) => pyxis,
		Ok(None) => return Err(HttpError::not_found("Pyxis not found")),
		Err(_) => return Err(HttpError::internal_server_error("Failed to get pyxis")),
	};

	let inventory = match app_state
		.repositories
		.inventory
		.remove_from_pyxis(pyxis.uuid.clone(), medicine_id.clone(), remove.quantity)
		.await
	{
		Ok(inventory) => inventory,
		Err(_) => return Err(HttpError::internal_server_error("Failed to remove from inventory")),
	};

	Ok(HttpResponse::Ok().json(&inventory))
}

#[web::delete("/{pyxis_id}/{medicine_id}")]
pub async fn delete_from_inventory(
	state: web::types::State<AppStateType>,
	params: web::types::Path<(String, String)>,
) -> Result<HttpResponse, HttpError> {
	let app_state = state.read().await;
	let (pyxis_id, medicine_id) = params.into_inner();

	let (floor, block) = split_pyxis_id(pyxis_id.to_string());

	let pyxis = match app_state.repositories.pyxis.get_by_floor_block(floor, block).await {
		Ok(Some(pyxis)) => pyxis,
		Ok(None) => return Err(HttpError::not_found("Pyxis not found")),
		Err(_) => return Err(HttpError::internal_server_error("Failed to get pyxis")),
	};

	let inventory = match app_state.repositories.inventory.delete_from_inventory(pyxis.uuid, medicine_id).await {
		Ok(inventory) => inventory,
		Err(_) => return Err(HttpError::internal_server_error("Failed to delete from inventory")),
	};

	Ok(HttpResponse::Ok().json(&inventory))
}

#[web::get("/{pyxis_id}")]
pub async fn get_inventories(
	state: web::types::State<AppStateType>,
	pyxis_id: web::types::Path<String>,
) -> Result<HttpResponse, HttpError> {
	let app_state = state.read().await;
	let (floor, block) = split_pyxis_id(pyxis_id.to_string());

	match app_state.repositories.pyxis.get_medicines(floor, block).await {
		Ok(Some(pyxis)) => match pyxis.inventory {
			Some(inventories) => return Ok(HttpResponse::Ok().json(&inventories)),
			None => return Err(HttpError::not_found("No medicines in inventory")),
		},
		Ok(None) => return Err(HttpError::not_found("Pyxis not found")),
		Err(_) => return Err(HttpError::internal_server_error("Failed to get pyxis")),
	}
}

#[web::get("/{pyxis_id}/{medicine_id}")]
pub async fn get_medicine_from_inventory(
	state: web::types::State<AppStateType>,
	params: web::types::Path<(String, String)>,
) -> Result<HttpResponse, HttpError> {
	let app_state = state.read().await;
	let (pyxis_id, medicine_id) = params.into_inner();

	let (floor, block) = split_pyxis_id(pyxis_id.to_string());

	match app_state.repositories.pyxis.get_medicine(floor, block, medicine_id).await {
		Ok(Some(pyxis)) => match pyxis.inventory {
			Some(inventories) => match inventories.into_iter().next() {
				Some(inventory) => return Ok(HttpResponse::Ok().json(&inventory)),
				None => return Err(HttpError::not_found("Medicine not found in inventory")),
			},
			None => return Err(HttpError::not_found("Medicine not found in inventory")),
		},
		Ok(None) => return Err(HttpError::not_found("Pyxis not found")),
		Err(_) => return Err(HttpError::internal_server_error("Failed to get pyxis")),
	}
}

pub fn init(config: &mut web::ServiceConfig) {
	config.service(
		web::scope("/inventory")
			.service(add_to_inventory)
			.service(get_inventories)
			.service(remove_from_inventory)
			.service(delete_from_inventory)
			.service(get_medicine_from_inventory),
	);
}
