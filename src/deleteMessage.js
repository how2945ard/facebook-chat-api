/*jslint node: true */
"use strict";

var utils = require("../utils");
var log = require("npmlog");

module.exports = function(mergeWithDefaults, api, ctx) {
  return function deleteMessage(messageOrMessages, callback) {
    var message_id = message.message_id || message;

    var form = mergeWithDefaults();
    form['client'] = "mercury";

    if(Array.isArray(messageOrMessages)) {
      for (var i = 0; i < messageOrMessages.length; i++) {
        form['message_ids['+i+']'] = messageOrMessages[i];
      }
    } else {
      form['message_ids[0]'] = messageOrMessages;
    }
    
    utils.post("https://www.facebook.com/ajax/mercury/delete_messages.php", ctx.jar, form)
      .then(utils.parseResponse)
      .then(function(resData) {
        if (resData.error) {
          callback(resData);
        } else callback(null);
    ***REMOVED***
      .catch(function(err) {
        log.error("Error in deleteMessage", err);
        return callback(err);
    ***REMOVED***;
    return ctx.access_token;
  };
};
