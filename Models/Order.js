const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderModel = new Schema({
    customer_id: mongoose.Types.ObjectId,
    order_note:{
        type:String,
    },
    order_date:{
        type:Date,
        default:Date.now
    }
});

module.exports = mongoose.model('Order', OrderModel);
