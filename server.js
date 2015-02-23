var request = require("request").defaults({jar: true***REMOVED***;
var cheerio = require("cheerio");
var fs = require("fs");
var bot = require("./bot");
var time = require("./time");
var helperFunctions = require("./helperFunctions");

function _get(url, jar, qs, callback) {
  if(typeof qs === 'function') {
    callback = qs;
    qs = {};
  }
  for(var prop in qs) {
    if(typeof qs[prop] === "object") {
      console.log("You probably shouldn't pass an object inside the form at property", prop, form);
      continue;
    }
    qs[prop] = qs[prop].toString();
  }
  var op = {
    headers: {
      'Content-Type' : 'application/x-www-form-urlencoded',
      'Referer': 'https://www.facebook.com/',
      'Host': url.replace('https://', '').split("/")[0],
      'Origin': 'https://www.facebook.com',
      "User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/600.3.18 (KHTML, like Gecko) Version/8.0.3 Safari/600.3.18",
      'Connection': 'keep-alive',
    },
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
      'Referer': 'https://www.facebook.com/',
      'Origin': 'https://www.facebook.com',
      'Host': url.replace('https://', '').split("/")[0],
      "User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/600.3.18 (KHTML, like Gecko) Version/8.0.3 Safari/600.3.18",
      'Connection': 'keep-alive',
    },
    url: url,
    method: "POST",
    form: form,
    jar: jar,
    gzip: true
  };

  request(op, callback);
}

function login(email, password, callback) {
  var jar = request.jar();
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
    _post("https://www.facebook.com/login.php?login_attempt=1", jar, form, function(err, res, html) {
      var cookies = res.headers['set-cookie'] || [];

      cookies.map(function (c) {
        jar.setCookie(c, "https://www.facebook.com");
    ***REMOVED***;
      _get(res.headers.location, jar, function(err, res, html) {
        var grammar_version = getFrom(html, "grammar_version\":\"", "\"");

        var clientid = (Math.random()*2147483648|0).toString(16);
        var starTime = Date.now();
        var userId = jar.getCookies("https://www.facebook.com").filter(function(val) {
          return val.cookieString().split("=")[0] === "c_user";
      ***REMOVED***[0].cookieString().split("=")[1];
        var userChannel = "p_" + userId;

        var form = {
          'channel': userChannel,
          'seq': '0',
          'partition': '-2',
          'clientid': clientid,
          'viewer_uid': userId,
          'uid': userId,
          'state': 'active',
          'mode': 'stream',
          'format': 'json',
          'idle': '40',
          'cap': '8',
          'cb':getCB(),
        };

        var fb_dtsg = getFrom(html, "name=\"fb_dtsg\" value=\"", "\"");
        var ttstamp = "";
        for (var i = 0; i < fb_dtsg.length; i++) {
          ttstamp += fb_dtsg.charCodeAt(i);
        }
        ttstamp += '2';

        var api = {};
        var shouldStop = false;
        var stop = function() {
          shouldStop = true;
        };

        // var prev = Date.now();
        var tmpPrev = [];
        var lastSync = Date.now();
        var reqCounter = 1;
        var currentlyRunning = [];
        var alreadySeenMessages = {};
        api.listen = function(cb, index) {
          index = index || 0;
          if(shouldStop) return;
          if(currentlyRunning.length < 19) {
            console.log("Currentl running requests -->", currentlyRunning.length);
            for (var i = currentlyRunning.length; i < 19; i++) {
              currentlyRunning.push(setTimeout(api.listen, 2500 * i, cb, i));
              tmpPrev.push(Date.now());
            }
          }
          form.wtc = time.doSerialize();
          form.cb = getCB();
          // form.idle = ~~((Date.now() - prev)/1000);
          // prev = Date.now();
          console.log(form);
          time.reportPullSent();
          _get("https://0-edge-chat.facebook.com/pull", jar, form, function(err, res, html) {

            time.reportPullReturned();
            var strData = makeParsable(html);
            var info = [];
            try {
              console.log("parsing....");

              info = strData.map(JSON.parse);

              if(Date.now() - tmpPrev[index] < 1000) {
                console.log('Going too fast ------------> ', info);
                clearTimeout(currentlyRunning[index]);

                // currentlyRunning[index] = setTimeout(api.listen, 5000, cb, index);
              }
              tmpPrev[index] = Date.now();
              if(info.length > 0 && info[0].t === 'fullReload') {
                var form4 = {
                  'lastSync':~~(lastSync/1000),
                  '__user': userId,
                  '__req': (reqCounter++).toString(36)
                };
                console.log("Request to sync -->", form4);
                _get("https://www.facebook.com/notifications/sync", jar, form4, function(err, res, html) {
                  var cookies = res.headers['set-cookie'] || [];
                  cookies.map(function (c) {
                    jar.setCookie(c, "https://www.facebook.com");
                ***REMOVED***;
                  lastSync = Date.now();
                  console.log("fullReload --->", html);
                  currentlyRunning[index] = setTimeout(api.listen, 5000, cb, index);
              ***REMOVED***;
                return;
              }

              info = info.filter(function(v) {
                return v.t !== "heartbeat" &&
                v.ms &&
                v.ms[0].type === 'messaging' &&
                v.ms[0].event === 'deliver' &&
                v.ms[0].message.sender_fbid.toString() !== userId;
            ***REMOVED***;

              info = info.filter(function(v) {
                if(alreadySeenMessages[v.ms[0].message.timestamp]) return false;
                alreadySeenMessages[v.ms[0].message.timestamp] = true;
                return true;
            ***REMOVED***;

              // First packet received is a little different
              if(info.length === 1 && info[0].lb_info) {
                form.sticky_token = info[0].lb_info.sticky;
                form.sticky_pool = info[0].lb_info.pool;
              }

              var max = -1;
              for (var i = 0; i < info.length; i++) {
                var num = parseInt(info[i].seq);
                if(num > max) max = num;
              }

              if(max !== -1) form.seq = max;

              if(info.length > 0){
                for (i = 0; i < info.length; i++) {
                  if(info[i].tr) {
                    form.traceid = info[i].tr;
                    break;
                  }
                }
              }

            } catch (e) {
              console.log("ERROR --> ",e, strData);
              currentlyRunning[index] = setTimeout(api.listen, 1000, cb, index);
              return;
            }
            console.log("next call in 100ms");
            currentlyRunning[index] = setTimeout(api.listen, 100, cb, index);

            info = info.map(formatMessage);
            info.sort(function(a, b) {
              return a.timestamp - b.timestamp;
          ***REMOVED***;

            // Send all messages to the callback
            for (var i = 0; i < info.length; i++){
              cb(info[i], stop);
            }
        ***REMOVED***;
        };


        api.sendMessage = function(msg, thread_id, sticker_id, cb) {
          if(typeof sticker_id === 'function') {
            cb = sticker_id;
            sticker_id = null;
          }
          if(!cb) cb = function() {};

          var tmp = {};
          helperFunctions.normalizeNewMessage(tmp, userId, clientid);
          var timestamp = Date.now();

          var form = {
            'client': "mercury",
            '__user': userId,
            'fb_dtsg': fb_dtsg,
            'ttstamp': ttstamp,
            '__req': (reqCounter++).toString(36),
            'message_batch[0][action_type]':'ma-type:user-generated-message',
            'message_batch[0][author]':tmp.author,
            'message_batch[0][timestamp]':timestamp,
            'message_batch[0][timestamp_absolute]':tmp.timestamp_absolute,
            'message_batch[0][timestamp_relative]':'18:17',
            'message_batch[0][timestamp_time_passed]':'0',
            'message_batch[0][is_unread]':'false',
            'message_batch[0][is_cleared]':'false',
            'message_batch[0][is_forward]':'false',
            'message_batch[0][is_filtered_content]':'false',
            'message_batch[0][is_spoof_warning]':'false',
            'message_batch[0][source]':'source:chat:web',
            'message_batch[0][source_tags][0]':'source:chat',
            'message_batch[0][body]':msg,
            'message_batch[0][html_body]':'false',
            'message_batch[0][ui_push_phase]':'V3',
            'message_batch[0][status]':'0',
            'message_batch[0][message_id]':tmp.message_id,
            'message_batch[0][manual_retry_cnt]':'0',
            'message_batch[0][thread_fbid]':thread_id,
            'message_batch[0][sticker_id]':sticker_id,
            'message_batch[0][has_attachment]':!!sticker_id
          };
          _post("https://www.facebook.com/ajax/mercury/send_messages.php", jar, form, function(err, res, html) {
            var strData = makeParsable(html);
            try{
              var ret = strData.map(JSON.parse);
              form.cb = getCB();
              // console.log("Request to active_ping");
              // _get("https://0-edge-chat.facebook.com/active_ping", jar, form, function(err, res, html) {
              //   console.log("active ping back --->", html);
              // ***REMOVED***;
              cb({
                thread_id: ret.thread_fbid, // LOL
            ***REMOVED***;
            } catch (e) {
              console.log("ERROR", e, html);
            }
        ***REMOVED***;
        };

        time.initialize();

        var form2 = {
          'grammar_version':grammar_version,
          '__user':userId,
          '__req':(reqCounter++).toString(36),
        };
        console.log("Request to null_state");
        _get("https://www.facebook.com/ajax/browse/null_state.php", jar, form2, function(err, res, html) {
          // console.log("--->", html);
          console.log("Request to reconnect");
          var form3 = {
            '__user': userId,
            '__req': (reqCounter++).toString(36),
            'reason': '6',
            'fb_dtsg': fb_dtsg
          };
          _get("https://www.facebook.com/ajax/presence/reconnect.php", jar, form3, function(err, res, html) {
            var cookies = res.headers['set-cookie'] || [];
            cookies.map(function (c) {
              jar.setCookie(c, "https://www.facebook.com");
          ***REMOVED***;

            // console.log("--->", html);
            console.log("Request to imps_logging");
            // form3.source = "periodical_imps";
            // form3.sorted_list = "1216678154,1086418163,100001056938824,1341803147";
            // form3.list_availability = "2,2,3,3";
            // form3.ttstamp = ttstamp;
            // _get("https://www.facebook.com/ajax/chat/imps_logging.php", jar, form3, function(err, res, html) {
              // console.log("--->", html);
              time.reportPullSent();
              console.log("Request to pull 1");
              _get("https://0-edge-chat.facebook.com/pull", jar, form, function(err, res, html) {
                // console.log("--->", html);
                time.reportPullReturned();
                form.wtc = time.doSerialize();
                var strData = makeParsable(html);
                try {
                  var info = strData.map(JSON.parse).filter(function(v) {
                    return v.t !== "heartbeat";
                ***REMOVED***;

                  // First packet received is a little different
                  if(info.length === 1 && info[0].lb_info) {
                    form.sticky_token = info[0].lb_info.sticky;
                    form.sticky_pool = info[0].lb_info.pool;
                  }
                } catch (e) {
                  console.log("ERROR in init --> ",e, strData);
                }
                console.log("Request to pull 2");
                _get("https://0-edge-chat.facebook.com/pull", jar, form, function(err, res, html) {
                  // console.log("--->", html);
                  time.reportPullReturned();
                  form.wtc = time.doSerialize();
                  var form4 = {
                    'lastSync':~~(Date.now()/1000 - 6),
                    '__user': userId,
                    '__req': (reqCounter++).toString(36),
                  };
                  console.log("Request to sync");
                  _get("https://www.facebook.com/notifications/sync", jar, form4, function(err, res, html) {
                    // console.log("sync --->", html);
                    console.log("Request to bz");
                    var cookies = res.headers['set-cookie'] || [];
                    cookies.map(function (c) {
                      jar.setCookie(c, "https://www.facebook.com");
                  ***REMOVED***;
                    var form5 = {
                      '__user': userId,
                      '__req': (reqCounter++).toString(36),
                      'fb_dtsg': fb_dtsg,
                      'ttstamp': ttstamp,
                      'ph': "V3",
                      'ts': Date.now()
                    };
                    _post("https://www.facebook.com/ajax/bz", jar, form5, function(err, res, html) {
                      // console.log("bz --->", html);
                      form.cb = getCB();
                      console.log("Request to active_ping");
                      _get("https://0-edge-chat.facebook.com/active_ping", jar, form, function(err, res, html) {
                        var form6 = {
                          '__user': userId,
                          '__req': (reqCounter++).toString(36),
                          'fb_dtsg': fb_dtsg,
                          'ttstamp': ttstamp,
                          'client': 'mercury',
                          'folders[0]': 'inbox',
                          'last_action_timestamp': ~~(Date.now() - 60)
                        };
                        console.log("Request to thread_sync");
                        _post("https://www.facebook.com/ajax/mercury/thread_sync.php", jar, form, function(err, res, html) {
                          console.log("thread sync --->");
                          console.log(err, res.statusCode, html);
                          console.log("Ready!");
                          callback(api);
                      ***REMOVED***;
                    ***REMOVED***;
                  ***REMOVED***;
                ***REMOVED***;
              ***REMOVED***;
            ***REMOVED***;
            // ***REMOVED***;
        ***REMOVED***;
      ***REMOVED***;
    ***REMOVED***;
  ***REMOVED***;
***REMOVED***;
}

var credentials = JSON.parse(fs.readFileSync('config.json', 'utf8'));
login(credentials.email, credentials.password, function(api) {
  api.listen(function(message, closeConnection) {
    console.log(message);

    var msg = bot(message.body, message.sender_name.split(' ')[0], message.thread_id, message.participant_names);
    console.log(msg);

    if(msg.text && msg.text.length > 0) api.sendMessage(msg.text, message.thread_id);
    if(msg.sticker_id) api.sendMessage('', message.thread_id, msg.sticker_id);
***REMOVED***;
***REMOVED***;

function getCB() {
  return (1048576 * Math.random() | 0).toString(36);
}

function getThreadIdFromMessage(message) {
  if (message.tid) return message.tid.split(".")[1];
  else return message.other_user_fbid;
}

function formatMessage(m) {
  var originalMessage = m.ms[0].message ? m.ms[0].message : m.ms[0];

  return {
    sender_name: originalMessage.sender_name,
    participant_names: (originalMessage.group_thread_info ? originalMessage.group_thread_info.participant_names : [originalMessage.sender_name.split(' ')[0]]),
    body: originalMessage.body,
    thread_id: originalMessage.tid ? originalMessage.tid.split('.')[1] : originalMessage.other_user_fbid
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
