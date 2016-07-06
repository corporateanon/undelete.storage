'use strict';

const t = require('tcomb');

const Deletion = t.struct({
  id: t.String,
  time: t.Date,
}, 'Deletion');

module.exports = Deletion;
