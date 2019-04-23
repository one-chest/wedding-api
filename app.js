const express = require('express');
const app = express();
const {connect, Guest} = require('./model');
const bodyParser = require('body-parser');
const qrcode = require('qrcode');

app.mongoConnect = connect;
app.use(bodyParser.json());

app.get('/health', function (req, res) {
    res.status(200);
    res.send({status: "UP"});
});

app.post('/guests/meet', function (req, res) {
    return Guest.meet(req.body.code, {
        extras: req.body.extras
    })
        .then(r => {
            res.status(r.nModified > 0 ? 200 : 204);
            res.send();
        });
});

app.get('/guests', function (req, res) {
    return Guest.findAll().then(r => res.send(r));
});

app.post('/guests', function (req, res) {
    return Guest.save(req.body.name).then(r => res.send(r));
});

app.get('/guests/:id', function (req, res) {
    return Guest.findByCode(req.params.id.toLowerCase()).then(r => res.send(r));
})
;

module.exports = app;