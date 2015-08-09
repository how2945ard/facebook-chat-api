"use strict";

var utils = require("../utils");
var log = require("npmlog");

function formatData(data) {
  return {
    threadID: data.thread_id,
    threadFbid: data.thread_fbid,
    participants: data.participants.map(function(v) { return v.replace('fbid:', ''); ***REMOVED***,
    formerParticipants: data.former_participants,
    name: data.name,
    snippet: data.snippet,
    snippetHasAttachment: data.snippet_has_attachment,
    snippetAttachments: data.snippet_attachments,
    snippetSender: data.snippet_sender.replace('fbid:', ''),
    unreadCount: data.unread_count,
    messageCount: data.message_count,
    imageSrc: data.image_src,
    timestamp: data.timestamp,
    serverTimestamp: data.server_timestamp, // what is this?
    muteSettings: data.muteSettings,
    isCanonicalUser: data.is_canonical_user,
    isCanonical: data.is_canonical,
    canonicalFbid: data.canonical_fbid,
    isSubscribed: data.is_subscribed,
    rootMessageThreadingID: data.root_message_threading_id,
    folder: data.folder,
    isArchived: data.is_archived,
    recipientsLoadable: data.recipients_loadable,
    hasEmailParticipant: data.has_email_participant,
    readOnly: data.read_only,
    canReply: data.can_reply,
    composerEnabled: data.composer_enabled,
    blockedParticipants: data.blocked_participants,
    lastMessageID: data.last_message_id
  };
}

module.exports = function(defaultFuncs, api, ctx) {
  return function searchForThread(name, callback) {
    var tmpForm = {
      client: 'web_messenger',
      query: name,
      offset: 0,
      limit: 1,
      index: 'fbid',
    };

    defaultFuncs.post('https://www.facebook.com/ajax/mercury/search_threads.php', ctx.jar, tmpForm)
    .then(utils.parseResponse)
    .then(function(resData) {
      if (resData.error) return globalCallback(resData);

      return callback(null, formatData(resData.payload.mercury_payload.threads[0]));
  ***REMOVED***;
  }
}
