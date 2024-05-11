use std::sync::Arc;

use super::DatabaseClient;
use crate::db::*;
use prisma_client_rust::QueryError;

pub type Employee = employee::Data;

pub struct EmployeeRepository {
	db_client: DatabaseClient,
}

impl EmployeeRepository {
	pub fn new(db_client: Arc<PrismaClient>) -> Self {
		Self { db_client: DatabaseClient::new(db_client) }
	}

	pub async fn create(
		&self,
		name: String,
		email: String,
		password: String,
		role: EmployeeRole,
	) -> Result<Employee, QueryError> {
		self.db_client.get_db().employee().create(name, email, password, vec![employee::role::set(role)]).exec().await
	}

	pub async fn find_by_credentials(&self, email: String, password: String) -> Result<Option<Employee>, QueryError> {
		self.db_client
			.get_db()
			.employee()
			.find_first(vec![employee::email::equals(email), employee::password::equals(password)])
			.exec()
			.await
	}

	pub async fn find_by_uuid(&self, uuid: String) -> Result<Option<Employee>, QueryError> {
		self.db_client.get_db().employee().find_unique(employee::uuid::equals(uuid)).exec().await
	}
}
