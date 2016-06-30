'use strict';

const t = require('tcomb');
const Attachment = require('./attachment-type');
const TwitterTweet = require('./twitter-types').TwitterTweet;

const Tweet = t.struct({
  id: t.String,
  body: TwitterTweet,
  attachments: t.maybe(t.list(Attachment)),
}, 'Tweet');

module.exports = Tweet;
