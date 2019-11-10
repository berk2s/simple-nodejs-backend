const express = require('express');
const router = express.Router();

// relevant model
const Order = require('../Models/Order');

/*
    this route returns all orders
 */

router.get('/', (req, res, next) => {

});

/*
    this route insert a order to db
    even emits socket
 */

router.post('/', (req, res, next) => {

    const { order_note, customer_id, order_date } = req.body;

    res.json(req.decoded);

});

module.exports = router;
