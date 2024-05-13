import http from 'k6/http';
import { check, sleep } from 'k6';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

export const options = {
	thresholds: {
		http_req_failed: ['rate<0.05'], // http errors should be less than 5%
		http_req_duration: ['avg<50', 'p(95)<100', 'max<300'], // http requests duration should be less than 50ms on average, 95th percentile should be below 100ms, and maximum below 200ms
	},
	stages: [
		{ duration: '10s', target: 50 }, // ramp-up to 50 users
		{ duration: '30s', target: 100 }, // steady state at 100 users
		{ duration: '10s', target: 0 }, // ramp-down to 0 users
	],
};

const BASE_URL = `http://${__ENV.HOSTNAME}:3000`;

export function login(email, password) {
	let payload = { email, password };

	let loginRes = http.post(`${BASE_URL}/user/login`, JSON.stringify({ email, password }), {
		headers: {
			'Content-Type': 'application/json',
		},
	});

	check(loginRes, {
		'login status is 200': (r) => r.status === 200,
		'login response is valid': (r) => r.json() !== null,
		'login response is same as payload': (r) => r.json().email === payload.email,
	});

	let userInfoRes = http.get(`${BASE_URL}/user/info`);

	check(userInfoRes, {
		'get user info status is 200': (r) => r.status === 200,
		'get user info response is valid': (r) => r.json() !== null,
		'get user info response is same as payload': (r) => r.json().email === payload.email,
	});
}

export function createEmployee() {
	let payload = {
		name: 'John Doe',
		email: `employee_${randomString(16)}@${randomString(8)}.com`,
		password: 'password123',
		role: 'IT',
	};

	let res = http.post(`${BASE_URL}/user/register/employee`, JSON.stringify(payload), {
		headers: {
			'Content-Type': 'application/json',
		},
	});

	check(res, {
		'create employee status is 201': (r) => r.status === 201,
		'create employee response is valid': (r) => r.json() !== null,
	});

	return payload;
}

export function createPatient() {
	let payload = {
		name: 'Jane Doe',
		email: `patient_${randomString(16)}@${randomString(8)}.com`,
		password: 'password',
	};

	let res = http.post(`${BASE_URL}/user/register/patient`, JSON.stringify(payload), {
		headers: {
			'Content-Type': 'application/json',
		},
	});

	check(res, {
		'create patient status is 201': (r) => r.status === 201,
		'create patient response is valid': (r) => r.json() !== null,
	});

	return payload;
}

export default function () {
	const employee = createEmployee();
	const patient = createPatient();

	[employee, patient].forEach((user) => {
		login(user.email, user.password);
	});
}
