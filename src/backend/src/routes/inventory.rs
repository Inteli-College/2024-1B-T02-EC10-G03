use crate::{db::*, error::HttpError, AppState};
use chrono::{FixedOffset, Utc};
use ntex::web::{self, HttpResponse};
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};

#[derive(Serialize, Deserialize, Debug)]
struct ModifyInventoryInput {
	medicine_id: String,
	quantity: i32,
}

#[derive(Serialize, Deserialize, Debug)]
struct DeleteInventoryInput {
	medicine_id: String,
}

#[web::post("/add/{pyxis_id}")]
pub async fn add_to_inventory(
	state: web::types::State<Arc<Mutex<AppState>>>,
	add: web::types::Json<ModifyInventoryInput>,
	pyxis_id: web::types::Path<String>,
) -> Result<web::HttpResponse, HttpError> {
	let app_state = state.lock().unwrap();
	let id_string = pyxis_id.into_inner();
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

	let inventory = app_state
		.db
		.inventory()
		.upsert(
			inventory::pyxis_uuid_medicine_id(pyxis_uuid.clone(), add.medicine_id.to_string()),
			inventory::create(
				medicine::id::equals(add.medicine_id.clone()),
				pyxis::uuid::equals(pyxis_uuid),
				add.quantity,
				vec![],
			),
			vec![
				inventory::quantity::increment(add.quantity),
				inventory::updated_at::set(Utc::now().with_timezone(&FixedOffset::east_opt(3 * 3600).unwrap())),
			],
		)
		.exec()
		.await;

	let inventory = match inventory {
		Ok(inventory) => inventory,
		Err(_) => return Err(HttpError::internal_server_error("Error adding to inventory")),
	};

	Ok(HttpResponse::Created().json(&inventory))
}

#[web::post("remove/{pyxis_id}")]
pub async fn remove_from_inventory(
	state: web::types::State<Arc<Mutex<AppState>>>,
	remove: web::types::Json<ModifyInventoryInput>,
	pyxis_id: web::types::Path<String>,
) -> Result<web::HttpResponse, HttpError> {
	let app_state = state.lock().unwrap();
	let id_string = pyxis_id.into_inner();
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

	let inventory = app_state
		.db
		.inventory()
		.find_first(vec![
			inventory::pyxis_uuid::equals(pyxis_uuid.clone()),
			inventory::medicine_id::equals(remove.medicine_id.to_string()),
		])
		.exec()
		.await
		.unwrap();

	let inventory_quantity = match inventory {
		Some(inventory) => inventory.quantity,
		None => return Err(HttpError::not_found("Pyxis inventory not found")),
	};

	if inventory_quantity < remove.quantity {
		return Err(HttpError::bad_request("Not enough medicine in inventory to remove"));
	} else {
		let inventory = app_state
			.db
			.inventory()
			.update(
				inventory::pyxis_uuid_medicine_id(pyxis_uuid.clone(), remove.medicine_id.to_string()),
				vec![
					inventory::quantity::decrement(remove.quantity),
					inventory::updated_at::set(Utc::now().with_timezone(&FixedOffset::east_opt(3 * 3600).unwrap())),
				],
			)
			.exec()
			.await
			.unwrap();

		Ok(HttpResponse::Created().json(&inventory))
	}
}

#[web::delete("/{pyxis_id}")]
pub async fn delete_from_inventory(
	state: web::types::State<Arc<Mutex<AppState>>>,
	delete: web::types::Json<DeleteInventoryInput>,
	pyxis_id: web::types::Path<String>,
) -> Result<web::HttpResponse, HttpError> {
	let app_state = state.lock().unwrap();
	let id_string = pyxis_id.into_inner();
	let position = id_string.chars().position(|c| c.is_alphabetic()).unwrap();
	let (floor, block) = id_string.split_at(position);

	let pyxis_uuid = app_state
		.db
		.pyxis()
		.find_first(vec![pyxis::floor::equals(floor.parse().unwrap()), pyxis::block::equals(block.to_string())])
		.exec()
		.await
		.unwrap();

	let pyxis_uuid = match pyxis_uuid {
		Some(pyxis) => pyxis.uuid,
		None => return Err(HttpError::not_found("Pyxis not found")),
	};

	let inventory = app_state
		.db
		.inventory()
		.delete(inventory::pyxis_uuid_medicine_id(pyxis_uuid.clone(), delete.medicine_id.to_string()))
		.exec()
		.await
		.unwrap();

	Ok(HttpResponse::Ok().json(&inventory))
}

#[web::get("/{id}")]
pub async fn get_from_inventory(
	state: web::types::State<Arc<Mutex<AppState>>>,
	id: web::types::Path<String>,
) -> Result<web::HttpResponse, HttpError> {
	let app_state = state.lock().unwrap();
	let id_string = id.into_inner();
	let position = id_string.chars().position(|c| c.is_alphabetic()).unwrap();
	let (floor, block) = id_string.split_at(position);

	let pyxis = app_state
		.db
		.pyxis()
		.find_first(vec![pyxis::floor::equals(floor.parse().unwrap()), pyxis::block::equals(block.to_string())])
		.with(pyxis::inventory::fetch(vec![]))
		.exec()
		.await
		.unwrap();

	let pyxis = match pyxis {
		Some(pyxis) => pyxis,
		None => return Err(HttpError::not_found("Pyxis not found")),
	};

	Ok(HttpResponse::Ok().json(&pyxis.inventory))
}

pub fn inventory_config(config: &mut web::ServiceConfig) {
	config.service(
		web::scope("/inventory")
			.service(add_to_inventory)
			.service(get_from_inventory)
			.service(remove_from_inventory)
			.service(delete_from_inventory),
	);
}
