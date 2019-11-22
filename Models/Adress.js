const mongose = require('mongoose');
const Schema = mongose.Schema;

const AdressModel = new Schema({
    user_id: mongose.Types.ObjectId,
    adress: {
        type:String,
        required:[true, 'Lutfen adresin girin'],
        min:[3, 'Kisa Adres'],
        max:[100, 'Uzun Adres']
    },
    adress_note:{
        type:String,
        min:[1, 'Kisa Not'],
        max:[100, 'Uzun Not']
    }
});

module.exports = mongose.model('adress', AdressModel);
