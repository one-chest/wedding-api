const mongoose = require('mongoose');
const util = require('./util');
const qrcodeGenerator = require('qrcode');

const weddingWebsite = process.env.WEDDING_WEBSITE || 'mongodb://localhost:27017/wedding';

const GuestSchema = new mongoose.Schema({
    code: {type: String, required: true, index: true},
    qrcode: {type: String, required: true},
    name: {type: String, required: true},
    createdDate: Date,
    plus: Number,
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
                    plus: data.plus,
                    approved: true,
                    approvedDate: new Date()
                }
            })
        },
        save: name => {
            const code = util.generateCode();
            return qrcodeGenerator.toDataURL(`${weddingWebsite}/?code=${code}`)
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
