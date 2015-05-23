var request = require("request").defaults({jar: true***REMOVED***;
var cheerio = require("cheerio");
var log = require("npmlog");
var fs = require("fs");
var time = require("./time");

function _get(url, jar, qs, callback) {
  if(typeof qs === 'function') {
    callback = qs;
    qs = {};
  }
  for(var prop in qs) {
    if(typeof qs[prop] === "object") {
      log.error("You probably shouldn't pass an object inside the form at property", prop, qs);
      continue;
    }
    qs[prop] = qs[prop].toString();
  }
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

function _post(url, jar, form, callback) {
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

function _login(email, password, callback) {
  var jar = request.jar();
  log.info("Getting login form data");
  _get("https://www.facebook.com/", jar, function(err, res, html) {
    var $ = cheerio.load(html);

    var arr = [];

    $("#login_form input").map(function(i, v){
      arr.push({val: $(v).val(), name: $(v).attr("name")***REMOVED***;
  ***REMOVED***;

    arr = arr.filter(function(v) {
      return v.val && v.val.length;
  ***REMOVED***;
    res.headers['set-cookie'].map(function(val) {
      jar.setCookie(val, "https://www.facebook.com");
  ***REMOVED***;
    var form = arrToForm(arr);
    form.email = email;
    form.pass = password;
    form.default_persistent = '1';

    log.info("Logging in...");
    _post("https://www.facebook.com/login.php?login_attempt=1", jar, form, function(err, res, html) {
      var cookies = res.headers['set-cookie'] || [];
      cookies.map(function (c) {
        jar.setCookie(c, "https://www.facebook.com");
    ***REMOVED***;

      if (!res.headers.location) return callback({error: "Wrong username/password."***REMOVED***;
      _get(res.headers.location, jar, function(err, res, html) {

        log.info("Logged in");

        var grammar_version = getFrom(html, "grammar_version\":\"", "\"");

        // I swear, this is copy pasted from FB's minified code
        var clientid = (Math.random()*2147483648|0).toString(16);
        var starTime = Date.now();
        var userId = jar.getCookies("https://www.facebook.com").filter(function(val) {
          return val.cookieString().split("=")[0] === "c_user";
      ***REMOVED***[0].cookieString().split("=")[1];
        var userChannel = "p_" + userId;
        var __rev = getFrom(html, "revision\":",",");

        var form = {
          'channel' : userChannel,
          'seq' : '0',
          'partition' : '-2',
          'clientid' : clientid,
          'viewer_uid' : userId,
          'uid' : userId,
          'state' : 'active',
          'format' : 'json',
          'idle' : 0,
          'cap' : '8'
        };

        var fb_dtsg = getFrom(html, "name=\"fb_dtsg\" value=\"", "\"");
        var ttstamp = "";
        for (var i = 0; i < fb_dtsg.length; i++) {
          ttstamp += fb_dtsg.charCodeAt(i);
        }
        ttstamp += '2';

        var api = {};
        var globalOptions = {
          selflisten: false
        };
        var access_token = "NONE";
        var shouldStop = false;
        var currentlyRunning = null;
        var stopListening = function() {
          shouldStop = true;
          if(currentlyRunning) clearTimeout(currentlyRunning);
        };

        var prev = Date.now();
        var tmpPrev = Date.now();
        var lastSync = Date.now();
        var getReq = (function() {
          var reqCounter = 1;
          return function() {
            return (reqCounter++).toString(36);
          };
      ***REMOVED***();

        api.setOptions = function(options) {
          handleOptions(options);
        }

        function handleOptions(options){
          if (options.loglevel){
            log.level = options.loglevel;
            globalOptions.loglevel = options.loglevel;
          }
          if (options.selflisten){
            globalOptions.selflisten = options.selflisten;
          }
        }


        api.listen = function(callback) {
          if(shouldStop) return;

          form.wtc = time.doSerialize();
          form.idle = ~~(Date.now()/1000) - prev;
          prev = ~~(Date.now()/1000);

          time.reportPullSent();
          // TODO: get the right URL to query...
          _get("https://0-edge-chat.facebook.com/pull", jar, form, function(err, res, html) {
            if(err) throw err;
            if(!html) throw "html was null after request to https://0-edge-chat.facebook.com/pull with form " + JSON.stringify(form);

            time.reportPullReturned();
            var strData = makeParsable(html);
            var info = [];
            try {
              info = strData.map(JSON.parse)[0];

              var now = Date.now();
              log.info("Got answer in ", now - tmpPrev);
              tmpPrev = now;

              if(info && info.t === 'fullReload') {
                form.seq = info.seq;
                var form4 = {
                  'lastSync' : ~~(lastSync/1000),
                  '__user' : userId,
                  '__req' : getReq(),
                  '__rev' : __rev,
                  '__a' : '1',
                };
                _get("https://www.facebook.com/notifications/sync/", jar, form4, function(err, res, html) {
                  var cookies = res.headers['set-cookie'] || [];
                  cookies.map(function (c) {
                    jar.setCookie(c, "https://www.facebook.com");
                ***REMOVED***;
                  lastSync = Date.now();
                  var form6 = {
                    '__a' : '1',
                    '__user' : userId,
                    '__req' : getReq(),
                    '__rev' : __rev,
                    'fb_dtsg' : fb_dtsg,
                    'ttstamp' : ttstamp,
                    'client' : 'mercury',
                    'folders[0]': 'inbox',
                    'last_action_timestamp' : ~~(Date.now() - 60)
                  };
                  _post("https://www.facebook.com/ajax/mercury/thread_sync.php", jar, form, function(err, res, html) {
                    log.info("thread sync --->", html);
                    currentlyRunning = setTimeout(api.listen, 1000, callback);
                ***REMOVED***;
              ***REMOVED***;
                return;
              }

              if(info.ms) {
                info.ms = info.ms.filter(function(v) {
                  return  v.type === 'messaging' &&
                          v.event === 'deliver' &&
                          (globalOptions.selflisten
                           || v.message.sender_fbid.toString() !== userId);
              ***REMOVED***;

                // Send deliveryReceipt notification to the server
                var formDeliveryReceipt = {
                  '__a' : '1',
                  '__user' : userId,
                  '__req' : getReq(),
                  '__rev' : __rev,
                  'fb_dtsg' : fb_dtsg,
                  'ttstamp' : ttstamp,
                };
                for (var i = 0; i < info.ms.length; i++) {
                  if(info.ms[i].message && info.ms[i].message.mid) formDeliveryReceipt["[" + i + "]"] = info.ms[i].message.mid;
                }

                // If there's at least one, we do the post request
                if(formDeliveryReceipt["[0]"]) {
                  _post("https://www.facebook.com/ajax/mercury/delivery_receipts.php", jar, formDeliveryReceipt, function(err, res, html) {
                ***REMOVED***;
                }
                info.ms = info.ms.map(formatMessage);
                info.ms.sort(function(a, b) {
                  return a.timestamp - b.timestamp;
              ***REMOVED***;
              }


              if(info.seq) form.seq = info.seq;
              if(info.tr) form.traceid = info.tr;
            } catch (e) {
              log.error("ERROR in listen --> ",e, strData);
              callback({error: e}, null, stopListening);
              currentlyRunning = setTimeout(api.listen, Math.random() * 200 + 50, callback);
              return;
            }
            currentlyRunning = setTimeout(api.listen, Math.random() * 200 + 50, callback);

            // If any call to stopListening was made, do not call the callback
            if(shouldStop) return;
            if(info.ms) {
              // Send all messages to the callback
              for (var j = 0; j < info.ms.length; j++){
                callback(null, info.ms[j], stopListening);
              }
            }
        ***REMOVED***;
        };

        api.getUserId = function(name, callback) {
          var form = {
            'value' : name.toLowerCase(),
            'viewer' : userId,
            'rsp' : "search",
            'context' : "search",
            'path' : "/home.php",
            'request_id' : getGUID(),
            '__user' : userId,
            '__a' : '1',
            '__req' : getReq(),
            '__rev' : __rev,
          };

          _get("https://www.facebook.com/ajax/typeahead/search.php", jar, form, function(err, res, html) {
            var strData = makeParsable(html);
            try{
              var ret = strData.map(JSON.parse);
              var info = ret[0].payload;
              if(info.entries[0].type !== "user") {
                return callback({error: "Couldn't find a user with name " + name + ". Best match: " + info.entries[0].path***REMOVED***;
              }

              callback(null, info);
            } catch (e) {
              log.error("ERROR in sendDirectMessage --> ",e, strData);
              callback({error: e***REMOVED***;
            }
        ***REMOVED***;
        };

        api.sendDirectMessage = function(msg, nameOrUserId, callback) {
          if(!callback) throw new Error("Callback is required for sendDirectMessage");

          if(typeof nameOrUserId === "number") {
            return api.sendMessage(msg, nameOrUserId, callback);
          }

          api.getUserId(nameOrUserId, function(err, data) {
            if(err) return callback(err);

            // TODO: find the actual best entry
            var thread_id = data.entries[0].uid;
            api.sendMessage(msg, thread_id, callback);
        ***REMOVED***;
        };

        api.sendDirectSticker = function(sticker_id, nameOrUserId, callback) {
          if(!callback) throw new Error("Callback is required for sendDirectSticker");

          if(typeof nameOrUserId === "number") {
            return api.sendSticker(sticker_id, nameOrUserId, callback);
          }

          api.getUserId(nameOrUserId, function(err, data) {
            if(err) return callback(err);

            // TODO: find the actual best entry
            var thread_id = data.entries[0].uid;
            api.sendSticker(sticker_id, thread_id, callback);
        ***REMOVED***;
        };

        api.sendSticker = function(sticker_id, thread_id, callback) {
          if(!callback) callback = function() {};
          if (typeof sticker_id !== "number" && typeof sticker_id !== "string")
            return callback({error: "Sticker_id should be of type number or string and not " + typeof msg + "."***REMOVED***;
          if (typeof thread_id !== "number" && typeof thread_id !== "string")
            return callback({error: "Thread_id should be of type number or string and not " + typeof msg + "."***REMOVED***;
          var timestamp = Date.now();
          var d = new Date();
          var form = {
            'client' : 'mercury',
            'fb_dtsg' : fb_dtsg,
            'ttstamp' : ttstamp,
            '__a' : '1',
            '__req' : getReq(),
            '__rev' : __rev,
            '__user' : userId,
            'message_batch[0][action_type]' : 'ma-type:user-generated-message',
            'message_batch[0][author]' : 'fbid:' + userId,
            'message_batch[0][timestamp]' : timestamp,
            'message_batch[0][timestamp_absolute]' : 'Today',
            'message_batch[0][timestamp_relative]' : d.getHours() + ":" + padZeros(d.getMinutes()),
            'message_batch[0][timestamp_time_passed]' : '0',
            'message_batch[0][is_unread]' : false,
            'message_batch[0][is_cleared]' : false,
            'message_batch[0][is_forward]' : false,
            'message_batch[0][is_filtered_content]' : false,
            'message_batch[0][is_spoof_warning]' : false,
            'message_batch[0][source]' : 'source:chat:web',
            'message_batch[0][source_tags][0]' : 'source:chat',
            'message_batch[0][body]' : '',
            'message_batch[0][html_body]' : false,
            'message_batch[0][ui_push_phase]' : 'V3',
            'message_batch[0][status]' : '0',
            'message_batch[0][message_id]' : generateMessageID(clientid),
            'message_batch[0][manual_retry_cnt]' : '0',
            'message_batch[0][thread_fbid]' : thread_id,
            'message_batch[0][sticker_id]' : sticker_id,
            'message_batch[0][has_attachment]' : true,
            'message_batch[0][client_thread_id]' : "user:"+thread_id,
            'message_batch[0][signatureID]' : getSignatureId()
          };
          _post("https://www.facebook.com/ajax/mercury/send_messages.php", jar, form, function(err, res, html) {
            var strData = makeParsable(html);
            var ret;
            try{
              ret = strData.map(JSON.parse)[0];
            } catch (e) {
              log.error("ERROR in sendSticker --> ",e, strData);
              return callback({error: e***REMOVED***;
            }

            if (!ret){
              callback({error: "Send sticker failed."***REMOVED***;
            } else if (ret.error){
              if (ret.error == 1545012){
                log.error("Second call, creating chat");
                // Try to create new chat.
                form.__req = getReq();
                form['message_batch[0][specific_to_list][0]'] = "fbid:"+thread_id;
                form['message_batch[0][specific_to_list][1]'] = "fbid:"+userId;
                _post("https://www.facebook.com/ajax/mercury/send_messages.php", jar, form, function(err, res, html) {
                  var strData = makeParsable(html);
                  var ret;
                  try{
                    ret = strData.map(JSON.parse)[0];
                  } catch (e) {
                    log.info("ERROR in sendSticker --> ",e, strData);
                    return callback({error: e***REMOVED***;
                  }

                  if (!ret){
                    callback({error: "Send sticker failed."***REMOVED***;
                  } else if (ret.error){
                    callback({error: ret***REMOVED***;
                  } else {
                    callback();
                  }
              ***REMOVED***;
                return;
              }
              callback({error: ret***REMOVED***;
            } else {
              callback();
            }
        ***REMOVED***;
        };

        api.setTitle = function(newTitle, thread_id, callback) {
          if(!callback) callback = function() {};
          var timestamp = Date.now();
          var d = new Date();
          var form = {
            '__req' : getReq(),
            '__rev' : __rev,
            '__user' : userId,
            '__a' : '1',
            'client' : 'mercury',
            'fb_dtsg' : fb_dtsg,
            'ttstamp' : ttstamp,
            'message_batch[0][action_type]' : 'ma-type:log-message',
            'message_batch[0][author]' : 'fbid:' + userId,
            'message_batch[0][thread_id]' : '',
            'message_batch[0][author_email]' : '',
            'message_batch[0][coordinates]' : '',
            'message_batch[0][timestamp]' : timestamp,
            'message_batch[0][timestamp_absolute]' : 'Today',
            'message_batch[0][timestamp_relative]' : d.getHours() + ":" + padZeros(d.getMinutes()),
            'message_batch[0][timestamp_time_passed]' : '0',
            'message_batch[0][is_unread]' : false,
            'message_batch[0][is_cleared]' : false,
            'message_batch[0][is_forward]' : false,
            'message_batch[0][is_filtered_content]' : false,
            'message_batch[0][is_spoof_warning]' : false,
            'message_batch[0][source]' : 'source:chat:web',
            'message_batch[0][source_tags][0]' : 'source:chat',
            'message_batch[0][status]' : '0',
            'message_batch[0][message_id]' : generateMessageID(clientid),
            'message_batch[0][manual_retry_cnt]' : '0',
            'message_batch[0][thread_fbid]' : thread_id,
            'message_batch[0][log_message_data][name]' : newTitle,
            'message_batch[0][log_message_type]' : 'log:thread-name'
          };

          _post("https://www.facebook.com/ajax/mercury/send_messages.php", jar, form, function(err, res, html) {
            var strData = makeParsable(html);
            var ret;
            try{
              ret = strData.map(JSON.parse);
              if (ret instanceof Array){
                ret = ret[0];
              }
            } catch (e) {
              log.error("ERROR in setTitle --> ",e, strData);
              callback({error: e***REMOVED***;
            }

            if (ret.error && ret.error === 1545012){
              callback({error: "Cannot change chat title: Not member of chat."***REMOVED***;
            } else if (ret.error && ret.error === 1545003){
              callback({error: "Cannot set title of single-user chat."***REMOVED***;
            } else if (ret.error) {
              callback({error: ret***REMOVED***;
            } else callback();
        ***REMOVED***;
        };

        api.getThreadList = function(start, end, callback) {
          if(!callback) callback = function() {};

          if (end <= start) end = start + 20;

          var form = {
            '__req' : getReq(),
            '__rev' : __rev,
            '__user' : userId,
            '__a' : '1',
            'client' : 'mercury',
            'fb_dtsg' : fb_dtsg,
            'ttstamp' : ttstamp,
            'inbox[offset]' : start,
            'inbox[limit]' : end
          };

          _post("https://www.facebook.com/ajax/mercury/threadlist_info.php", jar, form, function(err, res, html) {
            var strData = makeParsable(html);
            var ret;
            try{
              ret = strData.map(JSON.parse);
              if (ret instanceof Array){
                ret = ret[0];
              }
            } catch (e) {
              log.error("ERROR in setTitle --> ",e, strData);
              callback({error: e***REMOVED***;
            }

            if (ret.error && ret.error === 1545012){
              callback({error: "Cannot change chat title: Not member of chat."***REMOVED***;
            } else if (ret.error && ret.error === 1545003){
              callback({error: "Cannot set title of single-user chat."***REMOVED***;
            } else if (ret.error) {
              callback({error: ret***REMOVED***;
            } else callback(null, ret.payload.threads);
        ***REMOVED***;
        };


        api.markAsRead = function(thread_id, callback) {
          if(!callback) callback = function() {};
          var form = {
            __user: userId,
            fb_dtsg: fb_dtsg,
            ttstamp: ttstamp,
            __req: getReq(),
          };

          form["ids[" + thread_id + "]"] = true;

          _post("https://www.facebook.com/ajax/mercury/change_read_status.php", jar, form, function(err, res, html) {
            var cookies = res.headers['set-cookie'] || [];
            cookies.map(function (c) {
              jar.setCookie(c, "https://www.facebook.com");
          ***REMOVED***;

            var strData = makeParsable(html);
            try{
              var ret = strData.map(JSON.parse);
            } catch (e) {
              log.error("ERROR in markAsRead --> ",e, strData);
              return callback({error: e***REMOVED***;
            }
              callback();
        ***REMOVED***;
        };

        api.sendMessage = function(msg, thread_id, callback) {
          if(!callback) callback = function() {};
          if(typeof msg !== "string") return callback({error: "Message should be of type string and not " + typeof msg + "."***REMOVED***;
          if (typeof thread_id !== "number" && typeof thread_id !== "string")
            return callback({error: "Thread_id should be of type number or string and not " + typeof msg + "."***REMOVED***;

          var timestamp = Date.now();
          var d = new Date();
          var form = {
            'client' : 'mercury',
            'fb_dtsg' : fb_dtsg,
            'ttstamp' : ttstamp,
            '__a' : '1',
            '__req' : getReq(),
            '__rev' : __rev,
            '__user' : userId,
            'message_batch[0][action_type]' : 'ma-type:user-generated-message',
            'message_batch[0][author]' : 'fbid:' + userId,
            'message_batch[0][timestamp]' : timestamp,
            'message_batch[0][timestamp_absolute]' : 'Today',
            'message_batch[0][timestamp_relative]' : d.getHours() + ":" + padZeros(d.getMinutes()),
            'message_batch[0][timestamp_time_passed]' : '0',
            'message_batch[0][is_unread]' : false,
            'message_batch[0][is_cleared]' : false,
            'message_batch[0][is_forward]' : false,
            'message_batch[0][is_filtered_content]' : false,
            'message_batch[0][is_spoof_warning]' : false,
            'message_batch[0][source]' : 'source:chat:web',
            'message_batch[0][source_tags][0]' : 'source:chat',
            'message_batch[0][body]' : msg ? msg.toString() : "",
            'message_batch[0][html_body]' : false,
            'message_batch[0][ui_push_phase]' : 'V3',
            'message_batch[0][status]' : '0',
            'message_batch[0][message_id]' : generateMessageID(clientid),
            'message_batch[0][manual_retry_cnt]' : '0',
            'message_batch[0][thread_fbid]' : thread_id,
            'message_batch[0][has_attachment]' : false,
            'message_batch[0][signatureID]' : getSignatureId(),
            // 'message_batch[0][specific_to_list][0]':'fbid:'+thread_id,
            // 'message_batch[0][specific_to_list][1]':'fbid:'+userId
          };

          // We're doing a query to this to check if the given id is the id of
          // a user or of a group chat. The form will be different depending
          // on that.
          api.getUserInfo(thread_id, function(err, res) {
            // This means that thread_id is the id of a user, and the chat
            // is a single person chat
            if(!(res instanceof Array)) {
              form['message_batch[0][client_thread_id]'] = "user:"+thread_id;
              form['message_batch[0][specific_to_list][0]'] = "fbid:"+thread_id;
              form['message_batch[0][specific_to_list][1]'] = "fbid:"+userId;
            }

            _post("https://www.facebook.com/ajax/mercury/send_messages.php", jar, form, function(err, res, html) {

              var strData = makeParsable(html);
              var ret;
              try{
                ret = strData.map(JSON.parse)[0];
              } catch (e) {
                log.error("ERROR in sendMessage --> ",e, strData);
                return callback({error: e***REMOVED***;
              }

              if (!ret){
                callback({error: "Send message failed."***REMOVED***;
              } else if (ret.error){
                if (ret.error == 1545012){
                  log.info("Second call, creating chat");
                  // Try to create new chat.
                  form.__req = getReq();
                  form['message_batch[0][specific_to_list][0]'] = "fbid:"+thread_id;
                  form['message_batch[0][specific_to_list][1]'] = "fbid:"+userId;
                  _post("https://www.facebook.com/ajax/mercury/send_messages.php", jar, form, function(err, res, html) {
                    var strData = makeParsable(html);
                    var ret;
                    try{
                      ret = strData.map(JSON.parse)[0];
                    } catch (e) {
                      log.error("ERROR in sendMessage --> ",e, strData);
                      return callback({error: e***REMOVED***;
                    }

                    if (!ret){
                      callback({error: "Send message failed."***REMOVED***;
                    } else if (ret.error){
                      callback({error: ret***REMOVED***;
                    } else {
                      callback();
                    }
                ***REMOVED***;
                  return;
                }
                callback({error: ret***REMOVED***;
              } else {
                callback();
              }
          ***REMOVED***;
        ***REMOVED***;
        };

        api.getAccessToken = function() {
          return access_token;
        };

        api.getUserInfo = function(id, callback) {
          var form = {
            "__user":userId,
            __a:"1",
            "__req":getReq(),
            "__rev":__rev,
          };
          if(!(id instanceof Array)) id = [id];

          id.map(function(v, i) {
            form["ids[" + i + "]"] = v;
        ***REMOVED***;

          _get("https://www.facebook.com/chat/user_info/", jar, form, function(req, res, html) {
            var strData = makeParsable(html);
            var ret;
            try{
              ret = strData.map(JSON.parse)[0];
              callback(null, ret.payload.profiles);
            } catch (e) {
              log.error("ERROR in getUserInfo --> ",e, strData);
              return callback({error: e***REMOVED***;
            }
        ***REMOVED***;
        };

        time.initialize();

        var form2 = {
          'grammar_version' : grammar_version,
          '__user' : userId,
          '__a' : '1',
          '__req' : getReq(),
        };
        log.info("Initial requests...");
        log.info("Request to null_state");
        _get("https://www.facebook.com/ajax/browse/null_state.php", jar, form2, function(err, res, html) {
          log.info("Request to reconnect");
          var form3 = {
            '__user' : userId,
            '__req' : getReq(),
            '__a' : '1',
            '__rev' : __rev,
            'reason' : '6',
            'fb_dtsg' : fb_dtsg
          };
          _get("https://www.facebook.com/ajax/presence/reconnect.php", jar, form3, function(err, res, html) {
            var cookies = res.headers['set-cookie'] || [];
            cookies.map(function (c) {
              jar.setCookie(c, "https://www.facebook.com");
          ***REMOVED***;

            time.reportPullSent();
            log.info("Request to pull 1");
            _get("https://0-edge-chat.facebook.com/pull", jar, form, function(err, res, html) {
              time.reportPullReturned();
              form.wtc = time.doSerialize();
              var strData = makeParsable(html);
              try {
                var info = strData.map(JSON.parse);

                form.sticky_token = info[0].lb_info.sticky;
                form.sticky_pool = info[0].lb_info.pool;
              } catch (e) {
                log.error("ERROR in init --> ",e, strData);
                callback({error: e***REMOVED***;
              }
              log.info("Request to pull 2");
              _get("https://0-edge-chat.facebook.com/pull", jar, form, function(err, res, html) {
                time.reportPullReturned();
                form.wtc = time.doSerialize();
                var form4 = {
                  'lastSync' : ~~(Date.now()/1000 - 60),
                  '__user' : userId,
                  '__req' : getReq(),
                  '__a' : '1',
                  '__rev' : __rev
                };
                log.info("Request to sync");
                _get("https://www.facebook.com/notifications/sync", jar, form4, function(err, res, html) {
                  var strData = makeParsable(html);
                  var lastSync = strData.map(JSON.parse)[0].payload.lastSync;

                  var cookies = res.headers['set-cookie'] || [];
                  cookies.map(function (c) {
                    jar.setCookie(c, "https://www.facebook.com");
                ***REMOVED***;

                  var form6 = {
                    '__user' : userId,
                    '__req' : getReq(),
                    '__a' : '1',
                    '__rev' : __rev,
                    'fb_dtsg' : fb_dtsg,
                    'ttstamp' : ttstamp,
                    'client' : 'mercury',
                    'folders[0]': 'inbox',
                    'last_action_timestamp' : '0'
                  };
                  log.info("Request to thread_sync");
                  _post("https://www.facebook.com/ajax/mercury/thread_sync.php", jar, form, function(err, res, html) {
                    var cookies = res.headers['set-cookie'] || [];
                    cookies.map(function (c) {
                      jar.setCookie(c, "https://www.facebook.com");
                  ***REMOVED***;

                    var graphAPIForm = {
                      "fb_dtsg":fb_dtsg,
                      "app_id":"145634995501895",
                      "redirect_uri":"https://www.facebook.com/connect/login_success.html",
                      "display":"popup",
                      "access_token":"",
                      "sdk":"",
                      "from_post":"1",
                      "public_info_nux":"1",
                      "private":"",
                      "login":"",
                      "read":"user_about_me,user_actions.books,user_actions.fitness,user_actions.music,user_actions.news,user_actions.video,user_birthday,user_education_history,user_events,user_friends,user_games_activity,user_groups,user_hometown,user_likes,user_location,user_managed_groups,user_photos,user_posts,user_relationship_details,user_relationships,user_religion_politics,user_status,user_tagged_places,user_videos,user_website,user_work_history,public_profile,baseline",
                      "write": "",
                      "readwrite":"",
                      "extended": "",
                      "social_confirm":"",
                      "confirm":"",
                      "seen_scopes":"user_about_me,user_actions.books,user_actions.fitness,user_actions.music,user_actions.news,user_actions.video,user_birthday,user_education_history,user_events,user_friends,user_games_activity,user_groups,user_hometown,user_likes,user_location,user_managed_groups,user_photos,user_posts,user_relationship_details,user_relationships,user_religion_politics,user_status,user_tagged_places,user_videos,user_website,user_work_history,public_profile,baseline",
                      "auth_type":"",
                      "auth_token":"",
                      "auth_nonce":"",
                      "default_audience":"",
                      "ref":"Default",
                      "return_format":"access_token",
                      "domain":"",
                      "sso_device":"",
                      "sheet_name":"initial",
                      "__CONFIRM__":"1",
                      "__user":userId,
                      "__a":"1",
                      "__req":getReq(),
                      "ttstamp":ttstamp,
                      "__rev":__rev
                    };
                    log.info("Getting read access.");
                    _post("https://www.facebook.com/v2.3/dialog/oauth/read", jar, graphAPIForm, function(req, res, html) {
                      graphAPIForm.read = "";
                      graphAPIForm.write = "publish_actions";
                      graphAPIForm.seen_scopes = graphAPIForm.write;
                      graphAPIForm["audience[0][value]"] = 40;
                      log.info("Getting write access.");
                      _post("https://www.facebook.com/v2.3/dialog/oauth/write", jar, graphAPIForm, function(req, res, html) {
                        graphAPIForm.write = "";
                        graphAPIForm.extended = "ads_management,ads_read,manage_notifications,manage_pages,publish_pages,read_insights,read_page_mailboxes,rsvp_event";
                        graphAPIForm.seen_scopes = graphAPIForm.extended;
                        graphAPIForm["audience[0][value]"] = "";
                        log.info("Getting extended access.");
                        _post("https://www.facebook.com/v2.3/dialog/oauth/extended", jar, graphAPIForm, function(req, res, html) {
                          var strData = makeParsable(html);
                          var ret;
                          try {
                            ret = strData.map(JSON.parse)[0];
                          } catch (e) {
                            log.error("ERROR in getting extended access --> ",e, strData);
                            return callback({error: e***REMOVED***;
                          }

                          access_token = -1;
                          try {
                            var tokenArray = ret.jsmods.require;
                            for (var i = 0; i < tokenArray.length; i++){
                              if (tokenArray[i][3][0].indexOf("access_token=") != -1){
                                access_token = tokenArray[i][3][0].split("access_token=")[1].split("&")[0];
                                break;
                              }
                            }
                          } catch (e) {
                            access_token = -1;
                          }
                          if (access_token === -1){
                            log.error("Error retrieving access token, continuing...");
                          }

                          log.info("Done loading.");
                          callback(null, api);
                      ***REMOVED***;
                    ***REMOVED***;
                  ***REMOVED***;
                ***REMOVED***;
              ***REMOVED***;
            ***REMOVED***;
          ***REMOVED***;
        ***REMOVED***;
      ***REMOVED***;
    ***REMOVED***;
  ***REMOVED***;
***REMOVED***;
}

function login(loginData, callback) {
  var obj = {};
  if(typeof loginData === 'function') {
    if(!process.env.FB_LOGIN_EMAIL || !process.env.FB_LOGIN_PASSWORD) return console.error("Please define env variables");
    obj.email = process.env.FB_LOGIN_EMAIL;
    obj.password = process.env.FB_LOGIN_PASSWORD;
    callback = loginData;
  } else if (typeof loginData === 'string') {
    obj = JSON.parse(fs.readFileSync(loginData, 'utf8'));
    if(!obj.email || !obj.password) throw loginData + " has to be a valid json with an email field and a password field";
  } else if (typeof loginData === 'object') {
    if(!obj.email || !obj.password) throw "Invalid JSON passed into login.";
    else obj = loginData;
  } else {
    throw "Invalid argument passed into login.";
  }

  return _login(obj.email, obj.password, callback);
}
module.exports = login;


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
  var lastHalf = str.substring(start);
  var end = lastHalf.indexOf(endToken);
  return lastHalf.substring(0, end);
}

function makeParsable(html) {
  return html.replace(/for\s*\(\s*;\s*;\s*\)\s*;\s*/, "").split("\n").filter(function(v) {
    return v.length > 0;
***REMOVED***;
}

function arrToForm(form) {
  return arrayToObject(form, function(v) {return v.name;}, function(v) {return v.val;***REMOVED***;
}

function arrayToObject (arr, getKey, getValue) {
  return arr.reduce(function(acc, val) {
    acc[getKey(val)] = getValue(val);
    return acc;
  ***REMOVED******REMOVED***;
}

function getSignatureId(){
  return Math.floor(Math.random() * 2147483648).toString(16);
}

