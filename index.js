'use strict';

const http = require('http');
const logger = require('koa-logger');
const koaRouter = require('koa-router');
const koaBody = require('koa-body')();
const co = require('co');
const koa = require('koa');
const RedisStorage = require('./redis');
const conf = require('./conf')();
const socketIO = require('socket.io');

var env = process.env.NODE_ENV || 'development';


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
  const additionResult = yield storage.addTweet(this.request.body);
  if(additionResult) {
    io.emit('messages', additionResult);
  }
  this.body = JSON.stringify({ status:'ok' });
  yield next;
});


router.put('/deletions', koaBody, function *(next) {
  yield storage.addDeletion(this.request.body);
  this.body = JSON.stringify({ status:'ok' });
  yield next;
});


const server = http.Server(app.callback());
var io = socketIO(server);

// Socket.io
io.on('connection', function(socket){
  console.log('ws connected');
  // socket.emit('ping', {});
  socket.on('message', function (data) {
    console.log('message', data);
    socket.emit('pong', {message:data});
  });
  socket.on('getMessages', co.wrap(function *(data) {
    try {
      const messages = yield storage.getTweetListSince(data.since);
      socket.emit('messages', messages);
    } catch(e) {
      console.error(e.stack);
    }
  }));
});

server.listen(conf.http.port);
