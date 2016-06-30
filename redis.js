'use strict';
// const assert = require('assert');
const _ = require('lodash');
const co = require('co');
const moment = require('moment');
const redis = require('promise-redis')();
const BaseStorage = require('./storage');
const RedisCappedBuffer = require('./redis-capped-buffer');
const Tweet = require('./tweet-type');
const Deletion = require('./deletion-type');
const types = require('./types');

const STAT_INPUT_SIZE_HOURLY = 'stat/input-size/hourly';
const STAT_TWEETS_ADDED_HOURLY = 'stat/tweets-added/hourly';

module.exports = class RedisStorage extends BaseStorage {
  constructor () {
    super();
    this.r = redis.createClient();

    this.tweetsBuffer = new RedisCappedBuffer({
      redis   : this.r,
      key     : 'tweets',
      capacity: 1000,
      seenTtl : 3600 * 24 * 2,
    });

    this.deletionsBuffer = new RedisCappedBuffer({
      redis   : this.r,
      key     : 'deletions',
      capacity: 10000,
      seenTtl : 3600 * 24 * 2,
    });

  }

  addTweet (tweet) {
    return co(function* () {
      tweet = types.fromJSON(Tweet, tweet);
      const tweetStr = this.serializeTweet(tweet);
      const lastTime = yield this.tweetsBuffer.add(tweet.id, tweetStr);
      if (lastTime) {
        return {
          messages: [tweetStr],
          lastTime: lastTime,
        };
      } else {
        return false;
      }
    }.bind(this));
  }

  addDeletion (deletion) {
    return co(function* () {
      deletion = types.fromJSON(Deletion, deletion);
      const deletionStr = this.serializeDeletion(deletion);
      const lastTime = yield this.deletionsBuffer.add(deletion.id, deletionStr);
      if (lastTime) {
        return {
          messages: [deletionStr],
          lastTime: lastTime,
        };
      } else {
        return false;
      }
    }.bind(this));
  }

  getTweetListSince (since) {
    return co(function* (){

      const result = yield this.tweetsBuffer.getList({ since: since });
      return {
        messages: result[0],
        lastTime: result[1]
      };
    }.bind(this));
  }

  getDeletionListSince (since) {
    return co(function* (){

      const result = yield this.deletionsBuffer.getList({ since: since });
      return {
        messages: result[0],
        lastTime: result[1]
      };
    }.bind(this));
  }

  serializeTweet (tweet) {
    return JSON.stringify(tweet);
  }

  serializeDeletion (deletion) {
    return JSON.stringify(deletion);
  }




  reportStat (tweetObject) {
    const statKey = this.getStatKey();
    var inputSize = JSON.stringify(tweetObject).length;
    this.r.hincrby(statKey.inputSizeHourly, statKey.hour, inputSize);
    this.r.hincrby(statKey.tweetsAddedHourly, statKey.hour, 1);
    console.log('stat:', 'inputSize=', inputSize);
  }

  getStatInputSize (dateFrom, dateTo) {
    return this.getStat(STAT_INPUT_SIZE_HOURLY, dateFrom, dateTo);
  }

  getStatTweetsAdded (dateFrom, dateTo) {
    return this.getStat(STAT_TWEETS_ADDED_HOURLY, dateFrom, dateTo);
  }

  normalizeStat (dayKeys, statHashList) {
    return _(dayKeys).zip(statHashList)
      .map(it => {
        const dayStr = it[0];
        const hourlyStat = it[1] || {};
        return _(_.range(24))
          .map(hour => ('0' + hour).slice(-2))
          .map(hourStr => {
            const metric = hourlyStat[hourStr] === undefined ? null : parseFloat(hourlyStat[hourStr], 10);
            return {
              time: moment(dayStr + ' ' + hourStr, 'YYYY-MM-DD HH').toDate(),
              metric: metric,
            };
          }).value();
      }).flatten().value();
  }

  getStat (statKey, dateFrom, dateTo) {
    const dayKeys = this.dateRangeToDayKeys(dateFrom, dateTo);
    const inputSizeKeys = dayKeys.map(key => statKey + '/' + key);
    return Promise.all(inputSizeKeys.map(key => this.r.hgetall(key)))
      .then(result => this.normalizeStat(dayKeys, result));
  }

  getStatKey () {
    const startOfHour = moment().startOf('hour');
    const day = startOfHour.format('YYYY-MM-DD');
    const hour = startOfHour.format('HH');
    return {
      day: day,
      hour: hour,
      inputSizeHourly: STAT_INPUT_SIZE_HOURLY + '/' + day,
      tweetsAddedHourly: STAT_TWEETS_ADDED_HOURLY + '/' + day,
    };
  }

  dateRangeToDayKeys (dateFrom, dateTo) {
    const momentFrom = moment(dateFrom).startOf('day');
    const momentTo = moment(dateTo).startOf('day');
    const diffDays = momentTo.diff(momentFrom, 'days');
    const dayKeys = [];
    const momentCurrent = momentFrom.clone();
    for (var i = 0; i <= diffDays; i++) {
      dayKeys.push(momentCurrent.format('YYYY-MM-DD'));
      momentCurrent.add(1, 'days');
    }

    return dayKeys;
  }

};
