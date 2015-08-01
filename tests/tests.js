var login = require('../index.js');
var fs = require('fs');
var assert = require('assert');

var conf = JSON.parse(fs.readFileSync('tests/test-config.json', 'utf8'));
var credentials = {email: conf.email, password: conf.password};
var groupChatID = conf.groupChatID;
var otherID = conf.otherID;

var options = {logLevel: 'silent', selfListen: true, listenEvents: true};
var pageOptions = {logLevel: 'silent', pageID: conf.pageID};
var getType = require('../utils').getType;

var userID = 0;

function checkError(done){
  return function(err) {
    if (err) done(err);
  };
}

// Approach: object {test-name: null|compare fn|true}
// Init all tests to null
// Create a listen that tries to find an appropriate compare obj and set it to true and call `done`.
// In the `it`, set the compare obj.
describe('Login:', function() {
  var api = null;
  var tests = {};
  var dones = {};
  var stopListening;
  this.timeout(15000);

  before(function(done) {
    login(credentials, options, function (err, localAPI) {
      checkError(done)(err);
      assert(localAPI);
      api = localAPI;
      userID = api.getCurrentUserID();
      stopListening = api.listen(function (err, msg) {
        Object.keys(tests).map(function(key) {
          if (getType(tests[key]) === 'Function' && tests[key](msg)){
            delete tests[key];
            dones[key]();
            delete dones[key];
          }
      ***REMOVED***;
    ***REMOVED***;

      done();
  ***REMOVED***;
***REMOVED***;

  it('Login without error', function (done){
   if (api) done();
***REMOVED***;


  it('Text message object (user)', function (done){
    var time = Date.now();
    dones[time] = done;
    tests[time] = function (msg) {
      return (msg.type === 'message' && msg.body === 'test' + time);
    };
    api.sendMessage({body: 'test'+time}, userID, checkError(done));
***REMOVED***;

  it('Sticker message object (user)', function (done){
    var stickerID = '767334526626290';
    var time = Date.now();
    dones[time] = done;
    tests[time] = function (msg) {
      return (msg.type === 'sticker' && msg.stickerID == stickerID);
    };
    api.sendMessage({sticker: stickerID}, userID, checkError(done));
***REMOVED***;

  it('Basic string (user)', function (done){
    var time = Date.now();
    dones[time] = done;
    tests[time] = function (msg) {
      return (msg.type === 'message' && msg.body === 'test' + time);
    };
    api.sendMessage('test'+time, userID, checkError(done));
***REMOVED***;

  it('Text message object (group)', function (done){
    var time = Date.now();
    dones[time] = done;
    tests[time] = function (msg) {
      return (msg.type === 'message' && msg.body === 'test' + time);
    };
    api.sendMessage({body: 'test'+time}, groupChatID, checkError(done));
***REMOVED***;

  it('Sticker message object (group)', function (done){
    var stickerID = '767334526626290';
    var time = Date.now();
    dones[time] = done;
    tests[time] = function (msg) {
      return (msg.type === 'sticker' && msg.stickerID == stickerID);
    };
    api.sendMessage({sticker: stickerID}, groupChatID, checkError(done));
***REMOVED***;

  it('Basic string (group)', function (done){
    var time = Date.now();
    dones[time] = done;
    tests[time] = function (msg) {
      return (msg.type === 'message' && msg.body === 'test' + time);
    };
    api.sendMessage('test'+time, groupChatID, checkError(done));
***REMOVED***;

  it('Change chat title', function (done){
    var time = Date.now();
    dones[time] = done;
    tests[time] = function (msg) {
      return (msg.type === 'event' &&
        msg.logMessageType === 'log:thread-name' &&
        msg.logMessageData.name === 'test chat ' + time);
    };
    api.setTitle('test chat '+time, groupChatID, checkError(done));
***REMOVED***;

  it('Kick user', function (done){
    var time = Date.now();
    dones[time] = done;
    tests[time] = function (msg) {
      return (msg.type === 'event' &&
        msg.logMessageType === 'log:unsubscribe' &&
        msg.logMessageData.
          removed_participants.indexOf('fbid:'+otherID) > -1);
    };
    api.removeUserFromGroup(otherID, groupChatID, checkError(done));
***REMOVED***;

  it('Add user', function (done){
    var time = Date.now();
    dones[time] = done;
    tests[time] = function (msg) {
      return (msg.type === 'event' &&
        msg.logMessageType === 'log:subscribe' &&
        msg.logMessageData.
          added_participants.indexOf('fbid:'+otherID) > -1);
    };
    api.addUserToGroup(otherID, groupChatID, checkError(done));
***REMOVED***;

  it('Mark as read', function (done){
    api.markAsRead(groupChatID, done);
***REMOVED***;

  it('Send typing indicator', function (done) {
    var stopType = api.sendTypingIndicator(groupChatID, function(err) {
      if(err) return done(err);

      stopType();
      done();
  ***REMOVED***;
***REMOVED***;

  after(function (){
    if (stopListening) stopListening();
***REMOVED***;
***REMOVED***;
