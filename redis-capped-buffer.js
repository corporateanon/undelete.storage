'use strict';

const t = require('tcomb');
const co = require('co');


const RedisCappedBufferOptions = t.struct({
  redis    : t.Object,
  key      : t.String,
  capacity : t.Number,
  seenTtl  : t.Number,
}, 'RedisCappedBufferOptions');

const GetListOptions = t.struct({
  since    : t.maybe(t.Number),
}, 'GetListOptions');


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
    return co(function* () {
      const seen = yield this._isSeen(id);
      if (seen) {
        return false;
      }

      const now = Date.now();
      yield this._insert(id, value, now);

      return now;
    }.bind(this));
  }

  getList(options) {
    const o = new GetListOptions(options);
    const since = o.since ? `(${o.since}` : -Infinity;

    return co(function* () {
      const list = yield this._redis.zrangebyscore(this._key, since, Infinity);
      const lastScore = list.length ? parseInt(yield this._redis.zscore(this._key, list[list.length - 1]), 10) : null;
      return [list, lastScore || null];
    }.bind(this));
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
