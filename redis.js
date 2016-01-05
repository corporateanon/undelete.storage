'use strict';
// const assert = require('assert');
// const _ = require('lodash');
const moment = require('moment');
const redis = require('promise-redis')();
const BaseStorage = require('./storage');
const Tweet = require('./tweet.t');
const types = require('./types');

const BUFFER = 'buffer';
const TWEETID = 'tweet-id-';
const STAT_INPUT_SIZE_HOURLY = 'stat/input-size/hourly';
const STAT_TWEETS_ADDED_HOURLY = 'stat/tweets-added/hourly';
const BUFFER_MAX_LENGTH = 1000;
const TWEETID_TTL = 3600 * 24 * 2;

module.exports = class RedisStorage extends BaseStorage {
        constructor () {
                super();
                this.r = redis.createClient();
        }

        addTweet (tweet) {
                var isSeen = false;
                var tweetObject;

                return Promise.resolve(tweet)
                        .then(tweet => tweetObject = types.cast(Tweet, tweet))
                        .then(() => this.isSeen(tweetObject.id))
                        .then(seen => isSeen = seen)
                        .then(() => !isSeen && this.r.zadd(BUFFER, Date.now(), this.serializeTweet(tweetObject)))
                        .then(() => !isSeen && this.setSeen(tweetObject.id))
                        .then(() => !isSeen && this.reportStat(tweetObject))
                        .then(() => this.shrinkBuffer());
        }

        addDeletion () {

        }

        getTweetListSince () {

        }

        getUnresolvedDeletionList () {

        }

        serializeTweet (tweet) {
                return JSON.stringify(tweet.body);
        }

        shrinkBuffer () {
                return this.r.zremrangebyrank(BUFFER, BUFFER_MAX_LENGTH, -1);
        }

        isSeen (id) {
                return this.r.get(TWEETID + id);
        }

        setSeen (id) {
                return this.r.setex(TWEETID + id, TWEETID_TTL, 1);
        }

        reportStat (tweetObject) {
                const statKey = this.getStatKey();
                // var startOfHour = moment().startOf('hour').valueOf();
                var inputSize = JSON.stringify(tweetObject).length;
                this.r.hincrby(statKey.inputSizeHourly, statKey.hour, inputSize);
                this.r.hincrby(statKey.tweetsAddedHourly, statKey.hour, 1);
                console.log('stat:', 'inputSize=', inputSize);
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

};
