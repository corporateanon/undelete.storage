'use strict';

const t = require('tcomb');

const Attachment = t.struct({
  url: t.String,
  body: t.String,
}, 'Attachment');

module.exports = Tweet;
