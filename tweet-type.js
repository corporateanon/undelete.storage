'use strict';

const t = require('tcomb');
const Attachment = require('./attachment-type');

const Tweet = t.struct({
  id: t.String,
  body: t.Object,
  attachments: t.maybe(t.list(Attachment)),
}, 'Tweet');

module.exports = Tweet;
