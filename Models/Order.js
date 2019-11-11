const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const moment = require('moment-timezone');
const dateTurkey = moment.tz(Date.now(), "Europe/Istanbul");

const OrderModel = new Schema({
    customer_id: mongoose.Types.ObjectId,
    order_note:{
        type:String,
    },
    order_date:{
        type:Date,
        default:dateTurkey._d
    },
    order_status:{
        type:Number,
        default: 0
    }
});

module.exports = mongoose.model('Order', OrderModel);
