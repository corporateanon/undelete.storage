'use strict';

const logger = require('koa-logger');
const koaRouter = require('koa-router');
const koaBody = require('koa-body')();
const koa = require('koa');
const RedisStorage = require('./redis');
const conf = require('./conf')();


var env = process.env.NODE_ENV || 'development';

module.exports = api;


function api() {

  const storage = new RedisStorage();

  var app = koa();

  if ('test' != env) {
    app.use(logger());
  }

  const router = koaRouter();

  app
    .use(router.routes())
    .use(router.allowedMethods());


  router.put('/tweets', koaBody, function *(next) {
    yield storage.addTweet(this.request.body);
    this.body = JSON.stringify({ status:'ok' });
    yield next;
  });


  router.put('/deletions', koaBody, function *(next) {
    yield storage.addDeletion(this.request.body);
    this.body = JSON.stringify({ status:'ok' });
    yield next;
  });

  return app;
}

api().listen(conf.http.port);
