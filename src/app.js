const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const controllers = require('./controllers');

function bootstrap(){
  const router = express.Router();
  controllers.initialize(router);

  const app = express();
  app.use(logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(cors())

  app.use('/', router);  

  app.use(function(req, res, next) {
    res.status(404).send({ error: 'Not found' })
  });
  
  app.use(function(err, req, res, next) {
    console.log("Error: " + err);
    res.locals.message = err.message;
    res.locals.error = err;
    res.status(err.status || 500).send({ error: err })
  });

  return app;
}

module.exports = bootstrap();
