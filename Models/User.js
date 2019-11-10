const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserModel = new Schema({
    name:{
        type:String,
        required:[true, 'Lutfen isminizi girin']
    },
    username:{
        type:String,
        unique:true,
        required:[true, 'Lutfen e-posta girin']
    },
    user_password:{
        type:String,
        required:[true, 'Lutfen sifre girin']
    },
    user_phone:{
        type:String,
        unique: true,
        required:[true, 'Lutfen telefon numarasi girin']
    },
    user_address:{
        type:String
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
});

module.exports = mongoose.model('User', UserModel);
