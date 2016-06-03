'use strict';

const t = require('tcomb');

const Deletion = t.struct({
  id: t.String
}, 'Deletion');

module.exports = Deletion;
