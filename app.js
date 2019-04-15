const express = require('express');
const app = express();
const { connect, Guest } = require('./model');
const bodyParser = require('body-parser');

app.mongoConnect = connect;
app.use(bodyParser.json());

app.get('/health', function(req, res) {
    res.status(200);
    res.send({status: "UP"});
});

app.post('/guests/meet', function(req, res) {
    res.status(200);
    return Guest.meet(req.body.code, {
        plus: req.body.plus
    })
        .then(r => res.send(r));
});

app.get('/guests', function(req, res) {
    return Guest.findAll().then(r => res.send(r));
});

app.get('/guests/:id', function(req, res) {
    res.status(501);
    res.send();
});

module.exports = app;