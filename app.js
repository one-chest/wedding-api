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

app.post('/guests', function (req, res) {
    return Guest.save(req.body).then(r => res.send(r)).catch(e => errorHandler(res, e));
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