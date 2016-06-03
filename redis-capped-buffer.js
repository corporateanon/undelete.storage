'use strict';

const t = require('tcomb');


const RedisCappedBufferOptions = t.struct({
  redis    : t.Obj,
  key      : t.Str,
  capacity : t.Num,
  seenTtl  : t.Num,
}, 'Deletion');


module.exports = class RedisCappedBuffer {

  constructor(options) {
    const o = new RedisCappedBufferOptions(options);

    this._redis    = o.redis;
    this._key      = o.key;
    this._seenTtl  = o.seenTtl;
    this._capacity = o.capacity;

    this._seenKey = 'seen-' + this._key;
  }

  add(id, value) {
    const now = Date.now();

    return this._isSeen(id)
      .then(seen => !seen && this._insert(id, value, now).then(Promise.resolve(true)));
  }

  _insert(id, value, timestamp) {
    return this._redis.zadd(this._key, timestamp, value).then(this._setSeen(id)).then(this._shrink());
  }

  _shrink() {
    return this._redis.zremrangebyrank(this._key, 0, -this._capacity - 1);
  }

  _setSeen(id) {
    return this._redis.setex(`${this._seenKey}-${id}`, this._seenTtl, 1);
  }

  _isSeen(id) {
    return this._redis.get(`${this._seenKey}-${id}`);
  }
};
