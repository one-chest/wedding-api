const app = require('./app');

const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/wedding';

app.mongoConnect(mongoUrl);

app.listen(5050, function() {
    console.log('Express server listening on port 5050');
});
