module.exports = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    if(apiKey != req.app.get('app_api_key')) {
        res.json({
            message: 'invalid api key!',
            status: {
                state: false,
                code: 'RA0'
            }
        })
    }else{
        next();
    }
}
