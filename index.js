'use strict';

const Hapi = require('hapi');
const RedisStorage = require('./redis');
const types = require('./types');
const conf = require('./conf')();

// Create a server with a host and port
const server = new Hapi.Server();
const storage = new RedisStorage();

server.connection({
  host: '0.0.0.0',
  port: conf.http.port
});

// Add the route
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

// Start the server
server.start((err) => {

  if (err) {
    throw err;
  }
  console.log('Server running at:', server.info.uri);
});
