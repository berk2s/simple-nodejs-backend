const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.headers['x-access-token'];

    if(!token){
        res.json({
            message: 'invalid token!',
            status: {
                state: false,
                code: 'JWT0'
            }
        })
        return false;
    }

    jwt.verify(token, req.app.get('app_api_key'), (err, decoded) => {
       if(err) {
           res.json(err);
           return false;
       }

           req.decoded = decoded;
           //console.log('token', decoded);
           next();

    });
};

