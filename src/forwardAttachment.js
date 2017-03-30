"use strict";

var utils = require("../utils");
var log = require("npmlog");

module.exports = function(defaultFuncs, api, ctx) {
  return function forwardAttachment(attachmentId, usersID, callback) {
    if (!callback) {
      callback = function() {};
    }

    var form = {
      attachment_id: attachmentId,
    };

    if(utils.getType(usersID) !== "Array") {
      usersID = [usersID];
    }
    
    var timestamp = Math.floor(Date.now() / 1000);

    for (var i = 0; i < usersID.length; i++) {
      //That's good, the key of the array is really timestmap in seconds + index
      //Probably time when the attachment will be sent?
      form['recipient_map[' + (timestamp + i) + ']'] = usersID[i];
    }

    defaultFuncs
      .post("https://www.messenger.com/mercury/attachments/forward/?dpr=1", ctx.jar, form)
      .then(utils.parseAndCheckLogin(ctx.jar, defaultFuncs))
      .then(function(resData) {
        if (resData.error) {
          throw resData;
        }
        
        return callback(null);
    ***REMOVED***
      .catch(function(err) {
        log.error("forwardAttachment", err);
        return callback(err);
    ***REMOVED***;
  };
};
