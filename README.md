# Facebook Chat API
The Official Facebook Chat API uses XMPP and is deprecated as of April 30th 2015. This is a non-official API that doesn't use XMPP.
As of right now, the only way to automate the chat functionalities is to emulate the browser. This means doing the exact same GET/POST requests and tricking Facebook into thinking we're accessing the website normally. Because we're doing it this way, this API won't work with an auth token but requires the credentials of a Facebook account.

_Side note_: if you want a larger example you should head over to [Marc Zuckerbot](https://github.com/bsansouci/marc-zuckerbot)

## Install
```bash
npm install facebook-chat-api
```

## Example Usage
```javascript
var login = require("facebook-chat-api");

// Create simple echo bot
login({email: "FB_EMAIL", password: "FB_PASSWORD"}, function callback (err, api) {
    if(err) return console.error(err);
    
    api.listen(function callback(err, message) {
        api.sendMessage(message.body, message.thread_id);
  ***REMOVED***;
***REMOVED***;


```

## Documentation
* [`login`](#login)
* [`api.listen`](#listen)
* [`api.setOptions`](#setOptions)
* [`api.getUserId`](#getUserId)
* [`api.getCurrentUserId`](#getCurrentUserId)
* [`api.sendMessage`](#sendMessage)
* [`api.markAsRead`](#markAsRead)
* [`api.setTitle`](#setTitle)
* [`api.getUserInfo`](#getUserInfo)
* [`api.getFriendsList`](#getFriendsList)
* [`api.getThreadList`](#getThreadList)
* [`api.addUserToGroup`](#addUserToGroup)
* [`api.removeUserFromGroup`](#removeUserFromGroup)
* [`api.sendTypingIndicator`](#sendTypingIndicator)
* [`api.getOnlineUsers`](#getOnlineUsers)

---------------------------------------

<a name="login" />
### login(emailAndPassword, [options], callback)

This function is returned by require(...) and is the main entry point to the API. 

Logs into facebook given the right credentials.

If it succeeds, callback will be called with a null object (for potential errors) and with an object containing all the available functions.

If it fails, callback will be called with an error object.

__Arguments__

* `emailAndPassword` - An object containing the fields `email` and `password` used to login.
* `options` - An object representing options to use when logging in (as described in [api.setOptions](#setOptions)).
* `callback(err, api)` - A callback called when login is done (successful or not). `err` is an object containing a field `error`.

__Example__

```js
login({email: "FB_EMAIL", password: "FB_PASSWORD"}, function callback (err, api) {
    if(err) return console.error(err);
    // Here you can use the api
***REMOVED***;
```


__Login Approvals (2-Factor Auth)__: When you try to login with Login Approvals enabled, your callback will be called with an error `'login-approval'` that has a `continue` function that accepts the approval code as a `string` or a `number`.

__Example__:

```js
var readline = require("readline");
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
***REMOVED***;

login(obj, function(err, api) {
  if(err) {
    switch (err.error) {
      case 'login-approval':
        console.log('Enter code > ');
        rl.on('line', function(line){
          err.continue(line);
          rl.close();
      ***REMOVED***;
        break;
    }
    return;
  }
  
  // Logged in!
}
```

__Review Recent Login__: Sometimes Facebook will ask you to review your recent logins. This means you've recently logged in from a unrecognized location. This will will result in the callback being called with an error `'review-recent-login'` by default. If you wish to automatically approve all recent logins, you can set the option `forceLogin` to `true` in the `loginOptions`.


---------------------------------------

<a name="listen" />
### api.listen(callback)

Will call callback when a new message it received on this account. 
By default this won't receive events (joining/leaving a chat, title change etc...) but it can be activated with `api.setOptions({listenEvents: true***REMOVED***`.

__Arguments__

- `callback(error, message, stopListening)` - A callback called every time the logged-in account receives a new message. `stopListening` is a function that will stop the `listen` loop and is guaranteed to prevent any future calls to the callback given to `listen`. An immediate call to `stopListening` when an error occurs will prevent the listen function to continue. 

__Message__

If `type` is `message`, the object will contain the following fields:

  + `sender_name` - First and last name of the person who just sent the message.
  + `sender_id` - The id of the person who sent the message in the chat with thread_id.
  + `participant_ids` - An array containing the ids of everyone in the thread (sender included).
  + `participant_names` - An array containing only the first names of the other participants in the thread (sender included).
  + `body` - The string corresponding to the message that was just received.
  + `thread_id` - The thread_id representing the thread in which the message was sent.
  + `coordinates` - An object containing `latitude`, `longitude`, and `accuracy`.
  + `type` - The string `"message"`, `"sticker"`, `"file"`, `"photo"`, `"animated_image"`, or `"event"` (if applicable, see below).

If `type` is `"sticker"` there will be a `sticker_id` and `sticker_url` field instead of `body`.

If `type` is `file` there will be a `name` and a `file_url` instead of `body`.

If `type` is `photo` there will be `name`,`hires_url`, `thumbnail_url`, and `preview_url` instead of `body`.

If `type` is `animated_image` there will be `name`, `url`, and `preview_url`  instead of `body`.

If enabled through [setOptions](#setOptions), this will also handle events. In this case, `message` will be either a message (see above) or an event object with the following fields
- `type` - The string `"event"`
- `thread_id` - The thread_id representing the thread in which the message was sent.
- `log_message_type` - String representing the type of event (`"log:thread-name"`, `"log:unsubscribe"`, `"log:subscribe"`, ...)
- `log_message_data` - Data relevant to the event.
- `log_message_body` - String printed in the chat.
- `author` - The person who performed the event.

If enabled through [setOptions](#setOptions), this will also return presence, (`type` will be `"presence"`), which is the online status of the user's friends. The object given to the callback will have the following fields
- `timestamp` - how old the information is
- `userId` - the id of the user whose status this packet is describing
- `statuses` - An object will the following fields: `fbAppStatus`, `messengerStatus`, `otherStatus`, `status` and `webStatus`. All those can contain either of the following values: `"active"`, `"idle"`, `"offline"`.

__Example__

```js
// Simple echo bot. He'll repeat anything that you say.
// Will stop when you say '/stop'

login({email: "FB_EMAIL", password: "FB_PASSWORD"}, function callback (err, api) {
    if(err) return console.error(err);

    api.setOptions({listenEvents: true***REMOVED***;

    api.listen(function(err, event, stopListening) {
        if(err) return console.error(err);

        switch(event.type) {
          case "message":
            if(event.body === '/stop') {
              api.sendMessage("Goodbye...", event.thread_id);
              return stopListening();
            }
            api.markAsRead(event.thread_id, function(err) {
              if(err) console.log(err);
          ***REMOVED***;
            api.sendMessage("TEST BOT: " + event.body, event.thread_id);
            break;
          case "event":
        ***REMOVED***;
            break;
        }
  ***REMOVED***;
***REMOVED***;
```

---------------------------------------

<a name="setOptions" />
### api.setOptions(options)

Sets various configurable options for the api.

__Arguments__

* `options` - An object containing the new values for the options that you want
  to set.  If the value for an option is unspecified, it is unchanged. The following options are possible.
    - `logLevel` - The desired logging level as determined by npmlog.  Choose
      from either `"silly"`, `"verbose"`, `"info"`, `"http"`, `"warn"`, `"error"`, or `"silent"`.
    - `selfListen` - (Default `false`) Set this to `true` if you want your api
      to receive messages from its own account.  This is to be used with
      caution, as it can result in loops (a simple echo bot will send messages
      forever).
    - `listenEvents` - (Default `false`) Will make [api.listen](#listen) also handle events (look at api.listen for more details).
    - `pageId` - (Default empty) Makes [api.listen](#listen) only receive messages through the page specified by that ID. Also makes sendMessage and sendSticker send from the page.
    - `updatePresence` - (Default `false`) Will make [api.listen](#listen) also return `presence` (look at api.listen for more details).
    - `forceLogin` - (Default `false`) Will automatically approve of any recent logins and continue with the login process.

__Example__

```js
// Simple echo bot. This will send messages forever.

login({email: "FB_EMAIL", password: "FB_PASSWORD"}, function callback (err, api) {
    if(err) return console.error(err);
    
    api.setOptions({
      selfListen: true,
      logLevel: "silent"
  ***REMOVED***;

    api.listen(function(err, message, stopListening){
        if(err) return console.error(err);

        api.sendMessage(message.body, message.thread_id);
  ***REMOVED***;
***REMOVED***;
```

---------------------------------------

<a name="getUserId" />
### api.getUserId(name, callback)

Given a person's full name will do a Facebook Graph search and return all the ids ordered by however Facebook wants to order them.

__Arguments__

* `name` - A string being the name of the person you're looking for.
* `callback(err, obj)` - A callback called when the search is done (either with an error or with the resulting object). `obj` is an array which contains all of the users that facebook graph search found, ordered by "importance".

__Example__

```js
login({email: "FB_EMAIL", password: "FB_PASSWORD"}, function callback (err, api) {
    if(err) return console.error(err);
    
    api.getUserId("Marc Zuckerbot", function(err, data) {
        if(err) return callback(err);
        
        // Send the message to the best match (best by Facebook's criteria)
        var thread_id = data[0].uid;
        api.sendMessage(msg, thread_id);
  ***REMOVED***;
***REMOVED***;
```

---------------------------------------

<a name="getCurrentUserId" />
### api.getCurrentUserId()

Returns the currently logged-in user's Facebook user ID.

---------------------------------------

<a name="sendMessage" />
### api.sendMessage(message, thread_id, [callback])

Sends the given message to the thread_id.

__Arguments__

* `message` - A string (for backward compatibility) or a message object as described below.
* `thread_id` - A string or number representing a thread. It happens to be someone's userId in the case of a one to one conversation. 
* `callback(err, obj)` - A callback called when sending the message is done (either with an error or with an confirmation object). `obj` contains only the thread_id where the message was sent.

*Message Object*: Various types of message can be sent:
* Regular - Set a field `body` to the desired message.
* Sticker - Set a field `sticker` to the desired sticker ID.
* File/Image - Set field `attachment` to a readable stream or an array of readable streams.

__Tip__: to find your own ID, go to your own profile on Facebook and replace 'www' by 'graph' in the URL.

__Example (Basic Message)__
```js
login({email: "FB_EMAIL", password: "FB_PASSWORD"}, function callback (err, api) {
    if(err) return console.error(err);
    
    var yourID = 0000000000000;
    var msg = {body: "Hey!"};
    api.sendMessage(msg, yourID);
***REMOVED***;
```

__Example (File upload)__
```js
login({email: "FB_EMAIL", password: "FB_PASSWORD"}, function callback (err, api) {
    if(err) return console.error(err);
    
    // Note this example uploads an image called image.jpg 
    var yourID = 0000000000000;
    var msg = {
      body: "Hey!",
      attachment: fs.createReadStream(__dirname + '/image.jpg')
    }
    api.sendMessage(msg, yourID);
***REMOVED***;
```

---------------------------------------

<a name="markAsRead" />
### api.markAsRead(thread\_id, callback)

Given a thread_id will mark all the unread messages as read. Facebook will take a couple of seconds to show that you've read the messages.

__Arguments__

* `thread_id` - The id of the thread in which you want to mark the messages as read.
* `callback(err)` - A callback called when the operation is done maybe with an object representing an error.

__Example__

```js
var login = require("facebook-chat-api");

login({email: "FB_EMAIL", password: "FB_PASSWORD"}, function callback (err, api) {
    if(err) return console.error(err);
  
    api.listen(function callback(err, message) {
        // Marks message as read immediately after they're sent
        api.markAsRead(message.thread_id);
  ***REMOVED***;
***REMOVED***;
```

---------------------------------------

<a name="setTitle" />
### api.setTitle(newTitle, thread_id, [callback])

Sets the title of the group chat with thread id thread_id to newTitle.

Note: This will not work if the thread id corresponds to a single-user chat or
if the bot is not in the group chat.

__Arguments__

* `newTitle` - A string representing the new title.
* `thread_id` - A string or number representing a thread. It happens to be someone's userId in the case of a one to one conversation. 
* `callback(err, obj)` - A callback called when sending the message is done (either with an error or with an confirmation object). `obj` contains only the thread_id where the message was sent.

---------------------------------------

<a name="getUserInfo" />
### api.getUserInfo(ids, callback)

Will get some information about the given users.

__Arguments__

* `ids` - Either a string/number for one ID or an array of strings/numbers for a batched query.
* `callback(err, obj)` - A callback called when the query is done (either with an error or with an confirmation object). `obj` is a mapping from userId to another object containing the following properties: id, name, firstName, vanity, thumbSrc, uri, gender, type, is_friend, is_birthday, searchTokens, alternateName.

__Example__

```js
login({email: "FB_EMAIL", password: "FB_PASSWORD"}, function callback (err, api) {
    if(err) return console.error(err);
    
    api.getUserInfo([1, 2, 3, 4], function(err, ret) {
      if(err) return console.error(err);

      for(var prop in ret) {
        if(ret.hasOwnProperty(prop) && ret[prop].is_birthday) {
          api.sendMessage("Happy birthday :)", prop);
        }
      }
  ***REMOVED***;
***REMOVED***;
```

---------------------------------------

<a name="getFriendsList" />
### api.getFriendsList(id, callback)

__Warning__: this function takes a longer time than others to answer because it pulls the friends in batches of 20 (blindly following how the UI pulls the friends list). It might take a couple seconds if you have >1000 friends.

__Warning 2__: this will only work if you're friends with the person or if the person didn't set their friends list as being private information.

Given the id of a person, will return an array of ids of all its friends.

__Arguments__

* `id` - The id of a person.
* `callback(err, arr)` - A callback called when the query is done (either with an error or with an confirmation object). `arr` is an array containing all the ids of the person's friends. You can get more information about those people by then calling getUserInfo with the array (this will return faster because it'll be done in one request).

__Example__

```js
login({email: "FB_EMAIL", password: "FB_PASSWORD"}, function callback (err, api) {
  if(err) return console.error(err);
  
  api.getFriendsList(1216678154, function(err, data) {
    if(err) return console.error(err);

    console.log(data.length);
***REMOVED***;
***REMOVED***;
```

---------------------------------------

<a name="getThreadList" />
### api.getThreadList(start, end, callback)

Will return information about threads.

__Arguments__

* `start` - Start index in the list of recently used threads.
* `end` - End index.
* `callback(err, arr)` - A callback called when the query is done (either with an error or with an confirmation object). `arr` is an array of thread object containing the following properties: thread_id, thread_fbid, other_user_fbid, last_action_id, participants, former_participants, name, snippet, snippet_has_attachment, is_forwarded_snippet, snippet_attachments, snippet_sender, unread_count, message_count, image_src, timestamp_absolute, timestamp_datetime, timestamp_relative, timestamp_time_passed, timestamp, server_timestamp, mute_settings, is_canonical_user, is_canonical, canonical_fbid, is_subscribed, root_message_threading_id, folder, is_archived, mode, recipients_loadable, name_conversation_sheet_dismissed, has_email_participant, read_only.

---------------------------------------

<a name="addUserToGroup" />
### api.addUserToGroup(user\_id, thread\_id, [callback])

Adds a user (or array of users) to a group chat.

__Arguments__

* `user_id` - User ID or array of user IDs.
* `thread_id` - Group chat ID.
* `callback(err)` - A callback called when the query is done (either with an error or with no arguments).

---------------------------------------

<a name="removeUserFromGroup" />
### api.removeUserFromGroup(user\_id, thread\_id, [callback])

Removes a user from a group chat.

__Arguments__

* `user_id` - User ID.
* `thread_id` - Group chat ID.
* `callback(err)` - A callback called when the query is done (either with an error or with no arguments).

---------------------------------------

<a name="sendTypingIndicator" />
### api.sendTypingIndicator(thread\_id, [callback])

Sends a "USERNAME is typing" indicator to other members of the thread indicated by thread\_id.  This indication will disappear after 30 second or when the `end` function is called.

__Arguments__

* `thread_id` - Group chat ID.
* `callback(err, end)` - A callback called when the query is done (either with an error or with null followed by a function `end` described above).

---------------------------------------

<a name="getOnlineUsers" />
### api.getOnlineUsers([callback])

Will call the callback with a list of the online users.

__Arguments__

* `callback(err, arr)` - A callback called when the query is done (either with an error or with null followed by an array `arr`). `arr`
is an array of objects with the following keys: `timestamp`, `userID` and `statuses`. `statuses` looks like:
```js
{
  status: 'idle',
  webStatus: 'idle',
  fbAppStatus: 'offline',
  messengerStatus: 'offline',
  otherStatus: 'offline'
}
```

Look at [listen](#listen) for details on how to get updated presence.
