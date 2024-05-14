import http from 'k6/http';
import { check } from 'k6';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

const BASE_URL = `http://${__ENV.HOSTNAME}:3000`;

export function createMedicine(id, names) {
	let payload = { id, names };

	let res = http.post(`${BASE_URL}/medicine/`, JSON.stringify(payload), {
		headers: {
			'Content-Type': 'application/json',
		},
	});

	check(res, {
		'create medicine status is 201': (r) => r.status === 201,
		'create medicine response is valid': (r) => r.json() !== null,
		'create medicine id is correct': (r) => r.json().id === id,
	});

	return payload.id;
}

export function getMedicine(id) {
	let res = http.get(`${BASE_URL}/medicine/${id}`);

	check(res, {
		'get medicine status is 200': (r) => r.status === 200,
		'get medicine response is valid': (r) => r.json() !== null,
		'get medicine id is correct': (r) => r.json().id === id,
	});
}

export function getAllMedicine() {
	let res = http.get(`${BASE_URL}/medicine/`);

	check(res, {
		'get all medicine status is 200': (r) => r.status === 200,
		'get all medicine response is valid': (r) => r.json() !== null,
	});
}

export function deleteMedicine(id) {
	let res = http.del(`${BASE_URL}/medicine/${id}`);

	check(res, {
		'delete medicine status is 200': (r) => r.status === 200,
		'delete medicine response is valid': (r) => r.json() !== null,
		'delete medicine id is correct': (r) => r.json().id === id,
	});
}

export default function medicineTest() {
	getAllMedicine();

	let createdMedicineId = createMedicine(randomString(16), [randomString(32)]);

	getMedicine(createdMedicineId);
	deleteMedicine(createdMedicineId);
}
