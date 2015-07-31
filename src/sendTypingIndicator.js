/*jslint node: true */
"use strict";

var utils = require("../utils");
var log = require("npmlog");

module.exports = function(mergeWithDefaults, api, ctx) {
  function makeTypingIndicator(threadID, typ, callback) {
    var form = mergeWithDefaults({
      typ: +typ,
      to: '',
      source: 'mercury-chat',
      thread: threadID
  ***REMOVED***;

    // Check if thread is single person chat or group chat
    // More info on this is in api.sendMessage
    api.getUserInfo(threadID, function(err, res) {
      // If id is single person chat
      if(!(res instanceof Array)) {
        form.to = threadID
      };

      utils.post("https://www.facebook.com/ajax/messaging/typ.php", ctx.jar, form)
      .then(utils.parseResponse)
      .then(function(resData) {
        if(resData.error) return callback(resData);

        return callback();
    ***REMOVED***
      .catch(function(err) {
        log.error("Error in sendTypingIndicator", err);
        return callback(err);
    ***REMOVED***;
  ***REMOVED***;
  };

  return function sendTypingIndicator(threadID, callback) {
    if(!callback) return log.error("sendTypingIndicator: need callback");

    makeTypingIndicator(threadID, true, function(err) {
      if(err) return callback(err)

      return callback();
  ***REMOVED***;

    // TODO: document that we return the stop/cancel functions now
    return function end() {
      makeTypingIndicator(threadID, false)
    };
  };
};
