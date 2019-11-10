module.exports = (req, res, next) => {
    const apiKey = req.body.apiKey || req.query.apiKey;

    if(apiKey != req.app.get('app_api_key')) {
        res.json({
            error: 'invalid api key!',
            status: {
                state: false,
                code: 'A0'
            }
        })
    }else{
        next();
    }
}
