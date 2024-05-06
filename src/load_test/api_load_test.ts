import http from 'k6/http';

export const options = {

    blacklistIPs: [],

    thresholds: {
        http_req_failed: ['rate<0.01'], 
        http_req_duration: ['p(95)<200'],
    },

    vus: 10,
    duration: '30s',
};

export default function () {
    const url = 'http://localhost:3000/';
    
    http.get(url);

    http.get(url + 'swagger.json');

};

