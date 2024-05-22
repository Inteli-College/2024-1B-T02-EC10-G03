use crate::db::EmployeeRole;
use crate::{
	error::HttpError,
	states::app::AppStateType,
	utils::parser::{fetch_transaction_type, split_pyxis_id},
};
use ntex::web::{self, HttpResponse};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct TransactionCreateInput {
	pub r#type: String,
	pub employee_uuid: String,
	pub patient_uuid: String,
	pub medicine_id: String,
	pub pyxis_id: String,
	pub quantity: i32,
}

#[web::get("/")]
async fn get_all_transactions(state: web::types::State<AppStateType>) -> Result<HttpResponse, HttpError> {
	let app_state = state.read().await;

	let transactions = match app_state.repositories.transaction.get_all().await {
		Ok(transactions) => transactions,
		Err(_) => return Err(HttpError::internal_server_error("Failed to get transactions")),
	};

	Ok(HttpResponse::Ok().json(&transactions))
}

#[web::get("/{uuid}")]
async fn get_transaction(
	state: web::types::State<AppStateType>,
	uuid: web::types::Path<String>,
) -> Result<HttpResponse, HttpError> {
	let app_state = state.read().await;

	let transaction = match app_state.repositories.transaction.get(uuid.into_inner()).await {
		Ok(transaction) => transaction,
		Err(_) => return Err(HttpError::internal_server_error("Failed to get transaction")),
	};

	match transaction {
		Some(transaction) => Ok(HttpResponse::Ok().json(&transaction)),
		None => Err(HttpError::not_found("Transaction not found")),
	}
}

#[web::post("/")]
async fn create_transaction(
	state: web::types::State<AppStateType>,
	transaction_input: web::types::Json<TransactionCreateInput>,
) -> Result<HttpResponse, HttpError> {
	let app_state = state.read().await;
	let (floor, block) = split_pyxis_id(transaction_input.pyxis_id.clone());

	let transaction_type = fetch_transaction_type(transaction_input.r#type.clone())
		.ok_or_else(|| HttpError::bad_request("Invalid transaction type value"))?;

	let quantity = match app_state
		.repositories
		.pyxis
		.get_medicine(floor.clone(), block.clone(), transaction_input.medicine_id.clone())
		.await
	{
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

	if quantity < transaction_input.quantity {
		return Err(HttpError::bad_request("Quantity to remove is greater than quantity in inventory"));
	}

	let pyxis_uuid = match app_state.repositories.pyxis.get_by_floor_block(floor.clone(), block.clone()).await {
		Ok(pyxis) => match pyxis {
			Some(pyxis) => pyxis.uuid,
			None => return Err(HttpError::bad_request("Pyxis not found")),
		},
		Err(_) => return Err(HttpError::internal_server_error("Failed to get pyxis")),
	};

	app_state
		.repositories
		.inventory
		.remove_from_pyxis(pyxis_uuid.clone(), transaction_input.medicine_id.clone(), transaction_input.quantity)
		.await
		.map_err(|_| HttpError::internal_server_error("Failed to remove from inventory"))?;

	let new_transaction = app_state
		.repositories
		.transaction
		.create(
			transaction_type,
			transaction_input.employee_uuid.clone(),
			transaction_input.patient_uuid.clone(),
			transaction_input.medicine_id.clone(),
			pyxis_uuid,
			transaction_input.quantity,
		)
		.await
		.map_err(|_| HttpError::internal_server_error("Failed to create transaction"))?;

	Ok(HttpResponse::Created().json(&new_transaction))
}

#[web::get("/types")]
pub async fn list_types() -> HttpResponse {
	let roles = vec![
		EmployeeRole::Nurse.to_string(),
		EmployeeRole::Pharmacist.to_string(),
		EmployeeRole::It.to_string(),
		EmployeeRole::Admin.to_string(),
		EmployeeRole::Commoner.to_string(),
	];
	HttpResponse::Ok().json(&roles)
}

pub fn init(config: &mut web::ServiceConfig) {
	config.service(
		web::scope("/transaction")
			.service(list_types)
			.service(get_all_transactions)
			.service(get_transaction)
			.service(create_transaction),
	);
}
