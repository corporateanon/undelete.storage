'use strict';

const Hapi = require('hapi');
const RedisStorage = require('./redis');
const types = require('./types');
const conf = require('./conf')();

const server = new Hapi.Server();
const storage = new RedisStorage();

server.connection({
  host: '0.0.0.0',
  port: conf.http.port
});


server.route({
  method: 'PUT',
  path: '/tweets',
  handler: function (request, reply) {
    storage.addTweet(request.payload)
      .then(
        function () {
          reply({
            status: 'OK'
          });
        },
        function (err) {
          var response = reply({
            error: `${err}`
          });
          if (err && err instanceof types.ValidationError) {
            response.code(400);
          } else {
            response.code(500);
          }
        }
      );
  }
});


server.route({
  method: 'PUT',
  path: '/deletions',
  handler: function (request, reply) {
    storage.addDeletion(request.payload)
      .then(
        function () {
          reply({
            status: 'OK'
          });
        },
        function (err) {
          var response = reply({
            error: `${err}`
          });
          if (err && err instanceof types.ValidationError) {
            response.code(400);
          } else {
            response.code(500);
          }
        }
      );
  }
});


server.start((err) => {
  if (err) {
    throw err;
  }
  console.log('Server running at:', server.info.uri);
});
