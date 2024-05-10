class APIResponse {
	status: number;
	data: any;

	constructor(status: number, data: any) {
		this.status = status;
		this.data = data;
	}
}

class ClientAPI {
	private base_url: string;

	constructor(base_url: string) {
		this.base_url = base_url;
	}

	async get(path: string) {
		const response = await fetch(`${this.base_url}/${path}`);
		return new APIResponse(response.status, await response.json());
	}

	async post(path: string, data: any) {
		const response = await fetch(`${this.base_url}/${path}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});

		return new APIResponse(response.status, await response.json());
	}

	async put(path: string, data: any) {
		const response = await fetch(`${this.base_url}/${path}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});

		return new APIResponse(response.status, await response.json());
	}

	async delete(path: string) {
		const response = await fetch(`${this.base_url}/${path}`, {
			method: 'DELETE',
		});

		return new APIResponse(response.status, await response.json());
	}

	pyxis = {
		getAll: async () => this.get('pyxis/'),
		create: async (data: { floor: number; block: string }) => this.post('pyxis/', data),
		getSpecific: async (id: string) => this.get(`pyxis/${id}`),
		deleteSpecific: async (id: string) => this.delete(`pyxis/${id}`),
	};

	user = {
		registerPatient: async (data: { name: string; email: string; password: string }) => this.post('user/register/patient', data),
		registerEmployee: async (data: { name: string; email: string; password: string; role: 'NURSE' | 'PHARMACIST' | 'IT' | 'ADMIN' | 'COMMONER' }) => this.post('user/register/employee', data),
		login: async (data: { email: string; password: string }) => this.post('user/login', data),
		getInfo: async () => this.get('user/info'),
	};

	medicine = {
		getAll: async () => this.get('medicine/'),
		create: async (data: { names: string[]; id: string }) => this.post('medicine/', data),
		getSpecific: async (id: string) => this.get(`medicine/${id}`),
		delete: async (id: string) => this.delete(`medicine/${id}`),
	};

	inventory = {
		getMedicines: async (pyxisId: string) => this.get(`inventory/${pyxisId}`),
		addMedicine: async (pyxisId: string, data: { medicine_id: string; quantity: number }) => this.post(`inventory/add/${pyxisId}`, data),
		removeMedicine: async (pyxisId: string, data: { medicine_id: string; quantity: number }) => this.post(`inventory/remove/${pyxisId}`, data),
		deleteMedicine: async (pyxisId: string, medicineId: string) => this.delete(`inventory/${pyxisId}/${medicineId}`),
	};
}

if (typeof process.env.API_URL === 'undefined') {
	throw new Error('API_URL is not defined in the environment variables, add it to .env file');
}

export default new ClientAPI(process.env.API_URL);
