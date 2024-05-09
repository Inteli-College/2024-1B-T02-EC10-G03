import http from 'k6/http';
import {sleep} from 'k6';
import { randomIntBetween, uuidv4 } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

export const options = {

    blacklistIPs: [],

    thresholds: {
        http_req_failed: ['rate<0.05'], 
        http_req_duration: ['p(95)<300'],
    },

    vus: 10,
    duration: '30s',
};

export default function () {
    const baseUrl = 'http://localhost:3000';
    
    http.get(baseUrl);

    http.get(baseUrl + '/pyxis');
    http.get(baseUrl + '/catalog');

    // Creating a new pyxis entry
    const pyxisPayload = JSON.stringify({ floor: randomIntBetween(1, 11), block: 'exampleBlock' });
    http.post(baseUrl + '/pyxis', pyxisPayload, { headers: { 'Content-Type': 'application/json' } });

    // Creating a new medicine
    const catalogPayload = JSON.stringify({ name: 'exampleMedicineName' });
    http.post(baseUrl + '/catalog', catalogPayload, { headers: { 'Content-Type': 'application/json' } });

    // Deleting a pyxis entry and medicine
    // Currently, the delete operation is leading
    // to a error because of the uuid not existing
    
    /*
    http.del(baseUrl + '/pyxis/' + uuidv4());
    http.del(baseUrl + '/catalog/' + uuidv4());
    */

    sleep(1);

};

