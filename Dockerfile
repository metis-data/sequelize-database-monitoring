FROM public.ecr.aws/o2c0x5x8/application-base:node-express-postgres-sequelize

WORKDIR /usr/src/app

COPY . ./

CMD npm start
