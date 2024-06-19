use crate::db::*;
use crate::repositories::DatabaseClient;
use prisma_client_rust::QueryError;
use serde_json::Value;
use std::sync::Arc;

type PyxisReport = pyxis_report::Data;

pub struct PyxisReportRepository {
	db_client: DatabaseClient,
}

impl PyxisReportRepository {
	pub fn new(db_client: Arc<PrismaClient>) -> Self {
		Self { db_client: DatabaseClient::new(db_client) }
	}

	pub async fn get_all(&self) -> Result<Vec<PyxisReport>, QueryError> {
		self.db_client.get_db().pyxis_report().find_many(vec![]).exec().await
	}

	pub async fn get(&self, cuid: String) -> Result<Option<PyxisReport>, QueryError> {
		self.db_client.get_db().pyxis_report().find_unique(pyxis_report::cuid::equals(cuid)).exec().await
	}

	pub async fn create(
		&self,
		r#type: PyxisReportType,
		pyxis_uuid: String,
		employee_uuid: String,
		medicine_id: String,
		observation: String,
		urgency: bool,
		additional_info: Value,
	) -> Result<PyxisReport, QueryError> {
		self.db_client
			.get_db()
			.pyxis_report()
			.create(
				pyxis::uuid::equals(pyxis_uuid),
				employee::uuid::equals(employee_uuid),
				medicine::id::equals(medicine_id),
				r#type,
				observation,
				urgency,
				vec![pyxis_report::additional_info::set(additional_info)],
			)
			.exec()
			.await
	}

	pub async fn update_status(&self, cuid: String, status: ReportStatus) -> Result<PyxisReport, QueryError> {
		self.db_client
			.get_db()
			.pyxis_report()
			.update(pyxis_report::cuid::equals(cuid), vec![pyxis_report::status::set(status)])
			.exec()
			.await
	}

	pub async fn update_observation(&self, cuid: String, observation: String) -> Result<PyxisReport, QueryError> {
		self.db_client
			.get_db()
			.pyxis_report()
			.update(pyxis_report::cuid::equals(cuid), vec![pyxis_report::observation::set(observation)])
			.exec()
			.await
	}
}
