const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserModel = new Schema({
    name:{
        type:String,
        maxLength:[50, 'Maximum 50 karakter giriniz']
    },
    username:{
        type:String,
        unique:true,
        required:[true, 'Lutfen e-posta girin'],
        maxLength:[50, 'Maximum 50 karakter giriniz']
    },
    password:{
        type:String,
        required:[true, 'Lutfen sifre girin']
    },
    phone:{
        type:String,
        unique: true,
        required:[true, 'Lutfen telefon numarasi girin'],
        minlength:[10, 'Lutfen gercek numara girin'],
        maxLength:[11, 'Lutfen gercek numara girin'],
    },
    address:{
        type:String,
        maxLength:[300, 'Fazla uzun adres']
    },
    user_push_token:{
        type:Number,
        default:null
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
});

module.exports = mongoose.model('User', UserModel);
