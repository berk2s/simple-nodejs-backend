const mongoose = require('mongoose');

module.exports = () => {

    mongoose.connect('mongodb://admin:Mzk!7vx3Et5s66t@ds143156.mlab.com:43156/heroku_ph7lcj39', { useNewUrlParser: true, useUnifiedTopology: true });

    mongoose.connection
        .on('open', () => {
            console.log('MongoDB connection is succesful!')
        })
        .on('error', (err) => {
           console.log('MongoDB connection has a error', err);
        });

}
