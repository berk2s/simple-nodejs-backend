const express = require('express');
const router = express.Router();

// model
const User = require('../Models/User');

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
                    orders:'$orders'
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

    const {user_id, pass} = req.body;

    try{
        const userInfo = await User.find({_id:user_id});

        bcrypt.compare(pass, userInfo.password)
            .then((result) => {
                if(!result){
                    res.json({
                        message:'Mevcut sifre yanlis!',
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
                                    user,
                                    state:{
                                        code:'U1',
                                        status:true,
                                        hash
                                    }
                                });
                            }catch(e){
                                res.json({
                                    state:{
                                        code:'U1',
                                        status:true,
                                        e
                                    }
                                });
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
