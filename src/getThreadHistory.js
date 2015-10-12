"use strict";

var utils = require("../utils");
var log = require("npmlog");

module.exports = function(defaultFuncs, api, ctx) {
  return function getThreadHistory(threadID, start, end, timestamp, callback) {
    if(!callback) callback = function() {};

    var form = {
      'client' : 'mercury'
    };

    api.getUserInfo(threadID, function(err, res) {
      if(err) {
        return callback(err);
      }
      var key = (Object.keys(res).length > 0) ? "user_ids" : "thread_fbids";
        form['messages['+key+'][' + threadID + '][offset]'] = start;
        form['messages['+key+'][' + threadID + '][timestamp]'] = timestamp;
        form['messages['+key+'][' + threadID + '][limit]'] = end - start + 1;

        if(ctx.globalOptions.pageId) form.request_user_id = ctx.globalOptions.pageId;

        defaultFuncs.post("https://www.facebook.com/ajax/mercury/thread_info.php", ctx.jar, form)
        .then(utils.parseAndCheckLogin)
        .then(function(resData) {
          if (resData.error) {
            throw resData;
          } else if (!resData.payload){
            throw {error: "Could not retrieve thread history."};
          }

          var userIDs = {};
          resData.payload.actions.forEach(function(v) {
            userIDs[v.author.split(":").pop()] = "";
        ***REMOVED***;

          api.getUserInfo(Object.keys(userIDs), function(err, data){
            if (err) return callback(err); //callback({error: "Could not retrieve user information in getThreadHistory."***REMOVED***;

            resData.payload.actions.forEach(function (v) {
              v.sender_name = data[v.author.split(":").pop()].name;
              v.sender_fbid = v.author;
              delete v.author;
          ***REMOVED***;

            callback(null, resData.payload.actions.map(utils.formatMessage));
        ***REMOVED***;
      ***REMOVED***
        .catch(function(err) {
          log.error("Error in getThreadHistory", err);
          return callback(err);
      ***REMOVED***;
  ***REMOVED***;

  };
};

