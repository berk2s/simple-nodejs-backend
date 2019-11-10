var express = require('express');
var router = express.Router();

// socket.io
const socketApi = require('../src/socketApi');

// jwt
const jwt = require('jsonwebtoken');

// bcrypt
const bcrypt = require('bcryptjs');

// model
const User = require('../Models/User');

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

router.post('/register', async (req, res, next) => {

    const { name, username, password, address, phone } = req.body;

    try{
        const user = await User.findOne({$or: [{username}, {phone}]});

        if(user){
            let whichOne = null;

            if(user.username == username && user.phone == phone)
                whichOne = 'both'
            else if(user.username == username)
                whichOne = 'username'
            else
                whichOne = 'phone';

            res.json({
                error:'duplicate user!',
                status:{
                    state:false,
                    code:'R0',
                    whichOne
                }
            })

            return false;
        }

        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt, async (err, hash) => {

                const user = new User({
                    name,
                    username,
                    password:hash,
                    address,
                    phone
                });

                try {
                    const data = await user.save();
                    res.json(data);
                }catch(e){
                    res.json(e);
                }


            });
        });

    }catch(e){
        res.json(e);
    }



});

/*
    this router authenticate a user
 */

router.post('/authenticate', (req, res, next) => {

    const { username, password } = req.body;

    const promise = User.findOne({username});

    promise
        .then((user) => {
            if(!user){
                res.json({
                    message:'invalid username!',
                    status:{
                        state:false,
                        code:'A0'
                    }
                })
                return false;
            }

            bcrypt.compare(password, user.password)
                .then((result) => {
                    if(!result){
                        res.json({
                            message:'invalid password!',
                            status:{
                                state:false,
                                code:'A1'
                            }
                        })
                        return false;
                    }

                    const payload = {username};

                    const token = jwt.sign(payload, req.app.get('app_api_key'), {});

                    res.json({
                        message:'successful!',
                        status:{
                            state:true,
                            code:'A2',
                            token
                        }
                    })

                })


        })
        .catch((err) => {
            res.json(err);
        })


});


module.exports = router;
