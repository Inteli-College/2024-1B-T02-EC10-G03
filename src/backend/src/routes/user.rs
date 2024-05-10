use crate::{db::*, error::HttpError, features, AppState};
use ntex::web::{self, HttpResponse};
use redis::AsyncCommands;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::sync::{Arc, Mutex};

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

fn fetch_role(role: String) -> Result<EmployeeRole, &'static str> {
	match role.as_str() {
		"NURSE" => Ok(EmployeeRole::Nurse),
		"PHARMACIST" => Ok(EmployeeRole::Pharmacist),
		"IT" => Ok(EmployeeRole::It),
		"ADMIN" => Ok(EmployeeRole::Admin),
		"COMMONER" => Ok(EmployeeRole::Commoner),
		_ => Err("Invalid role"),
	}
}

#[web::post("/register/employee")]
pub async fn register_employee(
	state: web::types::State<Arc<Mutex<AppState>>>,
	payload: web::types::Json<RegisterEmployeeInput>,
) -> Result<web::HttpResponse, HttpError> {
	let app_state = state.lock().unwrap();
	let role = fetch_role(payload.role.clone()).unwrap();
	let employee = app_state
		.db
		.employee()
		.create(payload.name.clone(), payload.email.clone(), payload.password.clone(), vec![employee::role::set(role)])
		.exec()
		.await;

	if employee.is_err() {
		return Err(HttpError::internal_server_error("Error creating employee"));
	}

	Ok(HttpResponse::Created().json(&employee))
}

#[web::post("/register/patient")]
pub async fn register_patient(
	state: web::types::State<Arc<Mutex<AppState>>>,
	payload: web::types::Json<RegisterPatientInput>,
) -> Result<web::HttpResponse, HttpError> {
	let app_state = state.lock().unwrap();
	let patient =
		app_state.db.patient().create(payload.name.clone(), payload.email.clone(), payload.password.clone(), vec![]).exec().await;

	if patient.is_err() {
		return Err(HttpError::internal_server_error("Error creating patient"));
	}

	Ok(HttpResponse::Created().json(&patient))
}

#[web::post("/login")]
pub async fn login(
	state: web::types::State<Arc<Mutex<AppState>>>,
	session_info: features::session::SessionInfo,
	payload: web::types::Json<LoginInput>,
) -> Result<web::HttpResponse, HttpError> {
	let mut app_state = state.lock().unwrap();
	let mut user = json!({});

	let employee = app_state
		.db
		.employee()
		.find_first(vec![employee::email::equals(payload.email.clone()), employee::password::equals(payload.password.clone())])
		.exec()
		.await
		.unwrap();

	if employee.is_none() {
		let patient = app_state
			.db
			.patient()
			.find_first(vec![patient::email::equals(payload.email.clone()), patient::password::equals(payload.password.clone())])
			.exec()
			.await
			.unwrap();

		if patient.is_none() {
			return Err(HttpError::unauthorized("Invalid credentials"));
		}

		user = serde_json::to_value(&patient.unwrap()).unwrap();
	} else {
		user = serde_json::to_value(&employee.unwrap()).unwrap();
	}

	let _: () = app_state
		.redis
		.set(format!("session:{}", session_info.get_session_id().to_string()), user["uuid"].to_string())
		.await
		.unwrap();

	Ok(HttpResponse::Ok().json(&user))
}

#[web::get("/info")]
pub async fn info(
	session_info: features::session::SessionInfo,
	state: web::types::State<Arc<Mutex<AppState>>>,
) -> Result<web::HttpResponse, HttpError> {
	let app_state = state.lock().unwrap();

	if session_info.get_user_id().is_none() {
		return Err(HttpError::unauthorized("Invalid credentials"));
	}

	let mut user = json!({});

	let user_uuid: String = session_info.get_user_id().unwrap().clone();
	info!("User UUID: {:?}", user_uuid);

	let employee = app_state.db.employee().find_unique(employee::uuid::equals(user_uuid.clone())).exec().await.unwrap();

	if employee.is_none() {
		let patient = app_state.db.patient().find_unique(patient::uuid::equals(user_uuid.clone())).exec().await.unwrap();

		if patient.is_none() {
			return Err(HttpError::unauthorized("Invalid credentials"));
		}

		user = serde_json::to_value(&patient.unwrap()).unwrap();
	} else {
		user = serde_json::to_value(&employee.unwrap()).unwrap();
	}

	Ok(HttpResponse::Ok().json(&user))
}

pub fn user_config(config: &mut web::ServiceConfig) {
	config.service(web::scope("/user").service(register_employee).service(register_patient).service(login).service(info));
}
