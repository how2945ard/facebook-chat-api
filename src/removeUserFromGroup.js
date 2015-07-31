/*jslint node: true */
"use strict";

var utils = require("../utils");
var log = require("npmlog");

module.exports = function(mergeWithDefaults, api, ctx) {
  return function removeUserFromGroup(userID, threadID, callback) {
    if(!callback) callback = function() {};

    if (typeof threadID !== "number" && typeof threadID !== "string")
      return callback({error: "threadID should be of type number or string and not " + typeof threadID + "."***REMOVED***;
    if (typeof userID !== "number" && typeof userID !== "string")
      return callback({error: "userID should be of type number or string and not " + typeof userID + "."***REMOVED***;

    var form = mergeWithDefaults({
      'uid' : userID,
      'tid' : threadID,
  ***REMOVED***;

    utils.post("https://www.facebook.com/chat/remove_participants", ctx.jar, form)
    .then(utils.parseResponse)
    .then(function(resData) {
      if (!resData) return callback({error: "Remove from group failed."***REMOVED***;
      if(resData.error) return callback(resData);

      return callback();
  ***REMOVED***
    .catch(function(err) {
      log.error("ERROR in removeUserFromGroup --> ", err);
      return callback(err);
  ***REMOVED***;
  };
};
