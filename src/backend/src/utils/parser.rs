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
