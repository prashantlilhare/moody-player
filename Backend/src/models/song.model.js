const mongoose = require('mongoose');




const songSchemma = new mongoose.Schema({
    title:String,
    artist:String,
    audio:String,
    mood:String,
})




const song =mongoose.model('song',songSchemma)




module.exports = song