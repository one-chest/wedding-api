
function generateCode() {
    return (Math.round(new Date().getTime() % 1000000)).toString(16);
}

module.exports = { generateCode };