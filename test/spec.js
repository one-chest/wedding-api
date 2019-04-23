const mongoUnit = require('mongo-unit');
const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const mongodb = require('mongoose');
const assert = require('assert');
const {Guest} = require('../model');

const guest = {
    guests: {
        "_id": "56d9bf92f9be48771d6fe5b1",
        "code": "0000",
        "qrcode": "data:image/png;base64,iVB===",
        "name": "Руслан Михалев",
        "createdDate": new Date(),
    }
};

const guests = {
    guests: [
        {
            "_id": "56d9bf92f9be48771d6fe5b1",
            "code": "0000",
            "qrcode": "data:image/png;base64,iVB===",
            "name": "Руслан Михалев",
            "createdDate": new Date(),
        },
        {
            "_id": "56d9bf92f9be48771d6fe5b2",
            "code": "00a1",
            "qrcode": "data:image/png;base64,iVB===",
            "name": "Анастасия Шаповалова",
            "createdDate": new Date(),
        }
    ]
};

const approvedGuest = {
    guests: {
        "_id": "56d9bf92f9be48771d6fe5b1",
        "code": "0000",
        "qrcode": "data:image/png;base64,iVB===",
        "name": "Руслан Михалев",
        "createdDate": new Date(),
        "extras": 1,
        "approved": true,
        "approvedDate": new Date()
    }
};

describe('Application managment test', () => {

    it('health should be 200', function (done) {
        request(app)
            .get('/guests/health')
            .expect(200, done);
    });

});

describe('Test util', () => {

    const util = require('../util');

    it('code size should be 5 or less', function (done) {
        assert.ok(util.generateCode().length <= 5);
        done()
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
                    assert.ok(response.body[0].qrcode);
                    assert.ok(response.body[0].qrcode.indexOf("png") > 0);
                    assert.ok(response.body[0].createdDate);
                    done()
                })
            )
            .catch(e => done(e));
    });

    it('should find guest by code', function (done) {
        mongoUnit.load(guests)
            .then(() => request(app)
                .get('/guests/00a1')
                .expect(200)
                .then(response => {
                    assert.equal(response.body.name, "Анастасия Шаповалова");
                    assert.equal(response.body.code, "00a1");
                    done()
                })
            )
            .catch(e => done(e));
    });

    it('should find guest by code in upper case', function (done) {
        mongoUnit.load(guests)
            .then(() => request(app)
                .get('/guests/00A1')
                .expect(200)
                .then(response => {
                    assert.equal(response.body.name, "Анастасия Шаповалова");
                    assert.equal(response.body.code, "00a1");
                    assert.ok(response.body.qrcode);
                    assert.ok(response.body.qrcode.indexOf("png") > 0);
                    assert.ok(response.body.createdDate);
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
                    assert.equal(response.body[0].extras, 1);
                    assert.equal(response.body[0].name, "Руслан Михалев");
                    assert.equal(response.body[0].approved, true);
                    done()
                })
            )
            .catch(e => done(e));
    });

    it('should approve the guest', function (done) {
        mongoUnit.load(guest)
            .then(() => request(app)
                .post('/guests/meet')
                .send("code=0000&extras=3")
                .expect(200)
                .then(response => {
                    return request(app)
                        .get('/guests')
                        .expect(200)
                        .then(response => {
                            assert.equal(response.body.length, 1);
                            assert.equal(response.body[0].approved, true);
                            assert.equal(response.body[0].extras, 3);
                            assert.equal(response.body[0].name, "Руслан Михалев");
                            done()
                        });
                })
            )
            .catch(e => done(e));
    });


    it('should 204 if no guest by code found', function (done) {
        mongoUnit.load(guest)
            .then(() => request(app)
                .post('/guests/meet')
                .send({
                    code: "A000",
                    extras: 3
                })
                .expect(204)
                .then(() => done())
            )
            .catch(e => done(e));
    });


    it('should save the guest', function (done) {
        request(app)
            .post('/guests')
            .send({
                name: "Руслан Михалев"
            })
            .expect(200)
            .then(response => {
                return Guest.findAll()
                    .then(guests => {
                        assert.equal(guests.length, 1);
                        assert.equal(guests[0].name, "Руслан Михалев");
                        assert.ok(guests[0].code);
                        assert.ok(guests[0].qrcode);
                        assert.ok(guests[0].qrcode.indexOf("png") > 0);
                        assert.equal(guests[0].approved, undefined);
                        assert.equal(guests[0].extras, undefined);
                        done();
                    })
            })
            .catch(e => done(e));
    });


    after(done => {
        mongoUnit.stop().then(() => mongoose.disconnect()).then(done)
    });
});