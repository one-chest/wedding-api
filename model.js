const mongoose = require('mongoose');

const GuestSchema = new mongoose.Schema({
    code: { type: String, required: true, index: true },
    name: { type: String, required: true },
    createdDate: Date,
    plus: Number,
    approved: Boolean,
    approvedDate: Date
});

const GuestModel = mongoose.model('guests', GuestSchema);

module.exports = {
    connect: (url) => {
        console.log(`Connecting to ${url}`);
        mongoose.connect(url, { useNewUrlParser: true });
    },

    Guest: {
        findAll: () => {
            return GuestModel.find({})
        },
        save: data => new GuestModel(data).save(),
        delete: guestId => GuestModel.findByIdAndRemove(guestId)
    }

};
