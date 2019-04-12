const request = require('supertest');
const app = require('../app');

describe('Application managment test', () => {

    it('health should be 200', function(done) {
        request(app)
            .get('/health')
            .expect(200, done);
    })
})