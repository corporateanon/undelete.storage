'use strict';

const t = require('tcomb');

const maybe = t.maybe;
const list = t.list;
const declare = t.declare;

const Str = t.String;
const Num = t.Number;
const Dat = t.Date; //todo implement fromJSON
const Bool = t.Boolean;
const Obj = t.Object;

const TwitterDate = t.refinement(t.Date, (n) => true, 'TwitterDate');
TwitterDate.fromJSON = (n) => new Date(n);


const MStr = maybe(Str);
const MNum = maybe(Num);
const MDat = maybe(Dat);
const MBool = maybe(Bool);
const MObj = maybe(Obj);

const MTwitterDate = maybe(TwitterDate);


const TwitterUser           = declare('TwitterUser');
const TwitterContributor    = declare('TwitterContributor');
const TwitterTwitEntities   = declare('TwitterTwitEntities');
const TwitterTweet          = declare('TwitterTweet');

const TwitterEntity         = Obj;

TwitterUser.define(t.struct({
  
  //important
  id_str: Str,
  screen_name: Str,
  name: Str,
  created_at: TwitterDate, //note: "Mon Nov 29 21:18:15 +0000 2010" 
  entities: maybe(list(TwitterEntity)),
  favourites_count: Num,
  followers_count: Num,
  friends_count: Num,
  listed_count: Num,
  protected: Bool,
  statuses_count: Num,
  verified: Bool,

  //important, but optional
  url: MStr,
  location: MStr,
  description: MStr,

  //unimportant
  id: Num,
  contributors_enabled: MBool,
  default_profile: MBool,
  default_profile_image: MBool,
  follow_request_sent: MBool,
  following: MBool,
  geo_enabled: MBool,
  is_translator: MBool,
  lang: MStr,
  profile_background_color: MStr,
  profile_background_image_url: MStr,
  profile_background_image_url_https: MStr,
  profile_background_tile: MBool,
  profile_banner_url: MStr,
  profile_image_url: MStr,
  profile_image_url_https: MStr,
  profile_link_color: MStr,
  profile_sidebar_border_color: MStr,
  profile_sidebar_fill_color: MStr,
  profile_text_color: MStr,
  profile_use_background_image: MBool,
  show_all_inline_media: MBool,
  status: maybe(TwitterTweet), //todo: really? w/o user?
  time_zone: MStr,
  utc_offset: MNum,
  withheld_in_countries: MStr,
  withheld_scope: MStr,
}));

TwitterContributor.define(t.struct({
  id: Num,
  id_str: Str,
  screen_name: Str,
}));

TwitterTwitEntities.define(t.struct({
  hashtags: maybe(list(TwitterEntity)),
  urls: maybe(list(TwitterEntity)),
  user_mentions: maybe(list(TwitterEntity)),
}));

TwitterTweet.define(t.struct({

  //important part
  id_str: Str,
  created_at: TwitterDate,
  favorite_count: Num,
  retweet_count: Num,
  text: Str,
  user: TwitterUser,

  //important, but may be omitted
  entities: maybe(TwitterTwitEntities),
  in_reply_to_screen_name: MStr,
  in_reply_to_status_id_str: MStr,
  in_reply_to_user_id_str: MStr,
  quoted_status_id_str: MStr,
  quoted_status: maybe(TwitterTweet),
  retweeted_status: maybe(TwitterTweet),
  source: MStr,

  //unimportant part
  id: Num,
  annotations: MObj,
  contributors: maybe(list(TwitterContributor)),
  coordinates: MObj, //todo implement?
  current_user_retweet: MObj,
  favorited: MBool,
  filter_level: MStr,
  in_reply_to_status_id: MNum,
  in_reply_to_user_id: MNum,
  lang: MStr,
  place: MObj, //todo: implement?
  possibly_sensitive: MBool,
  quoted_status_id: MNum,
  scopes: MObj, //todo: do we ever need it?
  retweeted: MBool,
  truncated: MBool,
  withheld_copyright: MBool,
  withheld_in_countries: maybe(list(Str)),
  withheld_scope: MStr,
}));


////////

exports.TwitterEntity       = TwitterEntity;
exports.TwitterUser         = TwitterUser;
exports.TwitterContributor  = TwitterContributor;
exports.TwitterTwitEntities = TwitterTwitEntities;
exports.TwitterTweet        = TwitterTweet;
