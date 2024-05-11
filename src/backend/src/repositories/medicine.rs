use std::sync::Arc;

use super::DatabaseClient;
use crate::db::*;
use prisma_client_rust::QueryError;

type Medicine = medicine::Data;
pub struct MedicineRepository {
	db_client: DatabaseClient,
}

impl MedicineRepository {
	pub fn new(db_client: Arc<PrismaClient>) -> Self {
		Self { db_client: DatabaseClient::new(db_client) }
	}

	pub async fn get_all(&self) -> Result<Vec<Medicine>, QueryError> {
		self.db_client.get_db().medicine().find_many(vec![]).with(medicine::medicine_names::fetch(vec![])).exec().await
	}

	pub async fn get(&self, id: String) -> Result<Option<Medicine>, QueryError> {
		self.db_client
			.get_db()
			.medicine()
			.find_unique(medicine::id::equals(id))
			.with(medicine::medicine_names::fetch(vec![]))
			.exec()
			.await
	}

	pub async fn create(&self, id: String, names: Vec<String>) -> Result<Medicine, QueryError> {
		let name_creations =
			names.iter().map(|name| medicine_name::create_unchecked(name.to_string(), vec![])).collect::<Vec<_>>();

		self.db_client.get_db().medicine_name().create_many(name_creations).exec().await?;

		let connect_params = names.iter().map(|name| medicine_name::name::equals(name.to_string())).collect::<Vec<_>>();

		self.db_client
			.get_db()
			.medicine()
			.create(id.clone(), vec![medicine::medicine_names::connect(connect_params)])
			.with(medicine::medicine_names::fetch(vec![]))
			.exec()
			.await
	}

	pub async fn delete(&self, id: String) -> Result<Medicine, QueryError> {
		self.db_client.get_db().medicine().delete(medicine::id::equals(id.clone())).exec().await
	}
}
