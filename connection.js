const mongoose = require('mongoose');

async function connectMongoDB(URL){
    mongoose.connect(URL);
}

module.exports = { connectMongoDB };
