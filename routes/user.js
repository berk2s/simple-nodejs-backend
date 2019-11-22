const express = require('express');
const router = express.Router();

// model
const User = require('../Models/User');
const Adress = require('../Models/Adress');

const bcrypt = require('bcryptjs');


// orders
const Order = require('../Models/Order');
/*
    this router returns all users with all related orders
 */

router.get('/', async (req, res) => {
    try{
        const users = await User.aggregate([
            {
                $lookup:{
                    from:'orders',
                    localField:'_id',
                    foreignField:'customer_id',
                    as:'orders'
                }
            },
            {
                $unwind:{
                    path:'$orders',
                    preserveNullAndEmptyArrays: true
                }
            },


            {
                $lookup:{
                    from:'adress',
                    localField:'_id',
                    foreignField:'user_id',
                    as:'adresses'
                }
            },
            {
                $unwind:{
                    path:'$adresses',
                    preserveNullAndEmptyArrays: true
                }
            },


            {
                $group:{
                    _id:{
                        _id:'$_id',
                        name:'$name',
                        username:'$username',
                        password:'$password',
                        phone:'$phone',
                        address:'$address',
                    },
                    orders:{
                        $push:'$orders'
                    },
                    adresses:{
                        $push:'$adresses'
                    }
                }
            },
            {
                $project:{
                    _id:'$_id._id',
                    name:'$_id.name',
                    username:'$_id.username',
                    password:'$_id.password',
                    phone:'$_id.phone',
                    address:'$_id.address',
                    orders:'$orders',
                    adresses:'$adresses'
                }
            }


        ]);
        res.json(users);
    }catch(e){
        res.json(e);
    }
});

router.get('/:user_id', async (req, res) => {

    const {user_id} = req.params;

    try{
        const user = await User.findOne({_id:user_id});
        res.json(user);
    }catch(e){
        res.json(e);
    }
})

router.put('/update', async (req, res) => {
    const { userName, phone, userID } = req.body;

    try {
        const realUser = await User.findOne({_id:userID});
        const user = await User.findOne({username:userName});
        const userPhone = await User.findOne({phone:phone});

        if(realUser.username != userName) {
            if (user) {
                res.json({
                    message: 'Boyle bir kullanici adi mevcut!',
                    status: {
                        state: false,
                        code: 'U0',
                    }
                })
                return false;
            }
        }

        if(realUser.phone != phone) {
            if (userPhone) {
                res.json({
                    message: 'Boyle bir telefon numarasi mevcut!',
                    status: {
                        state: false,
                        code: 'U2',
                    }
                })
                return false;
            }
        }

        const update = await User.findByIdAndUpdate({_id: userID}, {username: userName, phone: phone}, {new: true});
        res.json({
            message:'update is succesfull! veriler:'+userName+' '+phone+' '+userID,
            status:{
                state:false,
                code:'U1',
                update
            }
        })
    }catch(e){
        res.json(e);
    }
});

router.get('/adress/:user_id', async (req, res) => {
   const {user_id} = req.params;

    try{
        const user = await User.findOne({user_id:user_id});
        res.json(user);
    }catch(e){
        res.json(e);
    }
});

router.get('/orders/:user_id', async (req, res) => {
    const {user_id} = req.params;
    try{
        const orders = await Order.find({customer_id:user_id});
        res.json(orders);
    }catch(e){
        res.json(e);
    }
});

router.get('/orders/notcheckeds/:user_id', async (req, res) => {
   const {user_id} = req.params;
   try{
       const usersNotCheckeds = await Order
           .find({customer_id:user_id, $or:[{order_status:1}, {order_status:2}, {order_status:0}]})
           .sort({"order_date": -1})
       res.json(usersNotCheckeds);
   }catch(e){
       res.json(e);
   }
});

router.get('/orders/success/:user_id', async (req, res) => {
    const {user_id} = req.params;
    try{
        const usersNotCheckeds = await Order.find({$and:[{customer_id:user_id}, {order_status:3}]});
        res.json(usersNotCheckeds);
    }catch(e){
        res.json(e);
    }
});

router.post('/repass', async (req, res) => {

    const {user_id, pass, oldPass} = req.body;

    try{
        const userInfo = await User.findOne({_id:user_id});

        bcrypt.compare(oldPass, userInfo.password)
            .then((result) => {
                if(!result){
                    res.json({
                        message:'Mevcut sifre yanlis!',
                        pass1: userInfo.password,
                        pass2: pass,
                        result:result,
                        state:{
                            code:'U0',
                            status:true
                        }
                    })
                }else{

                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(pass, salt, async (err, hash) => {

                            try{
                                const user = await User.findByIdAndUpdate({_id: userInfo._id}, {password:hash}, {new:true});

                                res.json({
                                    user:user,
                                    state:{
                                        code:'U1',
                                        status:true,
                                        hash:hash
                                    }
                                });
                            }catch(e){
                                res.json(e);
                            }

                        });
                    });

                }

            })

    }catch(e){
        res.json(e);
    }
})



module.exports = router;
