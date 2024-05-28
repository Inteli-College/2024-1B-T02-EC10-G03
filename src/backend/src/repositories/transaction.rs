use std::sync::Arc;

use super::DatabaseClient;
use crate::db::*;
use prisma_client_rust::QueryError;

pub type Transaction = transaction::Data;

pub struct TransactionRepository {
	db_client: DatabaseClient,
}

impl TransactionRepository {
	pub fn new(db_client: Arc<PrismaClient>) -> Self {
		Self { db_client: DatabaseClient::new(db_client) }
	}

	pub async fn get_all(&self) -> Result<Vec<Transaction>, QueryError> {
		self.db_client.get_db().transaction().find_many(vec![]).exec().await
	}

	pub async fn get(&self, uuid: String) -> Result<Option<Transaction>, QueryError> {
		self.db_client.get_db().transaction().find_unique(transaction::uuid::equals(uuid)).exec().await
	}

	pub async fn create(
		&self,
		r#type: TransactionType,
		employee_uuid: String,
		patient_uuid: String,
		medicine_id: String,
		pyxis_uuid: String,
		quantity: i32,
	) -> Result<Transaction, QueryError> {
		self.db_client
			.get_db()
			.transaction()
			.create(
				r#type,
				employee::uuid::equals(employee_uuid),
				patient::uuid::equals(patient_uuid),
				medicine::id::equals(medicine_id),
				pyxis::uuid::equals(pyxis_uuid),
				quantity,
				vec![],
			)
			.exec()
			.await
	}
}
