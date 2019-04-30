const axios = require('axios');

const TRELLO_GREEN_LABEL_ID = process.env.TRELLO_GREEN_LABEL_ID;
const TRELLO_KEY = process.env.TRELLO_KEY;
const TRELLO_TOKEN = process.env.TRELLO_TOKEN;
const TRELLO_ENABLED = process.env.TRELLO_ENABLED !== "false";

if (TRELLO_ENABLED) {
    if (!TRELLO_GREEN_LABEL_ID)
        throw new Error("TRELLO_GREEN_LABEL_ID environment not specified");
    if (!TRELLO_KEY)
        throw new Error("TRELLO_KEY environment not specified");
    if (!TRELLO_TOKEN)
        throw new Error("TRELLO_TOKEN environment not specified");
}

function approveGuest(data) {
    if (TRELLO_ENABLED && !data.approved) {
        const url = "https://api.trello.com/1/cards/" + data.cardId + "/idLabels?value=" + TRELLO_GREEN_LABEL_ID + "&key=" + TRELLO_KEY + "&token=" + TRELLO_TOKEN;
        return axios.post(url);
    }
    return Promise.resolve(true);
}

function addCode(cardId, code) {
    if (TRELLO_ENABLED) {
        const url = `https://api.trello.com/1/cards/${cardId}/actions/comments?text=https://chest.one/${code}&key=${TRELLO_KEY}&token=${TRELLO_TOKEN}`;
        console.log(url);
        return axios.post(url);
    }
    return Promise.resolve(true);
}

module.exports = {approveGuest, addCode};