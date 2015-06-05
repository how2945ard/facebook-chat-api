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

    utils.get("https://www.facebook.com/chat/user_info/", ctx.jar, form, function(err, res, html) {
      var strData = utils.makeParsable(html);
      var ret;
      try{
        ret = JSON.parse(strData);
      } catch (e) {
        log.error("ERROR in getUserInfo --> ",e, "\nnumber of ids:", id.length, "\n-------- strData --------\n" ,strData);
        return callback(e);
      }
      callback(null, ret.payload.profiles);
  ***REMOVED***;
  };
};