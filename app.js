var express = require('express');
var app = express();

app.get('/health', function(req, res) {
    res.status(200);
    res.send({status: "UP"});
});

app.post('/guests/meet', function(req, res) {
    res.status(501);
    res.send();
});

app.get('/guests', function(req, res) {
    res.status(501);
    res.send();
});

app.get('/guests/:id', function(req, res) {
    res.status(501);
    res.send();
});

module.exports = app;