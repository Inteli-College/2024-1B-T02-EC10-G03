import http from 'k6/http';
import { check } from 'k6';
import { randomString, randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';
import { createMedicine, deleteMedicine } from './medicine.request.js';
import { createPyxis, getPyxis, deletePyxis } from './pyxis.request.js';

const BASE_URL = `http://${__ENV.HOSTNAME}:3000`;

export function getMedicineFromPyxis(pyxisId, medicineID) {
	let res = http.get(`${BASE_URL}/inventory/${pyxisId}/${medicineID}`);

	if (res.status === 404) {
		return null;
	}

	check(res, {
		'get medicine from pyxis status is 200': (r) => r.status === 200,
		'get medicine from pyxis response is valid': (r) => r.json() !== null,
		'get medicine from pyxis medicineID is correct': (r) => r.json().medicineId === medicineID,
	});

	return res.json();
}

export function addToPyxis(pyxisId, medicineID, quantity) {
	let payload = { quantity };

	const pyxis = getPyxis(pyxisId);

	let res = http.post(`${BASE_URL}/inventory/add/${pyxisId}/${medicineID}`, JSON.stringify(payload), {
		headers: {
			'Content-Type': 'application/json',
		},
	});

	check(res, {
		'add to pyxis status is 200': (r) => r.status === 200,
		'add to pyxis response is valid': (r) => r.json() !== null,
		'add to pyxis pyxisUUID is correct': (r) => r.json().pyxisUuid === pyxis.uuid,
		'add to pyxis medicineID is correct': (r) => r.json().medicineId === medicineID,
		'add to pyxis quantity is correct': (r) => r.json().quantity === quantity,
	});

	return res.json();
}

export function removeFromPyxis(pyxisId, medicineID, quantity) {
	let payload = { quantity };

	const currentMedicine = getMedicineFromPyxis(pyxisId, medicineID);
	let currentQuantity = currentMedicine ? currentMedicine.quantity : 0;

	const pyxis = getPyxis(pyxisId);

	let res = http.post(`${BASE_URL}/inventory/remove/${pyxisId}/${medicineID}`, JSON.stringify(payload), {
		headers: {
			'Content-Type': 'application/json',
		},
	});

	check(res, {
		'remove from pyxis status is 200': (r) => r.status === 200,
		'remove from pyxis response is valid': (r) => r.json() !== null,
		'remove from pyxis pyxisUUID is correct': (r) => r.json().pyxisUuid === pyxis.uuid,
		'remove from pyxis medicineID is correct': (r) => r.json().medicineId === medicineID,
		'remove from pyxis quantity is correct': (r) => r.json().quantity === currentQuantity - quantity,
	});

	return res.json();
}

export function deleteFromInventory(pyxisId, medicineID) {
	let res = http.del(`${BASE_URL}/inventory/${pyxisId}/${medicineID}`);

	const pyxis = getPyxis(pyxisId);

	check(res, {
		'delete from inventory status is 200': (r) => r.status === 200,
		'delete from inventory response is valid': (r) => r.json() !== null,
		'delete from inventory pyxisUUID is correct': (r) => r.json().pyxisUuid === pyxis.uuid,
		'delete from inventory medicineID is correct': (r) => r.json().medicineId === medicineID,
	});

	return res.json();
}

export default function inventoryTest() {
	let createdPyxisId = createPyxis(randomIntBetween(1, 100), randomString(8));
	let createdMedicineId = createMedicine(randomString(16), [randomString(32)]);
	let addQuantity = randomIntBetween(1, 1000);
	let removeQuantity = randomIntBetween(1, addQuantity - 1);

	addToPyxis(createdPyxisId, createdMedicineId, addQuantity);
	removeFromPyxis(createdPyxisId, createdMedicineId, removeQuantity);
	deleteFromInventory(createdPyxisId, createdMedicineId);

	deleteMedicine(createdMedicineId);
	deletePyxis(createdPyxisId);
}
