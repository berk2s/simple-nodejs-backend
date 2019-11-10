var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// routers
var indexRouter = require('./routes/index');
const orderRouter = require('./routes/orders');
const userRouter = require('./routes/user');

//middlewares
const apiKeyMiddleware = require('./middleware/apikey');
const tokenVerifyMiddleware = require('./middleware/token-verify');

var app = express();

//mongodb
const mongoose = require('./helper/db')();

//api key
const config =  require('./config');
app.set('app_api_key', config.app_api_key);

app.use('/api', tokenVerifyMiddleware)


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', apiKeyMiddleware, indexRouter);
app.use('/api/orders', orderRouter);
app.use('/api/user', userRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
