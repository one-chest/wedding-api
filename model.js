const mongoose = require('mongoose');
const qrcodeGenerator = require('qrcode');
const trelloService = require('./trello-service');

const weddingWebsite = process.env.WEDDING_WEBSITE || 'localhost:80';

const GuestSchema = new mongoose.Schema({
    cardId: {type: String, required: true},
    code: {type: String, required: true, index: true},
    qrcode: {type: String, required: true},
    name: {type: String, required: true},
    greeting: {type: String, required: true},
    email: {type: String},
    phone: {type: String},
    createdDate: Date,
    extras: Number,
    day: {type: String},
    approved: Boolean,
    approvedDate: Date
});

const GuestModel = mongoose.model('guests', GuestSchema);

module.exports = {
    connect: (url) => {
        console.log(`Connecting to ${url}`);
        mongoose.connect(url, {useNewUrlParser: true});
    },

    Guest: {
        findAll: () => {
            return GuestModel.find({})
        },
        findByCode: code => {
            return GuestModel.findOne({code})
        },
        meet: (code, data) => {
            console.debug(`Approve user with code ${code}`);
            return GuestModel.updateOne({code: code}, {
                $set: {
                    phone: data.phone,
                    extras: data.extras,
                    day: data.day,
                    email: data.email,
                    approved: true,
                    approvedDate: new Date()
                }
            })
        },
        save: (data) => {
            return trelloService.generateAndSaveCode(data.cardId)
                .then(code => {
                    return qrcodeGenerator.toDataURL(`${weddingWebsite}/${code}`)
                        .then(qrcode => {
                                return new GuestModel({
                                    ...data,
                                    code,
                                    qrcode: qrcode,
                                    createdDate: new Date()
                                }).save();
                            }
                        )
                })
        },
        update: (data) => GuestModel.updateOne({code: data.code}, {$set: data}),
        delete: guestId => GuestModel.findByIdAndRemove(guestId)
    }
};
