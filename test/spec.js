const prepare = require('mocha-prepare');
const mongoUnit = require('mongo-unit');
const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const assert = require('assert');

const guest = {
    guests: {
        "_id": "56d9bf92f9be48771d6fe5b1",
        "code": "0000",
        "name": "Руслан Михалев",
        "createdDate": new Date(),
    }
};

const approvedGuest = {
    guests: {
        "_id": "56d9bf92f9be48771d6fe5b1",
        "code": "0000",
        "name": "Руслан Михалев",
        "createdDate": new Date(),
        "plus": 1,
        "approved": false,
        "approvedDate": new Date()
    }
};

describe('Application managment test', () => {

    it('health should be 200', function (done) {
        request(app)
            .get('/health')
            .expect(200, done);
    });

});

describe('API', () => {

    before(done => {
        mongoUnit
            .start()
            .then(testMongoUrl => {
                console.log(`MongoDB is running at ${testMongoUrl}`);
                app.mongoConnect(testMongoUrl);
                done();
            })
            .catch(e => done(e));
    });

    beforeEach(done => {
        mongoUnit.drop().then(done);
    });

    it('should get guest list', function (done) {
        mongoUnit.load(guest)
            .then(() => request(app)
                .get('/guests')
                .expect(200)
                .then(response => {
                    assert.equal(response.body.length, 1);
                    assert.equal(response.body[0].name, "Руслан Михалев");
                    assert.equal(response.body[0].code, "0000");
                    assert.ok(response.body[0].createdDate);
                    done()
                })
            )
            .catch(e => done(e));
    });

    it('should get approved guest list', function (done) {
        mongoUnit.load(approvedGuest)
            .then(() => request(app)
                .get('/guests')
                .expect(200)
                .then(response => {
                    assert.equal(response.body.length, 1);
                    assert.equal(response.body[0].plus, 1);
                    assert.equal(response.body[0].name, "Руслан Михалев");
                    done()
                })
            )
            .catch(e => done(e));
    });

    after(done => {
        mongoUnit.stop().then(() => mongoose.disconnect()).then(done)
    });
});