const express = require('express');
const app = express();
const { connect, Guest } = require('./model');

app.mongoConnect = connect;

app.get('/health', function(req, res) {
    res.status(200);
    res.send({status: "UP"});
});

app.post('/guests/meet', function(req, res) {
    res.status(501);
    res.send();
});

app.get('/guests', function(req, res) {
    return Guest.findAll().then(r => res.send(r));
});

app.get('/guests/:id', function(req, res) {
    res.status(501);
    res.send();
});

module.exports = app;