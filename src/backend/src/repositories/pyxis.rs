use std::sync::Arc;

use super::DatabaseClient;
use crate::db::*;
use prisma_client_rust::QueryError;

pub type Pyxis = pyxis::Data;

pub struct PyxisRepository {
	db_client: DatabaseClient,
}

impl PyxisRepository {
	pub fn new(db_client: Arc<PrismaClient>) -> Self {
		Self { db_client: DatabaseClient::new(db_client) }
	}

	pub async fn get_all(&self) -> Result<Vec<Pyxis>, QueryError> {
		self.db_client.get_db().pyxis().find_many(vec![]).exec().await
	}

	pub async fn get_by_floor_block(&self, floor: i32, block: String) -> Result<Option<Pyxis>, QueryError> {
		self.db_client.get_db().pyxis().find_first(vec![pyxis::floor::equals(floor), pyxis::block::equals(block)]).exec().await
	}

	pub async fn create(&self, floor: i32, block: String) -> Result<Pyxis, QueryError> {
		self.db_client.get_db().pyxis().create(floor, block.to_uppercase(), vec![]).exec().await
	}

	pub async fn delete(&self, uuid: String) -> Result<Pyxis, QueryError> {
		self.db_client.get_db().pyxis().delete(pyxis::uuid::equals(uuid)).exec().await
	}

	pub async fn get_medicines(&self, floor: i32, block: String) -> Result<Option<Pyxis>, QueryError> {
		self.db_client
			.get_db()
			.pyxis()
			.find_first(vec![pyxis::floor::equals(floor), pyxis::block::equals(block)])
			.with(pyxis::inventory::fetch(vec![]))
			.exec()
			.await
	}

	pub async fn get_medicine(&self, floor: i32, block: String, medicine_id: String) -> Result<Option<Pyxis>, QueryError> {
		self.db_client
			.get_db()
			.pyxis()
			.find_first(vec![pyxis::floor::equals(floor), pyxis::block::equals(block)])
			.with(pyxis::inventory::fetch(vec![inventory::medicine_id::equals(medicine_id)]))
			.exec()
			.await
	}
}
