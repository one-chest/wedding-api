
function generateCode() {
    return (Math.round(new Date().getTime() % 100000)).toString(16);
}

module.exports = { generateCode };