use crate::db::PyxisReportType;
use crate::utils::parser::{fetch_pyxis_report_type, fetch_report_status};
use crate::{error::HttpError, states::app::AppStateType};
use ntex::web::{self, HttpResponse};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
struct UpdatePatientReportStatusInput {
	status: String,
}

#[derive(Serialize, Deserialize, Debug)]
struct UpdatePatientObservationInput {
	observation: String,
}

#[derive(Serialize, Deserialize, Debug)]
struct CreatePatientReportInput {
	pyxis_id: String,
	medicine_id: String,
	employee_uuid: String,
	r#type: String,
	observation: String,
	#[serde(default)]
	additional_info: serde_json::Value,
	urgency: bool,
}

#[web::get("/")]
pub async fn get_all_pyxis_reports(state: web::types::State<AppStateType>) -> Result<HttpResponse, HttpError> {
	let app_state = state.read().await;

	let reports = match app_state.repositories.pyxis_report.get_all().await {
		Ok(reports) => reports,
		Err(_) => return Err(HttpError::internal_server_error("Failed to get pyxis reports")),
	};

	Ok(HttpResponse::Ok().json(&reports))
}

#[web::get("/{cuid}")]
pub async fn get_pyxis_report(
	state: web::types::State<AppStateType>,
	cuid: web::types::Path<String>,
) -> Result<HttpResponse, HttpError> {
	let app_state = state.read().await;

	let report = match app_state.repositories.pyxis_report.get(cuid.into_inner()).await {
		Ok(report) => report,
		Err(_) => return Err(HttpError::internal_server_error("Failed to get pyxis report")),
	};

	match report {
		Some(report) => Ok(HttpResponse::Ok().json(&report)),
		None => Err(HttpError::not_found("Pyxis report not found")),
	}
}

#[web::post("/")]
pub async fn create_pyxis_report(
	state: web::types::State<AppStateType>,
	input: web::types::Json<CreatePatientReportInput>,
) -> Result<HttpResponse, HttpError> {
	let app_state = state.read().await;
	let repository = &app_state.repositories.pyxis_report;

	let r#type =
		fetch_pyxis_report_type(input.r#type.clone()).ok_or_else(|| HttpError::bad_request("Invalid report type value"))?;

	let pyxis_id = input.pyxis_id.clone();
	let (floor, block) = crate::utils::parser::split_pyxis_id(pyxis_id);

	let pyxis_uuid = match app_state.repositories.pyxis.get_by_floor_block(floor.clone(), block.clone()).await {
		Ok(pyxis) => match pyxis {
			Some(pyxis) => pyxis.uuid,
			None => return Err(HttpError::bad_request("Pyxis not found")),
		},
		Err(_) => return Err(HttpError::internal_server_error("Failed to get pyxis")),
	};

	let report = repository
		.create(
			r#type,
			pyxis_uuid,
			input.employee_uuid.clone(),
			input.medicine_id.clone(),
			input.observation.clone(),
			input.urgency,
			input.additional_info.clone(),
		)
		.await
		.map_err(|_| HttpError::internal_server_error("Failed to create pyxis report"))?;

	Ok(HttpResponse::Ok().json(&report))
}

#[web::put("/{cuid}")]
pub async fn update_pyxis_report_status(
	state: web::types::State<AppStateType>,
	cuid: web::types::Path<String>,
	input: web::types::Json<UpdatePatientReportStatusInput>,
) -> Result<HttpResponse, HttpError> {
	let app_state = state.read().await;
	let repository = &app_state.repositories.pyxis_report;

	let status = fetch_report_status(input.status.clone()).ok_or_else(|| HttpError::bad_request("Invalid status value"))?;

	let report = repository
		.update_status(cuid.into_inner(), status)
		.await
		.map_err(|_| HttpError::internal_server_error("Failed to update pyxis report status"))?;

	Ok(HttpResponse::Ok().json(&report))
}

#[web::put("/{cuid}/observation")]
pub async fn update_pyxis_report_observation(
	state: web::types::State<AppStateType>,
	cuid: web::types::Path<String>,
	input: web::types::Json<UpdatePatientObservationInput>,
) -> Result<HttpResponse, HttpError> {
	let app_state = state.read().await;
	let repository = &app_state.repositories.pyxis_report;

	let report = repository
		.update_observation(cuid.into_inner(), input.observation.clone())
		.await
		.map_err(|_| HttpError::internal_server_error("Failed to update pyxis report status"))?;

	Ok(HttpResponse::Ok().json(&report))
}

#[web::get("/types")]
pub async fn list_types() -> HttpResponse {
	let roles = vec![
		PyxisReportType::DataInconsistency,
		PyxisReportType::NeedsRefill,
		PyxisReportType::TechnicalIssue,
		PyxisReportType::Other,
	];
	HttpResponse::Ok().json(&roles)
}

pub fn init(config: &mut web::ServiceConfig) {
	config.service(
		web::scope("/pyxis_report")
			.service(list_types)
			.service(get_all_pyxis_reports)
			.service(get_pyxis_report)
			.service(create_pyxis_report)
			.service(update_pyxis_report_status)
			.service(update_pyxis_report_observation)
	);
}
