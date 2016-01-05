const t = require('tcomb');

const Tweet = t.struct({
  id: t.String,
  body: t.Object,
});

module.exports = Tweet;
