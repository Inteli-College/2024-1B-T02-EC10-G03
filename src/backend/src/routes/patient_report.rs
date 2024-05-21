use crate::{error::HttpError, states::app::AppStateType};
use ntex::web::{self, HttpResponse};
use serde::{Deserialize, Serialize};
use crate::ReportStatus;
use crate::PatientReportType;

#[derive(Serialize, Deserialize, Debug)]
struct UpdatePatientReportStatusInput {
    cuid: String,
    status: String,
}

#[derive(Serialize, Deserialize, Debug)]
struct CreatePatientReportInput {
    patient_uuid: String,
    transaction_uuid: String,
    status: String,
    report_type: String,
    observation: String,
}

#[web::get("/")]
pub async fn get_all_patient_reports(state: web::types::State<AppStateType>) -> Result<HttpResponse, HttpError> {
    let app_state = state.read().await;

    let reports = match app_state.repositories.patient_report.get_all().await {
        Ok(reports) => reports,
        Err(_) => return Err(HttpError::internal_server_error("Failed to get patient reports")),
    };

    Ok(HttpResponse::Ok().json(&reports))
}

#[web::get("/{cuid}")]
pub async fn get_patient_report(
    state: web::types::State<AppStateType>,
    cuid: web::types::Path<String>,
) -> Result<HttpResponse, HttpError> {
    let app_state = state.read().await;

    let report = match app_state.repositories.patient_report.get(cuid.into_inner()).await {
        Ok(report) => report,
        Err(_) => return Err(HttpError::internal_server_error("Failed to get patient report")),
    };

    match report {
        Some(report) => Ok(HttpResponse::Ok().json(&report)),
        None => Err(HttpError::not_found("Patient report not found")),
    }
}

#[web::post("/")]
pub async fn create_patient_report(
    state: web::types::State<AppStateType>,
    input: web::types::Json<CreatePatientReportInput>,
) -> Result<HttpResponse, HttpError> {
    let app_state = state.read().await;
    let repository = &app_state.repositories.patient_report;

    let status = match input.status.as_str() {
        "SENT" => ReportStatus::Sent,
        "RECEIVED" => ReportStatus::Received,
        "PENDING" => ReportStatus::Pending,
        "FINISHED" => ReportStatus::Finished,
        _ => return Err(HttpError::bad_request("Invalid status value")),
    };

    let report_type = match input.report_type.as_str() {
        "NOT_CONSUMED" => PatientReportType::NotConsumed,
        "QUANTITY_MISMATCH" => PatientReportType::QuantityMismatch,
        "OTHER" => PatientReportType::Other,
        _ => return Err(HttpError::bad_request("Invalid report type value")),
    };

    let new_report = repository
        .create(
            input.patient_uuid.clone(),
            input.transaction_uuid.clone(),
            status.clone(),
            report_type.clone(),
            input.observation.clone(),
        )
        .await
        .map_err(|_| HttpError::internal_server_error("Failed to create patient report"))?;

    Ok(HttpResponse::Ok().json(&new_report))
}

#[web::put("/")]
pub async fn update_patient_report_status(
    state: web::types::State<AppStateType>,
    input: web::types::Json<UpdatePatientReportStatusInput>,
) -> Result<HttpResponse, HttpError> {
    let app_state = state.read().await;

    let new_status = match input.status.as_str() {
        "SENT" => ReportStatus::Sent,
        "RECEIVED" => ReportStatus::Received,
        "PENDING" => ReportStatus::Pending,
        "FINISHED" => ReportStatus::Finished,
        _ => return Err(HttpError::bad_request("Invalid status value")),
    };

    let result = match app_state.repositories.patient_report.update_status(input.cuid.clone(), new_status).await {
        Ok(result) => result,
        Err(_) => return Err(HttpError::internal_server_error("Failed to update patient report status")),
    };
    
    if let Some(report) = result {
        Ok(HttpResponse::Ok().json(&report))
    } else {
        Err(HttpError::not_found("Patient report not found"))
    }
}

pub fn init(config: &mut web::ServiceConfig) {
    config.service(
        web::scope("/patient_report")
            .service(get_all_patient_reports)
            .service(get_patient_report)
            .service(create_patient_report)
            .service(update_patient_report_status),
    );
}
