use crate::db::EmployeeRole;
use crate::{error::HttpError, features, states::app::AppStateType, utils::parser::fetch_employee_role};
use ntex::web::{self, HttpResponse};
use redis::AsyncCommands;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
struct RegisterPatientInput {
	name: String,
	email: String,
	password: String,
}

#[derive(Serialize, Deserialize, Debug)]
struct RegisterEmployeeInput {
	name: String,
	email: String,
	password: String,
	role: String,
}

#[derive(Serialize, Deserialize, Debug)]
struct LoginInput {
	email: String,
	password: String,
}

#[web::post("/register/employee")]
pub async fn register_employee(
	state: web::types::State<AppStateType>,
	payload: web::types::Json<RegisterEmployeeInput>,
) -> Result<HttpResponse, HttpError> {
	let app_state = state.read().await;
	let role = match fetch_employee_role(payload.role.clone()) {
		Some(role) => role,
		None => return Err(HttpError::bad_request("Invalid role")),
	};

	let employee = match app_state
		.repositories
		.employee
		.create(payload.name.clone(), payload.email.clone(), payload.password.clone(), role)
		.await
	{
		Ok(employee) => employee,
		Err(_) => return Err(HttpError::internal_server_error("Failed to create employee")),
	};

	let mut response = match serde_json::to_value(&employee) {
		Ok(json) => json.as_object().unwrap().clone(),
		Err(_) => return Err(HttpError::internal_server_error("Failed to serialize employee data")),
	};

	response.remove("password");

	Ok(HttpResponse::Created().json(&response))
}

#[web::post("/register/patient")]
pub async fn register_patient(
	state: web::types::State<AppStateType>,
	payload: web::types::Json<RegisterPatientInput>,
) -> Result<HttpResponse, HttpError> {
	let app_state = state.read().await;

	let patient = match app_state
		.repositories
		.patient
		.create(payload.name.clone(), payload.email.clone(), payload.password.clone())
		.await
	{
		Ok(patient) => patient,
		Err(_) => return Err(HttpError::internal_server_error("Failed to create patient")),
	};

	let mut response = match serde_json::to_value(&patient) {
		Ok(json) => match json.as_object() {
			Some(patient) => patient.clone(),
			None => return Err(HttpError::internal_server_error("Failed to serialize patient data")),
		},
		Err(_) => return Err(HttpError::internal_server_error("Failed to serialize patient data")),
	};

	response.remove("password");

	Ok(HttpResponse::Created().json(&response))
}

#[web::post("/login")]
pub async fn login(
	state: web::types::State<AppStateType>,
	session_info: features::session::SessionInfo,
	payload: web::types::Json<LoginInput>,
) -> Result<HttpResponse, HttpError> {
	let app_state = state.read().await;

	let user_json = if let Some(employee) =
		match app_state.repositories.employee.find_by_credentials(payload.email.clone(), payload.password.clone()).await {
			Ok(employee) => employee,
			Err(_) => return Err(HttpError::internal_server_error("Failed to get employee")),
		} {
		match serde_json::to_value(&employee) {
			Ok(json) => json,
			Err(_) => return Err(HttpError::internal_server_error("Failed to serialize employee data")),
		}
	} else if let Some(patient) =
		match app_state.repositories.patient.find_by_credentials(payload.email.clone(), payload.password.clone()).await {
			Ok(patient) => patient,
			Err(_) => return Err(HttpError::internal_server_error("Failed to get patient")),
		} {
		match serde_json::to_value(&patient) {
			Ok(json) => json,
			Err(_) => return Err(HttpError::internal_server_error("Failed to serialize patient data")),
		}
	} else {
		return Err(HttpError::unauthorized("Invalid credentials"));
	};

	let _: () = app_state
		.redis
		.clone()
		.set(format!("session:{}", session_info.get_session_id().to_string()), user_json["uuid"].to_string())
		.await
		.unwrap();

	let mut response = match user_json.as_object() {
		Some(user) => user.clone(),
		None => return Err(HttpError::internal_server_error("Failed to serialize user data")),
	};

	response.remove("password");

	Ok(HttpResponse::Ok().json(&response))
}

#[web::get("/info")]
pub async fn info(
	session_info: features::session::SessionInfo,
	state: web::types::State<AppStateType>,
) -> Result<HttpResponse, HttpError> {
	let app_state = state.read().await;

	let user_uuid = session_info.get_user_id().ok_or(HttpError::unauthorized("Invalid credentials"))?.clone();

	let user = if let Some(employee) = match app_state.repositories.employee.find_by_uuid(user_uuid.clone()).await {
		Ok(employee) => employee,
		Err(_) => return Err(HttpError::internal_server_error("Failed to get employee")),
	} {
		match serde_json::to_value(&employee) {
			Ok(json) => json,
			Err(_) => return Err(HttpError::internal_server_error("Failed to serialize employee data")),
		}
	} else if let Some(patient) = match app_state.repositories.patient.find_by_uuid(user_uuid.clone()).await {
		Ok(patient) => patient,
		Err(_) => return Err(HttpError::internal_server_error("Failed to get patient")),
	} {
		match serde_json::to_value(&patient) {
			Ok(json) => json,
			Err(_) => return Err(HttpError::internal_server_error("Failed to serialize patient data")),
		}
	} else {
		return Err(HttpError::unauthorized("Invalid credentials"));
	};

	let mut response = match user.as_object() {
		Some(user) => user.clone(),
		None => return Err(HttpError::internal_server_error("Failed to serialize user data")),
	};
	response.remove("password");

	Ok(HttpResponse::Ok().json(&response))
}

#[web::get("/roles")]
pub async fn list_roles() -> HttpResponse {
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
		web::scope("/user").service(register_employee).service(register_patient).service(login).service(info).service(list_roles),
	);
}
