const RedisStorage = require('./redis');


const storage = new RedisStorage();

storage
.getStatInputSize(new Date()-3600*1000*24*20, new Date())
.then(console.log, console.error);
