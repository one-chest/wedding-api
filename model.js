const mongoose = require('mongoose');
const util = require('./util');
const qrcodeGenerator = require('qrcode');

const weddingWebsite = process.env.WEDDING_WEBSITE || 'localhost:80';

const GuestSchema = new mongoose.Schema({
    code: {type: String, required: true, index: true},
    qrcode: {type: String, required: true},
    name: {type: String, required: true},
    email: {type: String},
    createdDate: Date,
    extras: Number,
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
                    extras: data.extras,
                    email: data.email,
                    approved: true,
                    approvedDate: new Date()
                }
            })
        },
        save: name => {
            const code = util.generateCode();
            return qrcodeGenerator.toDataURL(`${weddingWebsite}/${code}`)
                .then(qrcode => new GuestModel({
                        name: name,
                        code: code,
                        qrcode: qrcode,
                        createdDate: new Date()
                    }).save()
                )
        },
        delete: guestId => GuestModel.findByIdAndRemove(guestId)
    }
};
