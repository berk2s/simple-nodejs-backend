var express = require('express');
var router = express.Router();

const socketApi = require('../src/socketApi');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });

  socketApi.io.emit('newOrder', {order:{
      order_id: 2321,
      order_time:'14:23',
      order_note:'something like mee',
      order_status: 0,
      customer_id: 23,
      customer_phone: '05396861440',
      customer_address: '1625.ada d blok dayre 5',
    }});

});

module.exports = router;
