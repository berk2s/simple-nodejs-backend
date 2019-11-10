var express = require('express');
var router = express.Router();

// socket.io
const socketApi = require('../src/socketApi');

// jwt
const jwt = require('jsonwebtoken');

// bcrypt
const bcrypt = require('bcryptjs');

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

/*
    this router register a user to database
 */

router.post('/register', (req, res, next) => {

    const { name, username, password, address, phone } = req.body;

    bcrypt.genSalt(10, (err, salt) => {
       bcrypt.hash(password, salt, (err, hash) => {

       });
    });

});

/*
    this router authenticate a user
 */

router.post('/authenticate', (req, res, next) => {



});


module.exports = router;
