/*jslint node: true */
"use strict";

var utils = require("../utils");
var log = require("npmlog");

module.exports = function(mergeWithDefaults, api, ctx) {
  return function getUserInfo(id, callback) {
    var form = mergeWithDefaults();
    if(!(id instanceof Array)) id = [id];

    id.map(function(v, i) {
      form["ids[" + i + "]"] = v;
  ***REMOVED***;

    utils.get("https://www.facebook.com/chat/user_info/", ctx.jar, form)
    .then(utils.parseResponse)
    .then(function(ret) {
      callback(null, ret.payload.profiles);
  ***REMOVED***
    .catch(function(err) {
      log.error("ERROR in getUserInfo --> ", err);
      return callback(err);
  ***REMOVED***;
  };
};