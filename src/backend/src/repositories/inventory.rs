use std::sync::Arc;

use super::DatabaseClient;
use crate::{db::*, utils::datetime::db_now_datetime};
use prisma_client_rust::QueryError;

type Inventory = inventory::Data;

pub struct InventoryRepository {
	db_client: DatabaseClient,
}

impl InventoryRepository {
	pub fn new(db_client: Arc<PrismaClient>) -> Self {
		Self { db_client: DatabaseClient::new(db_client) }
	}

	pub async fn create_inventory(&self, pyxis_uuid: String, medicine_id: String) -> Result<Inventory, QueryError> {
		self.db_client
			.get_db()
			.inventory()
			.create(
				medicine::id::equals(medicine_id),
				pyxis::uuid::equals(pyxis_uuid),
				vec![inventory::updated_at::set(db_now_datetime())],
			)
			.exec()
			.await
	}

	pub async fn add_to_pyxis(&self, pyxis_uuid: String, medicine_id: String, quantity: i32) -> Result<Inventory, QueryError> {
		self.db_client
			.get_db()
			.inventory()
			.upsert(
				inventory::pyxis_uuid_medicine_id(pyxis_uuid.clone(), medicine_id.clone()),
				inventory::create(
					medicine::id::equals(medicine_id),
					pyxis::uuid::equals(pyxis_uuid),
					vec![inventory::quantity::set(quantity), inventory::updated_at::set(db_now_datetime())],
				),
				vec![inventory::quantity::increment(quantity), inventory::updated_at::set(db_now_datetime())],
			)
			.exec()
			.await
	}

	pub async fn remove_from_pyxis(
		&self,
		pyxis_uuid: String,
		medicine_id: String,
		quantity: i32,
	) -> Result<Inventory, QueryError> {
		self.db_client
			.get_db()
			.inventory()
			.update(
				inventory::pyxis_uuid_medicine_id(pyxis_uuid, medicine_id),
				vec![inventory::quantity::decrement(quantity), inventory::updated_at::set(db_now_datetime())],
			)
			.exec()
			.await
	}

	pub async fn delete_from_inventory(&self, pyxis_uuid: String, medicine_id: String) -> Result<Inventory, QueryError> {
		self.db_client
			.get_db()
			.inventory()
			.delete(inventory::pyxis_uuid_medicine_id(pyxis_uuid.clone(), medicine_id.to_string()))
			.exec()
			.await
	}
}
