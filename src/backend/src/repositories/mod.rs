use crate::db::*;
use std::sync::Arc;

pub struct DatabaseClient {
	db: Arc<PrismaClient>,
}

impl DatabaseClient {
	pub fn new(db: Arc<PrismaClient>) -> Self {
		Self { db }
	}

	pub fn get_db(&self) -> Arc<PrismaClient> {
		self.db.clone()
	}
}

mod employee;
mod inventory;
mod medicine;
mod patient;
mod patient_report;
mod pyxis;
mod pyxis_report;
mod transaction;

pub struct Repositories {
	pub pyxis: pyxis::PyxisRepository,
	pub medicine: medicine::MedicineRepository,
	pub inventory: inventory::InventoryRepository,
	pub patient: patient::PatientRepository,
	pub employee: employee::EmployeeRepository,
	pub patient_report: patient_report::PatientReportRepository,
	pub transaction: transaction::TransactionRepository,
	pub pyxis_report: pyxis_report::PyxisReportRepository,
}

impl Repositories {
	pub fn new(db: Arc<PrismaClient>) -> Self {
		Self {
			pyxis: pyxis::PyxisRepository::new(db.clone()),
			medicine: medicine::MedicineRepository::new(db.clone()),
			inventory: inventory::InventoryRepository::new(db.clone()),
			patient: patient::PatientRepository::new(db.clone()),
			employee: employee::EmployeeRepository::new(db.clone()),
			patient_report: patient_report::PatientReportRepository::new(db.clone()),
			transaction: transaction::TransactionRepository::new(db.clone()),
			pyxis_report: pyxis_report::PyxisReportRepository::new(db.clone()),
		}
	}
}
