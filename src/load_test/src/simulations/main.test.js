import { group } from 'k6';
import userTest from '../requests/user.request.js';
import medicineTest from '../requests/medicine.request.js';
import inventoryTest from '../requests/inventory.request.js';
import pyxisTest from '../requests/pyxis.request.js';

export let options = {
	thresholds: {
		http_req_failed: ['rate<0.01'], // http errors should be less than 1%
		http_req_duration: ['avg<50', 'p(95)<150', 'max<500'], // http request duration should be less than 50ms on average, 95th percentile response time should be below 150ms, and maximum below 500ms
	},
	http_errors_exclude: [404], // don't treat 404 as errors
	stages: [
		{ duration: '30s', target: 50 }, // ramp-up to 50 users
		{ duration: '1m', target: 100 }, // steady state at 100 users
		{ duration: '30s', target: 0 }, // ramp-down to 0 users
	],
};

export default function () {
	group('User Routes', userTest);
	group('Medicine Routes', medicineTest);
	group('Inventory Routes', inventoryTest);
	group('Pyxis Routes', pyxisTest);
}
