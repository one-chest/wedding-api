const express = require('express');
const app = express();
const {connect, Guest} = require('./model');
const bodyParser = require('body-parser');
const qrcode = require('qrcode');
const trelloService = require('./trello-service');

app.mongoConnect = connect;
app.use(bodyParser.json());
app.use(express.urlencoded());

function errorHandler(res, e) {
    res.status(500);
    console.error(e);
    res.send(e.message);
}

app.get('/guests/health', function (req, res) {
    res.status(200);
    res.send({status: "UP"});
});

app.post('/guests/meet', function (req, res) {
    return Guest.findByCode(req.body.invite_code)
        .then(guest => Guest.meet(req.body.invite_code, {
            phone: req.body.phone,
            extras: req.body.extras,
            email: req.body.email
        })
            .then(result => {
                if (result.nModified) {
                    res.status(200);
                    res.send();
                    return trelloService.approveGuest(guest).then(() => result);
                }
                res.status(204);
                res.send();
            })
            .catch(e => errorHandler(res, e)));
});

app.get('/guests', function (req, res) {
    return Guest.findAll().then(r => res.send(r)).catch(e => errorHandler(res, e));
});

app.get('/guests/list', function (req, res) {
    return Guest.findAll().then(result => {
        const header = "<html><body>";
        const total = result.length;
        const data = result.map(r => r.name + ` [<a href='https://chest.one/${r.code}'>${r.code}</a>] ` + " <img style='display:block; width:100px;height:100px;' src='" + r.qrcode + "' />")
            .sort()
            .reduce((r, n) => r + "<br />" + n);
        const footer = "</body></html>";

        return res.send(header + data + "<br />" + "Всего: " + total + footer);
    }).catch(e => errorHandler(res, e));
});

app.post('/guests', function (req, res) {
    return Guest.save(req.body).then(r =>
        trelloService
            .addCode(r.cardId, r.code)
            .then(() => res.send(r)))
        .catch(e => errorHandler(res, e));
});

app.patch('/guests', function (req, res) {
    return Guest.update(req.body).then(r => res.send({modified: r.nModified > 0})).catch(e => errorHandler(res, e));
});

app.get('/guests/:id', function (req, res) {
    return Guest.findByCode(req.params.id.toLowerCase()).then(r => {
        if (!r) {
            res.status(404);
        }
        res.send(r)
    }).catch(e => errorHandler(res, e));
})
;

module.exports = app;