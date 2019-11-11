const express = require('express');
const router = express.Router();

// relevant model
const Order = require('../Models/Order');

// socket.io
const socketApi = require('../src/socketApi');


/*
    this route returns all orders with customer fields
 */

router.get('/', async (req, res, next) => {
    try{
        const orders = await Order.aggregate([
            {
                $lookup:{
                    from:'users',
                    localField:'customer_id',
                    foreignField:'_id',
                    as:'customer'
                }
            },
            {
                $unwind:{
                    path:'$customer'
                }
            }
        ]);
        res.json(orders);
    }catch(e){
        res.json(e);
    }
});

/*
    this route insert a order to db
    even emits socket
 */

router.post('/', async (req, res, next) => {

    const { order_note, customer_id } = req.body;

    const moment = require('moment-timezone');
    const dateTurkey = moment.tz(Date.now(), "Europe/Istanbul");

    const order_ = new Order({
        order_note,
        customer_id,
        order_date: dateTurkey._d
    })

    try{
        const order = await order_.save();

        socketApi.io.emit('newOrder', {order});

        res.json(order);
    }catch(e){
        res.json(e);
    }

});

router.get('/notcheckeds', async (req, res) => {
   try{
       const notCheckeds = await Order.find({order_status:0});
       res.json(notCheckeds);
   }catch(e){
       res.json(e);
   }
});

router.get('/checkeds', async (req, res) => {
   try{
       const checkeds = await Order.find({order_status:1});
       res.json(checkeds);
   }catch(e){
       res.json(e);
   }
});

/*
    this router returns orders with date
    :back field day of backwards
    ex: /between/3 returns all of today-3 and today orders (same mounth)
 */

router.get('/between/:back', async (req, res) => {
    const { back } = req.params;

    const moment = require('moment-timezone');

    const startDate_TypeDate = new Date();
    const finishDate_TypeDate= new Date();

    startDate_TypeDate.setDate(new Date().getDate()-(back))
    startDate_TypeDate.setHours(new Date().getHours()-(new Date().getHours()))

    finishDate_TypeDate.setDate(new Date().getDate())

    const { _d : startDate} = moment.tz(new Date(startDate_TypeDate), "Europe/Istanbul");

    const { _d : finishDate} = moment.tz(finishDate_TypeDate, "Europe/Istanbul");
    try{
        const checkeds = await Order.find(
                {order_date:
                    {
                        $gte:startDate, // >=
                        $lte:finishDate // <=
                    }
                });
        console.log(startDate, finishDate)
        res.json(checkeds);
    }catch(e){
        res.json(e);
    }
});

/*
    this router returns only a day orders
    :day param that which day want to return
    ex: /between/day/3 returns month 3.day's orders
 */

router.get('/between/day/:day', async (req, res) => {
   const { day } = req.params;

    const moment = require('moment-timezone');


   const startDate_TypeDate = new Date();
   const finishDate_TypeDate = new Date();

   startDate_TypeDate.setDate(new Date().getDate()-(day))
   startDate_TypeDate.setHours(new Date().getHours()-(new Date().getHours()))

    finishDate_TypeDate.setHours(23);
    finishDate_TypeDate.setMinutes(59);
    finishDate_TypeDate.setSeconds(59);
    finishDate_TypeDate.setMilliseconds(99)

    finishDate_TypeDate.setDate(new Date().getDate()-(day))

    const { _d : startDate} = moment.tz(startDate_TypeDate, "Europe/Istanbul");

    const { _d : finishDate} = moment.tz(finishDate_TypeDate, "Europe/Istanbul");

    console.log(startDate, finishDate)
   try{
       const orders = await Order.find({
           order_date:{
               $gte:startDate,
               $lte:finishDate,
           }
       });
       res.json(orders);
   }catch(e){
       res.json(e);
   }

});

/*
    this router returns today's order
 */

router.get('/today', async (req, res) => {

    const moment = require('moment-timezone');


    const startDate_TypeDate = new Date();
    const finishDate_TypeDate = new Date();

    startDate_TypeDate.setDate(new Date().getDate())
    startDate_TypeDate.setHours(0)
    startDate_TypeDate.setMinutes(0)
    startDate_TypeDate.setSeconds(0)
    startDate_TypeDate.setMilliseconds(0)


    finishDate_TypeDate.setHours(23);
    finishDate_TypeDate.setMinutes(59);
    finishDate_TypeDate.setSeconds(59);
    finishDate_TypeDate.setMilliseconds(99)

    finishDate_TypeDate.setDate(new Date().getDate())

    const { _d : startDate} = moment.tz(startDate_TypeDate, "Europe/Istanbul");

    const { _d : finishDate} = moment.tz(finishDate_TypeDate, "Europe/Istanbul");

    console.log(startDate, finishDate)

    try{
        const orders = await Order.find({
            order_date:{
                $gte:startDate,
                $lte:finishDate,
            }
        });
        res.json(orders);
    }catch (e) {
        res.json(e);
    }
});

/*
    this router return entered month, day, year orders only related day
 */

router.get('/between/only/:day/:month/:year', async (req, res) => {

    let { day, month: monthx , year } = req.params;

    let month = parseInt((monthx)-1)

    const moment = require('moment-timezone');

    const startDate_TypeDate = new Date();
    const finishDate_TypeDate = new Date();

    startDate_TypeDate.setFullYear(year);
    startDate_TypeDate.setMonth(month);
    startDate_TypeDate.setDate(day);
    startDate_TypeDate.setHours(0)
    startDate_TypeDate.setMinutes(0)
    startDate_TypeDate.setSeconds(0)
    startDate_TypeDate.setMilliseconds(1)

    finishDate_TypeDate.setFullYear(year);
    finishDate_TypeDate.setMonth(month);
    finishDate_TypeDate.setDate(day);
    finishDate_TypeDate.setHours(23);
    finishDate_TypeDate.setMinutes(59);
    finishDate_TypeDate.setSeconds(59);
    finishDate_TypeDate.setMilliseconds(99)

    const { _d : startDate} = moment.tz(startDate_TypeDate, "Europe/Istanbul");

    const { _d : finishDate} = moment.tz(finishDate_TypeDate, "Europe/Istanbul");

    console.log(startDate, finishDate, monthx)


    try{
        const orders = await Order.find({
            order_date:{
                $gte:startDate,
                $lte:finishDate,
            }
        });
        res.json(orders)
    }catch (e) {
        res.json(e);
    }
});

/*
    this router return entered month, day, year orders to today
 */

router.get('/between/all/:day/:month/:year', async (req, res) => {

    let { day, month: monthx , year } = req.params;

    let month = parseInt((monthx)-1)

    const moment = require('moment-timezone');

    const startDate_TypeDate = new Date();
    const finishDate_TypeDate = new Date();

    startDate_TypeDate.setFullYear(year);
    startDate_TypeDate.setMonth(month);
    startDate_TypeDate.setDate(day);
    startDate_TypeDate.setHours(0)
    startDate_TypeDate.setMinutes(0)
    startDate_TypeDate.setSeconds(0)
    startDate_TypeDate.setMilliseconds(1)

    finishDate_TypeDate.setFullYear(year);
    finishDate_TypeDate.setHours(23);
    finishDate_TypeDate.setMinutes(59);
    finishDate_TypeDate.setSeconds(59);
    finishDate_TypeDate.setMilliseconds(99)

    const { _d : startDate} = moment.tz(startDate_TypeDate, "Europe/Istanbul");

    const { _d : finishDate} = moment.tz(finishDate_TypeDate, "Europe/Istanbul");

    console.log(startDate, finishDate, monthx)


    try{
        const orders = await Order.find({
            order_date:{
                $gte:startDate,
                $lte:finishDate,
            }
        });
        res.json(orders)
    }catch (e) {
        res.json(e);
    }
});

/*

 */

router.get('/between/month/:month', async (req, res) => {

    let { month: monthx } = req.params;

    let month = parseInt((monthx)-1)

    const moment = require('moment-timezone');

    const startDate_TypeDate = new Date();
    const finishDate_TypeDate = new Date();

    startDate_TypeDate.setMonth(month);
    startDate_TypeDate.setDate(1);
    startDate_TypeDate.setHours(0)
    startDate_TypeDate.setMinutes(0)
    startDate_TypeDate.setSeconds(0)
    startDate_TypeDate.setMilliseconds(1)

    finishDate_TypeDate.setMonth(month+1);
    finishDate_TypeDate.setDate(0);
    finishDate_TypeDate.setHours(23);
    finishDate_TypeDate.setMinutes(59);
    finishDate_TypeDate.setSeconds(59);
    finishDate_TypeDate.setMilliseconds(99)

    const { _d : startDate} = moment.tz(startDate_TypeDate, "Europe/Istanbul");

    const { _d : finishDate} = moment.tz(finishDate_TypeDate, "Europe/Istanbul");

    console.log(startDate, finishDate, monthx)


    try{
        const orders = await Order.find({
            order_date:{
                $gte:startDate,
                $lte:finishDate,
            }
        });
        res.json(orders)
    }catch (e) {
        res.json(e);
    }
});

module.exports = router;
