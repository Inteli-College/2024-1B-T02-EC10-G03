import * as test01 from './tests/inventory.test.js';
import * as test02 from './tests/medicines.test.js';
import * as test03 from './tests/pyxis.test.js';
import * as test04 from './tests/users.test.js';

export let options = {
	scenarios: {
		scenario1: {
			executor: 'constant-vus',
			vus: 10,
			duration: '3s',
			exec: 'scenario1',
		},
		scenario2: {
			executor: 'constant-vus',
			vus: 5,
			duration: '5s',
			exec: 'scenario2',
		},
		scenario3: {
			executor: 'constant-vus',
			vus: 5,
			duration: '8s',
			exec: 'scenario3',
		},
	},
};

export function scenario1() {
	test01.default();
}

export function scenario2() {
	test02.default();
	test03.default();
}

export function scenario3() {
	test04.default();
}