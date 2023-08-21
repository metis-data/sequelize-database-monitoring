require('dotenv').config();

const app = require('./app');

async function bootstrap() {
  app.listen(process.env.PORT || 3000, '127.0.0.1');
}

bootstrap();