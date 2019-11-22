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
            },
            {
                $sort: {
                    order_date:-1
                }
            }
        ]);
        res.json(orders);
    }catch(e){
        res.json(e);
    }
});

router.get('/all', async (req, res, next) => {
    try{
        const notCheckeds = await Order.find().sort({"order_date": -1});
        res.json(notCheckeds);
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
        const count_1 = await Order.find({order_status:-1}).count();
        const count_2 = await Order.find({order_status:0}).count();
        const count_3 = await Order.find({order_status:1}).count();
        const count_4 = await Order.find({order_status:2}).count();
        const count_5 = await Order.find({order_status:3}).count();
        socketApi.io.emit('changedTotalUnrecognizedOrders', {count_1, count_2, count_3, count_4, count_5});
        socketApi.io.emit('newOrder', {order});

        res.json({
            order:order,
            state:{
                code:'O1',
                status:true
                order
            }
        });
    }catch(e){
        res.json(e);
    }

});

router.put('/status/cancel/', (req, res, next) => {
    const { order_id } = req.body;

    const update = Order.findByIdAndUpdate({_id: order_id}, {order_status:-1}, {new:true});

    update
       .then(async (data) => {
          if(!data){
             res.json({
                 message:'Ilgili siparis bulunamadi!'
             });
          }else{
              socketApi.io.emit('changedOrderStatus', {status: data.order_status, order_id: data._id})
              const count_1 = await Order.find({order_status:-1}).count();
              const count_2 = await Order.find({order_status:0}).count();
              const count_3 = await Order.find({order_status:1}).count();
              const count_4 = await Order.find({order_status:2}).count();
              const count_5 = await Order.find({order_status:3}).count();
              socketApi.io.emit('changedTotalCanceledOrders', {count_1, count_2, count_3, count_4, count_5});
             res.json({
                 message:'Ilgili siparis iptal edildi!',
              });
          }
       })
      .catch(err => res.json(err))

});

router.put('/status/delivered', (req, res, next) => {
    const { order_id } = req.body;

    const update = Order
        .findByIdAndUpdate({_id: order_id}, {order_status:3}, {new:true})


    update
        .then(async (data) => {
            if(!data){
                res.json({
                    message:'Ilgili siparis bulunamadi!'
                });
            }else{
                socketApi.io.emit('changedOrderStatus', {status: data.order_status, order_id: data._id});
                const count_1 = await Order.find({order_status:-1}).count();
                const count_2 = await Order.find({order_status:0}).count();
                const count_3 = await Order.find({order_status:1}).count();
                const count_4 = await Order.find({order_status:2}).count();
                const count_5 = await Order.find({order_status:3}).count();
                socketApi.io.emit('changedTotalCanceledOrders', {count_1, count_2, count_3, count_4, count_5});
                res.json({
                    message:'Ilgili siparisin durumu basarili olarak degistirildi!'
                });
            }
        })
        .catch(err => res.json(err))
})

router.put('/status/called', (req, res, next) => {
    const { order_id } = req.body;

    const update = Order.findByIdAndUpdate({_id: order_id}, {order_status:2}, {new:true});

    update
        .then(async (data) => {
            if(!data){
                res.json({
                    message:'Ilgili siparis bulunamadi!'
                });
            }else{
                socketApi.io.emit('changedOrderStatus', {status: data.order_status, order_id: data._id})
                const count_1 = await Order.find({order_status:-1}).count();
                const count_2 = await Order.find({order_status:0}).count();
                const count_3 = await Order.find({order_status:1}).count();
                const count_4 = await Order.find({order_status:2}).count();
                const count_5 = await Order.find({order_status:3}).count();
                socketApi.io.emit('changedTotalCanceledOrders', {count_1, count_2, count_3, count_4, count_5});
                res.json({
                    message:'Ilgili siparisin durumu gorusuldu olarak degistirildi!'
                });
            }
        })
        .catch(err => res.json(err))
})

router.put('/status/hibernate', (req, res, next) => {
    const { order_id } = req.body;

    const update = Order.findByIdAndUpdate({_id: order_id}, {order_status:1}, {new:true});

    update
        .then(async (data) => {
            if(!data){
                res.json({
                    message:'Ilgili siparis bulunamadi!'
                });
            }else{
                socketApi.io.emit('changedOrderStatus', {status: data.order_status, order_id: data._id})
                const count_1 = await Order.find({order_status:-1}).count();
                const count_2 = await Order.find({order_status:0}).count();
                const count_3 = await Order.find({order_status:1}).count();
                const count_4 = await Order.find({order_status:2}).count();
                const count_5 = await Order.find({order_status:3}).count();
                socketApi.io.emit('changedTotalCanceledOrders', {count_1, count_2, count_3, count_4, count_5});
                res.json({
                    message:'Ilgili siparisin durumu beklemede olarak degistirildi!'
                });
            }
        })
        .catch(err => res.json(err))
})

router.get('/count/hibernates', async (req, res) => {
    try{
        const orders = await Order.find({order_status:1}).count();
        res.json({
            count: orders
        });
    }catch(e){
        res.json(e);
    }
})

router.get('/count/called', async (req, res) => {
    try{
        const orders = await Order.find({order_status:2}).count();
        res.json({
            count: orders
        });
    }catch(e){
        res.json(e);
    }
})

router.get('/count/canceled', async (req, res) => {
    try{
        const orders = await Order.find({order_status:-1}).count();
        res.json({
            count: orders
        });
    }catch(e){
        res.json(e);
    }
})

router.get('/count/delivered', async (req, res) => {
    try{
        const orders = await Order.find({order_status:3}).count();
        res.json({
            count: orders
        });
    }catch(e){
        res.json(e);
    }
})

router.get('/count/unrecognised', async (req, res) => {
    try{
        const orders = await Order.find({order_status:0}).count();
        res.json({
            count: orders
        });
    }catch(e){
        res.json(e);
    }
})

router.get('/lastorder', async (req, res) => {
    try{
        const order = await Order.find()
            .sort({$natural: -1})
            .limit(1);
        res.json(order);
    }catch (e) {
        res.json(e)
    }
})

router.get('/notcheckeds', async (req, res) => {
   try{
       const notCheckeds = await Order.find({$or: [{order_status:0}, {order_status:1}, {order_status:2}]});
       res.json(notCheckeds);
   }catch(e){
       res.json(e);
   }
});

router.get('/checkeds', async (req, res) => {
   try{
       const checkeds = await Order.find({order_status:3})
           .sort({"order_date":-1});;
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
