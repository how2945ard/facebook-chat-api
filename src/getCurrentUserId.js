/*jslint node: true */
"use strict";

module.exports = function(mergeWithDefaults, api, ctx) {
  return function getCurentUserId(callback) {
    return ctx.userId;
  };
};
