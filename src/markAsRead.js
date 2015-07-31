/*jslint node: true */
"use strict";

var utils = require("../utils");
var log = require("npmlog");

module.exports = function(defaultFuncs, api, ctx) {
  return function markAsRead(threadID, callback) {
    if(!callback) callback = function() {};

    var form = {};
    form["ids[" + threadID + "]"] = true;

    defaultFuncs.post("https://www.facebook.com/ajax/mercury/change_read_status.php", ctx.jar, form)
    .then(utils.saveCookies(ctx.jar))
    .then(utils.parseResponse)
    .then(function(resData) {
      if (resData.error) return callback(resData);

      return callback();
  ***REMOVED***
    .catch(function(err) {
      log.error("Error in markAsRead", err);
      return callback(err);
  ***REMOVED***;
  };
};