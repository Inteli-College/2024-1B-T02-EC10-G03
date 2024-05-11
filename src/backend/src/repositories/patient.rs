use std::sync::Arc;

use super::DatabaseClient;
use crate::db::*;
use prisma_client_rust::QueryError;

pub type Patient = patient::Data;

pub struct PatientRepository {
	db_client: DatabaseClient,
}

impl PatientRepository {
	pub fn new(db_client: Arc<PrismaClient>) -> Self {
		Self { db_client: DatabaseClient::new(db_client) }
	}

	pub async fn create(&self, name: String, email: String, password: String) -> Result<Patient, QueryError> {
		self.db_client.get_db().patient().create(name, email, password, vec![]).exec().await
	}

	pub async fn find_by_credentials(&self, email: String, password: String) -> Result<Option<Patient>, QueryError> {
		self.db_client
			.get_db()
			.patient()
			.find_first(vec![patient::email::equals(email), patient::password::equals(password)])
			.exec()
			.await
	}

	pub async fn find_by_uuid(&self, uuid: String) -> Result<Option<Patient>, QueryError> {
		self.db_client.get_db().patient().find_unique(patient::uuid::equals(uuid)).exec().await
	}
}
