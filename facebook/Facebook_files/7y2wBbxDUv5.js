/*!CK:2235497010!*/
/*1424145592,*/
if (self.CavalryLogger) {
  CavalryLogger.start_js(["lpMbT"]);
}

__d("MessagingRealtimeConstants", [], function(a, b, c, d, e, f) {
  e.exports = {
    VIEWER_FBID: "realtime_viewer_fbid"
  };
}, null);

__d("ChannelSubdomain", ["Event", "JSLogger", "Run", "setTimeoutAcrossTransitions", "LogHistory", "WebStorage"], function(a, b, c, d, e, f, g, h, i, j) {
  var k = b('LogHistory').getInstance('channel'),
    l = b('WebStorage').getLocalStorage(),
    m = h.create('channel'),
    n = 'channel_sub:',
    o = 7,
    p = 100 * 1000,
    q = null,
    r;

  function s() {
    if (r) {
      clearTimeout(r);
      r = null;
    }
    if (l && q != null) l.removeItem(n + q);
    q = null;
  }

  function t(u, v, w) {
    var x = (u - 1) * o;
    if (w) {
      if (r) clearTimeout(r);
      q = r = null;
    }
    if (v == null) v = Math.floor(Math.random() * x);
    if (q == null)
      if (l) {
        var y = [];
        for (var z = 0; z < l.length; z++) {
          var aa = l.key(z);
          if (aa.indexOf(n) === 0) {
            var ba = parseInt(aa.substr(n.length), 10);
            y[ba] = parseInt(l.getItem(aa), 10);
          }
        }
        var ca = Date.now() - p;
        for (z = 0; z < x; z++) {
          var da = (z + v) % x;
          if (!y[da] || y[da] < ca) {
            q = da;
            break;
          }
        }
        if (q != null) {
          var ea = function() {
            try {
              l.setItem(n + q, Date.now());
            } catch (fa) {
              k.warn('subdomain set failed', fa.message);
            }
            r = j(ea, p / 2);
          };
          ea();
        } else {
          k.warn('no channel subdomain', y);
          m.error('subdomain_overflow');
        }
        if (typeof window.onpageshow != 'undefined') {
          g.listen(window, 'pagehide', s);
        } else i.onUnload(s);
      } else q = v;
    return q == null ? null : q % o;
  }
  e.exports = {
    allocate: t,
    clear: s
  };
}, null);

__d("DocRPC", ["ErrorUtils"], function(a, b, c, d, e, f, g) {
  var h = {
    _apis: {},
    _dispatch: function(i) {
      var j;
      try {
        i = JSON.parse(i);
      } catch (k) {
        throw new Error('DocRPC unparsable dispatch: "' + i + '"');
      }
      if (h._apis.hasOwnProperty(i.api)) {
        var l = h._apis[i.api];
        if (l[i.method]) j = g.applyWithGuard(l[i.method], l, i.args);
      }
      if (j === (void 0)) j = null;
      return JSON.stringify(j);
    },
    publish: function(i, j) {
      h._apis[j] = i;
    },
    proxy: function(i, j, k) {
      var l = {};
      k.forEach(function(m) {
        l[m] = function() {
          var n = {
              api: j,
              method: m,
              args: Array.prototype.slice.call(arguments)
            },
            o;
          try {
            if (i.closed) throw new Error('DocRPC window closed');
            o = i.DocRPC._dispatch(JSON.stringify(n));
          } catch (p) {
            g.reportError(p);
            return;
          }
          if (typeof(o) == 'string') try {
            o = JSON.parse(o);
          } catch (p) {
            throw new Error('DocRPC ' + j + '.' + m + ' unparsable return: "' + o + '"');
          }
          return o;
        };
    ***REMOVED***;
      return l;
    }
  };
  e.exports = a.DocRPC = h;
}, null);

__d("ChannelTransport", ["copyProperties", "bind", "AjaxRequest", "URI", "JSLogger", "DocRPC", "ChannelConstants", "setTimeoutAcrossTransitions"], function(a, b, c, d, e, f, g, h, i, j, k, l, m, n) {
  var o = k.create('channel');

  function p() {
    return (1048576 * Math.random() | 0).toString(36);
  }

  function q(z, aa) {
    var ba = z.subdomain;
    ba = ba === null ? '' : (ba + '-');
    var ca = new j(aa).setDomain(ba + z.host + '.facebook.com').setPort(z.port).setSecure(j().isSecure());
    return ca;
  }

  function r(z) {
    var aa = {
      partition: z.partition,
      cb: p()
    };
    if (z.sticky_token) aa.sticky_token = z.sticky_token;
    var ba = q(z, '/p').setQueryData(aa);
    o.log('start_p', {
      uri: ba.toString()
  ***REMOVED***;
    var ca = new i('GET', ba);
    if (i.supportsCORS()) ca.xhr.withCredentials = true;
    var da = function(ea) {
      o.log('finish_p', {
        xhr: ea.toJSON ? ea.toJSON() : ea
    ***REMOVED***;
    };
    ca.timeout = z.P_TIMEOUT;
    ca.onError = ca.onSuccess = da;
    ca.send();
  }

  function s(z, aa, ba) {
    var ca = new Image(),
      da = 0,
      ea = function(ha) {
        ca.abort();
        return ha ? aa() : ba();
      };
    ca.onload = function() {
      o.log('ping_ok', {
        duration: Date.now() - da
    ***REMOVED***;
      ea(true);
    };
    ca.onerror = function() {
      r(z);
      ea(false);
    };
    var fa = n(ca.onerror, 10000);
    ca.abort = function() {
      if (fa) {
        clearTimeout(fa);
        fa = null;
      }
      ca.onload = ca.onerror = null;
    };
    var ga = {
      partition: z.partition,
      cb: p()
    };
    if (z.sticky_token) ga.sticky_token = z.sticky_token;
    if (z.sticky_pool) ga.sticky_pool = z.sticky_pool;
    if (z.lastRequestErrorReason) {
      ga.reason = z.lastRequestErrorReason;
      z.lastRequestErrorReason = null;
    }
    if (z.uid && z.viewerUid) {
      ga.uid = z.uid;
      ga.viewer_uid = z.viewerUid;
    }
    if (z.watchdog && z.watchdog.enabled) ga.wtc = z.watchdog.doSerialize();
    da = Date.now();
    ca.src = q(z, '/ping').setQueryData(ga);
    return ca;
  }

  function t(z) {
    var aa = {
      channel: z.user_channel,
      partition: z.partition,
      clientid: z.sessionID,
      cb: p(),
      cap: 0,
      uid: z.uid,
      viewer_uid: z.viewerUid
    };

    if (z.sticky_token) aa.sticky_token = z.sticky_token;
    if (z.sticky_pool) aa.sticky_pool = z.sticky_pool;
    if (z.is_offline) {
      if (!!z.send_active_when_offline) {
        aa.state = 'offline';
      } else return;
    } else aa.state = 'active';
    if (aa.state === z.lastPresenceState) return;
    z.lastPresenceState = aa.state;
    if (z.profile) aa.profile = z.profile;
    if (z.capabilities) aa.cap = z.capabilities;
    var ba = q(z, '/active_ping').setQueryData(aa),
      ca = new i('GET', ba);
    if (i.supportsCORS()) ca.xhr.withCredentials = true;
    ca.onError = function(da) {
      o.warn('active_ping_error');
    };
    ca.onSuccess = function(da) {
      o.log('active_ping_ok');
    };
    ca.timeout = z.P_TIMEOUT;
    ca.send();
  }

  function u(z, aa, ba, ca) {
    var da = new Date(),
      ea = -1;
    if (z.userActive > 0) {
      ea = (da - z.userActive) / 1000 | 0;
      if (ea < 0) o.warn('idle_regression', {
        idleTime: ea,
        now: da.getTime(),
        userActive: z.userActive
    ***REMOVED***;
    }
    var fa = {
      channel: z.user_channel,
      seq: z.seq,
      partition: z.partition,
      clientid: z.sessionID,
      cb: p(),
      idle: ea,
      cap: 0
    };
    if (!!z.watchdog && z.watchdog.enabled) fa.wtc = z.watchdog.doSerialize();
    if (z.uid && z.viewerUid) {
      fa.uid = z.uid;
      fa.viewer_uid = z.viewerUid;
    }
    if (z.sticky_token) fa.sticky_token = z.sticky_token;
    if (z.sticky_pool) fa.sticky_pool = z.sticky_pool;
    if ('trace_id' in z) fa.traceid = z.trace_id;
    var ga = !!z.send_active_when_offline;
    if (ga && z.is_offline) {
      fa.state = 'offline';
    } else if (z.userActive > 0 && ea < 60) fa.state = 'active';
    z.lastPresenceState = fa.state;
    if (z.streamingCapable) {
      fa.mode = 'stream';
      fa.format = 'json';
    }
    if (z.profile) fa.profile = z.profile;
    if (z.capabilities) fa.cap = z.capabilities;
    var ha = q(z, '/pull').setQueryData(fa),
      ia = z.fantail_enabled ? 'POST' : 'GET',
      ja = new i(ia, ha);
    if (i.supportsCORS()) ja.xhr.withCredentials = true;
    ja.timeout = z.streamingCapable ? z.STREAMING_TIMEOUT : z.LONGPOLL_TIMEOUT;
    ja.onJSON = aa;
    ja.onSuccess = ba;
    ja.onError = function() {
      var ma = (this.status == 12002 && this._time >= z.MIN_12002_TIMEOUT) || (this.status == 504 && this._time >= z.MIN_504_TIMEOUT),
        na = ma ? ba : ca;
      return na && na.apply(this, arguments);
    };
    if (z.fantail_logs && z.fantail_logs.length > 0) {
      var ka = {};
      for (var la = 0; la < z.fantail_logs.length; la++) g(ka, z.fantail_logs[la]);
      ja.send(ka);
      z.fantail_logs = [];
    } else ja.send();
    z.inStreaming = z.streamingCapable;
    return ja;
  }

  function v(z) {
    this.manager = z;
    (this.init && this.init());
  }

  function w(z) {
    v.apply(this, arguments);
  }
  g(w.prototype, {
    logName: 'CORS',
    enterState: function(z, aa) {
      if (this._request) {
        this._request.abort();
        this._request = null;
      }
      if (z == 'init') n(h(this.manager, 'exitState', {
        status: m.OK,
        stateId: aa.stateId
    ***REMOVED***, 3000);
      if (!/pull|ping/.test(z)) return;
      var ba = this.manager;
      if (z == 'ping') {
        this._request = s(aa, h(ba, 'exitState', {
          status: m.OK,
          stateId: aa.stateId
      ***REMOVED***, h(ba, 'exitState', {
          status: m.ERROR,
          stateId: aa.stateId
      ***REMOVED***);
      } else if (z == 'pull') this._request = u(aa, h(ba, '_processTransportData', aa.stateId), h(ba, 'exitState', {
        status: m.OK,
        stateId: aa.stateId
    ***REMOVED***, h(ba, 'exitState', {
        status: m.ERROR,
        stateId: aa.stateId
    ***REMOVED***);
    }
***REMOVED***;

  function x(z) {
    o.log('iframe_init_constructor');
    v.apply(this, arguments);
    this._iframe = document.createElement('iframe');
    this._iframe.style.display = 'none';
    document.body.appendChild(this._iframe);
    l.publish(this, 'outerTransport');
  }
  g(x.prototype, {
    logName: 'iframe',
    _initIframe: function(z) {
      o.log('iframe_init_start');
      window.onchanneliframeready = function() {
        o.log('iframe_resources');
        return z.resources;
      };
      window.onchanneliframeloaded = function() {
        o.log('iframe_loaded');
      };
      if (z) {
        this._iframeURI = q(z, z.path);
        if (z.resources) {
          var aa = this._iframeURI.getDomain();
          z.resources = z.resources.map(function(da) {
            var ea = j(da);
            if (ea.getPath().startsWith('/intern/rsrc.php') && ea.getQueryData().origin !== (void 0)) return ea.addQueryData('origin', aa).toString();
            return da;
        ***REMOVED***;
        }
        if (z.bustIframe) {
          var ba = {
            partition: z.partition,
            cb: p()
          };
          this._iframeURI.setQueryData(ba);
        }
      } else this._iframeURI = 'about:blank';
      this._iframeProxy = null;
      try {
        this._iframe.contentWindow.location.replace(this._iframeURI);
        o.log('iframe_uri_set');
      } catch (ca) {
        o.error('iframe_uri_set_error', ca);
        this.exitState({
          status: m.ERROR,
          stateId: z.stateId
        }, ca + '');
      }
    },
    enterState: function(z, aa) {
      if (z == 'init') {
        this._initIframe(aa);
      } else if (/idle|ping|pull/.test(z)) {
        if (this._iframeProxy) {
          this._iframeProxy.enterState.apply(this._iframeProxy, arguments);
        } else if (z != 'idle') this.exitState({
          status: m.ERROR,
          stateId: aa.stateId
        }, 'iframe not yet loaded');
      } else if (z == 'shutdown') this._initIframe();
    },
    _processTransportData: function() {
      this.manager._processTransportData.apply(this.manager, arguments);
    },
    exitState: function(z) {
      if (this.manager.state == 'init' && z.status == m.OK) this._iframeProxy = l.proxy(this._iframe.contentWindow, 'innerTransport', ['enterState'], (this._iframeURI + '').replace(/iframe.*/, ''));
      if (/ping|pull/.test(this.manager.state) && !this._iframeProxy) return;
      this.manager.exitState.apply(this.manager, arguments);
    }
***REMOVED***;

  function y() {
    this.init = this.init.bind(this);
    v.apply(this, arguments);
  }
  g(y.prototype, {
    logName: 'iframe(inner)',
    init: function() {
      l.publish(this, 'innerTransport');
      try {
        var aa = l.proxy(window.parent, 'outerTransport', ['_processTransportData', 'exitState'], top.DocRPC.origin);
        g(this, aa);
        this.exitState({
          status: m.OK,
          stateId: 1e+06
      ***REMOVED***;
      } catch (z) {
        o.error('iframe_inner_init_error', z);
      }
    },
    enterState: function(z, aa) {
      if (this._request) {
        this._request.abort();
        this._request = null;
      }
      if (z == 'ping') {
        this._request = s(aa, h(this, 'exitState', {
          status: m.OK,
          stateId: aa.stateId
      ***REMOVED***, h(this, 'exitState', {
          status: m.ERROR,
          stateId: aa.stateId
      ***REMOVED***);
      } else if (z == 'pull') this._request = u(aa, h(this, '_processTransportData', aa.stateId), h(this, 'exitState', {
        status: m.OK,
        stateId: aa.stateId
    ***REMOVED***, h(this, 'exitState', {
        status: m.ERROR,
        stateId: aa.stateId
    ***REMOVED***);
    }
***REMOVED***;
  e.exports = {
    getURI: q,
    Transport: v,
    CORSTransport: w,
    IframeTransport: x,
    IframeInnerTransport: y,
    sendActivePing: t
  };
}, null);

__d("Dcode", [], function(a, b, c, d, e, f) {
  var g, h = {},
    i = {
      _: '%',
      A: '%2',
      B: '000',
      C: '%7d',
      D: '%7b%22',
      E: '%2c%22',
      F: '%22%3a',
      G: '%2c%22ut%22%3a1',
      H: '%2c%22bls%22%3a',
      I: '%2c%22n%22%3a%22%',
      J: '%22%3a%7b%22i%22%3a0%7d',
      K: '%2c%22pt%22%3a0%2c%22vis%22%3a',
      L: '%2c%22ch%22%3a%7b%22h%22%3a%22',
      M: '%7b%22v%22%3a2%2c%22time%22%3a1',
      N: '.channel%22%2c%22sub%22%3a%5b',
      O: '%2c%22sb%22%3a1%2c%22t%22%3a%5b',
      P: '%2c%22ud%22%3a100%2c%22lc%22%3a0',
      Q: '%5d%2c%22f%22%3anull%2c%22uct%22%3a',
      R: '.channel%22%2c%22sub%22%3a%5b1%5d',
      S: '%22%2c%22m%22%3a0%7d%2c%7b%22i%22%3a',
      T: '%2c%22blc%22%3a1%2c%22snd%22%3a1%2c%22ct%22%3a',
      U: '%2c%22blc%22%3a0%2c%22snd%22%3a1%2c%22ct%22%3a',
      V: '%2c%22blc%22%3a0%2c%22snd%22%3a0%2c%22ct%22%3a',
      W: '%2c%22s%22%3a0%2c%22blo%22%3a0%7d%2c%22bl%22%3a%7b%22ac%22%3a',
      X: '%2c%22ri%22%3a0%7d%2c%22state%22%3a%7b%22p%22%3a0%2c%22ut%22%3a1',
      Y: '%2c%22pt%22%3a0%2c%22vis%22%3a1%2c%22bls%22%3a0%2c%22blc%22%3a0%2c%22snd%22%3a1%2c%22ct%22%3a',
      Z: '%2c%22sb%22%3a1%2c%22t%22%3a%5b%5d%2c%22f%22%3anull%2c%22uct%22%3a0%2c%22s%22%3a0%2c%22blo%22%3a0%7d%2c%22bl%22%3a%7b%22ac%22%3a'
    };
  (function() {
    var k = [];
    for (var l in i) {
      h[i[l]] = l;
      k.push(i[l]);
    }
    k.reverse();
    g = new RegExp(k.join("|"), 'g');
***REMOVED***();
  var j = {
    encode: function(k) {
      return encodeURIComponent(k).replace(/([_A-Z])|%../g, function(l, m) {
        return m ? '%' + m.charCodeAt(0).toString(16) : l;
    ***REMOVED***.toLowerCase().replace(g, function(l) {
        return h[l];
    ***REMOVED***;
    },
    decode: function(k) {
      return decodeURIComponent(k.replace(/[_A-Z]/g, function(l) {
        return i[l];
    ***REMOVED***);
    }
  };
  e.exports = j;
}, null);

__d("PresenceCookieManager", ["Cookie", "CurrentUser", "Dcode", "ErrorUtils", "JSLogger", "PresenceInitialData", "PresenceUtil", "URI"], function(a, b, c, d, e, f, g, h, i, j, k, l, m, n) {
  var o = l.cookieVersion,
    p = l.dictEncode,
    q = 'presence',
    r = {},
    s = null,
    t = null,
    u = k.create('presence_cookie');

  function v() {
    try {
      var z = g.get(q);
      if (s !== z) {
        s = z;
        t = null;
        if (z && z.charAt(0) == 'E') z = i.decode(z.substring(1));
        if (z) t = JSON.parse(z);
      }
      if (t && (!t.user || t.user === h.getID())) return t;
    } catch (y) {
      u.warn('getcookie_error', y);
    }
    return null;
  }

  function w() {
    return parseInt(Date.now() / 1000, 10);
  }
  var x = {
    register: function(y, z) {
      r[y] = z;
    },
    store: function() {
      var y = v();
      if (y && y.v && o < y.v) {
        u.debug('stale_cookie', o);
        return;
      }
      var z = {
        v: o,
        time: w(),
        user: h.getID()
      };
      for (var aa in r) z[aa] = j.applyWithGuard(r[aa], r, [y && y[aa]], function(ea) {
        ea.presence_subcookie = aa;
    ***REMOVED***;
      var ba = JSON.stringify(z);
      if (p) ba = 'E' + i.encode(ba);
      if (m.hasUserCookie()) {
        var ca = ba.length;
        if (ca > 1024) u.warn('big_cookie', ca);
        var da = n.getRequestURI(false).isSecure() && !!g.get('csm');
        g.set(q, ba, null, null, da);
      }
    },
    clear: function() {
      g.clear(q);
    },
    getSubCookie: function(y) {
      var z = v();
      if (!z) return null;
      return z[y];
    }
  };
  e.exports = x;
}, null);

__d("PresenceState", ["Arbiter", "ErrorUtils", "JSLogger", "PresenceCookieManager", "copyProperties", "debounceAcrossTransitions", "setIntervalAcrossTransitions", "PresenceInitialData"], function(a, b, c, d, e, f, g, h, i, j, k, l, m, n) {
  var o = n.cookiePollInterval || 2000,
    p = [],
    q = [],
    r = null,
    s = null,
    t = 0,
    u = null,
    v = 0,
    w = ['sb2', 't2', 'lm2', 'uct2', 'tr', 'tw', 'at', 'wml'],
    x = i.create('presence_state');

  function y() {
    return j.getSubCookie('state');
  }

  function z() {
    t = Date.now();
    j.store();
    da(s);
  }
  var aa = l(z, 0);

  function ba(ia) {
    if (typeof ia == 'undefined' || isNaN(ia) || ia == Number.POSITIVE_INFINITY || ia == Number.NEGATIVE_INFINITY) ia = 0;
    return ia;
  }

  function ca(ia) {
    var ja = {};
    if (ia) {
      w.forEach(function(ma) {
        ja[ma] = ia[ma];
    ***REMOVED***;
      if (t < ia.ut) x.error('new_cookie', {
        cookie_time: ia.ut,
        local_time: t
    ***REMOVED***;
    }
    ja.ut = t;
    for (var ka = 0, la = p.length; ka < la; ka++) h.applyWithGuard(p[ka], null, [ja]);
    s = ja;
    return s;
  }

  function da(ia) {
    v++;
    t = ba(ia.ut);
    if (!r) r = m(ga, o);
    s = ia;
    if (u === null) u = ia;
    for (var ja = 0, ka = q.length; ja < ka; ja++) h.applyWithGuard(q[ja], null, [ia]);
    v--;
  }

  function ea(ia) {
    if (ia && ia.ut)
      if (t < ia.ut) {
        return true;
      } else if (ia.ut < t) x.error('old_cookie', {
      cookie_time: ia.ut,
      local_time: t
  ***REMOVED***;
    return false;
  }

  function fa() {
    var ia = y();
    if (ea(ia)) s = ia;
    return s;
  }

  function ga() {
    var ia = y();
    if (ea(ia)) da(ia);
  }
  j.register('state', ca);
  g.subscribe(i.DUMP_EVENT, function(ia, ja) {
    ja.presence_state = {
      initial: k({}, u),
      state: k({}, s),
      update_time: t,
      sync_paused: v,
      poll_time: o
    };
***REMOVED***;
  (function() {
    var ia = fa();
    if (ia) {
      da(ia);
    } else {
      x.debug('no_cookie_initial');
      da(ca());
      return;
    }
***REMOVED***();
  var ha = {
    doSync: function(ia) {
      if (v) return;
      if (ia) {
        z();
      } else aa();
    },
    registerStateStorer: function(ia) {
      p.push(ia);
    },
    registerStateLoader: function(ia) {
      q.push(ia);
    },
    get: function() {
      return fa();
    },
    getInitial: function() {
      return u;
    },
    verifyNumber: ba
  };
  e.exports = ha;
}, null);

__d("ActiveXSupport", ["UserAgent_DEPRECATED"], function(a, b, c, d, e, f, g) {
  var h = null,
    i = {
      isSupported: function() {
        if (h !== null) return h;
        try {
          if (g.ie() >= 11) {
            h = !!new ActiveXObject("htmlfile");
          } else h = !!window.ActiveXObject && !!new ActiveXObject("htmlfile");
        } catch (j) {
          h = false;
        }
        return h;
      }
    };
  e.exports = i;
}, null);

__d("FBRTCConstants", ["FBRTCStruct"], function(a, b, c, d, e, f, g) {
  var h = {
      OFFER: 'offer',
      ANSWER: 'answer',
      ICE_CANDIDATE: 'ice_candidate',
      OK: 'ok',
      PING: 'ping',
      HANGUP: 'hang_up',
      OTHER_DISMISS: 'other_dismiss',
      MSG_ACK: 'msg_ack',
      PRANSWER: 'pranswer',
      ICERESTART_OFFER: 'icerestart_offer',
      ICERESTART_ANSWER: 'icerestart_answer',
      OFFER_ACK: 'offer_ack',
      OFFER_NACK: 'offer_nack',
      ANSWER_ACK: 'answer_ack',
      SET_VIDEO: 'set_video'
    },
    i = new g([{
      IGNORE_CALL: 'IgnoreCall'
    ***REMOVED***
      HANGUP_CALL: 'HangupCall'
    ***REMOVED***
      IN_ANOTHER_CALL: 'InAnotherCall'
    ***REMOVED***
      ACCEPT_AFTER_HANGUP: 'CallEndAcceptAfterHangUp'
    ***REMOVED***
      NO_ANSWER_TIMEOUT: 'NoAnswerTimeout'
    ***REMOVED***
      INCOMING_TIMEOUT: 'IncomingTimeout'
    ***REMOVED***
      OTHER_INSTANCE_HANDLED: 'OtherInstanceHandled'
    ***REMOVED***
      SIGNALING_MESSAGE_FAILED: 'SignalingMessageFailed'
    ***REMOVED***
      CONNECTION_DROPPED: 'ConnectionDropped'
    ***REMOVED***
      CLIENT_INTERRUPTED: 'ClientInterrupted'
    ***REMOVED***
      WEBRTC_ERROR: 'WebRTCError'
    ***REMOVED***
      CLIENT_ERROR: 'ClientError'
    ***REMOVED***
      NO_PERMISSION: 'NoPermission'
    ***REMOVED***
      OTHER_NOT_CAPABLE: 'OtherNotCapable'
    ***REMOVED***
      NO_UI_ERROR: 'NoUIShown'
    ***REMOVED***
      UNSUPPORTED_VERSION: 'VersionUnsupported'
    ***REMOVED***
      CALLER_NOT_VISIBLE: 'CallerNotVisible'
    ***REMOVED***
      CARRIER_BLOCKED: 'CarrierBlocked'
    ***REMOVED***
      OTHER_CARRIER_BLOCKED: 'OtherCarrierBlocked'
    }]),
    j = {
      HANG_UP: 1,
      TOGGLE_MUTE_AUDIO: 2,
      TOGGLE_MUTE_VIDEO: 3,
      TOGGLE_FULL_SCREEN: 4,
      TOGGLE_SELF_VIEW: 5,
      SUBMIT_STAR_RATING: 6,
      SUBMIT_FEEDBACK: 7,
      SHOW_SETTINGS: 8
    },
    k = {
      PayloadType: h,
      CallEndReason: i,
      UIEventType: j,
      endCallReasonFromString: function(l) {
        return i.strNames.indexOf(l);
      },
      callEndReasonString: function(l) {
        if (l < 0 || l > i.strNames.length) return 'Unknown';
        return i.strNames[l];
      },
      fullCallEndReasonString: function(l, m) {
        return this.callEndReasonString(l) + '_' + (m ? 'remote' : 'local');
      }
    };
  e.exports = k;
}, null);

__d("FBRTCIceStatsParser", [], function(a, b, c, d, e, f) {
  var g = null;
  h.getInstance = function() {
    "use strict";
    if (!g) g = new h();
    return g;
  };

  function h() {
    "use strict";
  }
  h.prototype.extractIceInfo = function(i) {
    "use strict";
    var j = [],
      k = i.split("\r\n");
    for (var l = 0; l < k.length; l++) {
      var m = k[l];
      if (this.$FBRTCIceStatsParser0(m)) j.push({
        gen: this.$FBRTCIceStatsParser1(m),
        type: this.$FBRTCIceStatsParser2(m)
    ***REMOVED***;
    }
    return j;
  };
  h.prototype.$FBRTCIceStatsParser0 = function(i) {
    "use strict";
    return (i.indexOf('candidate:') > -1);
  };
  h.prototype.$FBRTCIceStatsParser1 = function(i) {
    "use strict";
    var j = 0,
      k = i.match(/generation (\d+)/);
    if (k) j = parseInt(k[1], 10);
    return j;
  };
  h.prototype.$FBRTCIceStatsParser2 = function(i) {
    "use strict";
    var j = i.match(/typ (host|relay|srflx|prflx)/);
    if (j) {
      return j[1];
    } else return 'unknown';
  };
  e.exports = h;
}, null);

__d("FBRTCLogger", ["Log", "LogHistory", "MarauderLogger", "formatDate", "pageID"], function(a, b, c, d, e, f, g, h, i, j, k) {
  var l = 'webrtc',
    m = 'sent_message',
    n = 'received_message',
    o = 'send_succeeded',
    p = 'send_failed',
    q = 'info',
    r = 'call_action',
    s = 'client_event',
    t = 'client_error',
    u = 'type',
    v = 'msg_id',
    w = 'ack_msg_id',
    x = 'call_id',
    y = 'from',
    z = 'to',
    aa = 'content',
    ba = 'tag',
    ca = 'peer_id',
    da = 'error_code',
    ea = 'trigger',
    fa = 'endcallstats',
    ga = null;
  ha.getInstance = function() {
    "use strict";
    if (!ga) ga = new ha();
    return ga;
  };

  function ha() {
    "use strict";
    this.$FBRTCLogger0 = h.getInstance(l);
  }
  ha.prototype.logToConsole = function(ia) {
    "use strict";
    var ja = 'Console';
    this.$FBRTCLogger1(null, null, ja, ia);
    this.$FBRTCLogger0.log(ja, ia);
  };
  ha.prototype.logReceivedMessage = function(ia, ja, ka) {
    "use strict";
    var la = {};
    la[y] = ia;
    la[x] = ja;
    la[u] = ka.type;
    la[v] = ka.msg_id;
    if (ka.sdp) la[aa] = ka.sdp;
    if (ka.ack_id) la[w] = ka.ack_id;
    this.$FBRTCLogger2(n, la);
    this.$FBRTCLogger1(ia, ja, 'Received', ka.type + ', ' + ka.msg_id);
  };
  ha.prototype.logSentMessage = function(ia, ja, ka) {
    "use strict";
    var la = {};
    la[z] = ia;
    la[x] = ja;
    la[u] = ka.type;
    la[v] = ka.msg_id;
    if (ka.sdp) la[aa] = ka.sdp;
    if (ka.ack_id) la[w] = ka.ack_id;
    this.$FBRTCLogger2(m, la);
    this.$FBRTCLogger1(ia, ja, 'Sent', ka.type + ', ' + ka.msg_id);
  };
  ha.prototype.logSentMessageSuccess = function(ia, ja, ka, la) {
    "use strict";
    var ma = {};
    ma[ca] = ia;
    ma[x] = ja;
    ma[u] = ka;
    ma[v] = la;
    this.$FBRTCLogger2(o, ma);
  };
  ha.prototype.logSentMessageFailure = function(ia, ja, ka, la, ma) {
    "use strict";
    var na = {};
    na[ca] = ia;
    na[x] = ja;
    na[u] = ka;
    na[v] = la;
    na[da] = ma;
    this.$FBRTCLogger2(p, na);
    this.$FBRTCLogger1(ia, ja, 'Send Failed', ka + ', ' + ma);
  };
  ha.prototype.logCallAction = function(ia, ja, ka, la, ma) {
    "use strict";
    var na = {};
    na[ca] = ia;
    na[x] = ja;
    na[r] = ka;
    na[aa] = la;
    if (ma) na[ea] = ma;
    this.$FBRTCLogger2(r, na);
    this.$FBRTCLogger1(ia, ja, 'CallAction', ka + ', ' + la);
  };
  ha.prototype.logEvent = function(ia, ja, event) {
    "use strict";
    var ka = {};
    ka[ca] = ia;
    ka[x] = ja;
    ka[aa] = event;
    this.$FBRTCLogger2(s, ka);
    this.$FBRTCLogger1(ia, ja, 'Event', event);
  };
  ha.prototype.logInfo = function(ia, ja, ka) {
    "use strict";
    var la = {};
    la[ca] = ia;
    la[x] = ja;
    la[aa] = ka;
    this.$FBRTCLogger2(q, la);
    this.$FBRTCLogger1(ia, ja, 'Info', ka);
  };
  ha.prototype.logError = function(ia, ja, ka) {
    "use strict";
    var la = {};
    la[ca] = ia;
    la[x] = ja;
    la[aa] = ka;
    this.$FBRTCLogger2(t, la);
    this.$FBRTCLogger1(ia, ja, 'Error', ka);
  };
  ha.prototype.logErrorWithoutID = function(ia) {
    "use strict";
    this.logError(null, null, ia);
  };
  ha.prototype.logEndCallSummary = function(ia) {
    "use strict";
    if (!ia) return;
    var ja = {};
    ja[ca] = ia.peerID;
    ja[x] = ia.callID;
    ja[ba] = fa;
    ja[aa] = ia.toString();
    var ka = ia.getExtraInfo();
    for (var la in ka)
      if (ka.hasOwnProperty(la)) ja[la] = ka[la];
    this.$FBRTCLogger2(q, ja);
    this.$FBRTCLogger1(ia.peerID, ia.callID, 'Call Summary', ja);
  };
  ha.prototype.$FBRTCLogger2 = function(ia, ja) {
    "use strict";
    ja.page_id = k;
    this.$FBRTCLogger0.log(ia, ja);
    i.log(ia, l, ja);
  };
  ha.prototype.$FBRTCLogger1 = function(ia, ja, ka, la) {
    "use strict";
  };
  ha.CallAction = {
    START_CALL: 'start_call',
    RECEIVED_CALL: 'received_call',
    ANSWER_CALL: 'answer_call',
    END_CALL: 'end_call',
    DENIED_PERMISSION: 'denied_permission',
    SET_MUTE: 'set_mute',
    SET_VIDEO_ON: 'set_video_on',
    SET_SELF_VIEW_ON: 'set_self_view_on',
    SET_FULLSCREEN_ON: 'set_fullscreen_on',
    START_SKYPE: 'start_skype',
    TRY_NEW: 'try_new',
    OPEN_POPUP: 'open_popup',
    POPUP_OPENED: 'popup_opened',
    AUTO_DISABLE_VIDEO: 'auto_disable_video',
    FAILED_GETTING_URI: 'failed_getting_uri',
    OLD_URI: 'old_uri'
  };
  ha.Trigger = {
    ADMIN_MESSAGE: 'admin_message',
    CHAT_TAB_ICON: 'chat_tab_icon',
    CHAT_TAB_ICON_TOUR: 'chat_tab_icon_tour',
    SKYPE_DEPRECATION_DIALOG: 'skype_deprecation_dialog',
    REDIAL_BUTTON: 'redial_button',
    RETURN_CALL: 'return_call',
    WEB_MESSENGER: 'web_messenger',
    UNKNOWN: 'unknown'
  };
  ha.Key = {
    DEVICE_INFO: 'device_info',
    RATING: 'rating5',
    RATING_SHOWN: 'rating_shown',
    SURVEY_CHOICE: 'survey_choice',
    SURVEY_DETAILS: 'survey_details',
    SURVEY_SHOWN: 'survey_shown',
    INITIATED_BY_PAGE_ID: 'initiated_by_page_id',
    PEER_IS_MOBILE: 'peer_is_mobile'
  };
  e.exports = ha;
}, null);

__d("FBRTCCallSummary", ["FBRTCConstants", "FBRTCIceStatsParser", "FBRTCLogger", "UserAgentData", "copyProperties"], function(a, b, c, d, e, f, g, h, i, j, k) {
  var l = {
    CALL_STARTED: 'started',
    POPUP_OPENED: 'opened',
    SENT_OFFER: 's_o',
    RECV_OFFER: 'r_o',
    SENT_OFFER_ACK: 's_oack',
    RECV_OFFER_ACK: 'r_oack',
    SENT_RETRIED_OFFER: 's_o2',
    RECV_RETRIED_OFFER: 'r_o2',
    SENT_RETRIED_OFFER_ACK: 's_oack2',
    RECV_RETRIED_OFFER_ACK: 'r_oack2',
    SENT_PRANSWER: 's_pr',
    RECV_PRANSWER: 'r_pr',
    NETWORK_READY: 'network_ready',
    SENT_ANSWER: 's_a',
    RECV_ANSWER: 'r_a',
    SENT_ANSWER_ACK: 's_aack',
    RECV_ANSWER_ACK: 'r_aack',
    SENT_RETRIED_ANSWER: 's_a2',
    RECV_RETRIED_ANSWER: 'r_a2',
    SENT_RETRIED_ANSWER_ACK: 's_aack2',
    RECV_RETRIED_ANSWER_ACK: 'r_aack2',
    SENT_OK: 's_ok',
    RECV_OK: 'r_ok',
    CALL_CONNECTED: 'connected',
    CALL_ENDED: 'ended'
  };
  m.CURRENT_SUMMARY_VERSION = 10;

  function m(n) {
    "use strict";
    this.peerID = n.peerID;
    this.callID = n.callID;
    this.$FBRTCCallSummary0 = n.isCaller;
    this.$FBRTCCallSummary1 = (new Date()).valueOf();
    this.$FBRTCCallSummary2 = null;
    this.$FBRTCCallSummary3 = {};
    this.$FBRTCCallSummary4 = null;
    this.$FBRTCCallSummary5 = null;
    this.$FBRTCCallSummary6 = null;
    this.$FBRTCCallSummary7 = null;
    this.$FBRTCCallSummary8 = null;
    this.$FBRTCCallSummary9 = null;
    this.$FBRTCCallSummarya = {};
    this.$FBRTCCallSummaryb = {};
    this.$FBRTCCallSummaryc = {};
    this.$FBRTCCallSummaryd = {};
    this.$FBRTCCallSummarye = {};
    this.$FBRTCCallSummaryf = {};
    this.$FBRTCCallSummaryg = 0;
    this.$FBRTCCallSummaryh = {};
    this.addExtraInfo(i.Key.DEVICE_INFO, this.$FBRTCCallSummaryi());
    this.$FBRTCCallSummaryj();
    this.$FBRTCCallSummaryk = h.getInstance();
  }
  m.prototype.toJsonString = function() {
    "use strict";
    this.$FBRTCCallSummary8 = (new Date()).valueOf();
    return JSON.stringify({
      version: m.CURRENT_SUMMARY_VERSION,
      peerID: this.peerID,
      callID: this.callID,
      isCaller: this.$FBRTCCallSummary0,
      startTime: this.$FBRTCCallSummary1,
      trigger: this.$FBRTCCallSummary2,
      signalingTime: this.$FBRTCCallSummary3,
      endCallReason: this.$FBRTCCallSummary4,
      endCallSubreason: this.$FBRTCCallSummary5,
      isRemoteEnded: this.$FBRTCCallSummary6,
      lastUpdatedTime: this.$FBRTCCallSummary7,
      lastSerializedTime: this.$FBRTCCallSummary8,
      unsetOnRetrieve: this.$FBRTCCallSummary9,
      openCount: this.$FBRTCCallSummaryg,
      extraInfo: this.$FBRTCCallSummaryh,
      pcStats: this.$FBRTCCallSummarya,
      captureStats: this.$FBRTCCallSummaryb,
      gen0IceSentCount: this.$FBRTCCallSummaryc,
      gen0IceReceivedCount: this.$FBRTCCallSummaryd,
      iceSentCount: this.$FBRTCCallSummarye,
      iceReceivedCount: this.$FBRTCCallSummaryf
  ***REMOVED***;
  };
  m.fromJsonString = function(n) {
    "use strict";
    var o;
    try {
      o = JSON.parse(n);
    } catch (p) {
      return null;
    }
    if (o.version !== m.CURRENT_SUMMARY_VERSION) return null;
    if (!o.hasOwnProperty('peerID') || !o.hasOwnProperty('callID') || !o.hasOwnProperty('isCaller') || !o.hasOwnProperty('startTime') || !o.hasOwnProperty('trigger') || !o.hasOwnProperty('signalingTime') || !o.hasOwnProperty('endCallReason') || !o.hasOwnProperty('isRemoteEnded') || !o.hasOwnProperty('lastUpdatedTime') || !o.hasOwnProperty('lastSerializedTime')) return null;
    var q = new m({
      peerID: o.peerID,
      callID: o.callID,
      isCaller: o.isCaller
  ***REMOVED***;
    q.$FBRTCCallSummary1 = o.startTime;
    q.$FBRTCCallSummary2 = o.trigger;
    q.$FBRTCCallSummary3 = o.signalingTime;
    q.$FBRTCCallSummary4 = o.endCallReason;
    q.$FBRTCCallSummary5 = o.endCallSubreason;
    q.$FBRTCCallSummary6 = o.isRemoteEnded;
    q.$FBRTCCallSummary7 = o.lastUpdatedTime;
    q.$FBRTCCallSummary8 = o.lastSerializedTime;
    if (o.unsetOnRetrieve) q.$FBRTCCallSummary9 = o.unsetOnRetrieve;
    if (o.openCount) q.$FBRTCCallSummaryg = o.openCount;
    if (o.extraInfo) q.$FBRTCCallSummaryh = o.extraInfo;
    if (o.pcStats) q.$FBRTCCallSummarya = o.pcStats;
    if (o.captureStats) q.$FBRTCCallSummaryb = o.captureStats;
    if (o.gen0IceSentCount) q.$FBRTCCallSummaryc = o.gen0IceSentCount;
    if (o.gen0IceReceivedCount) q.$FBRTCCallSummaryd = o.gen0IceReceivedCount;
    if (o.iceSentCount) q.$FBRTCCallSummarye = o.iceSentCount;
    if (o.iceReceivedCount) q.$FBRTCCallSummaryf = o.iceReceivedCount;
    return q;
  };
  m.restoreOrInitialize = function(n, o, p, q, r) {
    "use strict";
    var s = n.retrieveCallSummary(o, p);
    if (!s) {
      s = new m({
        peerID: o,
        callID: p,
        isCaller: q
    ***REMOVED***;
      if (r) {
        s.onFullMessageReceived({
          msg: r
      ***REMOVED***;
        s.onOfferAckSent(r);
      } else s.onCallStarted(i.Trigger.UNKNOWN);
      i.getInstance().logError(o, p, 'Missing call summary from storage');
    } else if (s.$FBRTCCallSummary9) {
      s.$FBRTCCallSummary4 = null;
      s.$FBRTCCallSummary5 = null;
      s.$FBRTCCallSummary6 = null;
      delete s.$FBRTCCallSummary3[l.CALL_ENDED];
      s.$FBRTCCallSummary9 = null;
    }
    return s;
  };
  m.logSavedSummaries = function(n) {
    "use strict";
    var o = n.getLoggableSummaries(),
      p = o.length;
    if (p <= 0) return;
    var q = i.getInstance(),
      r = [];
    for (var s = 0; s < p; s++) {
      var t = o[s];
      q.logEndCallSummary(t);
      r.push({
        peerID: t.peerID,
        callID: t.callID
    ***REMOVED***;
    }
    n.removeCallSummaries(r);
    q.logToConsole('Logged pending summaries: ' + p);
  };
  m.prototype.save = function(n) {
    "use strict";
    n.storeCallSummary(this.peerID, this.callID, this);
  };
  m.prototype.getLastUpdatedTime = function() {
    "use strict";
    return this.$FBRTCCallSummary7;
  };
  m.prototype.setLastUpdatedTime = function(n) {
    "use strict";
    this.$FBRTCCallSummary7 = n;
  };
  m.prototype.getExtraInfo = function() {
    "use strict";
    return this.$FBRTCCallSummaryh;
  };
  m.prototype.addExtraInfo = function(n, o) {
    "use strict";
    this.$FBRTCCallSummaryh[n] = o;
    this.$FBRTCCallSummaryj();
  };
  m.prototype.onCallStarted = function(n) {
    "use strict";
    this.$FBRTCCallSummary2 = n;
    this.$FBRTCCallSummaryl(l.CALL_STARTED);
    this.$FBRTCCallSummaryj();
  };
  m.prototype.onPopupOpened = function() {
    "use strict";
    this.$FBRTCCallSummaryl(l.POPUP_OPENED);
    this.$FBRTCCallSummaryg++;
    this.$FBRTCCallSummaryj();
  };
  m.prototype.setPcStats = function(n) {
    "use strict";
    this.$FBRTCCallSummarya = n;
    this.$FBRTCCallSummaryj();
  };
  m.prototype.setVideoCaptureStats = function(n, o) {
    "use strict";
    this.$FBRTCCallSummaryb = {
      w: n,
      h: o
    };
    this.$FBRTCCallSummaryj();
  };
  m.prototype.onOfferAckSent = function(n) {
    "use strict";
    this.onMessageSent({
      type: g.PayloadType.OFFER_ACK,
      flag: n.flag
  ***REMOVED***;
  };
  m.prototype.onMessageSent = function(n) {
    "use strict";
    var o = n.flag === 1;
    switch (n.type) {
      case g.PayloadType.OFFER:
        this.$FBRTCCallSummarym(o, l.SENT_OFFER, l.SENT_RETRIED_OFFER);
        this.$FBRTCCallSummaryn(n, this.$FBRTCCallSummaryc, this.$FBRTCCallSummarye);
        break;
      case g.PayloadType.ANSWER:
        this.$FBRTCCallSummarym(o, l.SENT_ANSWER, l.SENT_RETRIED_ANSWER);
        this.$FBRTCCallSummaryn(n, this.$FBRTCCallSummaryc, this.$FBRTCCallSummarye);
        break;
      case g.PayloadType.OK:
        this.$FBRTCCallSummaryl(l.SENT_OK);
        break;
      case g.PayloadType.PRANSWER:
        this.$FBRTCCallSummaryl(l.SENT_PRANSWER);
        break;
      case g.PayloadType.OFFER_ACK:
        this.$FBRTCCallSummarym(o, l.SENT_OFFER_ACK, l.SENT_RETRIED_OFFER_ACK);
        break;
      case g.PayloadType.ANSWER_ACK:
        this.$FBRTCCallSummarym(o, l.SENT_ANSWER_ACK, l.SENT_RETRIED_ANSWER_ACK);
        break;
      case g.PayloadType.ICE_CANDIDATE:
        this.$FBRTCCallSummaryn(n, this.$FBRTCCallSummaryc, this.$FBRTCCallSummarye);
        break;
      default:
    }
    this.$FBRTCCallSummaryj();
  };
  m.prototype.$FBRTCCallSummaryn = function(n, o, p) {
    "use strict";
    var q = null,
      r = null,
      s = this.$FBRTCCallSummaryk.extractIceInfo(n.sdp);
    for (var t = 0; t < s.length; t++) {
      q = s[t].gen;
      r = s[t].type;
      if (q === 0) this.$FBRTCCallSummaryo(o, r);
      this.$FBRTCCallSummaryo(p, r);
    }
  };
  m.prototype.$FBRTCCallSummaryo = function(n, o) {
    "use strict";
    if (!n[o]) {
      n[o] = 1;
    } else n[o] = n[o] + 1;
  };
  m.prototype.$FBRTCCallSummaryp = function(n) {
    "use strict";
    if (n.isFromMobile()) this.addExtraInfo(i.Key.PEER_IS_MOBILE, '1');
  };
  m.prototype.onFullMessageReceived = function(n) {
    "use strict";
    var o = n.msg,
      p = o.flag === 1;
    switch (o.type) {
      case g.PayloadType.OFFER:
        this.$FBRTCCallSummaryp(n);
        this.$FBRTCCallSummarym(p, l.RECV_OFFER, l.RECV_RETRIED_OFFER);
        this.$FBRTCCallSummaryn(o, this.$FBRTCCallSummaryd, this.$FBRTCCallSummaryf);
        break;
      case g.PayloadType.ANSWER:
        this.$FBRTCCallSummaryp(n);
        this.$FBRTCCallSummarym(p, l.RECV_ANSWER, l.RECV_RETRIED_ANSWER);
        this.$FBRTCCallSummaryn(o, this.$FBRTCCallSummaryd, this.$FBRTCCallSummaryf);
        break;
      case g.PayloadType.OK:
        this.$FBRTCCallSummaryl(l.RECV_OK);
        break;
      case g.PayloadType.PRANSWER:
        this.$FBRTCCallSummaryl(l.RECV_PRANSWER);
        break;
      case g.PayloadType.OFFER_ACK:
        this.$FBRTCCallSummarym(p, l.RECV_OFFER_ACK, l.RECV_RETRIED_OFFER_ACK);
        break;
      case g.PayloadType.ANSWER_ACK:
        this.$FBRTCCallSummarym(p, l.RECV_ANSWER_ACK, l.RECV_RETRIED_ANSWER_ACK);
        break;
      case g.PayloadType.ICE_CANDIDATE:
        this.$FBRTCCallSummaryn(o, this.$FBRTCCallSummaryd, this.$FBRTCCallSummaryf);
        break;
      default:
    }
    this.$FBRTCCallSummaryj();
  };
  m.prototype.onCallConnected = function() {
    "use strict";
    this.$FBRTCCallSummaryl(l.NETWORK_READY);
    this.$FBRTCCallSummaryl(l.CALL_CONNECTED);
    this.$FBRTCCallSummaryj();
  };
  m.prototype.onCallEnded = function(n, o, p, q) {
    "use strict";
    this.$FBRTCCallSummary9 = p;
    this.$FBRTCCallSummary4 = n;
    this.$FBRTCCallSummary5 = q;
    this.$FBRTCCallSummary6 = o;
    this.$FBRTCCallSummaryl(l.CALL_ENDED);
    this.$FBRTCCallSummaryj();
  };
  m.prototype.toString = function() {
    "use strict";
    var n = {};
    n.core_metrics = this.$FBRTCCallSummaryq();
    n.time_series = null;
    return JSON.stringify(n);
  };
  m.prototype.$FBRTCCallSummaryq = function() {
    "use strict";
    var n = {};
    n.ver = m.CURRENT_SUMMARY_VERSION;
    n.caller = this.$FBRTCCallSummary0;
    n.conn = this.$FBRTCCallSummaryr();
    n.peer_id = this.peerID;
    n.has_video = true;
    n.open_count = this.$FBRTCCallSummaryg;
    n.signaling = this.$FBRTCCallSummarys();
    n.sender = this.$FBRTCCallSummaryt();
    n.receiver = this.$FBRTCCallSummaryu();
    n.end = this.$FBRTCCallSummaryv();
    n.video = this.$FBRTCCallSummaryw();
    return n;
  };
  m.prototype.$FBRTCCallSummaryr = function() {
    "use strict";
    var n = {
      dtls: 1
    };
    if (this.$FBRTCCallSummarya.sender && this.$FBRTCCallSummarya.sender.rtt) n.rtt = this.$FBRTCCallSummarya.sender.rtt;
    return n;
  };
  m.prototype.$FBRTCCallSummarys = function() {
    "use strict";
    var n = {};
    if (this.$FBRTCCallSummary2) n.trigger = this.$FBRTCCallSummary2;
    n.start_time = this.$FBRTCCallSummary1;
    n.time_from_start = this.$FBRTCCallSummary3;
    var o = this.$FBRTCCallSummary3[l.CALL_CONNECTED],
      p = this.$FBRTCCallSummary3[l.CALL_ENDED];
    if (o) {
      if (!p)
        if (this.$FBRTCCallSummary8) {
          p = this.$FBRTCCallSummary8 - this.$FBRTCCallSummary1;
        } else p = this.$FBRTCCallSummaryx();
      var q = p - o;
      if (q > 0) n.duration = q;
    }
    return n;
  };
  m.prototype.$FBRTCCallSummaryt = function() {
    "use strict";
    var n = {};
    if (this.$FBRTCCallSummaryc) n.ice_g0 = this.$FBRTCCallSummaryc;
    if (this.$FBRTCCallSummarye) n.ice = this.$FBRTCCallSummarye;
    if (this.$FBRTCCallSummarya.sender) k(n, this.$FBRTCCallSummarya.sender);
    return n;
  };
  m.prototype.$FBRTCCallSummaryu = function() {
    "use strict";
    var n = {};
    if (this.$FBRTCCallSummaryd) n.ice_g0 = this.$FBRTCCallSummaryd;
    if (this.$FBRTCCallSummaryf) n.ice = this.$FBRTCCallSummaryf;
    return n;
  };
  m.prototype.$FBRTCCallSummaryv = function() {
    "use strict";
    var n = {};
    if (this.$FBRTCCallSummary4 !== null) {
      n.end_call_reason_string = g.callEndReasonString(this.$FBRTCCallSummary4);
      if (this.$FBRTCCallSummary5 !== null) n.end_call_subreason_string = this.$FBRTCCallSummary5;
      n.remote_ended = this.$FBRTCCallSummary6;
    }
    if (this.$FBRTCCallSummarya.end) k(n, this.$FBRTCCallSummarya.end);
    return n;
  };
  m.prototype.$FBRTCCallSummaryw = function() {
    "use strict";
    var n = {
      capture: {}
    };
    if (this.$FBRTCCallSummarya.video && this.$FBRTCCallSummarya.video.sender) k(n, this.$FBRTCCallSummarya.video.sender);
    if (this.$FBRTCCallSummaryb) k(n.capture, this.$FBRTCCallSummaryb);
    return {
      sender: n
    };
  };
  m.prototype.$FBRTCCallSummaryx = function() {
    "use strict";
    return (new Date()).valueOf() - this.$FBRTCCallSummary1;
  };
  m.prototype.$FBRTCCallSummaryl = function(n) {
    "use strict";
    if (this.$FBRTCCallSummary3[n]) return;
    this.$FBRTCCallSummary3[n] = this.$FBRTCCallSummaryx();
  };
  m.prototype.$FBRTCCallSummarym = function(n, o, p) {
    "use strict";
    if (n) {
      this.$FBRTCCallSummaryl(p);
    } else this.$FBRTCCallSummaryl(o);
  };
  m.prototype.$FBRTCCallSummaryj = function() {
    "use strict";
    this.$FBRTCCallSummary7 = (new Date()).valueOf();
  };
  m.prototype.$FBRTCCallSummaryi = function() {
    "use strict";
    return {
      device: j.deviceName,
      os: j.platformName,
      os_version: j.platformFullVersion,
      browser: j.browserName,
      browser_version: j.browserFullVersion,
      screen_height: window.screen.availHeight,
      screen_width: window.screen.availWidth
    };
  };
  e.exports = m;
}, null);

__d("FBRTCCallSummaryStore", ["CacheStorage", "FBRTCCallSummary", "FBRTCLogger", "areEqual"], function(a, b, c, d, e, f, g, h, i, j) {
  var k = 'localstorage',
    l = 'RTC_CALL_SUMMARY_',
    m = 'summary',
    n = 2000,
    o = 3,
    p = 3 * 60 * 1000,
    q = null;
  r.getInstance = function() {
    "use strict";
    if (!q) q = new r();
    return q;
  };

  function r() {
    "use strict";
    this.$FBRTCCallSummaryStore0 = new g(k, l);
    this.$FBRTCCallSummaryStore1 = i.getInstance();
  }
  r.prototype.storeCallSummary = function(s, t, u) {
    "use strict";
    var v = this;
    this.$FBRTCCallSummaryStore2(function(w) {
      if (!w[s]) w[s] = {};
      var x = w[s][t];
      if (x) {
        var y = v.$FBRTCCallSummaryStore3(x);
        if (y && y.getLastUpdatedTime() > u.getLastUpdatedTime()) {
          v.$FBRTCCallSummaryStore1.logToConsole('Outdated summaries');
          return null;
        }
      }
      w[s][t] = v.$FBRTCCallSummaryStore4(u);
      return w;
    }, v.$FBRTCCallSummaryStore1.logError.bind(v.$FBRTCCallSummaryStore1, s, t));
  };
  r.prototype.retrieveCallSummary = function(s, t) {
    "use strict";
    var u = this.$FBRTCCallSummaryStore5(),
      v = null;
    if (u[s]) v = u[s][t];
    if (v) {
      return this.$FBRTCCallSummaryStore3(v);
    } else return null;
  };
  r.prototype.removeCallSummary = function(s, t) {
    "use strict";
    this.removeCallSummaries([{
      peerID: s,
      callID: t
    }]);
  };
  r.prototype.removeCallSummaries = function(s) {
    "use strict";
    var t = this;
    this.$FBRTCCallSummaryStore2(function(u) {
      var v = s.length;
      for (var w = 0; w < v; w++) {
        var x = s[w].peerID,
          y = s[w].callID;
        if (u[x] && u[x][y]) {
          delete u[x][y];
          if (t.$FBRTCCallSummaryStore6(u[x])) delete u[x];
        }
      }
      return u;
    }, t.$FBRTCCallSummaryStore1.logError.bind(t.$FBRTCCallSummaryStore1, null, null));
  };
  r.prototype.getLoggableSummaries = function() {
    "use strict";
    var s = this.$FBRTCCallSummaryStore5(),
      t = [];
    for (var u in s)
      if (s.hasOwnProperty(u))
        for (var v in s[u])
          if (s[u].hasOwnProperty(v)) {
            var w = this.$FBRTCCallSummaryStore3(s[u][v], p);
            if (w) t.push(w);
          }
    return t;
  };
  r.prototype.$FBRTCCallSummaryStore6 = function(s) {
    "use strict";
    for (var t in s)
      if (s.hasOwnProperty(t)) return false;
    return true;
  };
  r.prototype.$FBRTCCallSummaryStore4 = function(s) {
    "use strict";
    var t = {
      __t: Date.now(),
      __d: s.toJsonString()
    };
    return t;
  };
  r.prototype.$FBRTCCallSummaryStore3 = function(s, t) {
    "use strict";
    if (s)
      if (!t || (Date.now() - s.__t >= t)) return h.fromJsonString(s.__d);
    return null;
  };
  r.prototype.$FBRTCCallSummaryStore5 = function() {
    "use strict";
    var s = this.$FBRTCCallSummaryStore0.get(m) || {};
    return s;
  };
  r.prototype.$FBRTCCallSummaryStore2 = function(s, t, u, v) {
    "use strict";
    if (u === (void 0) || u === null) u = o;
    var w = this.$FBRTCCallSummaryStore5(),
      x = this.$FBRTCCallSummaryStore5(),
      y = s(w);
    if (y === null) return;
    var z = this.$FBRTCCallSummaryStore5();
    if (j(x, z)) {
      this.$FBRTCCallSummaryStore0.set(m, y);
      this.$FBRTCCallSummaryStore1.logToConsole('Updated summaries');
    } else if (u > 0) {
      t('Retry lock');
      if (v) {
        var aa = this;
        setTimeout(function() {
          aa.$FBRTCCallSummaryStore2(s, t, u - 1, true);
        }, n);
      } else this.$FBRTCCallSummaryStore2(s, t, u - 1, true);
    } else t('Failed to lock');
  };
  e.exports = r;
}, null);

__d("FBRTCUtils", ["emptyFunction", "randomInt", "AsyncRequest"], function(a, b, c, d, e, f, g, h, i) {
  var j = 6000,
    k = {
      attachMediaStream: function(l, m) {
        if (window.webkitRTCPeerConnection) {
          l.src = window.webkitURL.createObjectURL(m);
        } else {
          l.mozSrcObject = m;
          l.play();
        }
      },
      reattachMediaStream: function(l, m) {
        if (window.webkitRTCPeerConnection) {
          l.src = m.src;
        } else {
          l.mozSrcObject = m.mozSrcObject;
          l.play();
        }
      },
      generateRandomInt: function() {
        return h(0, 4294967294) + 1;
      },
      aboutEqual: function(l, m) {
        return (l - m) < .01 && (m - l) < .01;
      },
      sendServerRequest: function(l, m, n, o, p, q) {
        m = m || g;
        n = n || g;
        o = o || false;
        p = p || j;
        q = q || {};
        var r = new i().setURI(l).setData(q).setAllowCrossPageTransition(true).setHandler(m).setErrorHandler(n).setTimeoutHandler(p, function() {
          n();
      ***REMOVED***;
        if (o) r.setOption('asynchronous', false);
        r.send();
      }
    };
  e.exports = k;
}, null);

__d("XVideoCallInitController", ["XController"], function(a, b, c, d, e, f) {
  e.exports = b("XController").create("\/videocall\/init\/", {
    peer_id: {
      type: "Int",
      required: true
    },
    call_id: {
      type: "Int",
      required: true
    },
    is_caller: {
      type: "Bool",
      defaultValue: false
    }
***REMOVED***;
}, null);

__d("XVideoCallController", ["XController"], function(a, b, c, d, e, f) {
  e.exports = b("XController").create("\/videocall\/incall\/", {
    peer_id: {
      type: "Int",
      required: true
    },
    call_id: {
      type: "Int"
    },
    is_caller: {
      type: "Bool",
      defaultValue: false
    }
***REMOVED***;
}, null);

__d("FBRTCUrlManager", ["FBRTCLogger", "FBRTCUtils", "XVideoCallInitController", "XVideoCallController", "emptyFunction"], function(a, b, c, d, e, f, g, h, i, j, k) {
  var l = 3,
    m = function(q, r, s) {
      g.getInstance().logCallAction(q, r, g.CallAction.OLD_URI);
      return j.getURIBuilder().setInt('peer_id', q).setInt('call_id', r).setBool('is_caller', s).getURI();
    },
    n = function(q, r, s, t, u, v) {
      if (v === (void 0) || v === null) v = l;
      var w = i.getURIBuilder().setInt('peer_id', q).setInt('call_id', r).setBool('is_caller', s).getURI();
      h.sendServerRequest(w, function(x) {
        t(x.payload.uri);
      }, function(x) {
        if (v > 0) {
          n(q, r, s, t, u, v - 1);
        } else t(m(q, r, s));
    ***REMOVED***;
    },
    o = function(q) {
      window.history.replaceState({}, '', q);
    },
    p = {
      init: function(q, r) {
        this._pendingUriUpdate = false;
        this._peerID = q.peerID;
        this._callID = q.callID;
        if (r) {
          this._connectedUri = r;
        } else this._connectedUri = m(this._peerID, this._callID);
      },
      setCallModel: function(q) {
        if (this._peerID !== q.peerID || this._callID !== q.callID) {
          this._peerID = q.peerID;
          this._callID = q.callID;
          this._connectedUri = null;
          n(this._peerID, this._callID, null, this._onNewConnectedUriSet.bind(this), k);
        }
      },
      onCallStarted: function() {
        if (this._connectedUri) {
          o(this._connectedUri);
        } else this._pendingUriUpdate = true;
      },
      onCallEnded: function() {
        o(m(this._peerID));
      },
      getCallUri: n,
      _onNewConnectedUriSet: function(q) {
        this._connectedUri = q;
        if (this._pendingUriUpdate) {
          o(q);
          this._pendingUriUpdate = false;
        }
      }
    };
  e.exports = p;
}, null);

__d("FBRTCCallUI", ["Cookie", "UserAgent", "FBRTCCallSummary", "FBRTCCallSummaryStore", "FBRTCConstants", "FBRTCLogger", "FBRTCUrlManager", "pageID"], function(a, b, c, d, e, f, g, h, i, j, k, l, m, n) {
  var o = null,
    p = {
      openAsCaller: function(q, r, s) {
        if (!o && window.rtcCallChildWindow) {
          o = window.rtcCallChildWindow;
          window.rtcCallChildWindow = null;
        }
        if (this._shouldFocusCallWindow(q)) {
          o.focus();
          return;
        }
        if (this._shouldCloseCallWindow()) o.close();
        l.getInstance().logCallAction(q, r, l.CallAction.START_CALL, null, s);
        var t = new i({
          peerID: q,
          callID: r,
          isCaller: true
      ***REMOVED***;
        t.onCallStarted(s);
        this._open(q, r, true, t, false);
      },
      openAsCallee: function(q, r, s, t) {
        this._open(q, r, false, s, t);
      },
      _shouldFocusCallWindow: function(q) {
        return o && !o.closed && o.rtcCallInProgessWith === q;
      },
      _shouldCloseCallWindow: function() {
        return o && !o.closed && !o.rtcCallInProgessWith;
      },
      _open: function(q, r, s, t, u) {
        g.clear('vcpwn');
        g.clear('vctid');
        var v = this._windowPosition(),
          w = ['menubar=no', 'location=no', 'scrollbars=no', 'status=no', 'personalbar=no', v.height, v.width, v.top, v.left].join(',');
        if (this._isSparkBrowser()) w = '';
        t.addExtraInfo(l.Key.INITIATED_BY_PAGE_ID, n);
        t.onCallEnded(k.CallEndReason.CLIENT_ERROR, false, true, 'PopupPending');
        t.save(j.getInstance());
        if (!u) {
          o = window.open('', 'Video Call', w);
          this._setUri(o, q, r, s);
        } else {
          l.getInstance().logCallAction(q, r, l.CallAction.OPEN_POPUP);
          o = window.open(u, 'Video Call', w);
        }
        if (window.focus) o.focus();
      },
      _setUri: function(q, r, s, t) {
        m.getCallUri(r, s, t, function(u) {
          l.getInstance().logCallAction(r, s, l.CallAction.OPEN_POPUP);
          q.location = u;
        }, function() {
          l.getInstance().logCallAction(r, s, l.CallAction.FAILED_GETTING_URI);
      ***REMOVED***;
      },
      _windowPosition: function() {
        var q = 933,
          r = 700,
          s, t, u, v;
        if (window.innerWidth !== (void 0)) {
          t = window.innerWidth;
          s = window.innerHeight;
        } else {
          t = screen.width;
          s = screen.height;
        }
        if (window.screenLeft !== (void 0)) {
          u = window.screenLeft;
          v = window.screenTop;
        } else {
          u = window.screenX;
          v = window.screenY;
        }
        var w = Math.floor(((t / 2) - (q / 2)) + u),
          x = Math.floor(((s / 2) - (r / 2)) + v);
        return {
          height: 'height=' + r.toString(),
          width: 'width=' + q.toString(),
          top: 'top=' + x.toString(),
          left: 'left=' + w.toString()
        };
      },
      _isSparkBrowser: function() {
        return h.isBrowser('Chrome < 34') && h.isBrowser('Chrome > 33');
      }
    };
  e.exports = p;
}, null);

__d("XBrowserNotSupportedDialogController", ["XController"], function(a, b, c, d, e, f) {
  e.exports = b("XController").create("\/videocall\/browser_not_supported\/", {
    user_id: {
      type: "Int"
    },
    warning: {
      type: "Bool",
      defaultValue: false
    },
    __asyncDialog: {
      type: "Int"
    }
***REMOVED***;
}, null);

__d("FBRTCSoundController", ["MercuryConfig", "Sound"], function(a, b, c, d, e, f, g, h) {
  var i = [g.ringtone_mp3_url, g.ringtone_ogg_url],
    j = {
      playIncomingRingtone: function(k, l, m) {
        var n = ['incoming_ringtone', k.toString(), l.toString()].join('_');
        h.play(i, n, m);
      },
      stopIncomingRingtone: function() {
        h.stop(i);
      }
    };
  e.exports = j;
}, null);

__d("FBRTCUnsupportedBrowserMessage", ["AsyncDialog", "AsyncRequest", "XBrowserNotSupportedDialogController", "FBRTCSoundController"], function(a, b, c, d, e, f, g, h, i, j) {
  var k = {
    _dialog: null,
    warnForOutgoingCall: function(l) {
      var m = i.getURIBuilder().setBool('warning', true).getURI();
      this._presentDialog(m, l);
    },
    showForOutgoingCall: function() {
      var l = i.getURIBuilder().getURI();
      this._presentDialog(l);
    },
    showForIncomingCall: function(l, m) {
      j.playIncomingRingtone(l, m, false);
      var n = i.getURIBuilder().setInt('user_id', m).getURI();
      this._presentDialog(n);
    },
    dismiss: function() {
      if (this._dialog) this._dialog.hide();
    },
    _presentDialog: function(l, m) {
      if (this._dialog) return;
      var n = new h(l);
      g.send(n, function(o) {
        this._dialog = o;
        o.subscribe('hide', function() {
          this._dialog = null;
          if (m) m();
        }.bind(this));
      }.bind(this));
    }
  };
  e.exports = k;
}, null);

__d("VideoCallSupport", ["ActiveXSupport", "ChannelConstants", "ChatVisibility", "FBRTCCore", "MercuryConfig", "UserAgent"], function(a, b, c, d, e, f, g, h, i, j, k, l) {
  var m = {
    isSkypeDeprecated: function() {
      return k.SkypeDeprecated;
    },
    isSendWebrtcSupported: function() {
      if (this.isSkypeDeprecated()) return k.SendNewVCGK;
      return k.SendNewVCGK && m.isWebrtcSupported();
    },
    isReceiveWebrtcSupported: function() {
      return k.ReceiveNewVCGK;
    },
    isSkypeCallSupported: function() {
      if (this.isSkypeDeprecated()) return false;
      if (l.isPlatform('Windows')) {
        if (l.isBrowser('IE >= 9') && l.isBrowserArchitecture('32')) {
          return g.isSupported();
        } else return ((l.isBrowser('IE >= 7') && l.isBrowserArchitecture('32')) || l.isBrowser('Firefox >= 3.6') || l.isBrowser('Chrome >= 5') || l.isBrowser('Opera >= 12'));
      } else if (l.isPlatform('Mac OS X > 10.5')) return (l.isEngine('WebKit >= 500') || l.isBrowser('Firefox >= 3.6') || l.isBrowser('Chrome >= 5') || l.isBrowser('Opera >= 12'));
      return false;
    },
    isVideoCallSupported: function() {
      return (m.isSendWebrtcSupported() || m.isSkypeCallSupported());
    },
    isPluginInstalled: function(p) {
      if (p === 'undefined') p = true;
      var q = false;
      if (m.isSkypeCallSupported())
        if (n()) {
          var r = null;
          try {
            r = new ActiveXObject('SkypeLimited.SkypeWebPlugin');
            q = !!r;
          } catch (s) {}
          r = null;
        } else q = o(p);
      return q;
    },
    isWebrtcSupported: function() {
      return j.isWebrtcSupported();
    },
    getCapabilities: function() {
      var p = 0;
      if (m.isReceiveWebrtcSupported() && i.isOnline()) p = h.CAPABILITY_VOIP_INTEROP;
      return p;
    }
  };

  function n() {
    return l.isBrowser('IE');
  }

  function o(p) {
    if (!navigator) return null;
    if (p) navigator.plugins.refresh(false);
    var q = navigator.mimeTypes['application/skypesdk-plugin'];
    return q && q.enabledPlugin;
  }
  e.exports = m;
}, null);

__d("RTISession", ["URI", "AjaxRequest", "copyProperties", "invariant", "ErrorUtils"], function(a, b, c, d, e, f, g, h, i, j, k) {
  'use strict';
  var l = '.facebook.com';

  function m(n, o, p, q, r, s, t, u, v) {
    j(n);
    j(q);
    j(r);
    this.domain = n;
    this.port = o;
    this.edgePoolName = p;
    this.stickyToken = q;
    this.loggedInId = r;
    this.accountId = s;
    this.clientProfile = t || 'desktop';
    this.clientId = u;
    this.capabilities = v;
  }
  m.prototype.issueRequest = function(n, o, p, q, r) {
    j(n);
    j(o);
    j(q);
    var s = this.domain.length - l.length,
      t = s > 0 && this.domain.indexOf(l, s) !== -1,
      u = t ? this.domain : this.domain + l,
      v = (1048576 * Math.random() | 0).toString(36),
      w = {
        cb: v,
        sticky_token: this.stickyToken,
        uid: this.loggedInId,
        viewer_uid: this.accountId,
        sticky_pool: this.edgePoolName,
        profile: this.clientProfile,
        clientid: this.clientId,
        cap: this.capabilities
      };
    for (var x in w) j(!o[x]);
    i(w, o);
    var y = new g(n).setDomain(u).setPort(this.port).setSecure(g().isSecure()).setQueryData(w),
      z = p ? 'POST' : 'GET',
      aa = new h(z, y);
    aa.timeout = r ? r * 1000 : 30000;
    if (aa.xhr) aa.xhr.withCredentials = true;
    var ba = {};
    aa.onSuccess = function() {};
    aa.onJSON = (function() {
      ba.data = aa.json;
      ba.error = null;
      k.applyWithGuard(q, this, [ba]);
  ***REMOVED***.bind(this);
    aa.onError = (function() {
      ba.data = null;
      ba.error = aa.errorType || 'error';
      k.applyWithGuard(q, this, [ba]);
  ***REMOVED***.bind(this);
    aa.send(JSON.stringify(p));
  };
  e.exports = m;
}, null);

__d("ChannelManager", ["AjaxRequest", "Arbiter", "AsyncRequest", "ChannelConstants", "ChannelInitialData", "ChannelSubdomain", "ChannelTransport", "ChatVisibility", "DTSG", "Env", "FBAjaxRequest", "ISB", "JSLogger", "MessagingRealtimeConstants", "MovingStat", "PresenceCookieManager", "PresenceState", "PresenceUtil", "SystemEvents", "URI", "UserActivity", "VideoCallSupport", "RTISession", "copyProperties", "createArrayFromMixed", "setIntervalAcrossTransitions", "setTimeoutAcrossTransitions", "WebStorage"], function(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, w, x, y, z, aa, ba, ca, da, ea, fa, ga) {
  var ha = b('WebStorage').getSessionStorage(),
    ia = 'chproxy_base_sess',
    ja, ka = s.create('channel'),
    la = null;

  function ma(ya) {
    la = ya;
  }
  var na = {
      idle: {
        ok: 'init!'
      },
      init: {
        ok: 'pull!',
        error: 'reconnect',
        sys_online: 'init',
        sys_timetravel: 'init'
      },
      pull: {
        ok: 'pull!',
        error: 'ping',
        error_missing: 'pull',
        error_msg_type: 'pull',
        refresh_0: 'reconnect',
        refresh_110: 'reconnect',
        refresh_111: 'reconnect',
        refresh_112: 'pull',
        refresh_113: 'pull',
        refresh_117: 'reconnect'
      },
      ping: {
        ok: 'pull!',
        error: 'ping',
        error_stale: 'reconnect!'
      },
      reconnect: {
        ok: 'init!',
        error: 'reconnect',
        sys_online: 'reconnect',
        sys_timetravel: 'reconnect'
      },
      shutdown: {},
      _all: {
        error_max: 'shutdown!',
        error_shutdown: 'shutdown!',
        sys_owner: 'reconnect',
        sys_nonowner: 'idle!',
        sys_online: 'ping',
        sys_offline: 'idle!',
        sys_timetravel: 'ping'
      }
    },
    oa = {
      reconnectOverrideTimeMillis: Date.now(),
      userActive: Date.now(),
      lastPresenceState: null,
      lastRequestErrorReason: null,
      fantail_logs: [],
      sessionID: (Math.random() * 2147483648 | 0).toString(16),
      capabilities: ba.getCapabilities(),
      streamingCapable: false,
      inStreaming: false,
      LONGPOLL_TIMEOUT: 60000,
      STREAMING_TIMEOUT: 60000,
      P_TIMEOUT: 30000,
      IFRAME_LOAD_TIMEOUT: 30000,
      MIN_RETRY_INTERVAL: 5000,
      MAX_RETRY_INTERVAL: 320000,
      MIN_12002_TIMEOUT: 9000,
      MIN_504_TIMEOUT: 20000,
      STALL_THRESHOLD: 180000,
      JUMPSTART_THRESHOLD: 90000,
      MIN_INIT_PROBE_DELAY: 3000,
      INIT_PROBE_DELAY_RANDOMIZE_RANGE: 12000,
      CHANNEL_PROXY_REPORTING_MIN_INTERVAL: 10000,
      PROBE_DELAY: 60000,
      PROBE_HEARTBEATS_INTERVAL_LOW: 1000,
      PROBE_HEARTBEATS_INTERVAL_HIGH: 5000,
      STREAMING_EXIT_STATE_ON_CONTINUE: false,
      FANTAIL_QUEUE_CAPACITY: 50
    },
    pa = {
      MAX_CONTINUOUS_PULL_FAILS: 3,
      enabled: false,
      uptimeMillis: Date.now(),
      timeInGoodStatesStartMillis: Date.now(),
      timeInGoodStatesMillis: 0,
      initialized: false,
      firstPullSentTimeMillis: Date.now(),
      accumulatedPullTimeMillis: 0,
      pullStartTimeMillis: 0,
      pingCount: 0,
      pullCount: 0,
      continuousPullFails: 0,
      getTimeSinceFirstPullSentSeconds: function() {
        return (Date.now() - this.firstPullSentTimeMillis) / 1000;
      },
      getUptimeSeconds: function() {
        return (Date.now() - this.uptimeMillis) / 1000;
      },
      getAccumulatedPullTimeSeconds: function() {
        var ya = this.accumulatedPullTimeMillis,
          za = Date.now();
        if (this.pullStartTimeMillis > 0 && za - this.pullStartTimeMillis <= oa.LONGPOLL_TIMEOUT) ya += (za - this.pullStartTimeMillis);
        var ab = ya / 1000;
        if (ab >= this.getTimeSinceFirstPullSentSeconds()) this.initialize();
        return ab;
      },
      getPingToPullRatio: function() {
        return this.pullCount === 0 ? 0 : this.pingCount / this.pullCount;
      },
      reportPullSent: function() {
        if (!this.enabled) return;
        if (!this.initialized) this.initialize();
        this.pullStartTimeMillis = Date.now();
      },
      initialize: function() {
        this.initialized = true;
        this.firstPullSentTimeMillis = Date.now();
        this.pullStartTimeMillis = 0;
        this.accumulatedPullTimeMillis = 0;
        this.pingCount = 0;
        this.pullCount = 0;
        this.timeInGoodStatesStartMillis = Date.now();
        this.timeInGoodStatesMillis = 0;
        this.uptimeMillis = Date.now();
      },
      reportPullReturned: function(ya, za) {
        if (!this.enabled) return;
        if (this.pullStartTimeMillis > 0) {
          this.accumulatedPullTimeMillis += (Date.now() - this.pullStartTimeMillis);
          if (ya) {
            this.pullCount++;
            this.continuousPullFails = 0;
          } else this.continuousPullFails++;
        }
        this.pullStartTimeMillis = 0;
      },
      reportPingSent: function() {
        if (!this.enabled) return;
        this.pingCount++;
      },
      isGoodState: function(ya) {
        return ya.indexOf('pull') === 0 || ya.indexOf('init') === 0 || ya.indexOf('idle') === 0;
      },
      getTotalTimeInGoodStatesSeconds: function() {
        var ya = this.timeInGoodStatesMillis;
        if (this.timeInGoodStatesStartMillis > 0) ya += (Date.now() - this.timeInGoodStatesStartMillis);
        return ya / 1000;
      },
      clientEnteredState: function(ya) {
        if (!this.enabled) return;
        var za = this.isGoodState(ya);
        if (za && this.timeInGoodStatesStartMillis === 0) {
          this.timeInGoodStatesStartMillis = Date.now();
        } else if (!za && this.timeInGoodStatesStartMillis > 0) {
          this.timeInGoodStatesMillis = Date.now() - this.timeInGoodStatesStartMillis;
          this.timeInGoodStatesStartMillis = 0;
        }
      },
      transportEnteredState: function(ya) {
        if (!this.enabled) return;
        if (ya.indexOf('pull') === 0) {
          this.reportPullSent();
        } else if (ya.indexOf('ping') === 0 && oa.lastRequestErrorReason !== j.SYS_TIMETRAVEL && oa.lastRequestErrorReason !== j.SYS_ONLINE && oa.lastRequestErrorReason !== j.SYS_OWNER && oa.lastRequestErrorReason !== j.SYS_NONOWNER) this.reportPingSent();
      },
      doSerialize: function() {
        if (!this.enabled) return "";
        return (this.getTimeSinceFirstPullSentSeconds()).toFixed(0) + ',' + (this.getAccumulatedPullTimeSeconds()).toFixed(0) + ',' + (this.getPingToPullRatio()).toFixed(3) + ',' + (this.getUptimeSeconds()).toFixed(0) + ',' + (this.getTotalTimeInGoodStatesSeconds()).toFixed(0);
      }
    },
    qa = 1,
    ra = {},
    sa = 0;

  function ta() {
    return i.lastSuccessTime ? Math.round((Date.now() - i.lastSuccessTime) / 1000) : -1;
  }

  function ua() {
    var ya = {};
    if (ja.getConfig('host')) ya[ja.getConfig('user_channel')] = ja.getConfig('seq', 0);
    return ya;
  }

  function va() {
    var ya = Date.now(),
      za = Date.now(),
      ab = {
        total: 0
      },
      bb = 'idle',
      cb = false;
    y.subscribe([y.USER, y.ONLINE, y.TIME_TRAVEL], function(fb, gb) {
      xa(true);
      za = null;
      ja.lastPullTime = Date.now();
      var hb;
      switch (fb) {
        case y.USER:
          hb = y.isPageOwner() ? j.SYS_OWNER : j.SYS_NONOWNER;
          break;
        case y.ONLINE:
          hb = gb ? j.SYS_ONLINE : j.SYS_OFFLINE;
          break;
        case y.TIME_TRAVEL:
          hb = j.SYS_TIMETRAVEL;
          break;
      }
      ja.exitState({
        status: hb,
        stateId: qa
    ***REMOVED***;
  ***REMOVED***;
    var db = function(fb, gb) {
      var hb = Date.now(),
        ib;
      if (gb) {
        ya = hb;
        ib = gb.nextState || gb.state;
      } else ib = bb;
      y.checkTimeTravel();
      if (za) {
        var jb = Math.round((hb - za) / 1000);
        if (jb > 0) {
          ab[bb] = (ab[bb] || 0) + jb;
          ab.total += jb;
        }
      }
      bb = ib;
      za = hb;
      if (!fb) {
        ab.lastSuccessTime = ta();
        ab.online = y.isOnline();
        ka.log('rollup', ab);
      }
    };
    h.subscribe(j.ON_ENTER_STATE, db);
    fa(db, 60000);
    h.subscribe(s.DUMP_EVENT, function(fb, gb) {
      gb.channelRollup = ab;
  ***REMOVED***;
    var eb = function() {
      if (ja.isShutdown() || ja.shouldIdle()) return;
      y.checkTimeTravel();
      var fb = Date.now() - (ja.lastPullTime || p.start);
      if (!cb && fb > oa.STALL_THRESHOLD) {
        var gb = ta();
        ka.error('stall', {
          lastSuccessTime: gb,
          rollupState: bb
      ***REMOVED***;
        cb = true;
      }
      var hb = Date.now() - ya;
      if (ja.state == 'pull' && hb > oa.JUMPSTART_THRESHOLD) {
        ya = null;
        ka.warn('jumpstart', {
          state: ja.state,
          dormant: hb
      ***REMOVED***;
        ja.enterState('init');
      }
    };
    fa(eb, 10000);
  }

  function wa() {
    var ya = Date.now(),
      za = 1;

    function ab() {
      ga(ab, za * 1000);
      var fb = ja.state;
      if (fb == 'idle' && ja.shouldIdle()) return;
      ka.bump('conn_t', za);
      if (fb == 'pull') ka.bump('conn_t_pull', za);
    }
    ab();
    var bb = [15, 30, 60, 120, 240],
      cb = false,
      db = false;

    function eb(fb) {
      ga(function() {
        ka.rate('pullenter_' + fb, cb);
        ka.rate('pullexit_' + fb, db);
      }, fb * 1000);
    }
    while (bb.length) eb(bb.shift());
    h.subscribe(j.ON_ENTER_STATE, function(fb, gb) {
      if (gb.state == 'pull') cb = true;
      ya = Date.now();
  ***REMOVED***;
    h.subscribe(j.ON_EXIT_STATE, function(fb, gb) {
      if (gb.state != 'pull' || !ya) return;
      var hb = 'other';
      if (gb.status == j.OK) {
        db = true;
        hb = 'ok';
      } else if (gb.xhr && gb.xhr.errorType) {
        hb = /ar:(\w+)/.test(gb.xhr.errorType) && RegExp.$1;
      } else if (/^sys_/.test(gb.status)) return;
      var ib = (Date.now() - ya) / 1000;
      if (ib < 0) {
        return;
      } else if (ib > 3600) ib = 3600;
      ka.bump('conn_num');
      ka.bump('conn_exit', ib);
      ka.bump('conn_num_' + hb);
      ka.bump('conn_exit_' + hb, ib);
  ***REMOVED***;
  }

  function xa(ya) {
    if (ya) {
      sa = 0;
      ra = {};
    } else sa++;
  }
  ja = {
    state: 'idle',
    nextState: null,
    proxyDown: false,
    lastPullTime: Date.now(),
    lastReportOnMisguidedMsgTime: Date.now(),
    heartbeats: [],
    setTestCallback: ma,
    backoff: false,
    init: function(ya) {
      this.init = function() {};
      this._logFantail('client initialized', j.FANTAIL_INFO);
      var za = !!oa.use_sticky_session,
        ab = null;
      if (za && ha) {
        for (var bb = 0; bb < ha.length; bb++) {
          var cb = ha.key(bb);
          if (cb.indexOf(ia) === 0) {
            ab = ha.getItem(cb);
            break;
          }
        }
        if (!ab) {
          ab = oa.sessionID;
          ha.setItem(ia, ab);
        }
      }
      var db = !!oa.send_active_when_offline;
      if (!db && !n.isOnline()) oa.userActive = 0;
      pa.enabled = !!oa.watchdog_enabled;
      oa.watchdog = pa;
      if (typeof(aa) != 'undefined') {
        aa.subscribe(function() {
          if (db || n.isOnline()) oa.userActive = Date.now();
          if (!!oa.web_sends_active_ping) m.sendActivePing(oa);
        }.bind(this));
      } else ka.error('user_activity_undefined');
      v.register('ch', ua);
      var eb = this.getConfig('max_conn', 2);
      oa.subdomain = l.allocate(eb);
      if (ab && ab.length && ab.trim()) oa.sessionID = ab;
      this._logFantail('using session id: ' + oa.sessionID, j.FANTAIL_INFO);
      this._transportRate = new u(30000);
      var fb = (g.supportsCORS() && !oa.forceIframe) ? 'CORSTransport' : 'IframeTransport';
      this.transport = new m[fb](this);
      if (ya) this.enterState.apply(this, arguments);
      h.subscribe(s.DUMP_EVENT, function(event, hb) {
        hb.transportRate = this._transportRate.tally();
        hb.transportType = fb;
        hb.transportVersion = 2;
      }.bind(this));
      va();
      wa();
      if (ja.getConfig('tryStreaming') && ja.getConfig('host') && g.supportsCORS() && !oa.forceIframe) {
        var gb = oa.MIN_INIT_PROBE_DELAY + Math.random() * oa.INIT_PROBE_DELAY_RANDOMIZE_RANGE;
        ga(this._probeTest, gb);
      }
    },
    configure: function() {
      var ya = ea(arguments);
      ka.log('configure', ya);
      ya.forEach(da.bind(null, oa));
      h.inform(j.ON_CONFIG, this);
    },
    getConfig: function(ya, za) {
      return ya in oa ? oa[ya] : za;
    },
    getCompleteConfig: function() {
      return oa;
    },
    getWatchdog: function() {
      return pa;
    },
    isShutdown: function() {
      return this.state == 'shutdown';
    },
    shouldIdle: function() {
      return !(y.isPageOwner() && y.isOnline());
    },
    _sendIframeError: function(ya) {
      var za = new i().setURI('/ajax/presence/reconnect.php').setData({
        reason: ya,
        fb_dtsg: o.getToken()
    ***REMOVED***.setOption('suppressErrorHandlerWarning', true).setOption('retries', 1).setMethod('GET').setReadOnly(true).setAllowCrossPageTransition(true);
      za.specifiesWriteRequiredParams() && za.send();
    },
    _getDelay: function() {
      var ya = Math.min(oa.MIN_RETRY_INTERVAL * Math.pow(2, Math.max(0, sa - 1)), oa.MAX_RETRY_INTERVAL);
      if (this.proxyDown && 'proxy_down_delay_millis' in oa) ya = oa.proxy_down_delay_millis;
      this.proxyDown = false;
      return Math.floor(ya * (1 + Math.random() * .5));
    },
    enterState: function() {
      if (this._inEnterState) ka.warn('enterstate_recursion');
      this._inEnterState = true;
      try {
        this._enterState.apply(this, arguments);
        this._inEnterState = false;
      } catch (ya) {
        this._inEnterState = false;
        throw ya;
      }
    },
    _enterState: function(ya) {
      if ((ya.indexOf('pull') === 0 || ya.indexOf('ping') === 0 || ya.indexOf('shutdown') === 0) && !!oa.active_config_refresh) {
        var za = Date.now(),
          ab = (za - oa.reconnectOverrideTimeMillis) / 1000;
        if ('config_refresh_seconds' in oa && oa.config_refresh_seconds > 0 && ab > oa.config_refresh_seconds) {
          ya = 'reconnect';
          this._logFantail('forcing reconnect to refresh config' + ' - this is normal behavior', j.FANTAIL_DEBUG);
        }
      }
      if (ya.indexOf('reconnect') === 0) oa.reconnectOverrideTimeMillis = Date.now();
      var bb = this.backoff ? this._getDelay() : 0;
      this.backoff = false;
      var cb = ea(arguments);
      if (this.isShutdown()) {
        this._logFantail('not executing state due to shutdown mode: ' + ya, j.FANTAIL_WARN);
        return;
      }
      if (ya != 'idle!' && this.shouldIdle()) {
        this._logFantail('forced idleness', j.FANTAIL_WARN);
        return;
      }
      qa++;
      oa.stateId = qa;
      clearTimeout(this._deferredTransition);
      this._deferredTransition = null;
      this.transport.enterState('idle');
      this.state = 'idle';
      this.nextState = null;
      if (/!$/.test(ya)) {
        var db = this._transportRate.tally().timeAverage,
          eb = ja.getConfig('MAX_CHANNEL_STATES_PER_SEC', 1);
        if (db >= eb) {
          if (!this._throttled) {
            this._throttled = true;
            ka.warn('throttled');
          }
          ka.bump('throttle');
          bb = 1000 / eb;
        }
      } else if (!(/#$/.test(ya))) bb = this._getDelay();
      ya = ya.replace(/\W*$/, '');
      if (!na[ya]) {
        this._logFantail('invalid state: ' + ya, j.FANTAIL_ERROR);
        throw new Error('invalid state:' + ya);
      }
      var fb;
      if (bb <= 0) {
        fb = {
          state: ya
        };
        this._transportRate.add(1);
        this.state = ya;
        var gb = this['_enter_' + this.state];
        if (gb) {
          cb.shift();
          gb.apply(this, cb);
        }
        if (/init|idle|pull|ping/.test(this.state)) {
          if (oa.streamingCapable && /pull/.test(this.state)) this.heartbeats = [];
          pa.transportEnteredState(ya);
          pa.clientEnteredState(ya);
          oa.is_offline = !n.isOnline();
          oa.capabilities = ba.getCapabilities();
          this._logFantail('entering transport state: ' + this.state, j.FANTAIL_INFO);
          this.transport.enterState(this.state, oa);
          if (this.state == 'ping') {
            fb.url = m.getURI(oa).toString();
            fb.port = oa.port || 'undefined';
          }
        }
      } else {
        this.state = 'idle';
        this.nextState = ya;
        fb = {
          state: this.state,
          delay: bb,
          nextState: ya
        };
        cb[0] = ya + '#';
        this._deferredTransition = ga((function() {
          this._deferredTransition = null;
          this.enterState.apply(this, cb);
      ***REMOVED***.bind(this), bb);
      }
      if (/pull/.test(ya)) {
        fb.client_id = oa.sessionID;
        fb.streaming = oa.inStreaming;
      }
      ka.log('enter_' + this.state, fb);
      h.inform(j.ON_ENTER_STATE, fb);
    },
    exitState: function(ya, za) {
      var ab = ya.stateId,
        bb = ya.status;
      if ((bb == j.SYS_TIMETRAVEL || bb == j.SYS_ONLINE || bb == j.SYS_NONOWNER || bb == j.SYS_OWNER) && pa) pa.initialize();
      if (this.isShutdown() || ab < qa) return;
      var cb = ea(arguments),
        db = this.state;
      cb[0] = ya.status;
      var eb = {
        state: db,
        status: bb
      };
      if (/pull/.test(db)) {
        eb.client_id = oa.sessionID;
        eb.streaming = oa.inStreaming;
      }
      if (/ping/.test(db) && bb != j.OK) eb.url = m.getURI(oa).toString();
      if (this.nextState) eb.nextState = this.nextState;
      if (za && za.errorType) {
        oa.lastRequestErrorReason = za.errorType;
        eb.xhr = za.toJSON ? za.toJSON() : za;
        if (za.errorType == g.SERVICE_UNAVAILABLE) {
          this._logFantail('got 5xx http status code, setting long delay', j.FANTAIL_ERROR);
          this.proxyDown = true;
        }
        delete eb.xhr.json;
      } else if (bb != j.OK) oa.lastRequestErrorReason = bb;
      if (za && za.json) {
        if (za.json.t) eb.t = za.json.t;
        if (za.json.reason) eb.reason = za.json.reason;
        if (za.json.seq) eb.seq = za.json.seq;
      }
      ka.log('exit_' + db, eb);
      h.inform(j.ON_EXIT_STATE, eb);
      var fb = this['_exit_' + db];
      if (fb) bb = fb.apply(this, cb) || bb;
      if (bb != j.OK) {
        xa();
        ra[db] = (ra[db] || 0) + 1;
      }
      var gb = na[this.nextState || db][bb] || na._all[bb],
        hb = gb && gb.replace(/!*$/, '');
      if (!hb) {
        ka.error('terminal_transition', eb);
        this._shutdownHint = j.HINT_INVALID_STATE;
        gb = 'shutdown!';
        this._logFantail('entering shutdown state', j.FANTAIL_ERROR);
      }
      this._lastState = db;
      this._lastStatus = bb;
      this.enterState(gb);
    },
    _processTransportData: function(ya, za) {
      var ab = za.json,
        bb = ab.t;
      if ('s' in ab) {
        ab.seq = ab.s;
        delete ab.s;
      }
      if (ab.u && oa.user && ab.u != oa.user) {
        ka.warn('misguided_msg', {
          user: oa.user,
          target: ab.u
      ***REMOVED***;
        this._reportProxyMisguidedMsg(ab.u, oa.user);
        return;
      }
      var cb = oa.seq;
      if ('seq' in ab) {
        oa.seq = ab.seq;
        w.doSync();
      }
      switch (bb) {
        case 'continue':
          if (oa.inStreaming && this.heartbeats.length < 1) {
            oa.streamingCapable = false;
            ka.log('switch_to_longpoll');
            ga(this._probeTest, oa.PROBE_DELAY);
          }
          xa(true);
          if (!oa.inStreaming || oa.STREAMING_EXIT_STATE_ON_CONTINUE) this.exitState({
            status: j.OK,
            stateId: ya
        ***REMOVED***;
          break;
        case 'refresh':
        case 'refreshDelay':
          this._logFantail('got refresh with reason: ' + ab.reason, j.FANTAIL_INFO);
          this.exitState({
            status: 'refresh_' + (ab.reason || 0),
            stateId: ya
          }, za);
          break;
        case 'backoff':
          this._logFantail('server told client to back off', j.FANTAIL_WARN);
          xa();
          this.backoff = true;
          break;
        case 'lb':
          var db = ab.lb_info;
          if (db) {
            oa.sticky_token = db.sticky;
            if ('pool' in db) {
              oa.sticky_pool = db.pool;
            } else oa.host = db.vip;
            if (g.supportsCORS() && !oa.forceIframe) {
              var eb = oa.subdomain === null ? oa.host : (oa.subdomain + '-' + oa.host),
                fb = new ca(eb, oa.port, oa.sticky_pool, oa.sticky_token, oa.uid, oa.viewer_uid, oa.profile, oa.sessionID, oa.capabilities);
              h.inform(j.RTI_SESSION, fb);
            }
          } else ka.error('bad lb info');
          break;
        case 'test_streaming':
          ga(this._probeTest, 500);
          break;
        case 'fullReload':
          v.clear();
          ka.log('invalid_history');
          h.inform(j.ON_INVALID_HISTORY);
          xa(true);
          this._logFantail('full reload incurred', j.FANTAIL_INFO);
          this.exitState({
            status: j.ERROR_MISSING,
            stateId: ya
          }, za);
          break;
        case 'msg':
          var gb, hb, ib, jb;
          xa(true);
          if ('tr' in ab) oa.trace_id = ab.tr;
          hb = ab.ms;
          ib = oa.seq - hb.length;
          for (gb = 0; gb < hb.length; gb++, ib++)
            if (ib >= cb) {
              jb = hb[gb];
              if (jb.type) {
                var kb = j.getArbiterType(jb.type);
                if (jb.type === 'messaging') {
                  var lb = {
                    type: 'messaging',
                    event: jb.event
                  };
                  if (jb.message) {
                    lb.inbox_unread = jb.unread_counts && jb.unread_counts.inbox;
                    lb.tid = jb.message.tid;
                    lb.mid = jb.message.mid;
                    this._logFantail('got message with id: ' + jb.message.mid, j.FANTAIL_INFO);
                  }
                  ka.debug('message', lb);
                } else if (jb.type === 'm_messaging') {
                  ka.debug('message', {
                    type: 'm_messaging',
                    tid: jb.tid,
                    mid: jb.uuid
                ***REMOVED***;
                } else if (jb.type === 'pages_messaging') {
                  if (jb.unread_counts && jb.unread_counts.inbox) h.inform(j.getArbiterType('pages_inbox_count_update'), {
                    page_id: jb[t.VIEWER_FBID],
                    inbox_unread: jb.unread_counts.inbox
                ***REMOVED***;
                } else if (jb.type === 'skywalker') {
                  kb = j.SKYWALKER;
                } else ka.debug('message', {
                  type: jb.type
              ***REMOVED***;
                h.inform(kb, {
                  obj: jb
              ***REMOVED***;
              }
            } else ka.warn('seq_regression', {
              seq: ib,
              last_seq: cb,
              messages: hb.length
          ***REMOVED***;
          break;
        case 'heartbeat':
          if (oa.inStreaming) {
            var mb = Date.now();
            if (this.heartbeats.length > 0) {
              var nb = mb - this.heartbeats[this.heartbeats.length - 1];
              ka.log('heartbeat_interval', {
                client_id: oa.sessionID,
                interval: nb
            ***REMOVED***;
            }
            this.heartbeats.push(mb);
          }
          break;
        default:
          this._logFantail('got an unknown protocol message: ' + bb, j.FANTAIL_ERROR);
          ka.error('unknown_msg_type', {
            type: bb
        ***REMOVED***;
          break;
      }
    },
    _enter_init: function() {
      if (ra.init >= ja.getConfig('MAX_INIT_FAILS', 2)) return setTimeout(this.exitState.bind(this, {
        status: j.ERROR_MAX,
        stateId: qa
    ***REMOVED***, 0);
      this._initTimer = ga(this.exitState.bind(this, {
        status: j.ERROR,
        stateId: qa
      }, 'timeout'), oa.IFRAME_LOAD_TIMEOUT);
    },
    _enter_reconnect: function(ya) {
      this._logFantail('entered reconnect with reason: ' + ya, j.FANTAIL_INFO);
      var za = qa;
      if (!x.hasUserCookie()) {
        this._logFantail('user has no cookie???', j.FANTAIL_WARN);
        ka.warn('no_user_cookie');
        setTimeout(function() {
          ja._shutdownHint = j.HINT_AUTH;
          ja.exitState({
            status: j.ERROR_SHUTDOWN,
            stateId: za
        ***REMOVED***;
        }, 0);
        return;
      }
      var ab = {
        reason: ya,
        fb_dtsg: o.getToken()
      };
      if (r.token) ab.fb_isb = r.token;
      if (la) la(ab);
      var bb = new q('GET', '/ajax/presence/reconnect.php', ab);
      bb.onSuccess = (function() {
        ja.configure(bb.json);
        v.store();
        this.exitState({
          status: j.OK,
          stateId: za
      ***REMOVED***;
    ***REMOVED***.bind(this);
      bb.onError = (function() {
        var cb = bb.json && bb.json.error;
        this._logFantail('reconnect error: ' + bb.errorType, j.FANTAIL_ERROR);
        if (bb.errorType == g.TRANSPORT_ERROR || bb.errorType == g.PROXY_ERROR || bb.errorType == g.SERVICE_UNAVAILABLE) this._shutdownHint = j.HINT_CONN;
        if (cb && cb == 1356007) {
          this._shutdownHint = j.HINT_MAINT;
        } else if (cb == 1357001 || cb == 1357004 || cb == 1348009) {
          this._shutdownHint = j.HINT_AUTH;
        } else this._shutdownHint = null;
        this.exitState({
          status: this._shutdownHint ? j.ERROR_SHUTDOWN : j.ERROR,
          stateId: za
        }, bb);
    ***REMOVED***.bind(this);
      bb.send();
    },
    _enter_shutdown: function() {
      h.inform(j.ON_SHUTDOWN, {
        reason: this._shutdownHint
    ***REMOVED***;
      if (!!oa.shutdown_recovery_enabled && 'shutdown_recovery_interval_seconds' in oa && oa.shutdown_recovery_interval_seconds > 0) {
        var ya = oa.shutdown_recovery_interval_seconds * 1000;
        ga((function() {
          h.inform(j.ATTEMPT_RECONNECT);
          this.state = 'reconnect!';
          this.enterState('reconnect!');
      ***REMOVED***.bind(this), ya);
      }
    },
    _exit_init: function(ya) {
      if (this._initTimer) this._initTimer = clearTimeout(this._initTimer);
      if (ya == j.ERROR_MAX) this._sendIframeError(j.reason_IFrameLoadGiveUp);
    },
    _exit_pull: function(ya, za) {
      var ab = ya == j.OK;
      pa.reportPullReturned(ab, this);
      if (ab) {
        this.lastPullTime = Date.now();
      } else {
        var bb = "exit status: " + ya;
        if (za && za.errorType) bb += " ajax request error: " + za.errorType;
        this._logFantail('pull failed with status: ' + bb, j.FANTAIL_ERROR);
      }
    },
    _exit_ping: function(ya) {
      if (ya == j.OK) {
        var za = Date.now() - (this.lastPullTime || p.start);
        if (za > oa.STALL_THRESHOLD) {
          this._logFantail('didnt complete a successful pull for too long', j.FANTAIL_ERROR);
          return j.ERROR_STALE;
        }
      } else this._logFantail('ping failed with status: ' + ya, j.FANTAIL_ERROR);
    },
    _reportProxyMisguidedMsg: function(ya, za) {
      this._logFantail('misguided message to ' + za + ' meant for ' + ya, j.FANTAIL_ERROR);
      var ab = Date.now();
      if (ab - this.lastReportOnMisguidedMsgTime <= oa.CHANNEL_PROXY_REPORTING_MIN_INTERVAL) return;
      this.lastReportOnMisguidedMsgTime = ab;
      var bb = {
        received_uid: ya,
        expected_uid: za
      };
      if (oa.sticky_token) bb.sticky_token = oa.sticky_token;
      var cb = new z('/err_misguided_msg').setDomain(oa.host + '.facebook.com').setPort(oa.port).setSecure(z().isSecure()).setQueryData(bb),
        db = new g('GET', cb);
      if (g.supportsCORS()) db.xhr.withCredentials = true;
      db.onSuccess = function(eb) {};
      db.onError = function(eb) {};
      db.onJSON = function(eb, fb) {};
      db.send();
    },
    _probeTest: function() {
      oa.streamingCapable = false;
      var ya = [],
        za = {
          mode: 'stream',
          format: 'json'
        };
      if (oa.sticky_token) za.sticky_token = oa.sticky_token;
      var ab = new z('/probe').setDomain(oa.host + '.facebook.com').setPort(oa.port).setSecure(z().isSecure()).setQueryData(za),
        bb = new g('GET', ab);
      bb.onJSON = function(cb, db) {
        if (cb && cb.json && cb.json.t === 'heartbeat') {
          ya.push(Date.now());
          if (ya.length >= 2) {
            var eb = ya[1] - ya[0];
            if (eb >= oa.PROBE_HEARTBEATS_INTERVAL_LOW && eb <= oa.PROBE_HEARTBEATS_INTERVAL_HIGH) {
              oa.streamingCapable = true;
              ka.log('switch_to_streaming');
            }
            ka.log('probe_ok', {
              time: eb
          ***REMOVED***;
          }
        }
      };
      bb.onSuccess = function(cb) {
        if (ya.length != 2) {
          oa.streamingCapable = false;
          ka.error('probe_error', {
            error: 'beats.length = ' + ya.length
        ***REMOVED***;
        }
      };
      bb.onError = function(cb) {
        oa.streamingCapable = false;
        ka.error('probe_error', cb);
      };
      ka.log('probe_request');
      bb.send();
    },
    _logFantail: function(ya, za) {
      var ab = oa.fantail_queue_capacity || oa.FANTAIL_QUEUE_CAPACITY;
      if (!oa.fantail_enabled || oa.fantail_logs.length > ab) return;
      var bb = 'fantail queue size exceeded',
        cb = j.FANTAIL_WARN;
      if (oa.fantail_logs.length < ab) {
        bb = ya;
        cb = za;
      }
      var db = oa.fantail_logs.length,
        eb = {};
      eb['time' + db] = Date.now();
      eb['log' + db] = bb;
      eb['severity' + db] = cb;
      oa.fantail_logs.push(eb);
    }
  };
  e.exports = ja;
  if (k.channelConfig) {
    ja.configure(k.channelConfig);
    if (/shutdown/.test(k.state)) ja._shutdownHint = j[k.reason];
    ja.init(k.state, k.reason);
  }
}, null);

__d("ChannelConnection", ["Arbiter", "copyProperties", "ChatConfig", "Run", "SystemEvents", "ChannelConstants", "ChannelManager", "JSLogger", "setTimeoutAcrossTransitions"], function(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o) {
  var p = n.create('channel_connection'),
    q = null,
    r = null,
    s = null,
    t = null,
    u = 0,
    v = h(new g(), {
      CONNECTED: 'chat-connection/connected',
      RECONNECTING: 'chat-connection/reconnecting',
      SHUTDOWN: 'chat-connection/shutdown',
      MUTE_WARNING: 'chat-connection/mute',
      UNMUTE_WARNING: 'chat-connection/unmute'
  ***REMOVED***;

  function w() {
    if (r) {
      clearTimeout(r);
      r = null;
    }
  }

  function x() {
    w();
    p.log('unmute_warning');
    v.inform(v.UNMUTE_WARNING);
  }

  function y(ba) {
    w();
    r = o(x, ba);
    p.log('mute_warning', {
      time: ba
  ***REMOVED***;
    v.inform(v.MUTE_WARNING);
  }

  function z() {
    if (s) {
      clearTimeout(s);
      s = null;
    }
  }

  function aa(ba, ca) {
    z();
    if (ba === l.ON_ENTER_STATE && (ca.nextState || ca.state) === 'pull') {
      if (t !== v.CONNECTED) {
        p.log('connected');
        var da = !t;
        t = v.CONNECTED;
        u = 0;
        v.inform(v.CONNECTED, {
          init: da
      ***REMOVED***;
      }
    } else if (ba === l.ON_ENTER_STATE && ((ca.nextState || ca.state) === 'ping' || (!ca.nextState && ca.state === 'idle'))) {
      s = o(function() {
        var ea = null;
        if (!(ca.state === 'idle' && !ca.nextState)) ea = (ca.delay || 0);
        p.log('reconnecting', {
          delay: ea
      ***REMOVED***;
        if (v.disconnected()) p.log('reconnecting_ui', {
          delay: ea
      ***REMOVED***;
        t = v.RECONNECTING;
        (ca.state === 'idle') && u++;
        if (u > 1) {
          v.inform(v.RECONNECTING, ea);
        } else if (!ca.nextState && ca.state === 'idle') aa(ba, ca);
      }, 500);
    } else if (ba === l.ON_SHUTDOWN) {
      p.log('shutdown', {
        reason: ca.reason
    ***REMOVED***;
      t = v.SHUTDOWN;
      u = 0;
      v.inform(v.SHUTDOWN, ca.reason);
    }
  }
  if (m.isShutdown()) {
    aa(l.ON_SHUTDOWN, m._shutdownHint);
  } else aa(l.ON_ENTER_STATE, {
    state: m.state,
    nextState: m.nextState,
    delay: 0
***REMOVED***;
  h(v, {
    disconnected: function() {
      return t === v.SHUTDOWN || (t === v.RECONNECTING && !r && u > 1);
    },
    isShutdown: function() {
      return t === v.SHUTDOWN;
    },
    reconnect: function(ba) {
      if (m.state === 'ping' || m.isShutdown()) return;
      p.log('reconnect', {
        now: ba
    ***REMOVED***;
      v.inform(v.RECONNECTING, 0);
      if (!!ba) {
        if (q !== null) {
          clearTimeout(q);
          q = null;
        }
        m.enterState('ping!');
      } else if (!q) q = o(function() {
        m.enterState('ping!');
        q = null;
      }, i.get('channel_manual_reconnect_defer_msec'));
    },
    unmuteWarning: x
***REMOVED***;
  g.subscribe([l.ON_ENTER_STATE, l.ON_SHUTDOWN], aa);
  g.subscribe(l.ATTEMPT_RECONNECT, function() {
    if (v.disconnected()) v.reconnect();
***REMOVED***;
  k.subscribe(k.TIME_TRAVEL, function() {
    v.reconnect();
    y(i.get('mute_warning_time_msec'));
***REMOVED***;
  j.onBeforeUnload(z, false);
  e.exports = v;
}, null);

__d("ChatContexts", [], function(a, b, c, d, e, f) {
  var g = {};

  function h(k) {
    var l = k ? k.subtext : '';
    return l;
  }

  function i(k, l) {
    g[k] = l;
  }
  var j = {
    get: function(k) {
      if (k in g) {
        return g[k];
      } else return null;
    },
    update: function(k) {
      for (var l in k) i(l, k[l]);
    },
    getShortDisplay: function(k) {
      return h(j.get(k));
    }
  };
  e.exports = j;
}, null);

__d("PresencePoller", ["AvailableListConstants", "AvailableListInitialData", "BanzaiODS", "ChannelConnection", "ChatContexts", "ChatVisibility", "CurrentUser", "JSLogger", "LastMobileActiveTimes", "Poller", "PresencePrivacy", "PresenceStatus", "ServerTime", "ShortProfiles", "UserActivity", "copyProperties", "debounceAcrossTransitions"], function(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, w) {
  var x = 5,
    y = '/ajax/chat/buddy_list.php',
    z = 1800000,
    aa = h.pollInterval,
    ba = h.lazyPollInterval,
    ca = h.lazyThreshold,
    da = n.create('available_list'),
    ea = 'presence_poller';
  i.setEntitySample(ea, .01);

  function fa(ga) {
    "use strict";
    this.$PresencePoller0 = ga;
    this.$PresencePoller1 = false;
    this.$PresencePoller2 = h.chatNotif;
    this.$PresencePoller3 = new p({
      interval: aa,
      setupRequest: this.$PresencePoller4.bind(this),
      clearOnQuicklingEvents: false,
      dontStart: true
  ***REMOVED***;
    if (l.isOnline()) {
      this.$PresencePoller5 = Date.now();
      this.$PresencePoller6 = Date.now();
      this.$PresencePoller7 = Date.now();
      this.$PresencePoller8 = h.updateTime;
    } else {
      this.$PresencePoller5 = 0;
      this.$PresencePoller8 = 0;
      this.$PresencePoller6 = 0;
      this.$PresencePoller7 = 0;
    }
    this.$PresencePoller9 = 0;
    this.$PresencePollera('available_initial_data', h.updateTime, h.availableList, h.lastActiveTimes, h.mobileFriends);
    u.subscribe(function(ha, ia) {
      if (ia.idleness > aa) this.forceUpdate();
    }.bind(this));
    q.subscribe('privacy-user-presence-changed', function() {
      this.forceUpdate();
    }.bind(this));
  }
  fa.prototype.start = function() {
    "use strict";
    setTimeout(this.$PresencePoller3.start.bind(this.$PresencePoller3), 0);
  };
  fa.prototype.restart = function() {
    "use strict";
    if (this.$PresencePoller3.isMuted()) {
      this.$PresencePoller3.resume();
      this.forceUpdate();
    }
  };
  fa.prototype.stop = function() {
    "use strict";
    this.$PresencePoller3.mute();
  };
  fa.prototype.forceUpdate = function() {
    "use strict";
    this.$PresencePoller3.request();
  };
  fa.prototype.getIsUserIdle = function() {
    "use strict";
    return this.$PresencePoller1;
  };
  fa.prototype.getWebChatNotification = function() {
    "use strict";
    return this.$PresencePoller2;
  };
  fa.prototype.getCallback = function() {
    "use strict";
    return this.$PresencePoller0;
  };
  fa.prototype.$PresencePollerb = function() {
    "use strict";
    return w(function() {
      this.$PresencePoller0(g.ON_AVAILABILITY_CHANGED);
    }.bind(this), 0)();
  };
  fa.prototype.$PresencePollera = function(ga, ha, ia, ja, ka) {
    "use strict";
    this.$PresencePoller8 = ha;
    if (!Array.isArray(ia)) {
      r.resetPresenceData();
      for (var la in ia) r.set(la, ia[la].a, false, ga, ia[la].c, ia[la].p);
    }
    if (ja) o.update(ja);
    if (ka) r.setMobileFriends(ka);
    this.$PresencePollerb();
  };
  fa.prototype.$PresencePoller4 = function(ga) {
    "use strict";
    if (j.isShutdown() || !l.isOnline()) {
      this.$PresencePoller3.skip();
      i.bumpEntityKey(ea, 'skip.offline');
      return;
    }
    if (Date.now() - this.$PresencePoller5 < aa) {
      this.$PresencePoller3.skip();
      i.bumpEntityKey(ea, 'skip.recent');
      return;
    }
    i.bumpEntityKey(ea, 'request');
    this.$PresencePoller5 = Date.now();
    var ha = Date.now() - this.$PresencePoller7,
      ia = t.getCachedProfileIDs().join(",");
    ga.setHandler(this.$PresencePollerc.bind(this)).setErrorHandler(this.$PresencePollerd.bind(this)).setOption('suppressErrorAlerts', true).setOption('retries', 1).setData({
      user: m.getID(),
      cached_user_info_ids: ia,
      fetch_mobile: (ha > z)
  ***REMOVED***.setURI(y).setAllowCrossPageTransition(true);
  };
  fa.prototype.$PresencePollerc = function(ga) {
    "use strict";
    var ha = ga.getPayload(),
      ia = ha.buddy_list;
    if (!ia) {
      this.$PresencePollerd(ga);
      return;
    }
    i.bumpEntityKey(ea, 'response');
    this.$PresencePollere();
    this.$PresencePoller6 = Date.now();
    s.update(ha.time);
    if (ia.mobile_friends) this.$PresencePoller7 = Date.now();
    this.$PresencePoller9 = 0;
    this.$PresencePollerf();
    var ja = ia.userInfos;
    if (ja) t.setMulti(ja);
    var ka = ia.chatContexts;
    ka && k.update(ka);
    this.$PresencePoller1 = ia.userIsIdle;
    if (ia.chatNotif !== (void 0)) {
      this.$PresencePoller2 = ia.chatNotif;
      this.$PresencePoller0(g.ON_CHAT_NOTIFICATION_CHANGED, this.$PresencePoller2);
    }
    this.$PresencePollera('buddy_list_poller', ha.time, ia.nowAvailableList, ia.last_active_times, ia.mobile_friends);
  };
  fa.prototype.$PresencePollerd = function(ga) {
    "use strict";
    i.bumpEntityKey(ea, 'error');
    if (ga.getError() == 1356007) return;
    this.$PresencePoller9++;
    if (this.$PresencePoller9 >= x) this.$PresencePoller0(g.ON_UPDATE_ERROR);
  };
  fa.prototype.$PresencePollerf = function() {
    "use strict";
    var ga = u.isActive(ca) ? aa : ba;
    i.bumpEntityKey(ea, 'period.' + ga);
    this.$PresencePoller3.setInterval(ga);
  };
  fa.prototype.$PresencePollere = function() {
    "use strict";
    var ga = Date.now(),
      ha = ga - this.$PresencePoller6;
    da.log('buddylist_presence_stats', v({
      duration: ha
    }, r.getPresenceStats()));
  };
  e.exports = fa;
}, null);

__d("TypingStates", [], function(a, b, c, d, e, f) {
  var g = {
    INACTIVE: 0,
    TYPING: 1,
    QUITTING: 2
  };
  e.exports = g;
}, null);

__d("AvailableList", ["Arbiter", "ArbiterMixin", "AsyncRequest", "AvailableListConstants", "BanzaiODS", "ChannelConnection", "ChannelConstants", "ChatConfig", "ChatVisibility", "JSLogger", "LastMobileActiveTimes", "PresencePoller", "PresencePrivacy", "PresenceStatus", "ServerTime", "ShortProfiles", "TypingStates", "copyProperties", "debounceAcrossTransitions", "emptyFunction"], function(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, w, x, y, z) {
  k.setEntitySample('presence', .0001);
  var aa = x({}, j, h);
  aa.subscribe([j.ON_AVAILABILITY_CHANGED, j.ON_UPDATE_ERROR], function(ja, ka) {
    g.inform(ja, ka);
***REMOVED***;
  var ba = y(function() {
    aa.inform(j.ON_AVAILABILITY_CHANGED);
  }, 0);

  function ca(ja, ka, la, ma, na, oa) {
    var pa = t.set(ja, ka, la, ma, na, oa);
    if (pa) ba();
  }

  function da(ja) {
    var ka = ja.payload.availability || {};
    for (var la in ka) ca(la, ka[la].a, true, 'mercury_tabs', ka[la].c, ka[la].p);
  }

  function ea() {
    ia.restart();
  }

  function fa() {
    ia.stop();
  }

  function ga(ja) {
    var ka = aa.getDebugInfo(ja),
      la = (ka.presence == j.ACTIVE),
      ma = new i('/ajax/mercury/tabs_presence.php').setData({
        target_id: ja,
        to_online: la,
        presence_source: ka.overlaySource,
        presence_time: ka.overlayTime
    ***REMOVED***.setHandler(da).setErrorHandler(z).setAllowCrossPageTransition(true).send();
  }

  function ha(ja, ka) {
    ka.chat_config = n.getDebugInfo();
    ka.available_list_debug_info = {};
    t.getAvailableIDs().forEach(function(la) {
      ka.available_list_debug_info[la] = aa.getDebugInfo(la);
  ***REMOVED***;
    ka.available_list_poll_interval = aa._poller && aa._poller.getInterval();
  }
  var ia = new r(function(event) {
    aa.inform(event);
***REMOVED***;
  x(aa, {
    get: function(ja) {
      return t.get(ja);
    },
    updateForID: function(ja) {
      ga(ja);
    },
    getWebChatNotification: function() {
      return ia.getWebChatNotification();
    },
    isUserIdle: function() {
      return ia.getIsUserIdle();
    },
    isReady: function() {
      return true;
    },
    set: function(ja, ka, la, ma, na) {
      ca(ja, ka, true, la, ma, na);
    },
    update: function() {
      ia.forceUpdate();
    },
    isIdle: function(ja) {
      return aa.get(ja) == j.IDLE;
    },
    getDebugInfo: function(ja) {
      var ka = t.getDebugInfo(ja),
        la = v.getNow(ja);
      if (la) ka.name = la.name;
      return ka;
    }
***REMOVED***;
  ia.start();
  g.subscribe(p.DUMP_EVENT, ha);
  g.subscribe('chat-visibility/go-online', ea);
  g.subscribe('chat-visibility/go-offline', fa);
  s.subscribe(['privacy-changed', 'privacy-availability-changed', 'privacy-user-presence-response'], ba);
  l.subscribe([l.CONNECTED, l.RECONNECTING, l.SHUTDOWN, l.MUTE_WARNING, l.UNMUTE_WARNING], ba);
  g.subscribe(m.getArbiterType('buddylist_overlay'), function(ja, ka) {
    var la = {},
      ma = ka.obj.overlay;
    for (var na in ma) {
      aa.set(na, ma[na].a, ma[na].s || 'channel', ma[na].vc, ma[na].p);
      if (ma[na].la) la[na] = ma[na].la;
    }
    q.update(la);
***REMOVED***;
  g.subscribe([m.getArbiterType('typ'), m.getArbiterType('ttyp')], function(ja, ka) {
    var la = ka.obj;
    if (la.st === w.TYPING) {
      var ma = la.from;
      if (o.isOnline()) {
        k.bumpEntityKey('presence', 'stale_presence_check_typing');
        var na = t.get(ma);
        if (na != j.ACTIVE) {
          var oa = q.get(ma) * 1000,
            pa = u.get();
          if (!oa) {
            k.bumpEntityKey('presence', 'no_detailed_presence_typing');
          } else if (pa - oa > 5 * 60 * 1000) {
            var qa = 'stale_presence_typing',
              ra = pa - oa;
            if (ra < 10 * 60 * 1000) {
              qa += '600';
            } else if (ra < 60 * 60 * 1000) qa + '3600';
            k.bumpEntityKey('presence', qa);
          }
        }
      }
      aa.set(ma, j.ACTIVE, 'channel-typing');
    }
***REMOVED***;
  g.subscribe(m.getArbiterType('messaging'), function(ja, ka) {
    if (!o.isOnline()) return;
    var la = ka.obj;
    if (la.message && la.message.timestamp && la.message.sender_fbid) {
      var ma = u.get(),
        na = la.message.timestamp;
      if (ma - na < 2 * 60 * 1000) {
        k.bumpEntityKey('presence', 'stale_presence_check');
        var oa = la.message.sender_fbid,
          pa = t.get(oa);
        if (pa == j.ACTIVE) return;
        var qa = q.get(oa) * 1000;
        if (!qa) {
          k.bumpEntityKey('presence', 'no_detailed_presence');
        } else if (na - qa > 5 * 60 * 1000) {
          var ra = 'stale_presence',
            sa = na - qa;
          if (sa < 10 * 60 * 1000) {
            ra += '600';
          } else if (sa < 60 * 60 * 1000) ra + '3600';
          k.bumpEntityKey('presence', ra);
        }
      }
    }
***REMOVED***;
  a.AvailableList = e.exports = aa;
}, null);