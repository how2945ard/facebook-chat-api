/*jslint node: true */
"use strict";

var request = require("request").defaults({jar: true***REMOVED***;

function get(url, jar, qs, callback) {
  if(typeof qs === 'function') {
    callback = qs;
    qs = null;
  }
  // if(typeof qs === "object") {
  //   for(var prop in qs) {
  //     if(qs.hasOwnProperty(prop) && typeof qs[prop] === "object") {
  //       qs[prop] = JSON.stringify(qs[prop]);
  //     }
  //   }
  // }
  var op = {
    headers: {
      'Content-Type' : 'application/x-www-form-urlencoded',
      'Referer' : 'https://www.facebook.com/',
      'Host' : url.replace('https://', '').split("/")[0],
      'Origin' : 'https://www.facebook.com',
      'User-Agent' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/600.3.18 (KHTML, like Gecko) Version/8.0.3 Safari/600.3.18',
      'Connection' : 'keep-alive',
    },
    timeout: 60000,
    qs: qs,
    url: url,
    method: "GET",
    jar: jar,
    gzip: true
  };

  request(op, callback);
}

function post(url, jar, form, callback) {
  var op = {
    headers: {
      'Content-Type' : 'application/x-www-form-urlencoded',
      'Referer' : 'https://www.facebook.com/',
      'Origin' : 'https://www.facebook.com',
      'Host' : url.replace('https://', '').split("/")[0],
      'User-Agent' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/600.3.18 (KHTML, like Gecko) Version/8.0.3 Safari/600.3.18',
      'Connection' : 'keep-alive',
    },
    timeout: 60000,
    url: url,
    method: "POST",
    form: form,
    jar: jar,
    gzip: true
  };

  request(op, callback);
}

/**
 *
 * ============= Helper functions =================
 *
 */

function padZeros(val, len) {
    val = String(val);
    len = len || 2;
    while (val.length < len) val = "0" + val;
    return val;
}

function generateMessageID(clientID) {
  var k = Date.now();
  var l = Math.floor(Math.random() * 4294967295);
  var m = clientID;
  return ("<" + k + ":" + l + "-" + m + "@mail.projektitan.com>");
}

function getGUID() {
  /** @type {number} */
  var sectionLength = Date.now();
  /** @type {string} */
  var id = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    /** @type {number} */
    var r = Math.floor((sectionLength + Math.random() * 16) % 16);
    /** @type {number} */
    sectionLength = Math.floor(sectionLength / 16);
    /** @type {string} */
    var _guid = (c == "x" ? r : r & 7 | 8).toString(16);
    return _guid;
***REMOVED***;
  return id;
}

function formatMessage(m) {
  var originalMessage = m.message ? m.message : m;

  return {
    sender_name: originalMessage.sender_name,
    sender_id: originalMessage.sender_fbid,
    participant_names: (originalMessage.group_thread_info ? originalMessage.group_thread_info.participant_names : [originalMessage.sender_name.split(' ')[0]]),
    participant_ids: (originalMessage.group_thread_info ? originalMessage.group_thread_info.participant_ids : [originalMessage.sender_fbid]),
    body: originalMessage.body,
    thread_id: originalMessage.tid && originalMessage.tid.split(".")[0] === "id" ? originalMessage.tid.split('.')[1] : originalMessage.other_user_fbid,
    location: originalMessage.coordinates ? originalMessage.coordinates : null
  };
}

function getFrom(str, startToken, endToken) {
  var start = str.indexOf(startToken) + startToken.length;
  if(start < startToken.length) return "";

  var lastHalf = str.substring(start);
  var end = lastHalf.indexOf(endToken);
  return lastHalf.substring(0, end);
}

function makeParsable(html) {
  return html.replace(/for\s*\(\s*;\s*;\s*\)\s*;\s*/, "");
}

function arrToForm(form) {
  return arrayToObject(form, function(v) {return v.name;}, function(v) {return v.val;***REMOVED***;
}

function arrayToObject(arr, getKey, getValue) {
  return arr.reduce(function(acc, val) {
    acc[getKey(val)] = getValue(val);
    return acc;
  ***REMOVED******REMOVED***;
}

function getSignatureId(){
  return Math.floor(Math.random() * 2147483648).toString(16);
}

function genTimestampRelative() {
  var d = new Date();
  return d.getHours() + ":" + padZeros(d.getMinutes());
}

function makeMergeWithDefaults(html, userId) {
  var reqCounter = 1;
  var fb_dtsg = getFrom(html, "name=\"fb_dtsg\" value=\"", "\"");
  var ttstamp = "";
  for (var i = 0; i < fb_dtsg.length; i++) {
    ttstamp += fb_dtsg.charCodeAt(i);
  }
  ttstamp += '2';

  return function (obj) {
    var newObj = {
      __user: userId,
      __req: (reqCounter++).toString(36),
      __rev: getFrom(html, "revision\":",","),
      __a: 1,
      fb_dtsg: fb_dtsg,
      ttstamp: ttstamp,
    };

    if(!obj) return newObj;

    for(var prop in obj) {
      if(obj.hasOwnProperty(prop)) {
        newObj[prop] = obj[prop];
      }
    }

    return newObj;
  };
}

module.exports = {
  get: get,
  post: post,
  generateMessageID: generateMessageID,
  getGUID: getGUID,
  formatMessage: formatMessage,
  getFrom: getFrom,
  makeParsable: makeParsable,
  arrToForm: arrToForm,
  getSignatureId: getSignatureId,
  getJar: request.jar,
  genTimestampRelative: genTimestampRelative,
  makeMergeWithDefaults: makeMergeWithDefaults
};