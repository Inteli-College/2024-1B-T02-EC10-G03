import http from 'k6/http';
import { check } from 'k6';
import { randomString, randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

const BASE_URL = `http://${__ENV.HOSTNAME}:3000`;

export function createPyxis(floor, block) {
	let payload = { floor, block };

	let res = http.post(`${BASE_URL}/pyxis/`, JSON.stringify(payload), {
		headers: {
			'Content-Type': 'application/json',
		},
	});

	check(res, {
		'create pyxis status is 201': (r) => r.status === 201,
		'create pyxis response is valid': (r) => r.json !== null,
		'create pyxis floor is correct': (r) => r.json().floor === floor,
		'create pyxis block is correct': (r) => r.json().block === block.toUpperCase(),
	});

	return `${res.json().floor}${res.json().block}`;
}

export function getAllPyxis() {
	let res = http.get(`${BASE_URL}/pyxis/`);

	check(res, {
		'get all pyxis status is 200': (r) => r.status === 200,
		'get all pyxis response is valid': (r) => r.json() !== null,
	});
}

export function getPyxis(pyxisId) {
	let res = http.get(`${BASE_URL}/pyxis/${pyxisId}`);

	check(res, {
		'get pyxis status is 200': (r) => r.status === 200,
		'get pyxis response is valid': (r) => r.json() !== null,
		'get pyxis pyxisId is correct': (r) => `${r.json().floor}${r.json().block}` === pyxisId,
	});

	return res.json();
}

export function deletePyxis(pyxisId) {
	let res = http.del(`${BASE_URL}/pyxis/${pyxisId}`);

	check(res, {
		'delete pyxis status is 200': (r) => r.status === 200,
		'delete pyxis response is valid': (r) => r.json() !== null,
		'delete pyxis pyxisId is correct': (r) => `${r.json().floor}${r.json().block}` === pyxisId,
	});
}

export default function pyxisTest() {
	getAllPyxis();

	let createdPyxisId = createPyxis(randomIntBetween(1, 100), randomString(8));

	getPyxis(createdPyxisId);
	deletePyxis(createdPyxisId);
}
