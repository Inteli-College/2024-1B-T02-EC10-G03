use crate::db::*;

pub fn split_pyxis_id(pyxis_id: String) -> (i32, String) {
	let position = pyxis_id.chars().position(|c| c.is_alphabetic()).unwrap();
	let (floor, block) = pyxis_id.split_at(position);
	(floor.parse::<i32>().unwrap(), block.to_string())
}

pub fn fetch_employee_role(role: String) -> Option<EmployeeRole> {
	match role.as_str() {
		"NURSE" => Some(EmployeeRole::Nurse),
		"PHARMACIST" => Some(EmployeeRole::Pharmacist),
		"IT" => Some(EmployeeRole::It),
		"ADMIN" => Some(EmployeeRole::Admin),
		"COMMONER" => Some(EmployeeRole::Commoner),
		_ => None,
	}
}

pub fn fetch_patient_report_type(report_type: String) -> Option<PatientReportType> {
	match report_type.as_str() {
		"NOT_CONSUMED" => Some(PatientReportType::NotConsumed),
		"QUANTITY_MISMATCH" => Some(PatientReportType::QuantityMismatch),
		"OTHER" => Some(PatientReportType::Other),
		_ => None,
	}
}

pub fn fetch_pyxis_report_type(report_type: String) -> Option<PyxisReportType> {
	match report_type.as_str() {
		"DATA_INCONSISTENCY" => Some(PyxisReportType::DataInconsistency),
		"NEEDS_REFILL" => Some(PyxisReportType::NeedsRefill),
		"TECHNICAL_ISSUE" => Some(PyxisReportType::TechnicalIssue),
		"OTHER" => Some(PyxisReportType::Other),
		_ => None,
	}
}

pub fn fetch_report_status(status: String) -> Option<ReportStatus> {
	match status.as_str() {
		"SENT" => Some(ReportStatus::Sent),
		"RECEIVED" => Some(ReportStatus::Received),
		"PENDING" => Some(ReportStatus::Pending),
		"FINISHED" => Some(ReportStatus::Finished),
		_ => None,
	}
}

pub fn fetch_transaction_type(transaction_type: String) -> Option<TransactionType> {
	match transaction_type.as_str() {
		"IN" => Some(TransactionType::In),
		"OUT" => Some(TransactionType::Out),
		_ => None,
	}
}
