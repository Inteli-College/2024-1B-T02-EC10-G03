import { Employee, Patient, Pyxis, EmployeeRole, Medicine, Inventory, PyxisReport, PyxisReportType, ReportStatus, PatientReport, Transaction, TransactionType } from 'types/api';

class APIResponse<T> {
	status: number;
	data: T;

	constructor(status: number, data: T) {
		this.status = status;
		this.data = data;
	}
}

class ClientAPI {
	private base_url: string;

	constructor(base_url: string) {
		this.base_url = base_url;

		if (!this.base_url.startsWith('http://') && !this.base_url.startsWith('https://')) {
			this.base_url = `http://${this.base_url}`;
		}

		try {
			fetch(this.base_url)
				.then(async (response) => {
					const data = await response.json();
					if (response.status !== 200 || data.status !== 'ok') {
						throw new Error(`Invalid API URL ${data.message}`);
					}

					console.info(`API URL ${this.base_url} is valid`);
				})
				.catch((error) => {
					throw new Error(`Invalid API URL ${error.message}`);
				});
		} catch (error: any) {
			throw new Error(`Invalid API URL ${error.message}`);
		}
	}

	async get<T>(path: string): Promise<APIResponse<T>> {
		const response = await fetch(`${this.base_url}/${path}`);
		return new APIResponse<T>(response.status, await response.json());
	}

	async post<T>(path: string, data: any): Promise<APIResponse<T>> {
		const response = await fetch(`${this.base_url}/${path}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});
		return new APIResponse<T>(response.status, await response.json());
	}

	async put<T>(path: string, data: any): Promise<APIResponse<T>> {
		const response = await fetch(`${this.base_url}/${path}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});
		return new APIResponse<T>(response.status, await response.json());
	}

	async delete<T>(path: string): Promise<APIResponse<T>> {
		const response = await fetch(`${this.base_url}/${path}`, {
			method: 'DELETE',
		});
		return new APIResponse<T>(response.status, await response.json());
	}

	pyxis = {
		getAll: async () => this.get<Pyxis[]>('pyxis/'),
		create: async (data: { floor: number; block: string }) => this.post<Pyxis>('pyxis/', data),
		getSpecific: async (id: string) => this.get<Pyxis>(`pyxis/${id}`),
		deleteSpecific: async (id: string) => this.delete<Pyxis>(`pyxis/${id}`),
	};

	user = {
		registerPatient: async (data: { name: string; email: string; password: string }) => this.post<Patient>('user/register/patient', data),
		registerEmployee: async (data: { name: string; email: string; password: string; role: EmployeeRole }) => this.post<Employee>('user/register/employee', data),
		login: async (data: { email: string; password: string }) => this.post<Patient | Employee>('user/login', data),
		getInfo: async () => this.get<{ user: Employee | Patient }>('user/info'),
	};

	medicine = {
		getAll: async () => this.get<Medicine[]>('medicine/'),
		getSpecific: async (id: string) => this.get<Medicine>(`medicine/${id}`),
		create: async (data: { names: string[]; id: string }) => this.post<Medicine>('medicine', data),
		delete: async (id: string) => this.delete<string>(`medicine/${id}`),
	};

	inventory = {
		getAllMedicinesOfPyxis: async (pyxisId: string) => this.get<Inventory[]>(`inventory/${pyxisId}`),
		getSpecificMedicineOfPyxis: async (pyxisId: string, medicineId: string) => this.get<Inventory>(`inventory/${pyxisId}/${medicineId}`),
		addMedicine: async (pyxisId: string, medicineId: string, data: { quantity: number }) => this.post<Inventory>(`inventory/add/${pyxisId}/${medicineId}`, data),
		removeMedicine: async (pyxisId: string, medicineId: string, data: { quantity: number }) => this.post<Inventory>(`inventory/remove/${pyxisId}/${medicineId}`, data),
		deleteMedicine: async (pyxisId: string, medicineId: string) => this.delete<string>(`inventory/${pyxisId}/${medicineId}`),
	};

	pyxis_report = {
		getAll: async () => this.get<{ pyxis: Pyxis; medicines: PyxisReport[] }[]>('pyxis_report/'),
		getSpecific: async (cuid: string) => this.get<PyxisReport>(`pyxis_report/${cuid}`),
		create: async (data: { type: PyxisReportType; employee_uuid: string; medicine_id: string; pyxis_id: string; observation: string; urgency: boolean }) =>
			this.post<PyxisReport>('pyxis_report', data),
		updateStatus: async (cuid: string, status: ReportStatus) => this.put<PyxisReport>(`pyxis_report/${cuid}`, { status }),
	};

	patient_report = {
		getAll: async () => this.get<PatientReport[]>('patient_report/'),
		getSpecific: async (cuid: string) => this.get<PatientReport>(`patient_report/${cuid}`),
		create: async (data: { type: PyxisReportType; patient_uuid: string; transaction_uuid: string; observation: string }) => this.post<PatientReport>('patient_report', data),
		updateStatus: async (cuid: string, status: ReportStatus) => this.put<PatientReport>(`patient_report/${cuid}`, { status }),
	};

	transactions = {
		getAll: async () => this.get<Transaction[]>('transaction/'),
		getSpecific: async (cuid: string) => this.get<Transaction>(`transaction/${cuid}`),
		create: async (data: { type: TransactionType; employee_uuid: string; patient_uuid: string; medicine_id: string; pyxis_id: string; quantity: number }) =>
			this.post<Transaction>('transaction', data),
	};
}

if (typeof process.env.API_URL === 'undefined') {
	throw new Error('API_URL is not defined in the environment variables, add it to .env file');
}

export default new ClientAPI(process.env.API_URL);
