var login = require('../index.js');
var fs = require('fs');
var assert = require('assert');

var conf = JSON.parse(fs.readFileSync('test/test-config.json', 'utf8'));
var credentials = {
  email: conf.user.email,
  password: conf.user.password,
};

var userIDs = conf.userIDs;

var options = { selfListen: true, listenEvents: true, logLevel: "silent"};
var pageOptions = {logLevel: 'silent', pageID: conf.pageID};
var getType = require('../utils').getType;

var userID = conf.user.id;

var groupChatID;
var groupChatName;

function checkErr(done){
  return function(err) {
    if (err) done(err);
  };
}

describe('Login:', function() {
  var api = null;
  var tests = [];
  var stopListening;
  this.timeout(20000);

  function listen(done, matcher) {
    tests.push({matcher:matcher, done:done***REMOVED***;
  }

  before(function(done) {
    login(credentials, options, function (err, localAPI) {
      if(err) return done(err);

      assert(localAPI);
      api = localAPI;
      stopListening = api.listen(function (err, msg) {
        if (err) throw err;
        // Removes matching function and calls corresponding done
        tests = tests.filter(function(test) {
          return !(test.matcher(msg) && (test.done() || true));
      ***REMOVED***;
    ***REMOVED***;

      done();
  ***REMOVED***;
***REMOVED***;

  it('should login without error', function (){
    assert(api);
***REMOVED***;

  it('should get the current user ID', function (){
    assert(userID === api.getCurrentUserID());
***REMOVED***;

  it('should send text message object (user)', function (done){
    var body = "text-msg-obj-" + Date.now();
    listen(done, function (msg) {
      return msg.type === 'message' && msg.body === body;
  ***REMOVED***;
    api.sendMessage({body: body}, userID, checkErr(done));
***REMOVED***;

  it('should send sticker message object (user)', function (done){
    var stickerID = '767334526626290';
    listen(done, function (msg) {
      return msg.type === 'message' &&
        msg.attachments.length > 0 &&
        msg.attachments[0].type === 'sticker' &&
        msg.attachments[0].stickerID === stickerID;
  ***REMOVED***;
    api.sendMessage({sticker: stickerID}, userID, checkErr(done));
***REMOVED***;

  it('should send basic string (user)', function (done){
    var body = "basic-str-" + Date.now();
    listen(done, function (msg) {
      return (msg.type === 'message' && msg.body === body);
  ***REMOVED***;
    api.sendMessage(body, userID, checkErr(done));
***REMOVED***;

  it('should get the history of the chat (user)', function (done) {
    api.getThreadHistory(userID, 0, 5, Date.now(), function(err, data) {
      checkErr(done)(err);
      assert(getType(data) === "Array");
      assert(data.every(function(v) {return getType(v) == "Object";***REMOVED***);
      done();
  ***REMOVED***;
***REMOVED***;

  it('should create a chat', function (done){
    var body = "new-chat-" + Date.now();
    listen(done, function (msg) {
      return msg.type === 'message' && msg.body === body;
  ***REMOVED***;
    api.sendMessage(body, userIDs, function(err, info){
      checkErr(done)(err);
      groupChatID = info.threadID;
  ***REMOVED***;
***REMOVED***;

  it('should send text message object (group)', function (done){
    var body = "text-msg-obj-" + Date.now();
    listen(done, function (msg) {
      return msg.type === 'message' && msg.body === body;
  ***REMOVED***;
    api.sendMessage({body: body}, groupChatID, function(err, info){
      checkErr(done)(err);
      assert(groupChatID === info.threadID);
  ***REMOVED***;
***REMOVED***;

  it('should send basic string (group)', function (done){
    var body = "basic-str-" + Date.now();
    listen(done, function (msg) {
      return msg.type === 'message' && msg.body === body;
  ***REMOVED***;
    api.sendMessage(body, groupChatID, function(err, info) {
      checkErr(done)(err);
      assert(groupChatID === info.threadID);
  ***REMOVED***;
***REMOVED***;

  it('should send sticker message object (group)', function (done){
    var stickerID = '767334526626290';
    listen(done, function (msg) {
      return msg.type === 'message' &&
        msg.attachments.length > 0 &&
        msg.attachments[0].type === 'sticker' &&
        msg.attachments[0].stickerID === stickerID;
  ***REMOVED***;
    api.sendMessage({sticker: stickerID}, groupChatID, function (err, info) {
      assert(groupChatID === info.threadID);
      checkErr(done)(err);
  ***REMOVED***;
***REMOVED***;

  it('should send an attachment with a body (group)', function (done){
    var body = "attach-" + Date.now();
    var attach = [];
    attach.push(fs.createReadStream("test/data/test.txt"));
    attach.push(fs.createReadStream("test/data/test.png"));
    listen(done, function (msg) {
      return msg.type === 'message' && msg.body === body;
  ***REMOVED***;
    api.sendMessage({attachment: attach, body: body}, groupChatID, function(err, info){
      checkErr(done)(err);
      assert(groupChatID === info.threadID);
  ***REMOVED***;
***REMOVED***;

  it('should get the history of the chat (group)', function (done) {
    api.getThreadHistory(groupChatID, 0, 5, Date.now(), function(err, data) {
      checkErr(done)(err);
      assert(getType(data) === "Array");
      assert(data.every(function(v) {return getType(v) == "Object";***REMOVED***);
      done();
  ***REMOVED***;
***REMOVED***;


  it('should change chat title', function (done){
    var title = 'test-chat-title-' + Date.now();
    listen(done, function (msg) {
      return msg.type === 'event' &&
        msg.logMessageType === 'log:thread-name' &&
        msg.logMessageData.name === title;
  ***REMOVED***;
    groupChatName = title;
    api.setTitle(title, groupChatID, checkErr(done));
***REMOVED***;

  it('should kick user', function (done){
    var id = userIDs[0];
    listen(done, function (msg) {
      return msg.type === 'event' &&
        msg.logMessageType === 'log:unsubscribe' &&
        msg.logMessageData.removed_participants.indexOf('fbid:' + id) > -1;
  ***REMOVED***;
    api.removeUserFromGroup(id, groupChatID, checkErr(done));
***REMOVED***;

  it('should add user', function (done){
    var id = userIDs[0];
    listen(done, function (msg) {
      return (msg.type === 'event' &&
        msg.logMessageType === 'log:subscribe' &&
        msg.logMessageData.added_participants.indexOf('fbid:'+id) > -1);
  ***REMOVED***;
    api.addUserToGroup(id, groupChatID, checkErr(done));
***REMOVED***;

  it('should retrieve a list of threads', function (done) {
    api.getThreadList(0, 20, function(err, res) {
      checkErr(done)(err);
      // This checks to see if the group chat we just made
      // is in the list... it should be.
      assert(res.some(function (v) {
        return (
          v.threadFbid === groupChatID &&
          userIDs.every(function (val) {
            return v.participants.indexOf(val) > -1;
        ***REMOVED*** &&
          v.name === groupChatName
        );
    ***REMOVED***);
      done();
  ***REMOVED***;
***REMOVED***;

  it('should mark as read', function (done){
    api.markAsRead(groupChatID, done);
***REMOVED***;

  it('should send typing indicator', function (done) {
    var stopType = api.sendTypingIndicator(groupChatID, function(err) {
      checkErr(done)(err);
      stopType();
      done();
  ***REMOVED***;
***REMOVED***;

  it('should get a list of online users', function (done){
    api.getOnlineUsers(function(err, res) {
      checkErr(done)(err);
      assert(getType(res) === "Array");
      res.map(function(v) {
        assert(v.timestamp);
        assert(v.userID);
        assert(v.statuses);
        assert(v.statuses.status);
        assert(v.statuses.webStatus);
        assert(v.statuses.fbAppStatus);
        assert(v.statuses.messengerStatus);
        assert(v.statuses.otherStatus);
    ***REMOVED***;
      done();
  ***REMOVED***;
***REMOVED***;


  it('should get the right user info', function (done) {
    api.getUserInfo(userID, function(err, data) {
      checkErr(done)(err);
      var user = data[userID];
      assert(user.name);
      assert(user.firstName);
      assert(user.vanity !== null);
      assert(user.profileUrl);
      assert(user.gender);
      assert(user.type);
      assert(!user.isFriend);
      done();
  ***REMOVED***;
***REMOVED***;

  it('should get the user ID', function(done) {
    api.getUserInfo(userID, function(err, data) {
      checkErr(done)(err);
      var user = data[userID];
      api.getUserID(user.name, function(err, data) {
        checkErr(done)(err);
        assert(getType(data) === "Array");
        assert(data.some(function(val) {
          return val.userID === userID;
      ***REMOVED***);
        done();
    ***REMOVED***;
  ***REMOVED***;
***REMOVED***;

  it('should get the list of friends', function (done) {
    api.getFriendsList(userID, function(err, data) {
      checkErr(done)(err);
      assert(getType(data) === "Array");
      assert(data.every(function(v) {return !isNaN(v);***REMOVED***);
      done();
  ***REMOVED***;
***REMOVED***;

  it('should log out', function (done) {
    api.logout(done);
***REMOVED***;

  after(function (){
    if (stopListening) stopListening();
***REMOVED***;
***REMOVED***;
