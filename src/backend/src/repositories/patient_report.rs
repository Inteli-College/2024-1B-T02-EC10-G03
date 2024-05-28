use crate::db::*;
use crate::repositories::DatabaseClient;
use prisma_client_rust::QueryError;
use std::sync::Arc;

type PatientReport = patient_report::Data;

pub struct PatientReportRepository {
	db_client: DatabaseClient,
}

impl PatientReportRepository {
	pub fn new(db_client: Arc<PrismaClient>) -> Self {
		Self { db_client: DatabaseClient::new(db_client) }
	}

	pub async fn get_all(&self) -> Result<Vec<PatientReport>, QueryError> {
		self.db_client.get_db().patient_report().find_many(vec![]).exec().await
	}

	pub async fn get(&self, cuid: String) -> Result<Option<PatientReport>, QueryError> {
		self.db_client.get_db().patient_report().find_unique(patient_report::cuid::equals(cuid)).exec().await
	}

	pub async fn create(
		&self,
		patient_uuid: String,
		transaction_uuid: String,
		report_type: PatientReportType,
		observation: String,
	) -> Result<PatientReport, QueryError> {
		let patient = patient::uuid::equals(patient_uuid);
		let transaction = transaction::uuid::equals(transaction_uuid);

		self.db_client.get_db().patient_report().create(patient, transaction, report_type, observation, vec![]).exec().await
	}

	pub async fn update_status(&self, cuid: String, new_status: ReportStatus) -> Result<Option<PatientReport>, QueryError> {
		let result = self
			.db_client
			.get_db()
			.patient_report()
			.update(patient_report::cuid::equals(cuid.to_string()), vec![patient_report::status::set(new_status)])
			.exec()
			.await?;

		Ok(Some(result))
	}
}
