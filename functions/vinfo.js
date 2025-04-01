var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/sax/lib/sax.js
var require_sax = __commonJS({
  "node_modules/sax/lib/sax.js"(exports) {
    (function(sax) {
      sax.parser = function(strict, opt) {
        return new SAXParser(strict, opt);
      };
      sax.SAXParser = SAXParser;
      sax.SAXStream = SAXStream;
      sax.createStream = createStream;
      sax.MAX_BUFFER_LENGTH = 64 * 1024;
      var buffers = [
        "comment",
        "sgmlDecl",
        "textNode",
        "tagName",
        "doctype",
        "procInstName",
        "procInstBody",
        "entity",
        "attribName",
        "attribValue",
        "cdata",
        "script"
      ];
      sax.EVENTS = [
        "text",
        "processinginstruction",
        "sgmldeclaration",
        "doctype",
        "comment",
        "opentagstart",
        "attribute",
        "opentag",
        "closetag",
        "opencdata",
        "cdata",
        "closecdata",
        "error",
        "end",
        "ready",
        "script",
        "opennamespace",
        "closenamespace"
      ];
      function SAXParser(strict, opt) {
        if (!(this instanceof SAXParser)) {
          return new SAXParser(strict, opt);
        }
        var parser = this;
        clearBuffers(parser);
        parser.q = parser.c = "";
        parser.bufferCheckPosition = sax.MAX_BUFFER_LENGTH;
        parser.opt = opt || {};
        parser.opt.lowercase = parser.opt.lowercase || parser.opt.lowercasetags;
        parser.looseCase = parser.opt.lowercase ? "toLowerCase" : "toUpperCase";
        parser.tags = [];
        parser.closed = parser.closedRoot = parser.sawRoot = false;
        parser.tag = parser.error = null;
        parser.strict = !!strict;
        parser.noscript = !!(strict || parser.opt.noscript);
        parser.state = S.BEGIN;
        parser.strictEntities = parser.opt.strictEntities;
        parser.ENTITIES = parser.strictEntities ? Object.create(sax.XML_ENTITIES) : Object.create(sax.ENTITIES);
        parser.attribList = [];
        if (parser.opt.xmlns) {
          parser.ns = Object.create(rootNS);
        }
        if (parser.opt.unquotedAttributeValues === void 0) {
          parser.opt.unquotedAttributeValues = !strict;
        }
        parser.trackPosition = parser.opt.position !== false;
        if (parser.trackPosition) {
          parser.position = parser.line = parser.column = 0;
        }
        emit(parser, "onready");
      }
      if (!Object.create) {
        Object.create = function(o) {
          function F() {
          }
          F.prototype = o;
          var newf = new F();
          return newf;
        };
      }
      if (!Object.keys) {
        Object.keys = function(o) {
          var a = [];
          for (var i in o)
            if (o.hasOwnProperty(i))
              a.push(i);
          return a;
        };
      }
      function checkBufferLength(parser) {
        var maxAllowed = Math.max(sax.MAX_BUFFER_LENGTH, 10);
        var maxActual = 0;
        for (var i = 0, l = buffers.length; i < l; i++) {
          var len = parser[buffers[i]].length;
          if (len > maxAllowed) {
            switch (buffers[i]) {
              case "textNode":
                closeText(parser);
                break;
              case "cdata":
                emitNode(parser, "oncdata", parser.cdata);
                parser.cdata = "";
                break;
              case "script":
                emitNode(parser, "onscript", parser.script);
                parser.script = "";
                break;
              default:
                error(parser, "Max buffer length exceeded: " + buffers[i]);
            }
          }
          maxActual = Math.max(maxActual, len);
        }
        var m = sax.MAX_BUFFER_LENGTH - maxActual;
        parser.bufferCheckPosition = m + parser.position;
      }
      function clearBuffers(parser) {
        for (var i = 0, l = buffers.length; i < l; i++) {
          parser[buffers[i]] = "";
        }
      }
      function flushBuffers(parser) {
        closeText(parser);
        if (parser.cdata !== "") {
          emitNode(parser, "oncdata", parser.cdata);
          parser.cdata = "";
        }
        if (parser.script !== "") {
          emitNode(parser, "onscript", parser.script);
          parser.script = "";
        }
      }
      SAXParser.prototype = {
        end: function() {
          end(this);
        },
        write,
        resume: function() {
          this.error = null;
          return this;
        },
        close: function() {
          return this.write(null);
        },
        flush: function() {
          flushBuffers(this);
        }
      };
      var Stream;
      try {
        Stream = __require("stream").Stream;
      } catch (ex) {
        Stream = function() {
        };
      }
      if (!Stream)
        Stream = function() {
        };
      var streamWraps = sax.EVENTS.filter(function(ev) {
        return ev !== "error" && ev !== "end";
      });
      function createStream(strict, opt) {
        return new SAXStream(strict, opt);
      }
      function SAXStream(strict, opt) {
        if (!(this instanceof SAXStream)) {
          return new SAXStream(strict, opt);
        }
        Stream.apply(this);
        this._parser = new SAXParser(strict, opt);
        this.writable = true;
        this.readable = true;
        var me = this;
        this._parser.onend = function() {
          me.emit("end");
        };
        this._parser.onerror = function(er) {
          me.emit("error", er);
          me._parser.error = null;
        };
        this._decoder = null;
        streamWraps.forEach(function(ev) {
          Object.defineProperty(me, "on" + ev, {
            get: function() {
              return me._parser["on" + ev];
            },
            set: function(h) {
              if (!h) {
                me.removeAllListeners(ev);
                me._parser["on" + ev] = h;
                return h;
              }
              me.on(ev, h);
            },
            enumerable: true,
            configurable: false
          });
        });
      }
      SAXStream.prototype = Object.create(Stream.prototype, {
        constructor: {
          value: SAXStream
        }
      });
      SAXStream.prototype.write = function(data) {
        if (typeof Buffer === "function" && typeof Buffer.isBuffer === "function" && Buffer.isBuffer(data)) {
          if (!this._decoder) {
            var SD = __require("string_decoder").StringDecoder;
            this._decoder = new SD("utf8");
          }
          data = this._decoder.write(data);
        }
        this._parser.write(data.toString());
        this.emit("data", data);
        return true;
      };
      SAXStream.prototype.end = function(chunk) {
        if (chunk && chunk.length) {
          this.write(chunk);
        }
        this._parser.end();
        return true;
      };
      SAXStream.prototype.on = function(ev, handler) {
        var me = this;
        if (!me._parser["on" + ev] && streamWraps.indexOf(ev) !== -1) {
          me._parser["on" + ev] = function() {
            var args = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
            args.splice(0, 0, ev);
            me.emit.apply(me, args);
          };
        }
        return Stream.prototype.on.call(me, ev, handler);
      };
      var CDATA = "[CDATA[";
      var DOCTYPE = "DOCTYPE";
      var XML_NAMESPACE = "http://www.w3.org/XML/1998/namespace";
      var XMLNS_NAMESPACE = "http://www.w3.org/2000/xmlns/";
      var rootNS = { xml: XML_NAMESPACE, xmlns: XMLNS_NAMESPACE };
      var nameStart = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/;
      var nameBody = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
      var entityStart = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/;
      var entityBody = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
      function isWhitespace(c) {
        return c === " " || c === "\n" || c === "\r" || c === "	";
      }
      function isQuote(c) {
        return c === '"' || c === "'";
      }
      function isAttribEnd(c) {
        return c === ">" || isWhitespace(c);
      }
      function isMatch(regex, c) {
        return regex.test(c);
      }
      function notMatch(regex, c) {
        return !isMatch(regex, c);
      }
      var S = 0;
      sax.STATE = {
        BEGIN: S++,
        // leading byte order mark or whitespace
        BEGIN_WHITESPACE: S++,
        // leading whitespace
        TEXT: S++,
        // general stuff
        TEXT_ENTITY: S++,
        // &amp and such.
        OPEN_WAKA: S++,
        // <
        SGML_DECL: S++,
        // <!BLARG
        SGML_DECL_QUOTED: S++,
        // <!BLARG foo "bar
        DOCTYPE: S++,
        // <!DOCTYPE
        DOCTYPE_QUOTED: S++,
        // <!DOCTYPE "//blah
        DOCTYPE_DTD: S++,
        // <!DOCTYPE "//blah" [ ...
        DOCTYPE_DTD_QUOTED: S++,
        // <!DOCTYPE "//blah" [ "foo
        COMMENT_STARTING: S++,
        // <!-
        COMMENT: S++,
        // <!--
        COMMENT_ENDING: S++,
        // <!-- blah -
        COMMENT_ENDED: S++,
        // <!-- blah --
        CDATA: S++,
        // <![CDATA[ something
        CDATA_ENDING: S++,
        // ]
        CDATA_ENDING_2: S++,
        // ]]
        PROC_INST: S++,
        // <?hi
        PROC_INST_BODY: S++,
        // <?hi there
        PROC_INST_ENDING: S++,
        // <?hi "there" ?
        OPEN_TAG: S++,
        // <strong
        OPEN_TAG_SLASH: S++,
        // <strong /
        ATTRIB: S++,
        // <a
        ATTRIB_NAME: S++,
        // <a foo
        ATTRIB_NAME_SAW_WHITE: S++,
        // <a foo _
        ATTRIB_VALUE: S++,
        // <a foo=
        ATTRIB_VALUE_QUOTED: S++,
        // <a foo="bar
        ATTRIB_VALUE_CLOSED: S++,
        // <a foo="bar"
        ATTRIB_VALUE_UNQUOTED: S++,
        // <a foo=bar
        ATTRIB_VALUE_ENTITY_Q: S++,
        // <foo bar="&quot;"
        ATTRIB_VALUE_ENTITY_U: S++,
        // <foo bar=&quot
        CLOSE_TAG: S++,
        // </a
        CLOSE_TAG_SAW_WHITE: S++,
        // </a   >
        SCRIPT: S++,
        // <script> ...
        SCRIPT_ENDING: S++
        // <script> ... <
      };
      sax.XML_ENTITIES = {
        "amp": "&",
        "gt": ">",
        "lt": "<",
        "quot": '"',
        "apos": "'"
      };
      sax.ENTITIES = {
        "amp": "&",
        "gt": ">",
        "lt": "<",
        "quot": '"',
        "apos": "'",
        "AElig": 198,
        "Aacute": 193,
        "Acirc": 194,
        "Agrave": 192,
        "Aring": 197,
        "Atilde": 195,
        "Auml": 196,
        "Ccedil": 199,
        "ETH": 208,
        "Eacute": 201,
        "Ecirc": 202,
        "Egrave": 200,
        "Euml": 203,
        "Iacute": 205,
        "Icirc": 206,
        "Igrave": 204,
        "Iuml": 207,
        "Ntilde": 209,
        "Oacute": 211,
        "Ocirc": 212,
        "Ograve": 210,
        "Oslash": 216,
        "Otilde": 213,
        "Ouml": 214,
        "THORN": 222,
        "Uacute": 218,
        "Ucirc": 219,
        "Ugrave": 217,
        "Uuml": 220,
        "Yacute": 221,
        "aacute": 225,
        "acirc": 226,
        "aelig": 230,
        "agrave": 224,
        "aring": 229,
        "atilde": 227,
        "auml": 228,
        "ccedil": 231,
        "eacute": 233,
        "ecirc": 234,
        "egrave": 232,
        "eth": 240,
        "euml": 235,
        "iacute": 237,
        "icirc": 238,
        "igrave": 236,
        "iuml": 239,
        "ntilde": 241,
        "oacute": 243,
        "ocirc": 244,
        "ograve": 242,
        "oslash": 248,
        "otilde": 245,
        "ouml": 246,
        "szlig": 223,
        "thorn": 254,
        "uacute": 250,
        "ucirc": 251,
        "ugrave": 249,
        "uuml": 252,
        "yacute": 253,
        "yuml": 255,
        "copy": 169,
        "reg": 174,
        "nbsp": 160,
        "iexcl": 161,
        "cent": 162,
        "pound": 163,
        "curren": 164,
        "yen": 165,
        "brvbar": 166,
        "sect": 167,
        "uml": 168,
        "ordf": 170,
        "laquo": 171,
        "not": 172,
        "shy": 173,
        "macr": 175,
        "deg": 176,
        "plusmn": 177,
        "sup1": 185,
        "sup2": 178,
        "sup3": 179,
        "acute": 180,
        "micro": 181,
        "para": 182,
        "middot": 183,
        "cedil": 184,
        "ordm": 186,
        "raquo": 187,
        "frac14": 188,
        "frac12": 189,
        "frac34": 190,
        "iquest": 191,
        "times": 215,
        "divide": 247,
        "OElig": 338,
        "oelig": 339,
        "Scaron": 352,
        "scaron": 353,
        "Yuml": 376,
        "fnof": 402,
        "circ": 710,
        "tilde": 732,
        "Alpha": 913,
        "Beta": 914,
        "Gamma": 915,
        "Delta": 916,
        "Epsilon": 917,
        "Zeta": 918,
        "Eta": 919,
        "Theta": 920,
        "Iota": 921,
        "Kappa": 922,
        "Lambda": 923,
        "Mu": 924,
        "Nu": 925,
        "Xi": 926,
        "Omicron": 927,
        "Pi": 928,
        "Rho": 929,
        "Sigma": 931,
        "Tau": 932,
        "Upsilon": 933,
        "Phi": 934,
        "Chi": 935,
        "Psi": 936,
        "Omega": 937,
        "alpha": 945,
        "beta": 946,
        "gamma": 947,
        "delta": 948,
        "epsilon": 949,
        "zeta": 950,
        "eta": 951,
        "theta": 952,
        "iota": 953,
        "kappa": 954,
        "lambda": 955,
        "mu": 956,
        "nu": 957,
        "xi": 958,
        "omicron": 959,
        "pi": 960,
        "rho": 961,
        "sigmaf": 962,
        "sigma": 963,
        "tau": 964,
        "upsilon": 965,
        "phi": 966,
        "chi": 967,
        "psi": 968,
        "omega": 969,
        "thetasym": 977,
        "upsih": 978,
        "piv": 982,
        "ensp": 8194,
        "emsp": 8195,
        "thinsp": 8201,
        "zwnj": 8204,
        "zwj": 8205,
        "lrm": 8206,
        "rlm": 8207,
        "ndash": 8211,
        "mdash": 8212,
        "lsquo": 8216,
        "rsquo": 8217,
        "sbquo": 8218,
        "ldquo": 8220,
        "rdquo": 8221,
        "bdquo": 8222,
        "dagger": 8224,
        "Dagger": 8225,
        "bull": 8226,
        "hellip": 8230,
        "permil": 8240,
        "prime": 8242,
        "Prime": 8243,
        "lsaquo": 8249,
        "rsaquo": 8250,
        "oline": 8254,
        "frasl": 8260,
        "euro": 8364,
        "image": 8465,
        "weierp": 8472,
        "real": 8476,
        "trade": 8482,
        "alefsym": 8501,
        "larr": 8592,
        "uarr": 8593,
        "rarr": 8594,
        "darr": 8595,
        "harr": 8596,
        "crarr": 8629,
        "lArr": 8656,
        "uArr": 8657,
        "rArr": 8658,
        "dArr": 8659,
        "hArr": 8660,
        "forall": 8704,
        "part": 8706,
        "exist": 8707,
        "empty": 8709,
        "nabla": 8711,
        "isin": 8712,
        "notin": 8713,
        "ni": 8715,
        "prod": 8719,
        "sum": 8721,
        "minus": 8722,
        "lowast": 8727,
        "radic": 8730,
        "prop": 8733,
        "infin": 8734,
        "ang": 8736,
        "and": 8743,
        "or": 8744,
        "cap": 8745,
        "cup": 8746,
        "int": 8747,
        "there4": 8756,
        "sim": 8764,
        "cong": 8773,
        "asymp": 8776,
        "ne": 8800,
        "equiv": 8801,
        "le": 8804,
        "ge": 8805,
        "sub": 8834,
        "sup": 8835,
        "nsub": 8836,
        "sube": 8838,
        "supe": 8839,
        "oplus": 8853,
        "otimes": 8855,
        "perp": 8869,
        "sdot": 8901,
        "lceil": 8968,
        "rceil": 8969,
        "lfloor": 8970,
        "rfloor": 8971,
        "lang": 9001,
        "rang": 9002,
        "loz": 9674,
        "spades": 9824,
        "clubs": 9827,
        "hearts": 9829,
        "diams": 9830
      };
      Object.keys(sax.ENTITIES).forEach(function(key) {
        var e = sax.ENTITIES[key];
        var s2 = typeof e === "number" ? String.fromCharCode(e) : e;
        sax.ENTITIES[key] = s2;
      });
      for (var s in sax.STATE) {
        sax.STATE[sax.STATE[s]] = s;
      }
      S = sax.STATE;
      function emit(parser, event, data) {
        parser[event] && parser[event](data);
      }
      function emitNode(parser, nodeType, data) {
        if (parser.textNode)
          closeText(parser);
        emit(parser, nodeType, data);
      }
      function closeText(parser) {
        parser.textNode = textopts(parser.opt, parser.textNode);
        if (parser.textNode)
          emit(parser, "ontext", parser.textNode);
        parser.textNode = "";
      }
      function textopts(opt, text) {
        if (opt.trim)
          text = text.trim();
        if (opt.normalize)
          text = text.replace(/\s+/g, " ");
        return text;
      }
      function error(parser, er) {
        closeText(parser);
        if (parser.trackPosition) {
          er += "\nLine: " + parser.line + "\nColumn: " + parser.column + "\nChar: " + parser.c;
        }
        er = new Error(er);
        parser.error = er;
        emit(parser, "onerror", er);
        return parser;
      }
      function end(parser) {
        if (parser.sawRoot && !parser.closedRoot)
          strictFail(parser, "Unclosed root tag");
        if (parser.state !== S.BEGIN && parser.state !== S.BEGIN_WHITESPACE && parser.state !== S.TEXT) {
          error(parser, "Unexpected end");
        }
        closeText(parser);
        parser.c = "";
        parser.closed = true;
        emit(parser, "onend");
        SAXParser.call(parser, parser.strict, parser.opt);
        return parser;
      }
      function strictFail(parser, message) {
        if (typeof parser !== "object" || !(parser instanceof SAXParser)) {
          throw new Error("bad call to strictFail");
        }
        if (parser.strict) {
          error(parser, message);
        }
      }
      function newTag(parser) {
        if (!parser.strict)
          parser.tagName = parser.tagName[parser.looseCase]();
        var parent = parser.tags[parser.tags.length - 1] || parser;
        var tag = parser.tag = { name: parser.tagName, attributes: {} };
        if (parser.opt.xmlns) {
          tag.ns = parent.ns;
        }
        parser.attribList.length = 0;
        emitNode(parser, "onopentagstart", tag);
      }
      function qname(name, attribute) {
        var i = name.indexOf(":");
        var qualName = i < 0 ? ["", name] : name.split(":");
        var prefix = qualName[0];
        var local = qualName[1];
        if (attribute && name === "xmlns") {
          prefix = "xmlns";
          local = "";
        }
        return { prefix, local };
      }
      function attrib(parser) {
        if (!parser.strict) {
          parser.attribName = parser.attribName[parser.looseCase]();
        }
        if (parser.attribList.indexOf(parser.attribName) !== -1 || parser.tag.attributes.hasOwnProperty(parser.attribName)) {
          parser.attribName = parser.attribValue = "";
          return;
        }
        if (parser.opt.xmlns) {
          var qn = qname(parser.attribName, true);
          var prefix = qn.prefix;
          var local = qn.local;
          if (prefix === "xmlns") {
            if (local === "xml" && parser.attribValue !== XML_NAMESPACE) {
              strictFail(
                parser,
                "xml: prefix must be bound to " + XML_NAMESPACE + "\nActual: " + parser.attribValue
              );
            } else if (local === "xmlns" && parser.attribValue !== XMLNS_NAMESPACE) {
              strictFail(
                parser,
                "xmlns: prefix must be bound to " + XMLNS_NAMESPACE + "\nActual: " + parser.attribValue
              );
            } else {
              var tag = parser.tag;
              var parent = parser.tags[parser.tags.length - 1] || parser;
              if (tag.ns === parent.ns) {
                tag.ns = Object.create(parent.ns);
              }
              tag.ns[local] = parser.attribValue;
            }
          }
          parser.attribList.push([parser.attribName, parser.attribValue]);
        } else {
          parser.tag.attributes[parser.attribName] = parser.attribValue;
          emitNode(parser, "onattribute", {
            name: parser.attribName,
            value: parser.attribValue
          });
        }
        parser.attribName = parser.attribValue = "";
      }
      function openTag(parser, selfClosing) {
        if (parser.opt.xmlns) {
          var tag = parser.tag;
          var qn = qname(parser.tagName);
          tag.prefix = qn.prefix;
          tag.local = qn.local;
          tag.uri = tag.ns[qn.prefix] || "";
          if (tag.prefix && !tag.uri) {
            strictFail(parser, "Unbound namespace prefix: " + JSON.stringify(parser.tagName));
            tag.uri = qn.prefix;
          }
          var parent = parser.tags[parser.tags.length - 1] || parser;
          if (tag.ns && parent.ns !== tag.ns) {
            Object.keys(tag.ns).forEach(function(p) {
              emitNode(parser, "onopennamespace", {
                prefix: p,
                uri: tag.ns[p]
              });
            });
          }
          for (var i = 0, l = parser.attribList.length; i < l; i++) {
            var nv = parser.attribList[i];
            var name = nv[0];
            var value = nv[1];
            var qualName = qname(name, true);
            var prefix = qualName.prefix;
            var local = qualName.local;
            var uri = prefix === "" ? "" : tag.ns[prefix] || "";
            var a = {
              name,
              value,
              prefix,
              local,
              uri
            };
            if (prefix && prefix !== "xmlns" && !uri) {
              strictFail(parser, "Unbound namespace prefix: " + JSON.stringify(prefix));
              a.uri = prefix;
            }
            parser.tag.attributes[name] = a;
            emitNode(parser, "onattribute", a);
          }
          parser.attribList.length = 0;
        }
        parser.tag.isSelfClosing = !!selfClosing;
        parser.sawRoot = true;
        parser.tags.push(parser.tag);
        emitNode(parser, "onopentag", parser.tag);
        if (!selfClosing) {
          if (!parser.noscript && parser.tagName.toLowerCase() === "script") {
            parser.state = S.SCRIPT;
          } else {
            parser.state = S.TEXT;
          }
          parser.tag = null;
          parser.tagName = "";
        }
        parser.attribName = parser.attribValue = "";
        parser.attribList.length = 0;
      }
      function closeTag(parser) {
        if (!parser.tagName) {
          strictFail(parser, "Weird empty close tag.");
          parser.textNode += "</>";
          parser.state = S.TEXT;
          return;
        }
        if (parser.script) {
          if (parser.tagName !== "script") {
            parser.script += "</" + parser.tagName + ">";
            parser.tagName = "";
            parser.state = S.SCRIPT;
            return;
          }
          emitNode(parser, "onscript", parser.script);
          parser.script = "";
        }
        var t = parser.tags.length;
        var tagName = parser.tagName;
        if (!parser.strict) {
          tagName = tagName[parser.looseCase]();
        }
        var closeTo = tagName;
        while (t--) {
          var close = parser.tags[t];
          if (close.name !== closeTo) {
            strictFail(parser, "Unexpected close tag");
          } else {
            break;
          }
        }
        if (t < 0) {
          strictFail(parser, "Unmatched closing tag: " + parser.tagName);
          parser.textNode += "</" + parser.tagName + ">";
          parser.state = S.TEXT;
          return;
        }
        parser.tagName = tagName;
        var s2 = parser.tags.length;
        while (s2-- > t) {
          var tag = parser.tag = parser.tags.pop();
          parser.tagName = parser.tag.name;
          emitNode(parser, "onclosetag", parser.tagName);
          var x = {};
          for (var i in tag.ns) {
            x[i] = tag.ns[i];
          }
          var parent = parser.tags[parser.tags.length - 1] || parser;
          if (parser.opt.xmlns && tag.ns !== parent.ns) {
            Object.keys(tag.ns).forEach(function(p) {
              var n = tag.ns[p];
              emitNode(parser, "onclosenamespace", { prefix: p, uri: n });
            });
          }
        }
        if (t === 0)
          parser.closedRoot = true;
        parser.tagName = parser.attribValue = parser.attribName = "";
        parser.attribList.length = 0;
        parser.state = S.TEXT;
      }
      function parseEntity(parser) {
        var entity = parser.entity;
        var entityLC = entity.toLowerCase();
        var num;
        var numStr = "";
        if (parser.ENTITIES[entity]) {
          return parser.ENTITIES[entity];
        }
        if (parser.ENTITIES[entityLC]) {
          return parser.ENTITIES[entityLC];
        }
        entity = entityLC;
        if (entity.charAt(0) === "#") {
          if (entity.charAt(1) === "x") {
            entity = entity.slice(2);
            num = parseInt(entity, 16);
            numStr = num.toString(16);
          } else {
            entity = entity.slice(1);
            num = parseInt(entity, 10);
            numStr = num.toString(10);
          }
        }
        entity = entity.replace(/^0+/, "");
        if (isNaN(num) || numStr.toLowerCase() !== entity) {
          strictFail(parser, "Invalid character entity");
          return "&" + parser.entity + ";";
        }
        return String.fromCodePoint(num);
      }
      function beginWhiteSpace(parser, c) {
        if (c === "<") {
          parser.state = S.OPEN_WAKA;
          parser.startTagPosition = parser.position;
        } else if (!isWhitespace(c)) {
          strictFail(parser, "Non-whitespace before first tag.");
          parser.textNode = c;
          parser.state = S.TEXT;
        }
      }
      function charAt(chunk, i) {
        var result = "";
        if (i < chunk.length) {
          result = chunk.charAt(i);
        }
        return result;
      }
      function write(chunk) {
        var parser = this;
        if (this.error) {
          throw this.error;
        }
        if (parser.closed) {
          return error(
            parser,
            "Cannot write after close. Assign an onready handler."
          );
        }
        if (chunk === null) {
          return end(parser);
        }
        if (typeof chunk === "object") {
          chunk = chunk.toString();
        }
        var i = 0;
        var c = "";
        while (true) {
          c = charAt(chunk, i++);
          parser.c = c;
          if (!c) {
            break;
          }
          if (parser.trackPosition) {
            parser.position++;
            if (c === "\n") {
              parser.line++;
              parser.column = 0;
            } else {
              parser.column++;
            }
          }
          switch (parser.state) {
            case S.BEGIN:
              parser.state = S.BEGIN_WHITESPACE;
              if (c === "\uFEFF") {
                continue;
              }
              beginWhiteSpace(parser, c);
              continue;
            case S.BEGIN_WHITESPACE:
              beginWhiteSpace(parser, c);
              continue;
            case S.TEXT:
              if (parser.sawRoot && !parser.closedRoot) {
                var starti = i - 1;
                while (c && c !== "<" && c !== "&") {
                  c = charAt(chunk, i++);
                  if (c && parser.trackPosition) {
                    parser.position++;
                    if (c === "\n") {
                      parser.line++;
                      parser.column = 0;
                    } else {
                      parser.column++;
                    }
                  }
                }
                parser.textNode += chunk.substring(starti, i - 1);
              }
              if (c === "<" && !(parser.sawRoot && parser.closedRoot && !parser.strict)) {
                parser.state = S.OPEN_WAKA;
                parser.startTagPosition = parser.position;
              } else {
                if (!isWhitespace(c) && (!parser.sawRoot || parser.closedRoot)) {
                  strictFail(parser, "Text data outside of root node.");
                }
                if (c === "&") {
                  parser.state = S.TEXT_ENTITY;
                } else {
                  parser.textNode += c;
                }
              }
              continue;
            case S.SCRIPT:
              if (c === "<") {
                parser.state = S.SCRIPT_ENDING;
              } else {
                parser.script += c;
              }
              continue;
            case S.SCRIPT_ENDING:
              if (c === "/") {
                parser.state = S.CLOSE_TAG;
              } else {
                parser.script += "<" + c;
                parser.state = S.SCRIPT;
              }
              continue;
            case S.OPEN_WAKA:
              if (c === "!") {
                parser.state = S.SGML_DECL;
                parser.sgmlDecl = "";
              } else if (isWhitespace(c)) {
              } else if (isMatch(nameStart, c)) {
                parser.state = S.OPEN_TAG;
                parser.tagName = c;
              } else if (c === "/") {
                parser.state = S.CLOSE_TAG;
                parser.tagName = "";
              } else if (c === "?") {
                parser.state = S.PROC_INST;
                parser.procInstName = parser.procInstBody = "";
              } else {
                strictFail(parser, "Unencoded <");
                if (parser.startTagPosition + 1 < parser.position) {
                  var pad = parser.position - parser.startTagPosition;
                  c = new Array(pad).join(" ") + c;
                }
                parser.textNode += "<" + c;
                parser.state = S.TEXT;
              }
              continue;
            case S.SGML_DECL:
              if (parser.sgmlDecl + c === "--") {
                parser.state = S.COMMENT;
                parser.comment = "";
                parser.sgmlDecl = "";
                continue;
              }
              if (parser.doctype && parser.doctype !== true && parser.sgmlDecl) {
                parser.state = S.DOCTYPE_DTD;
                parser.doctype += "<!" + parser.sgmlDecl + c;
                parser.sgmlDecl = "";
              } else if ((parser.sgmlDecl + c).toUpperCase() === CDATA) {
                emitNode(parser, "onopencdata");
                parser.state = S.CDATA;
                parser.sgmlDecl = "";
                parser.cdata = "";
              } else if ((parser.sgmlDecl + c).toUpperCase() === DOCTYPE) {
                parser.state = S.DOCTYPE;
                if (parser.doctype || parser.sawRoot) {
                  strictFail(
                    parser,
                    "Inappropriately located doctype declaration"
                  );
                }
                parser.doctype = "";
                parser.sgmlDecl = "";
              } else if (c === ">") {
                emitNode(parser, "onsgmldeclaration", parser.sgmlDecl);
                parser.sgmlDecl = "";
                parser.state = S.TEXT;
              } else if (isQuote(c)) {
                parser.state = S.SGML_DECL_QUOTED;
                parser.sgmlDecl += c;
              } else {
                parser.sgmlDecl += c;
              }
              continue;
            case S.SGML_DECL_QUOTED:
              if (c === parser.q) {
                parser.state = S.SGML_DECL;
                parser.q = "";
              }
              parser.sgmlDecl += c;
              continue;
            case S.DOCTYPE:
              if (c === ">") {
                parser.state = S.TEXT;
                emitNode(parser, "ondoctype", parser.doctype);
                parser.doctype = true;
              } else {
                parser.doctype += c;
                if (c === "[") {
                  parser.state = S.DOCTYPE_DTD;
                } else if (isQuote(c)) {
                  parser.state = S.DOCTYPE_QUOTED;
                  parser.q = c;
                }
              }
              continue;
            case S.DOCTYPE_QUOTED:
              parser.doctype += c;
              if (c === parser.q) {
                parser.q = "";
                parser.state = S.DOCTYPE;
              }
              continue;
            case S.DOCTYPE_DTD:
              if (c === "]") {
                parser.doctype += c;
                parser.state = S.DOCTYPE;
              } else if (c === "<") {
                parser.state = S.OPEN_WAKA;
                parser.startTagPosition = parser.position;
              } else if (isQuote(c)) {
                parser.doctype += c;
                parser.state = S.DOCTYPE_DTD_QUOTED;
                parser.q = c;
              } else {
                parser.doctype += c;
              }
              continue;
            case S.DOCTYPE_DTD_QUOTED:
              parser.doctype += c;
              if (c === parser.q) {
                parser.state = S.DOCTYPE_DTD;
                parser.q = "";
              }
              continue;
            case S.COMMENT:
              if (c === "-") {
                parser.state = S.COMMENT_ENDING;
              } else {
                parser.comment += c;
              }
              continue;
            case S.COMMENT_ENDING:
              if (c === "-") {
                parser.state = S.COMMENT_ENDED;
                parser.comment = textopts(parser.opt, parser.comment);
                if (parser.comment) {
                  emitNode(parser, "oncomment", parser.comment);
                }
                parser.comment = "";
              } else {
                parser.comment += "-" + c;
                parser.state = S.COMMENT;
              }
              continue;
            case S.COMMENT_ENDED:
              if (c !== ">") {
                strictFail(parser, "Malformed comment");
                parser.comment += "--" + c;
                parser.state = S.COMMENT;
              } else if (parser.doctype && parser.doctype !== true) {
                parser.state = S.DOCTYPE_DTD;
              } else {
                parser.state = S.TEXT;
              }
              continue;
            case S.CDATA:
              if (c === "]") {
                parser.state = S.CDATA_ENDING;
              } else {
                parser.cdata += c;
              }
              continue;
            case S.CDATA_ENDING:
              if (c === "]") {
                parser.state = S.CDATA_ENDING_2;
              } else {
                parser.cdata += "]" + c;
                parser.state = S.CDATA;
              }
              continue;
            case S.CDATA_ENDING_2:
              if (c === ">") {
                if (parser.cdata) {
                  emitNode(parser, "oncdata", parser.cdata);
                }
                emitNode(parser, "onclosecdata");
                parser.cdata = "";
                parser.state = S.TEXT;
              } else if (c === "]") {
                parser.cdata += "]";
              } else {
                parser.cdata += "]]" + c;
                parser.state = S.CDATA;
              }
              continue;
            case S.PROC_INST:
              if (c === "?") {
                parser.state = S.PROC_INST_ENDING;
              } else if (isWhitespace(c)) {
                parser.state = S.PROC_INST_BODY;
              } else {
                parser.procInstName += c;
              }
              continue;
            case S.PROC_INST_BODY:
              if (!parser.procInstBody && isWhitespace(c)) {
                continue;
              } else if (c === "?") {
                parser.state = S.PROC_INST_ENDING;
              } else {
                parser.procInstBody += c;
              }
              continue;
            case S.PROC_INST_ENDING:
              if (c === ">") {
                emitNode(parser, "onprocessinginstruction", {
                  name: parser.procInstName,
                  body: parser.procInstBody
                });
                parser.procInstName = parser.procInstBody = "";
                parser.state = S.TEXT;
              } else {
                parser.procInstBody += "?" + c;
                parser.state = S.PROC_INST_BODY;
              }
              continue;
            case S.OPEN_TAG:
              if (isMatch(nameBody, c)) {
                parser.tagName += c;
              } else {
                newTag(parser);
                if (c === ">") {
                  openTag(parser);
                } else if (c === "/") {
                  parser.state = S.OPEN_TAG_SLASH;
                } else {
                  if (!isWhitespace(c)) {
                    strictFail(parser, "Invalid character in tag name");
                  }
                  parser.state = S.ATTRIB;
                }
              }
              continue;
            case S.OPEN_TAG_SLASH:
              if (c === ">") {
                openTag(parser, true);
                closeTag(parser);
              } else {
                strictFail(parser, "Forward-slash in opening tag not followed by >");
                parser.state = S.ATTRIB;
              }
              continue;
            case S.ATTRIB:
              if (isWhitespace(c)) {
                continue;
              } else if (c === ">") {
                openTag(parser);
              } else if (c === "/") {
                parser.state = S.OPEN_TAG_SLASH;
              } else if (isMatch(nameStart, c)) {
                parser.attribName = c;
                parser.attribValue = "";
                parser.state = S.ATTRIB_NAME;
              } else {
                strictFail(parser, "Invalid attribute name");
              }
              continue;
            case S.ATTRIB_NAME:
              if (c === "=") {
                parser.state = S.ATTRIB_VALUE;
              } else if (c === ">") {
                strictFail(parser, "Attribute without value");
                parser.attribValue = parser.attribName;
                attrib(parser);
                openTag(parser);
              } else if (isWhitespace(c)) {
                parser.state = S.ATTRIB_NAME_SAW_WHITE;
              } else if (isMatch(nameBody, c)) {
                parser.attribName += c;
              } else {
                strictFail(parser, "Invalid attribute name");
              }
              continue;
            case S.ATTRIB_NAME_SAW_WHITE:
              if (c === "=") {
                parser.state = S.ATTRIB_VALUE;
              } else if (isWhitespace(c)) {
                continue;
              } else {
                strictFail(parser, "Attribute without value");
                parser.tag.attributes[parser.attribName] = "";
                parser.attribValue = "";
                emitNode(parser, "onattribute", {
                  name: parser.attribName,
                  value: ""
                });
                parser.attribName = "";
                if (c === ">") {
                  openTag(parser);
                } else if (isMatch(nameStart, c)) {
                  parser.attribName = c;
                  parser.state = S.ATTRIB_NAME;
                } else {
                  strictFail(parser, "Invalid attribute name");
                  parser.state = S.ATTRIB;
                }
              }
              continue;
            case S.ATTRIB_VALUE:
              if (isWhitespace(c)) {
                continue;
              } else if (isQuote(c)) {
                parser.q = c;
                parser.state = S.ATTRIB_VALUE_QUOTED;
              } else {
                if (!parser.opt.unquotedAttributeValues) {
                  error(parser, "Unquoted attribute value");
                }
                parser.state = S.ATTRIB_VALUE_UNQUOTED;
                parser.attribValue = c;
              }
              continue;
            case S.ATTRIB_VALUE_QUOTED:
              if (c !== parser.q) {
                if (c === "&") {
                  parser.state = S.ATTRIB_VALUE_ENTITY_Q;
                } else {
                  parser.attribValue += c;
                }
                continue;
              }
              attrib(parser);
              parser.q = "";
              parser.state = S.ATTRIB_VALUE_CLOSED;
              continue;
            case S.ATTRIB_VALUE_CLOSED:
              if (isWhitespace(c)) {
                parser.state = S.ATTRIB;
              } else if (c === ">") {
                openTag(parser);
              } else if (c === "/") {
                parser.state = S.OPEN_TAG_SLASH;
              } else if (isMatch(nameStart, c)) {
                strictFail(parser, "No whitespace between attributes");
                parser.attribName = c;
                parser.attribValue = "";
                parser.state = S.ATTRIB_NAME;
              } else {
                strictFail(parser, "Invalid attribute name");
              }
              continue;
            case S.ATTRIB_VALUE_UNQUOTED:
              if (!isAttribEnd(c)) {
                if (c === "&") {
                  parser.state = S.ATTRIB_VALUE_ENTITY_U;
                } else {
                  parser.attribValue += c;
                }
                continue;
              }
              attrib(parser);
              if (c === ">") {
                openTag(parser);
              } else {
                parser.state = S.ATTRIB;
              }
              continue;
            case S.CLOSE_TAG:
              if (!parser.tagName) {
                if (isWhitespace(c)) {
                  continue;
                } else if (notMatch(nameStart, c)) {
                  if (parser.script) {
                    parser.script += "</" + c;
                    parser.state = S.SCRIPT;
                  } else {
                    strictFail(parser, "Invalid tagname in closing tag.");
                  }
                } else {
                  parser.tagName = c;
                }
              } else if (c === ">") {
                closeTag(parser);
              } else if (isMatch(nameBody, c)) {
                parser.tagName += c;
              } else if (parser.script) {
                parser.script += "</" + parser.tagName;
                parser.tagName = "";
                parser.state = S.SCRIPT;
              } else {
                if (!isWhitespace(c)) {
                  strictFail(parser, "Invalid tagname in closing tag");
                }
                parser.state = S.CLOSE_TAG_SAW_WHITE;
              }
              continue;
            case S.CLOSE_TAG_SAW_WHITE:
              if (isWhitespace(c)) {
                continue;
              }
              if (c === ">") {
                closeTag(parser);
              } else {
                strictFail(parser, "Invalid characters in closing tag");
              }
              continue;
            case S.TEXT_ENTITY:
            case S.ATTRIB_VALUE_ENTITY_Q:
            case S.ATTRIB_VALUE_ENTITY_U:
              var returnState;
              var buffer;
              switch (parser.state) {
                case S.TEXT_ENTITY:
                  returnState = S.TEXT;
                  buffer = "textNode";
                  break;
                case S.ATTRIB_VALUE_ENTITY_Q:
                  returnState = S.ATTRIB_VALUE_QUOTED;
                  buffer = "attribValue";
                  break;
                case S.ATTRIB_VALUE_ENTITY_U:
                  returnState = S.ATTRIB_VALUE_UNQUOTED;
                  buffer = "attribValue";
                  break;
              }
              if (c === ";") {
                var parsedEntity = parseEntity(parser);
                if (parser.opt.unparsedEntities && !Object.values(sax.XML_ENTITIES).includes(parsedEntity)) {
                  parser.entity = "";
                  parser.state = returnState;
                  parser.write(parsedEntity);
                } else {
                  parser[buffer] += parsedEntity;
                  parser.entity = "";
                  parser.state = returnState;
                }
              } else if (isMatch(parser.entity.length ? entityBody : entityStart, c)) {
                parser.entity += c;
              } else {
                strictFail(parser, "Invalid character in entity name");
                parser[buffer] += "&" + parser.entity + c;
                parser.entity = "";
                parser.state = returnState;
              }
              continue;
            default: {
              throw new Error(parser, "Unknown state: " + parser.state);
            }
          }
        }
        if (parser.position >= parser.bufferCheckPosition) {
          checkBufferLength(parser);
        }
        return parser;
      }
      if (!String.fromCodePoint) {
        (function() {
          var stringFromCharCode = String.fromCharCode;
          var floor = Math.floor;
          var fromCodePoint = function() {
            var MAX_SIZE = 16384;
            var codeUnits = [];
            var highSurrogate;
            var lowSurrogate;
            var index = -1;
            var length = arguments.length;
            if (!length) {
              return "";
            }
            var result = "";
            while (++index < length) {
              var codePoint = Number(arguments[index]);
              if (!isFinite(codePoint) || // `NaN`, `+Infinity`, or `-Infinity`
              codePoint < 0 || // not a valid Unicode code point
              codePoint > 1114111 || // not a valid Unicode code point
              floor(codePoint) !== codePoint) {
                throw RangeError("Invalid code point: " + codePoint);
              }
              if (codePoint <= 65535) {
                codeUnits.push(codePoint);
              } else {
                codePoint -= 65536;
                highSurrogate = (codePoint >> 10) + 55296;
                lowSurrogate = codePoint % 1024 + 56320;
                codeUnits.push(highSurrogate, lowSurrogate);
              }
              if (index + 1 === length || codeUnits.length > MAX_SIZE) {
                result += stringFromCharCode.apply(null, codeUnits);
                codeUnits.length = 0;
              }
            }
            return result;
          };
          if (Object.defineProperty) {
            Object.defineProperty(String, "fromCodePoint", {
              value: fromCodePoint,
              configurable: true,
              writable: true
            });
          } else {
            String.fromCodePoint = fromCodePoint;
          }
        })();
      }
    })(typeof exports === "undefined" ? exports.sax = {} : exports);
  }
});

// node_modules/miniget/dist/index.js
var require_dist = __commonJS({
  "node_modules/miniget/dist/index.js"(exports, module) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    var http_1 = __importDefault(__require("http"));
    var https_1 = __importDefault(__require("https"));
    var stream_1 = __require("stream");
    var httpLibs = { "http:": http_1.default, "https:": https_1.default };
    var redirectStatusCodes = /* @__PURE__ */ new Set([301, 302, 303, 307, 308]);
    var retryStatusCodes = /* @__PURE__ */ new Set([429, 503]);
    var requestEvents = ["connect", "continue", "information", "socket", "timeout", "upgrade"];
    var responseEvents = ["aborted"];
    Miniget.MinigetError = class MinigetError extends Error {
      constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
      }
    };
    Miniget.defaultOptions = {
      maxRedirects: 10,
      maxRetries: 2,
      maxReconnects: 0,
      backoff: { inc: 100, max: 1e4 }
    };
    function Miniget(url, options = {}) {
      var _a;
      const opts = Object.assign({}, Miniget.defaultOptions, options);
      const stream = new stream_1.PassThrough({ highWaterMark: opts.highWaterMark });
      stream.destroyed = stream.aborted = false;
      let activeRequest;
      let activeResponse;
      let activeDecodedStream;
      let redirects = 0;
      let retries = 0;
      let retryTimeout;
      let reconnects = 0;
      let contentLength;
      let acceptRanges = false;
      let rangeStart = 0, rangeEnd;
      let downloaded = 0;
      if ((_a = opts.headers) === null || _a === void 0 ? void 0 : _a.Range) {
        let r = /bytes=(\d+)-(\d+)?/.exec(`${opts.headers.Range}`);
        if (r) {
          rangeStart = parseInt(r[1], 10);
          rangeEnd = parseInt(r[2], 10);
        }
      }
      if (opts.acceptEncoding) {
        opts.headers = Object.assign({
          "Accept-Encoding": Object.keys(opts.acceptEncoding).join(", ")
        }, opts.headers);
      }
      const downloadHasStarted = () => activeDecodedStream && downloaded > 0;
      const downloadComplete = () => !acceptRanges || downloaded === contentLength;
      const reconnect = (err) => {
        activeDecodedStream = null;
        retries = 0;
        let inc = opts.backoff.inc;
        let ms = Math.min(inc, opts.backoff.max);
        retryTimeout = setTimeout(doDownload, ms);
        stream.emit("reconnect", reconnects, err);
      };
      const reconnectIfEndedEarly = (err) => {
        if (options.method !== "HEAD" && !downloadComplete() && reconnects++ < opts.maxReconnects) {
          reconnect(err);
          return true;
        }
        return false;
      };
      const retryRequest = (retryOptions) => {
        if (stream.destroyed) {
          return false;
        }
        if (downloadHasStarted()) {
          return reconnectIfEndedEarly(retryOptions.err);
        } else if ((!retryOptions.err || retryOptions.err.message === "ENOTFOUND") && retries++ < opts.maxRetries) {
          let ms = retryOptions.retryAfter || Math.min(retries * opts.backoff.inc, opts.backoff.max);
          retryTimeout = setTimeout(doDownload, ms);
          stream.emit("retry", retries, retryOptions.err);
          return true;
        }
        return false;
      };
      const forwardEvents = (ee, events) => {
        for (let event of events) {
          ee.on(event, stream.emit.bind(stream, event));
        }
      };
      const doDownload = () => {
        let parsed = {}, httpLib;
        try {
          let urlObj = typeof url === "string" ? new URL(url) : url;
          parsed = Object.assign({}, {
            host: urlObj.host,
            hostname: urlObj.hostname,
            path: urlObj.pathname + urlObj.search + urlObj.hash,
            port: urlObj.port,
            protocol: urlObj.protocol
          });
          if (urlObj.username) {
            parsed.auth = `${urlObj.username}:${urlObj.password}`;
          }
          httpLib = httpLibs[String(parsed.protocol)];
        } catch (err) {
        }
        if (!httpLib) {
          stream.emit("error", new Miniget.MinigetError(`Invalid URL: ${url}`));
          return;
        }
        Object.assign(parsed, opts);
        if (acceptRanges && downloaded > 0) {
          let start = downloaded + rangeStart;
          let end = rangeEnd || "";
          parsed.headers = Object.assign({}, parsed.headers, {
            Range: `bytes=${start}-${end}`
          });
        }
        if (opts.transform) {
          try {
            parsed = opts.transform(parsed);
          } catch (err) {
            stream.emit("error", err);
            return;
          }
          if (!parsed || parsed.protocol) {
            httpLib = httpLibs[String(parsed === null || parsed === void 0 ? void 0 : parsed.protocol)];
            if (!httpLib) {
              stream.emit("error", new Miniget.MinigetError("Invalid URL object from `transform` function"));
              return;
            }
          }
        }
        const onError = (err) => {
          if (stream.destroyed || stream.readableEnded) {
            return;
          }
          cleanup();
          if (!retryRequest({ err })) {
            stream.emit("error", err);
          } else {
            activeRequest.removeListener("close", onRequestClose);
          }
        };
        const onRequestClose = () => {
          cleanup();
          retryRequest({});
        };
        const cleanup = () => {
          activeRequest.removeListener("close", onRequestClose);
          activeResponse === null || activeResponse === void 0 ? void 0 : activeResponse.removeListener("data", onData);
          activeDecodedStream === null || activeDecodedStream === void 0 ? void 0 : activeDecodedStream.removeListener("end", onEnd);
        };
        const onData = (chunk) => {
          downloaded += chunk.length;
        };
        const onEnd = () => {
          cleanup();
          if (!reconnectIfEndedEarly()) {
            stream.end();
          }
        };
        activeRequest = httpLib.request(parsed, (res) => {
          if (stream.destroyed) {
            return;
          }
          if (redirectStatusCodes.has(res.statusCode)) {
            if (redirects++ >= opts.maxRedirects) {
              stream.emit("error", new Miniget.MinigetError("Too many redirects"));
            } else {
              if (res.headers.location) {
                url = res.headers.location;
              } else {
                let err = new Miniget.MinigetError("Redirect status code given with no location", res.statusCode);
                stream.emit("error", err);
                cleanup();
                return;
              }
              setTimeout(doDownload, parseInt(res.headers["retry-after"] || "0", 10) * 1e3);
              stream.emit("redirect", url);
            }
            cleanup();
            return;
          } else if (retryStatusCodes.has(res.statusCode)) {
            if (!retryRequest({ retryAfter: parseInt(res.headers["retry-after"] || "0", 10) })) {
              let err = new Miniget.MinigetError(`Status code: ${res.statusCode}`, res.statusCode);
              stream.emit("error", err);
            }
            cleanup();
            return;
          } else if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 400)) {
            let err = new Miniget.MinigetError(`Status code: ${res.statusCode}`, res.statusCode);
            if (res.statusCode >= 500) {
              onError(err);
            } else {
              stream.emit("error", err);
            }
            cleanup();
            return;
          }
          activeDecodedStream = res;
          if (opts.acceptEncoding && res.headers["content-encoding"]) {
            for (let enc of res.headers["content-encoding"].split(", ").reverse()) {
              let fn = opts.acceptEncoding[enc];
              if (fn) {
                activeDecodedStream = activeDecodedStream.pipe(fn());
                activeDecodedStream.on("error", onError);
              }
            }
          }
          if (!contentLength) {
            contentLength = parseInt(`${res.headers["content-length"]}`, 10);
            acceptRanges = res.headers["accept-ranges"] === "bytes" && contentLength > 0 && opts.maxReconnects > 0;
          }
          res.on("data", onData);
          activeDecodedStream.on("end", onEnd);
          activeDecodedStream.pipe(stream, { end: !acceptRanges });
          activeResponse = res;
          stream.emit("response", res);
          res.on("error", onError);
          forwardEvents(res, responseEvents);
        });
        activeRequest.on("error", onError);
        activeRequest.on("close", onRequestClose);
        forwardEvents(activeRequest, requestEvents);
        if (stream.destroyed) {
          streamDestroy(...destroyArgs);
        }
        stream.emit("request", activeRequest);
        activeRequest.end();
      };
      stream.abort = (err) => {
        console.warn("`MinigetStream#abort()` has been deprecated in favor of `MinigetStream#destroy()`");
        stream.aborted = true;
        stream.emit("abort");
        stream.destroy(err);
      };
      let destroyArgs = [];
      const streamDestroy = (err) => {
        activeRequest.destroy(err);
        activeDecodedStream === null || activeDecodedStream === void 0 ? void 0 : activeDecodedStream.unpipe(stream);
        activeDecodedStream === null || activeDecodedStream === void 0 ? void 0 : activeDecodedStream.destroy();
        clearTimeout(retryTimeout);
      };
      stream._destroy = (...args) => {
        stream.destroyed = true;
        if (activeRequest) {
          streamDestroy(...args);
        } else {
          destroyArgs = args;
        }
      };
      stream.text = () => new Promise((resolve, reject) => {
        let body = "";
        stream.setEncoding("utf8");
        stream.on("data", (chunk) => body += chunk);
        stream.on("end", () => resolve(body));
        stream.on("error", reject);
      });
      process.nextTick(doDownload);
      return stream;
    }
    module.exports = Miniget;
  }
});

// node_modules/ytdl-core/package.json
var require_package = __commonJS({
  "node_modules/ytdl-core/package.json"(exports, module) {
    module.exports = {
      name: "ytdl-core",
      description: "YouTube video downloader in pure javascript.",
      keywords: [
        "youtube",
        "video",
        "download"
      ],
      version: "4.11.5",
      repository: {
        type: "git",
        url: "git://github.com/fent/node-ytdl-core.git"
      },
      author: "fent <fentbox@gmail.com> (https://github.com/fent)",
      contributors: [
        "Tobias Kutscha (https://github.com/TimeForANinja)",
        "Andrew Kelley (https://github.com/andrewrk)",
        "Mauricio Allende (https://github.com/mallendeo)",
        "Rodrigo Altamirano (https://github.com/raltamirano)",
        "Jim Buck (https://github.com/JimmyBoh)",
        "Pawe\u0142 Ruci\u0144ski (https://github.com/Roki100)",
        "Alexander Paolini (https://github.com/Million900o)"
      ],
      main: "./lib/index.js",
      types: "./typings/index.d.ts",
      files: [
        "lib",
        "typings"
      ],
      scripts: {
        test: "nyc --reporter=lcov --reporter=text-summary npm run test:unit",
        "test:unit": "mocha --ignore test/irl-test.js test/*-test.js --timeout 4000",
        "test:irl": "mocha --timeout 16000 test/irl-test.js",
        lint: "eslint ./",
        "lint:fix": "eslint --fix ./",
        "lint:typings": "tslint typings/index.d.ts",
        "lint:typings:fix": "tslint --fix typings/index.d.ts"
      },
      dependencies: {
        m3u8stream: "^0.8.6",
        miniget: "^4.2.2",
        sax: "^1.1.3"
      },
      devDependencies: {
        "@types/node": "^13.1.0",
        "assert-diff": "^3.0.1",
        dtslint: "^3.6.14",
        eslint: "^6.8.0",
        mocha: "^7.0.0",
        "muk-require": "^1.2.0",
        nock: "^13.0.4",
        nyc: "^15.0.0",
        sinon: "^9.0.0",
        "stream-equal": "~1.1.0",
        typescript: "^3.9.7"
      },
      engines: {
        node: ">=12"
      },
      license: "MIT"
    };
  }
});

// node_modules/ytdl-core/lib/utils.js
var require_utils = __commonJS({
  "node_modules/ytdl-core/lib/utils.js"(exports) {
    var miniget = require_dist();
    exports.between = (haystack, left, right) => {
      let pos;
      if (left instanceof RegExp) {
        const match = haystack.match(left);
        if (!match) {
          return "";
        }
        pos = match.index + match[0].length;
      } else {
        pos = haystack.indexOf(left);
        if (pos === -1) {
          return "";
        }
        pos += left.length;
      }
      haystack = haystack.slice(pos);
      pos = haystack.indexOf(right);
      if (pos === -1) {
        return "";
      }
      haystack = haystack.slice(0, pos);
      return haystack;
    };
    exports.parseAbbreviatedNumber = (string) => {
      const match = string.replace(",", ".").replace(" ", "").match(/([\d,.]+)([MK]?)/);
      if (match) {
        let [, num, multi] = match;
        num = parseFloat(num);
        return Math.round(multi === "M" ? num * 1e6 : multi === "K" ? num * 1e3 : num);
      }
      return null;
    };
    var ESCAPING_SEQUENZES = [
      // Strings
      { start: '"', end: '"' },
      { start: "'", end: "'" },
      { start: "`", end: "`" },
      // RegeEx
      { start: "/", end: "/", startPrefix: /(^|[[{:;,/])\s?$/ }
    ];
    exports.cutAfterJS = (mixedJson) => {
      let open, close;
      if (mixedJson[0] === "[") {
        open = "[";
        close = "]";
      } else if (mixedJson[0] === "{") {
        open = "{";
        close = "}";
      }
      if (!open) {
        throw new Error(`Can't cut unsupported JSON (need to begin with [ or { ) but got: ${mixedJson[0]}`);
      }
      let isEscapedObject = null;
      let isEscaped = false;
      let counter = 0;
      let i;
      for (i = 0; i < mixedJson.length; i++) {
        if (!isEscaped && isEscapedObject !== null && mixedJson[i] === isEscapedObject.end) {
          isEscapedObject = null;
          continue;
        } else if (!isEscaped && isEscapedObject === null) {
          for (const escaped of ESCAPING_SEQUENZES) {
            if (mixedJson[i] !== escaped.start)
              continue;
            if (!escaped.startPrefix || mixedJson.substring(i - 10, i).match(escaped.startPrefix)) {
              isEscapedObject = escaped;
              break;
            }
          }
          if (isEscapedObject !== null) {
            continue;
          }
        }
        isEscaped = mixedJson[i] === "\\" && !isEscaped;
        if (isEscapedObject !== null)
          continue;
        if (mixedJson[i] === open) {
          counter++;
        } else if (mixedJson[i] === close) {
          counter--;
        }
        if (counter === 0) {
          return mixedJson.substring(0, i + 1);
        }
      }
      throw Error("Can't cut unsupported JSON (no matching closing bracket found)");
    };
    exports.playError = (player_response, statuses, ErrorType = Error) => {
      let playability = player_response && player_response.playabilityStatus;
      if (playability && statuses.includes(playability.status)) {
        return new ErrorType(playability.reason || playability.messages && playability.messages[0]);
      }
      return null;
    };
    exports.exposedMiniget = (url, options = {}, requestOptionsOverwrite) => {
      const req = miniget(url, requestOptionsOverwrite || options.requestOptions);
      if (typeof options.requestCallback === "function")
        options.requestCallback(req);
      return req;
    };
    exports.deprecate = (obj, prop, value, oldPath, newPath) => {
      Object.defineProperty(obj, prop, {
        get: () => {
          console.warn(`\`${oldPath}\` will be removed in a near future release, use \`${newPath}\` instead.`);
          return value;
        }
      });
    };
    var pkg = require_package();
    var UPDATE_INTERVAL = 1e3 * 60 * 60 * 12;
    exports.lastUpdateCheck = 0;
    exports.checkForUpdates = () => {
      if (!process.env.YTDL_NO_UPDATE && !pkg.version.startsWith("0.0.0-") && Date.now() - exports.lastUpdateCheck >= UPDATE_INTERVAL) {
        exports.lastUpdateCheck = Date.now();
        return miniget("https://api.github.com/repos/fent/node-ytdl-core/releases/latest", {
          headers: { "User-Agent": "ytdl-core" }
        }).text().then((response) => {
          if (JSON.parse(response).tag_name !== `v${pkg.version}`) {
            console.warn('\x1B[33mWARNING:\x1B[0m ytdl-core is out of date! Update with "npm install ytdl-core@latest".');
          }
        }, (err) => {
          console.warn("Error checking for updates:", err.message);
          console.warn("You can disable this check by setting the `YTDL_NO_UPDATE` env variable.");
        });
      }
      return null;
    };
    exports.getRandomIPv6 = (ip) => {
      if (!isIPv6(ip))
        throw Error("Invalid IPv6 format");
      const [rawAddr, rawMask] = ip.split("/");
      let base10Mask = parseInt(rawMask);
      if (!base10Mask || base10Mask > 128 || base10Mask < 24)
        throw Error("Invalid IPv6 subnet");
      const base10addr = normalizeIP(rawAddr);
      const randomAddr = new Array(8).fill(1).map(() => Math.floor(Math.random() * 65535));
      const mergedAddr = randomAddr.map((randomItem, idx) => {
        const staticBits = Math.min(base10Mask, 16);
        base10Mask -= staticBits;
        const mask = 65535 - (2 ** (16 - staticBits) - 1);
        return (base10addr[idx] & mask) + (randomItem & (mask ^ 65535));
      });
      return mergedAddr.map((x) => x.toString("16")).join(":");
    };
    var IPV6_REGEX = /^(([0-9a-f]{1,4}:)(:[0-9a-f]{1,4}){1,6}|([0-9a-f]{1,4}:){1,2}(:[0-9a-f]{1,4}){1,5}|([0-9a-f]{1,4}:){1,3}(:[0-9a-f]{1,4}){1,4}|([0-9a-f]{1,4}:){1,4}(:[0-9a-f]{1,4}){1,3}|([0-9a-f]{1,4}:){1,5}(:[0-9a-f]{1,4}){1,2}|([0-9a-f]{1,4}:){1,6}(:[0-9a-f]{1,4})|([0-9a-f]{1,4}:){1,7}(([0-9a-f]{1,4})|:))\/(1[0-1]\d|12[0-8]|\d{1,2})$/;
    var isIPv6 = exports.isIPv6 = (ip) => IPV6_REGEX.test(ip);
    var normalizeIP = exports.normalizeIP = (ip) => {
      const parts = ip.split("::").map((x) => x.split(":"));
      const partStart = parts[0] || [];
      const partEnd = parts[1] || [];
      partEnd.reverse();
      const fullIP = new Array(8).fill(0);
      for (let i = 0; i < Math.min(partStart.length, 8); i++) {
        fullIP[i] = parseInt(partStart[i], 16) || 0;
      }
      for (let i = 0; i < Math.min(partEnd.length, 8); i++) {
        fullIP[7 - i] = parseInt(partEnd[i], 16) || 0;
      }
      return fullIP;
    };
  }
});

// node_modules/ytdl-core/lib/formats.js
var require_formats = __commonJS({
  "node_modules/ytdl-core/lib/formats.js"(exports, module) {
    module.exports = {
      5: {
        mimeType: 'video/flv; codecs="Sorenson H.283, mp3"',
        qualityLabel: "240p",
        bitrate: 25e4,
        audioBitrate: 64
      },
      6: {
        mimeType: 'video/flv; codecs="Sorenson H.263, mp3"',
        qualityLabel: "270p",
        bitrate: 8e5,
        audioBitrate: 64
      },
      13: {
        mimeType: 'video/3gp; codecs="MPEG-4 Visual, aac"',
        qualityLabel: null,
        bitrate: 5e5,
        audioBitrate: null
      },
      17: {
        mimeType: 'video/3gp; codecs="MPEG-4 Visual, aac"',
        qualityLabel: "144p",
        bitrate: 5e4,
        audioBitrate: 24
      },
      18: {
        mimeType: 'video/mp4; codecs="H.264, aac"',
        qualityLabel: "360p",
        bitrate: 5e5,
        audioBitrate: 96
      },
      22: {
        mimeType: 'video/mp4; codecs="H.264, aac"',
        qualityLabel: "720p",
        bitrate: 2e6,
        audioBitrate: 192
      },
      34: {
        mimeType: 'video/flv; codecs="H.264, aac"',
        qualityLabel: "360p",
        bitrate: 5e5,
        audioBitrate: 128
      },
      35: {
        mimeType: 'video/flv; codecs="H.264, aac"',
        qualityLabel: "480p",
        bitrate: 8e5,
        audioBitrate: 128
      },
      36: {
        mimeType: 'video/3gp; codecs="MPEG-4 Visual, aac"',
        qualityLabel: "240p",
        bitrate: 175e3,
        audioBitrate: 32
      },
      37: {
        mimeType: 'video/mp4; codecs="H.264, aac"',
        qualityLabel: "1080p",
        bitrate: 3e6,
        audioBitrate: 192
      },
      38: {
        mimeType: 'video/mp4; codecs="H.264, aac"',
        qualityLabel: "3072p",
        bitrate: 35e5,
        audioBitrate: 192
      },
      43: {
        mimeType: 'video/webm; codecs="VP8, vorbis"',
        qualityLabel: "360p",
        bitrate: 5e5,
        audioBitrate: 128
      },
      44: {
        mimeType: 'video/webm; codecs="VP8, vorbis"',
        qualityLabel: "480p",
        bitrate: 1e6,
        audioBitrate: 128
      },
      45: {
        mimeType: 'video/webm; codecs="VP8, vorbis"',
        qualityLabel: "720p",
        bitrate: 2e6,
        audioBitrate: 192
      },
      46: {
        mimeType: 'audio/webm; codecs="vp8, vorbis"',
        qualityLabel: "1080p",
        bitrate: null,
        audioBitrate: 192
      },
      82: {
        mimeType: 'video/mp4; codecs="H.264, aac"',
        qualityLabel: "360p",
        bitrate: 5e5,
        audioBitrate: 96
      },
      83: {
        mimeType: 'video/mp4; codecs="H.264, aac"',
        qualityLabel: "240p",
        bitrate: 5e5,
        audioBitrate: 96
      },
      84: {
        mimeType: 'video/mp4; codecs="H.264, aac"',
        qualityLabel: "720p",
        bitrate: 2e6,
        audioBitrate: 192
      },
      85: {
        mimeType: 'video/mp4; codecs="H.264, aac"',
        qualityLabel: "1080p",
        bitrate: 3e6,
        audioBitrate: 192
      },
      91: {
        mimeType: 'video/ts; codecs="H.264, aac"',
        qualityLabel: "144p",
        bitrate: 1e5,
        audioBitrate: 48
      },
      92: {
        mimeType: 'video/ts; codecs="H.264, aac"',
        qualityLabel: "240p",
        bitrate: 15e4,
        audioBitrate: 48
      },
      93: {
        mimeType: 'video/ts; codecs="H.264, aac"',
        qualityLabel: "360p",
        bitrate: 5e5,
        audioBitrate: 128
      },
      94: {
        mimeType: 'video/ts; codecs="H.264, aac"',
        qualityLabel: "480p",
        bitrate: 8e5,
        audioBitrate: 128
      },
      95: {
        mimeType: 'video/ts; codecs="H.264, aac"',
        qualityLabel: "720p",
        bitrate: 15e5,
        audioBitrate: 256
      },
      96: {
        mimeType: 'video/ts; codecs="H.264, aac"',
        qualityLabel: "1080p",
        bitrate: 25e5,
        audioBitrate: 256
      },
      100: {
        mimeType: 'audio/webm; codecs="VP8, vorbis"',
        qualityLabel: "360p",
        bitrate: null,
        audioBitrate: 128
      },
      101: {
        mimeType: 'audio/webm; codecs="VP8, vorbis"',
        qualityLabel: "360p",
        bitrate: null,
        audioBitrate: 192
      },
      102: {
        mimeType: 'audio/webm; codecs="VP8, vorbis"',
        qualityLabel: "720p",
        bitrate: null,
        audioBitrate: 192
      },
      120: {
        mimeType: 'video/flv; codecs="H.264, aac"',
        qualityLabel: "720p",
        bitrate: 2e6,
        audioBitrate: 128
      },
      127: {
        mimeType: 'audio/ts; codecs="aac"',
        qualityLabel: null,
        bitrate: null,
        audioBitrate: 96
      },
      128: {
        mimeType: 'audio/ts; codecs="aac"',
        qualityLabel: null,
        bitrate: null,
        audioBitrate: 96
      },
      132: {
        mimeType: 'video/ts; codecs="H.264, aac"',
        qualityLabel: "240p",
        bitrate: 15e4,
        audioBitrate: 48
      },
      133: {
        mimeType: 'video/mp4; codecs="H.264"',
        qualityLabel: "240p",
        bitrate: 2e5,
        audioBitrate: null
      },
      134: {
        mimeType: 'video/mp4; codecs="H.264"',
        qualityLabel: "360p",
        bitrate: 3e5,
        audioBitrate: null
      },
      135: {
        mimeType: 'video/mp4; codecs="H.264"',
        qualityLabel: "480p",
        bitrate: 5e5,
        audioBitrate: null
      },
      136: {
        mimeType: 'video/mp4; codecs="H.264"',
        qualityLabel: "720p",
        bitrate: 1e6,
        audioBitrate: null
      },
      137: {
        mimeType: 'video/mp4; codecs="H.264"',
        qualityLabel: "1080p",
        bitrate: 25e5,
        audioBitrate: null
      },
      138: {
        mimeType: 'video/mp4; codecs="H.264"',
        qualityLabel: "4320p",
        bitrate: 135e5,
        audioBitrate: null
      },
      139: {
        mimeType: 'audio/mp4; codecs="aac"',
        qualityLabel: null,
        bitrate: null,
        audioBitrate: 48
      },
      140: {
        mimeType: 'audio/m4a; codecs="aac"',
        qualityLabel: null,
        bitrate: null,
        audioBitrate: 128
      },
      141: {
        mimeType: 'audio/mp4; codecs="aac"',
        qualityLabel: null,
        bitrate: null,
        audioBitrate: 256
      },
      151: {
        mimeType: 'video/ts; codecs="H.264, aac"',
        qualityLabel: "720p",
        bitrate: 5e4,
        audioBitrate: 24
      },
      160: {
        mimeType: 'video/mp4; codecs="H.264"',
        qualityLabel: "144p",
        bitrate: 1e5,
        audioBitrate: null
      },
      171: {
        mimeType: 'audio/webm; codecs="vorbis"',
        qualityLabel: null,
        bitrate: null,
        audioBitrate: 128
      },
      172: {
        mimeType: 'audio/webm; codecs="vorbis"',
        qualityLabel: null,
        bitrate: null,
        audioBitrate: 192
      },
      242: {
        mimeType: 'video/webm; codecs="VP9"',
        qualityLabel: "240p",
        bitrate: 1e5,
        audioBitrate: null
      },
      243: {
        mimeType: 'video/webm; codecs="VP9"',
        qualityLabel: "360p",
        bitrate: 25e4,
        audioBitrate: null
      },
      244: {
        mimeType: 'video/webm; codecs="VP9"',
        qualityLabel: "480p",
        bitrate: 5e5,
        audioBitrate: null
      },
      247: {
        mimeType: 'video/webm; codecs="VP9"',
        qualityLabel: "720p",
        bitrate: 7e5,
        audioBitrate: null
      },
      248: {
        mimeType: 'video/webm; codecs="VP9"',
        qualityLabel: "1080p",
        bitrate: 15e5,
        audioBitrate: null
      },
      249: {
        mimeType: 'audio/webm; codecs="opus"',
        qualityLabel: null,
        bitrate: null,
        audioBitrate: 48
      },
      250: {
        mimeType: 'audio/webm; codecs="opus"',
        qualityLabel: null,
        bitrate: null,
        audioBitrate: 64
      },
      251: {
        mimeType: 'audio/webm; codecs="opus"',
        qualityLabel: null,
        bitrate: null,
        audioBitrate: 160
      },
      264: {
        mimeType: 'video/mp4; codecs="H.264"',
        qualityLabel: "1440p",
        bitrate: 4e6,
        audioBitrate: null
      },
      266: {
        mimeType: 'video/mp4; codecs="H.264"',
        qualityLabel: "2160p",
        bitrate: 125e5,
        audioBitrate: null
      },
      271: {
        mimeType: 'video/webm; codecs="VP9"',
        qualityLabel: "1440p",
        bitrate: 9e6,
        audioBitrate: null
      },
      272: {
        mimeType: 'video/webm; codecs="VP9"',
        qualityLabel: "4320p",
        bitrate: 2e7,
        audioBitrate: null
      },
      278: {
        mimeType: 'video/webm; codecs="VP9"',
        qualityLabel: "144p 30fps",
        bitrate: 8e4,
        audioBitrate: null
      },
      298: {
        mimeType: 'video/mp4; codecs="H.264"',
        qualityLabel: "720p",
        bitrate: 3e6,
        audioBitrate: null
      },
      299: {
        mimeType: 'video/mp4; codecs="H.264"',
        qualityLabel: "1080p",
        bitrate: 55e5,
        audioBitrate: null
      },
      300: {
        mimeType: 'video/ts; codecs="H.264, aac"',
        qualityLabel: "720p",
        bitrate: 1318e3,
        audioBitrate: 48
      },
      302: {
        mimeType: 'video/webm; codecs="VP9"',
        qualityLabel: "720p HFR",
        bitrate: 25e5,
        audioBitrate: null
      },
      303: {
        mimeType: 'video/webm; codecs="VP9"',
        qualityLabel: "1080p HFR",
        bitrate: 5e6,
        audioBitrate: null
      },
      308: {
        mimeType: 'video/webm; codecs="VP9"',
        qualityLabel: "1440p HFR",
        bitrate: 1e7,
        audioBitrate: null
      },
      313: {
        mimeType: 'video/webm; codecs="VP9"',
        qualityLabel: "2160p",
        bitrate: 13e6,
        audioBitrate: null
      },
      315: {
        mimeType: 'video/webm; codecs="VP9"',
        qualityLabel: "2160p HFR",
        bitrate: 2e7,
        audioBitrate: null
      },
      330: {
        mimeType: 'video/webm; codecs="VP9"',
        qualityLabel: "144p HDR, HFR",
        bitrate: 8e4,
        audioBitrate: null
      },
      331: {
        mimeType: 'video/webm; codecs="VP9"',
        qualityLabel: "240p HDR, HFR",
        bitrate: 1e5,
        audioBitrate: null
      },
      332: {
        mimeType: 'video/webm; codecs="VP9"',
        qualityLabel: "360p HDR, HFR",
        bitrate: 25e4,
        audioBitrate: null
      },
      333: {
        mimeType: 'video/webm; codecs="VP9"',
        qualityLabel: "240p HDR, HFR",
        bitrate: 5e5,
        audioBitrate: null
      },
      334: {
        mimeType: 'video/webm; codecs="VP9"',
        qualityLabel: "720p HDR, HFR",
        bitrate: 1e6,
        audioBitrate: null
      },
      335: {
        mimeType: 'video/webm; codecs="VP9"',
        qualityLabel: "1080p HDR, HFR",
        bitrate: 15e5,
        audioBitrate: null
      },
      336: {
        mimeType: 'video/webm; codecs="VP9"',
        qualityLabel: "1440p HDR, HFR",
        bitrate: 5e6,
        audioBitrate: null
      },
      337: {
        mimeType: 'video/webm; codecs="VP9"',
        qualityLabel: "2160p HDR, HFR",
        bitrate: 12e6,
        audioBitrate: null
      }
    };
  }
});

// node_modules/ytdl-core/lib/format-utils.js
var require_format_utils = __commonJS({
  "node_modules/ytdl-core/lib/format-utils.js"(exports) {
    var utils = require_utils();
    var FORMATS = require_formats();
    var audioEncodingRanks = [
      "mp4a",
      "mp3",
      "vorbis",
      "aac",
      "opus",
      "flac"
    ];
    var videoEncodingRanks = [
      "mp4v",
      "avc1",
      "Sorenson H.283",
      "MPEG-4 Visual",
      "VP8",
      "VP9",
      "H.264"
    ];
    var getVideoBitrate = (format) => format.bitrate || 0;
    var getVideoEncodingRank = (format) => videoEncodingRanks.findIndex((enc) => format.codecs && format.codecs.includes(enc));
    var getAudioBitrate = (format) => format.audioBitrate || 0;
    var getAudioEncodingRank = (format) => audioEncodingRanks.findIndex((enc) => format.codecs && format.codecs.includes(enc));
    var sortFormatsBy = (a, b, sortBy) => {
      let res = 0;
      for (let fn of sortBy) {
        res = fn(b) - fn(a);
        if (res !== 0) {
          break;
        }
      }
      return res;
    };
    var sortFormatsByVideo = (a, b) => sortFormatsBy(a, b, [
      (format) => parseInt(format.qualityLabel),
      getVideoBitrate,
      getVideoEncodingRank
    ]);
    var sortFormatsByAudio = (a, b) => sortFormatsBy(a, b, [
      getAudioBitrate,
      getAudioEncodingRank
    ]);
    exports.sortFormats = (a, b) => sortFormatsBy(a, b, [
      // Formats with both video and audio are ranked highest.
      (format) => +!!format.isHLS,
      (format) => +!!format.isDashMPD,
      (format) => +(format.contentLength > 0),
      (format) => +(format.hasVideo && format.hasAudio),
      (format) => +format.hasVideo,
      (format) => parseInt(format.qualityLabel) || 0,
      getVideoBitrate,
      getAudioBitrate,
      getVideoEncodingRank,
      getAudioEncodingRank
    ]);
    exports.chooseFormat = (formats, options) => {
      if (typeof options.format === "object") {
        if (!options.format.url) {
          throw Error("Invalid format given, did you use `ytdl.getInfo()`?");
        }
        return options.format;
      }
      if (options.filter) {
        formats = exports.filterFormats(formats, options.filter);
      }
      if (formats.some((fmt) => fmt.isHLS)) {
        formats = formats.filter((fmt) => fmt.isHLS || !fmt.isLive);
      }
      let format;
      const quality = options.quality || "highest";
      switch (quality) {
        case "highest":
          format = formats[0];
          break;
        case "lowest":
          format = formats[formats.length - 1];
          break;
        case "highestaudio": {
          formats = exports.filterFormats(formats, "audio");
          formats.sort(sortFormatsByAudio);
          const bestAudioFormat = formats[0];
          formats = formats.filter((f) => sortFormatsByAudio(bestAudioFormat, f) === 0);
          const worstVideoQuality = formats.map((f) => parseInt(f.qualityLabel) || 0).sort((a, b) => a - b)[0];
          format = formats.find((f) => (parseInt(f.qualityLabel) || 0) === worstVideoQuality);
          break;
        }
        case "lowestaudio":
          formats = exports.filterFormats(formats, "audio");
          formats.sort(sortFormatsByAudio);
          format = formats[formats.length - 1];
          break;
        case "highestvideo": {
          formats = exports.filterFormats(formats, "video");
          formats.sort(sortFormatsByVideo);
          const bestVideoFormat = formats[0];
          formats = formats.filter((f) => sortFormatsByVideo(bestVideoFormat, f) === 0);
          const worstAudioQuality = formats.map((f) => f.audioBitrate || 0).sort((a, b) => a - b)[0];
          format = formats.find((f) => (f.audioBitrate || 0) === worstAudioQuality);
          break;
        }
        case "lowestvideo":
          formats = exports.filterFormats(formats, "video");
          formats.sort(sortFormatsByVideo);
          format = formats[formats.length - 1];
          break;
        default:
          format = getFormatByQuality(quality, formats);
          break;
      }
      if (!format) {
        throw Error(`No such format found: ${quality}`);
      }
      return format;
    };
    var getFormatByQuality = (quality, formats) => {
      let getFormat = (itag) => formats.find((format) => `${format.itag}` === `${itag}`);
      if (Array.isArray(quality)) {
        return getFormat(quality.find((q) => getFormat(q)));
      } else {
        return getFormat(quality);
      }
    };
    exports.filterFormats = (formats, filter) => {
      let fn;
      switch (filter) {
        case "videoandaudio":
        case "audioandvideo":
          fn = (format) => format.hasVideo && format.hasAudio;
          break;
        case "video":
          fn = (format) => format.hasVideo;
          break;
        case "videoonly":
          fn = (format) => format.hasVideo && !format.hasAudio;
          break;
        case "audio":
          fn = (format) => format.hasAudio;
          break;
        case "audioonly":
          fn = (format) => !format.hasVideo && format.hasAudio;
          break;
        default:
          if (typeof filter === "function") {
            fn = filter;
          } else {
            throw TypeError(`Given filter (${filter}) is not supported`);
          }
      }
      return formats.filter((format) => !!format.url && fn(format));
    };
    exports.addFormatMeta = (format) => {
      format = Object.assign({}, FORMATS[format.itag], format);
      format.hasVideo = !!format.qualityLabel;
      format.hasAudio = !!format.audioBitrate;
      format.container = format.mimeType ? format.mimeType.split(";")[0].split("/")[1] : null;
      format.codecs = format.mimeType ? utils.between(format.mimeType, 'codecs="', '"') : null;
      format.videoCodec = format.hasVideo && format.codecs ? format.codecs.split(", ")[0] : null;
      format.audioCodec = format.hasAudio && format.codecs ? format.codecs.split(", ").slice(-1)[0] : null;
      format.isLive = /\bsource[/=]yt_live_broadcast\b/.test(format.url);
      format.isHLS = /\/manifest\/hls_(variant|playlist)\//.test(format.url);
      format.isDashMPD = /\/manifest\/dash\//.test(format.url);
      return format;
    };
  }
});

// node_modules/ytdl-core/lib/url-utils.js
var require_url_utils = __commonJS({
  "node_modules/ytdl-core/lib/url-utils.js"(exports) {
    var validQueryDomains = /* @__PURE__ */ new Set([
      "youtube.com",
      "www.youtube.com",
      "m.youtube.com",
      "music.youtube.com",
      "gaming.youtube.com"
    ]);
    var validPathDomains = /^https?:\/\/(youtu\.be\/|(www\.)?youtube\.com\/(embed|v|shorts)\/)/;
    exports.getURLVideoID = (link) => {
      const parsed = new URL(link.trim());
      let id = parsed.searchParams.get("v");
      if (validPathDomains.test(link.trim()) && !id) {
        const paths = parsed.pathname.split("/");
        id = parsed.host === "youtu.be" ? paths[1] : paths[2];
      } else if (parsed.hostname && !validQueryDomains.has(parsed.hostname)) {
        throw Error("Not a YouTube domain");
      }
      if (!id) {
        throw Error(`No video id found: "${link}"`);
      }
      id = id.substring(0, 11);
      if (!exports.validateID(id)) {
        throw TypeError(`Video id (${id}) does not match expected format (${idRegex.toString()})`);
      }
      return id;
    };
    var urlRegex = /^https?:\/\//;
    exports.getVideoID = (str) => {
      if (exports.validateID(str)) {
        return str;
      } else if (urlRegex.test(str.trim())) {
        return exports.getURLVideoID(str);
      } else {
        throw Error(`No video id found: ${str}`);
      }
    };
    var idRegex = /^[a-zA-Z0-9-_]{11}$/;
    exports.validateID = (id) => idRegex.test(id.trim());
    exports.validateURL = (string) => {
      try {
        exports.getURLVideoID(string);
        return true;
      } catch (e) {
        return false;
      }
    };
  }
});

// node_modules/m3u8stream/dist/m3u8-parser.js
var require_m3u8_parser = __commonJS({
  "node_modules/m3u8stream/dist/m3u8-parser.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var stream_1 = __require("stream");
    var m3u8Parser = class extends stream_1.Writable {
      constructor() {
        super();
        this._lastLine = "";
        this._seq = 0;
        this._nextItemDuration = null;
        this._nextItemRange = null;
        this._lastItemRangeEnd = 0;
        this.on("finish", () => {
          this._parseLine(this._lastLine);
          this.emit("end");
        });
      }
      _parseAttrList(value) {
        let attrs = {};
        let regex = /([A-Z0-9-]+)=(?:"([^"]*?)"|([^,]*?))/g;
        let match;
        while ((match = regex.exec(value)) !== null) {
          attrs[match[1]] = match[2] || match[3];
        }
        return attrs;
      }
      _parseRange(value) {
        if (!value)
          return null;
        let svalue = value.split("@");
        let start = svalue[1] ? parseInt(svalue[1]) : this._lastItemRangeEnd + 1;
        let end = start + parseInt(svalue[0]) - 1;
        let range = { start, end };
        this._lastItemRangeEnd = range.end;
        return range;
      }
      _parseLine(line) {
        let match = line.match(/^#(EXT[A-Z0-9-]+)(?::(.*))?/);
        if (match) {
          const tag = match[1];
          const value = match[2] || "";
          switch (tag) {
            case "EXT-X-PROGRAM-DATE-TIME":
              this.emit("starttime", new Date(value).getTime());
              break;
            case "EXT-X-MEDIA-SEQUENCE":
              this._seq = parseInt(value);
              break;
            case "EXT-X-MAP": {
              let attrs = this._parseAttrList(value);
              if (!attrs.URI) {
                this.destroy(new Error("`EXT-X-MAP` found without required attribute `URI`"));
                return;
              }
              this.emit("item", {
                url: attrs.URI,
                seq: this._seq,
                init: true,
                duration: 0,
                range: this._parseRange(attrs.BYTERANGE)
              });
              break;
            }
            case "EXT-X-BYTERANGE": {
              this._nextItemRange = this._parseRange(value);
              break;
            }
            case "EXTINF":
              this._nextItemDuration = Math.round(parseFloat(value.split(",")[0]) * 1e3);
              break;
            case "EXT-X-ENDLIST":
              this.emit("endlist");
              break;
          }
        } else if (!/^#/.test(line) && line.trim()) {
          this.emit("item", {
            url: line.trim(),
            seq: this._seq++,
            duration: this._nextItemDuration,
            range: this._nextItemRange
          });
          this._nextItemRange = null;
        }
      }
      _write(chunk, encoding, callback) {
        let lines = chunk.toString("utf8").split("\n");
        if (this._lastLine) {
          lines[0] = this._lastLine + lines[0];
        }
        lines.forEach((line, i) => {
          if (this.destroyed)
            return;
          if (i < lines.length - 1) {
            this._parseLine(line);
          } else {
            this._lastLine = line;
          }
        });
        callback();
      }
    };
    exports.default = m3u8Parser;
  }
});

// node_modules/m3u8stream/dist/parse-time.js
var require_parse_time = __commonJS({
  "node_modules/m3u8stream/dist/parse-time.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.durationStr = exports.humanStr = void 0;
    var numberFormat = /^\d+$/;
    var timeFormat = /^(?:(?:(\d+):)?(\d{1,2}):)?(\d{1,2})(?:\.(\d{3}))?$/;
    var timeUnits = {
      ms: 1,
      s: 1e3,
      m: 6e4,
      h: 36e5
    };
    exports.humanStr = (time) => {
      if (typeof time === "number") {
        return time;
      }
      if (numberFormat.test(time)) {
        return +time;
      }
      const firstFormat = timeFormat.exec(time);
      if (firstFormat) {
        return +(firstFormat[1] || 0) * timeUnits.h + +(firstFormat[2] || 0) * timeUnits.m + +firstFormat[3] * timeUnits.s + +(firstFormat[4] || 0);
      } else {
        let total = 0;
        const r = /(-?\d+)(ms|s|m|h)/g;
        let rs;
        while ((rs = r.exec(time)) !== null) {
          total += +rs[1] * timeUnits[rs[2]];
        }
        return total;
      }
    };
    exports.durationStr = (time) => {
      let total = 0;
      const r = /(\d+(?:\.\d+)?)(S|M|H)/g;
      let rs;
      while ((rs = r.exec(time)) !== null) {
        total += +rs[1] * timeUnits[rs[2].toLowerCase()];
      }
      return total;
    };
  }
});

// node_modules/m3u8stream/dist/dash-mpd-parser.js
var require_dash_mpd_parser = __commonJS({
  "node_modules/m3u8stream/dist/dash-mpd-parser.js"(exports) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    var stream_1 = __require("stream");
    var sax_1 = __importDefault(require_sax());
    var parse_time_1 = require_parse_time();
    var DashMPDParser = class extends stream_1.Writable {
      constructor(targetID) {
        super();
        this._parser = sax_1.default.createStream(false, { lowercase: true });
        this._parser.on("error", this.destroy.bind(this));
        let lastTag;
        let currtime = 0;
        let seq = 0;
        let segmentTemplate;
        let timescale, offset, duration, baseURL;
        let timeline = [];
        let getSegments = false;
        let gotSegments = false;
        let isStatic;
        let treeLevel;
        let periodStart;
        const tmpl = (str) => {
          const context = {
            RepresentationID: targetID,
            Number: seq,
            Time: currtime
          };
          return str.replace(/\$(\w+)\$/g, (m, p1) => `${context[p1]}`);
        };
        this._parser.on("opentag", (node) => {
          switch (node.name) {
            case "mpd":
              currtime = node.attributes.availabilitystarttime ? new Date(node.attributes.availabilitystarttime).getTime() : 0;
              isStatic = node.attributes.type !== "dynamic";
              break;
            case "period":
              seq = 0;
              timescale = 1e3;
              duration = 0;
              offset = 0;
              baseURL = [];
              treeLevel = 0;
              periodStart = parse_time_1.durationStr(node.attributes.start) || 0;
              break;
            case "segmentlist":
              seq = parseInt(node.attributes.startnumber) || seq;
              timescale = parseInt(node.attributes.timescale) || timescale;
              duration = parseInt(node.attributes.duration) || duration;
              offset = parseInt(node.attributes.presentationtimeoffset) || offset;
              break;
            case "segmenttemplate":
              segmentTemplate = node.attributes;
              seq = parseInt(node.attributes.startnumber) || seq;
              timescale = parseInt(node.attributes.timescale) || timescale;
              break;
            case "segmenttimeline":
            case "baseurl":
              lastTag = node.name;
              break;
            case "s":
              timeline.push({
                duration: parseInt(node.attributes.d),
                repeat: parseInt(node.attributes.r),
                time: parseInt(node.attributes.t)
              });
              break;
            case "adaptationset":
            case "representation":
              treeLevel++;
              if (!targetID) {
                targetID = node.attributes.id;
              }
              getSegments = node.attributes.id === `${targetID}`;
              if (getSegments) {
                if (periodStart) {
                  currtime += periodStart;
                }
                if (offset) {
                  currtime -= offset / timescale * 1e3;
                }
                this.emit("starttime", currtime);
              }
              break;
            case "initialization":
              if (getSegments) {
                this.emit("item", {
                  url: baseURL.filter((s) => !!s).join("") + node.attributes.sourceurl,
                  seq,
                  init: true,
                  duration: 0
                });
              }
              break;
            case "segmenturl":
              if (getSegments) {
                gotSegments = true;
                let tl = timeline.shift();
                let segmentDuration = ((tl === null || tl === void 0 ? void 0 : tl.duration) || duration) / timescale * 1e3;
                this.emit("item", {
                  url: baseURL.filter((s) => !!s).join("") + node.attributes.media,
                  seq: seq++,
                  duration: segmentDuration
                });
                currtime += segmentDuration;
              }
              break;
          }
        });
        const onEnd = () => {
          if (isStatic) {
            this.emit("endlist");
          }
          if (!getSegments) {
            this.destroy(Error(`Representation '${targetID}' not found`));
          } else {
            this.emit("end");
          }
        };
        this._parser.on("closetag", (tagName) => {
          switch (tagName) {
            case "adaptationset":
            case "representation":
              treeLevel--;
              if (segmentTemplate && timeline.length) {
                gotSegments = true;
                if (segmentTemplate.initialization) {
                  this.emit("item", {
                    url: baseURL.filter((s) => !!s).join("") + tmpl(segmentTemplate.initialization),
                    seq,
                    init: true,
                    duration: 0
                  });
                }
                for (let { duration: itemDuration, repeat, time } of timeline) {
                  itemDuration = itemDuration / timescale * 1e3;
                  repeat = repeat || 1;
                  currtime = time || currtime;
                  for (let i = 0; i < repeat; i++) {
                    this.emit("item", {
                      url: baseURL.filter((s) => !!s).join("") + tmpl(segmentTemplate.media),
                      seq: seq++,
                      duration: itemDuration
                    });
                    currtime += itemDuration;
                  }
                }
              }
              if (gotSegments) {
                this.emit("endearly");
                onEnd();
                this._parser.removeAllListeners();
                this.removeAllListeners("finish");
              }
              break;
          }
        });
        this._parser.on("text", (text) => {
          if (lastTag === "baseurl") {
            baseURL[treeLevel] = text;
            lastTag = null;
          }
        });
        this.on("finish", onEnd);
      }
      _write(chunk, encoding, callback) {
        this._parser.write(chunk);
        callback();
      }
    };
    exports.default = DashMPDParser;
  }
});

// node_modules/m3u8stream/dist/queue.js
var require_queue = __commonJS({
  "node_modules/m3u8stream/dist/queue.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Queue = void 0;
    var Queue = class {
      /**
       * A really simple queue with concurrency.
       *
       * @param {Function} worker
       * @param {Object} options
       * @param {!number} options.concurrency
       */
      constructor(worker, options = {}) {
        this._worker = worker;
        this._concurrency = options.concurrency || 1;
        this.tasks = [];
        this.total = 0;
        this.active = 0;
      }
      /**
       * Push a task to the queue.
       *
       *  @param {T} item
       *  @param {!Function} callback
       */
      push(item, callback) {
        this.tasks.push({ item, callback });
        this.total++;
        this._next();
      }
      /**
       * Process next job in queue.
       */
      _next() {
        if (this.active >= this._concurrency || !this.tasks.length) {
          return;
        }
        const { item, callback } = this.tasks.shift();
        let callbackCalled = false;
        this.active++;
        this._worker(item, (err, result) => {
          if (callbackCalled) {
            return;
          }
          this.active--;
          callbackCalled = true;
          callback === null || callback === void 0 ? void 0 : callback(err, result);
          this._next();
        });
      }
      /**
       * Stops processing queued jobs.
       */
      die() {
        this.tasks = [];
      }
    };
    exports.Queue = Queue;
  }
});

// node_modules/m3u8stream/dist/index.js
var require_dist2 = __commonJS({
  "node_modules/m3u8stream/dist/index.js"(exports, module) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    var stream_1 = __require("stream");
    var miniget_1 = __importDefault(require_dist());
    var m3u8_parser_1 = __importDefault(require_m3u8_parser());
    var dash_mpd_parser_1 = __importDefault(require_dash_mpd_parser());
    var queue_1 = require_queue();
    var parse_time_1 = require_parse_time();
    var supportedParsers = {
      m3u8: m3u8_parser_1.default,
      "dash-mpd": dash_mpd_parser_1.default
    };
    var m3u8stream = (playlistURL, options = {}) => {
      const stream = new stream_1.PassThrough({ highWaterMark: options.highWaterMark });
      const chunkReadahead = options.chunkReadahead || 3;
      const liveBuffer = options.liveBuffer || 2e4;
      const requestOptions = options.requestOptions;
      const Parser = supportedParsers[options.parser || (/\.mpd$/.test(playlistURL) ? "dash-mpd" : "m3u8")];
      if (!Parser) {
        throw TypeError(`parser '${options.parser}' not supported`);
      }
      let begin = 0;
      if (typeof options.begin !== "undefined") {
        begin = typeof options.begin === "string" ? parse_time_1.humanStr(options.begin) : Math.max(options.begin - liveBuffer, 0);
      }
      const forwardEvents = (req) => {
        for (let event of ["abort", "request", "response", "redirect", "retry", "reconnect"]) {
          req.on(event, stream.emit.bind(stream, event));
        }
      };
      let currSegment;
      const streamQueue = new queue_1.Queue((req, callback) => {
        currSegment = req;
        let size = 0;
        req.on("data", (chunk) => size += chunk.length);
        req.pipe(stream, { end: false });
        req.on("end", () => callback(null, size));
      }, { concurrency: 1 });
      let segmentNumber = 0;
      let downloaded = 0;
      const requestQueue = new queue_1.Queue((segment, callback) => {
        let reqOptions = Object.assign({}, requestOptions);
        if (segment.range) {
          reqOptions.headers = Object.assign({}, reqOptions.headers, {
            Range: `bytes=${segment.range.start}-${segment.range.end}`
          });
        }
        let req = miniget_1.default(new URL(segment.url, playlistURL).toString(), reqOptions);
        req.on("error", callback);
        forwardEvents(req);
        streamQueue.push(req, (_, size) => {
          downloaded += +size;
          stream.emit("progress", {
            num: ++segmentNumber,
            size,
            duration: segment.duration,
            url: segment.url
          }, requestQueue.total, downloaded);
          callback(null);
        });
      }, { concurrency: chunkReadahead });
      const onError = (err) => {
        stream.emit("error", err);
        stream.end();
      };
      let refreshThreshold;
      let minRefreshTime;
      let refreshTimeout;
      let fetchingPlaylist = true;
      let ended = false;
      let isStatic = false;
      let lastRefresh;
      const onQueuedEnd = (err) => {
        currSegment = null;
        if (err) {
          onError(err);
        } else if (!fetchingPlaylist && !ended && !isStatic && requestQueue.tasks.length + requestQueue.active <= refreshThreshold) {
          let ms = Math.max(0, minRefreshTime - (Date.now() - lastRefresh));
          fetchingPlaylist = true;
          refreshTimeout = setTimeout(refreshPlaylist, ms);
        } else if ((ended || isStatic) && !requestQueue.tasks.length && !requestQueue.active) {
          stream.end();
        }
      };
      let currPlaylist;
      let lastSeq;
      let starttime = 0;
      const refreshPlaylist = () => {
        lastRefresh = Date.now();
        currPlaylist = miniget_1.default(playlistURL, requestOptions);
        currPlaylist.on("error", onError);
        forwardEvents(currPlaylist);
        const parser = currPlaylist.pipe(new Parser(options.id));
        parser.on("starttime", (a) => {
          if (starttime) {
            return;
          }
          starttime = a;
          if (typeof options.begin === "string" && begin >= 0) {
            begin += starttime;
          }
        });
        parser.on("endlist", () => {
          isStatic = true;
        });
        parser.on("endearly", currPlaylist.unpipe.bind(currPlaylist, parser));
        let addedItems = [];
        const addItem = (item) => {
          if (!item.init) {
            if (item.seq <= lastSeq) {
              return;
            }
            lastSeq = item.seq;
          }
          begin = item.time;
          requestQueue.push(item, onQueuedEnd);
          addedItems.push(item);
        };
        let tailedItems = [], tailedItemsDuration = 0;
        parser.on("item", (item) => {
          let timedItem = Object.assign({ time: starttime }, item);
          if (begin <= timedItem.time) {
            addItem(timedItem);
          } else {
            tailedItems.push(timedItem);
            tailedItemsDuration += timedItem.duration;
            while (tailedItems.length > 1 && tailedItemsDuration - tailedItems[0].duration > liveBuffer) {
              const lastItem = tailedItems.shift();
              tailedItemsDuration -= lastItem.duration;
            }
          }
          starttime += timedItem.duration;
        });
        parser.on("end", () => {
          currPlaylist = null;
          if (!addedItems.length && tailedItems.length) {
            tailedItems.forEach((item) => {
              addItem(item);
            });
          }
          refreshThreshold = Math.max(1, Math.ceil(addedItems.length * 0.01));
          minRefreshTime = addedItems.reduce((total, item) => item.duration + total, 0);
          fetchingPlaylist = false;
          onQueuedEnd(null);
        });
      };
      refreshPlaylist();
      stream.end = () => {
        ended = true;
        streamQueue.die();
        requestQueue.die();
        clearTimeout(refreshTimeout);
        currPlaylist === null || currPlaylist === void 0 ? void 0 : currPlaylist.destroy();
        currSegment === null || currSegment === void 0 ? void 0 : currSegment.destroy();
        stream_1.PassThrough.prototype.end.call(stream, null);
        return stream;
      };
      return stream;
    };
    m3u8stream.parseTimestamp = parse_time_1.humanStr;
    module.exports = m3u8stream;
  }
});

// node_modules/ytdl-core/lib/info-extras.js
var require_info_extras = __commonJS({
  "node_modules/ytdl-core/lib/info-extras.js"(exports) {
    var utils = require_utils();
    var qs = __require("querystring");
    var { parseTimestamp } = require_dist2();
    var BASE_URL = "https://www.youtube.com/watch?v=";
    var TITLE_TO_CATEGORY = {
      song: { name: "Music", url: "https://music.youtube.com/" }
    };
    var getText = (obj) => obj ? obj.runs ? obj.runs[0].text : obj.simpleText : null;
    exports.getMedia = (info) => {
      let media = {};
      let results = [];
      try {
        results = info.response.contents.twoColumnWatchNextResults.results.results.contents;
      } catch (err) {
      }
      let result = results.find((v) => v.videoSecondaryInfoRenderer);
      if (!result) {
        return {};
      }
      try {
        let metadataRows = (result.metadataRowContainer || result.videoSecondaryInfoRenderer.metadataRowContainer).metadataRowContainerRenderer.rows;
        for (let row of metadataRows) {
          if (row.metadataRowRenderer) {
            let title = getText(row.metadataRowRenderer.title).toLowerCase();
            let contents = row.metadataRowRenderer.contents[0];
            media[title] = getText(contents);
            let runs = contents.runs;
            if (runs && runs[0].navigationEndpoint) {
              media[`${title}_url`] = new URL(
                runs[0].navigationEndpoint.commandMetadata.webCommandMetadata.url,
                BASE_URL
              ).toString();
            }
            if (title in TITLE_TO_CATEGORY) {
              media.category = TITLE_TO_CATEGORY[title].name;
              media.category_url = TITLE_TO_CATEGORY[title].url;
            }
          } else if (row.richMetadataRowRenderer) {
            let contents = row.richMetadataRowRenderer.contents;
            let boxArt = contents.filter((meta) => meta.richMetadataRenderer.style === "RICH_METADATA_RENDERER_STYLE_BOX_ART");
            for (let { richMetadataRenderer } of boxArt) {
              let meta = richMetadataRenderer;
              media.year = getText(meta.subtitle);
              let type = getText(meta.callToAction).split(" ")[1];
              media[type] = getText(meta.title);
              media[`${type}_url`] = new URL(
                meta.endpoint.commandMetadata.webCommandMetadata.url,
                BASE_URL
              ).toString();
              media.thumbnails = meta.thumbnail.thumbnails;
            }
            let topic = contents.filter((meta) => meta.richMetadataRenderer.style === "RICH_METADATA_RENDERER_STYLE_TOPIC");
            for (let { richMetadataRenderer } of topic) {
              let meta = richMetadataRenderer;
              media.category = getText(meta.title);
              media.category_url = new URL(
                meta.endpoint.commandMetadata.webCommandMetadata.url,
                BASE_URL
              ).toString();
            }
          }
        }
      } catch (err) {
      }
      return media;
    };
    var isVerified = (badges) => !!(badges && badges.find((b) => b.metadataBadgeRenderer.tooltip === "Verified"));
    exports.getAuthor = (info) => {
      let channelId, thumbnails = [], subscriberCount, verified = false;
      try {
        let results = info.response.contents.twoColumnWatchNextResults.results.results.contents;
        let v = results.find((v2) => v2.videoSecondaryInfoRenderer && v2.videoSecondaryInfoRenderer.owner && v2.videoSecondaryInfoRenderer.owner.videoOwnerRenderer);
        let videoOwnerRenderer = v.videoSecondaryInfoRenderer.owner.videoOwnerRenderer;
        channelId = videoOwnerRenderer.navigationEndpoint.browseEndpoint.browseId;
        thumbnails = videoOwnerRenderer.thumbnail.thumbnails.map((thumbnail) => {
          thumbnail.url = new URL(thumbnail.url, BASE_URL).toString();
          return thumbnail;
        });
        subscriberCount = utils.parseAbbreviatedNumber(getText(videoOwnerRenderer.subscriberCountText));
        verified = isVerified(videoOwnerRenderer.badges);
      } catch (err) {
      }
      try {
        let videoDetails = info.player_response.microformat && info.player_response.microformat.playerMicroformatRenderer;
        let id = videoDetails && videoDetails.channelId || channelId || info.player_response.videoDetails.channelId;
        let author = {
          id,
          name: videoDetails ? videoDetails.ownerChannelName : info.player_response.videoDetails.author,
          user: videoDetails ? videoDetails.ownerProfileUrl.split("/").slice(-1)[0] : null,
          channel_url: `https://www.youtube.com/channel/${id}`,
          external_channel_url: videoDetails ? `https://www.youtube.com/channel/${videoDetails.externalChannelId}` : "",
          user_url: videoDetails ? new URL(videoDetails.ownerProfileUrl, BASE_URL).toString() : "",
          thumbnails,
          verified,
          subscriber_count: subscriberCount
        };
        if (thumbnails.length) {
          utils.deprecate(author, "avatar", author.thumbnails[0].url, "author.avatar", "author.thumbnails[0].url");
        }
        return author;
      } catch (err) {
        return {};
      }
    };
    var parseRelatedVideo = (details, rvsParams) => {
      if (!details)
        return;
      try {
        let viewCount = getText(details.viewCountText);
        let shortViewCount = getText(details.shortViewCountText);
        let rvsDetails = rvsParams.find((elem) => elem.id === details.videoId);
        if (!/^\d/.test(shortViewCount)) {
          shortViewCount = rvsDetails && rvsDetails.short_view_count_text || "";
        }
        viewCount = (/^\d/.test(viewCount) ? viewCount : shortViewCount).split(" ")[0];
        let browseEndpoint = details.shortBylineText.runs[0].navigationEndpoint.browseEndpoint;
        let channelId = browseEndpoint.browseId;
        let name = getText(details.shortBylineText);
        let user = (browseEndpoint.canonicalBaseUrl || "").split("/").slice(-1)[0];
        let video = {
          id: details.videoId,
          title: getText(details.title),
          published: getText(details.publishedTimeText),
          author: {
            id: channelId,
            name,
            user,
            channel_url: `https://www.youtube.com/channel/${channelId}`,
            user_url: `https://www.youtube.com/user/${user}`,
            thumbnails: details.channelThumbnail.thumbnails.map((thumbnail) => {
              thumbnail.url = new URL(thumbnail.url, BASE_URL).toString();
              return thumbnail;
            }),
            verified: isVerified(details.ownerBadges),
            [Symbol.toPrimitive]() {
              console.warn(`\`relatedVideo.author\` will be removed in a near future release, use \`relatedVideo.author.name\` instead.`);
              return video.author.name;
            }
          },
          short_view_count_text: shortViewCount.split(" ")[0],
          view_count: viewCount.replace(/,/g, ""),
          length_seconds: details.lengthText ? Math.floor(parseTimestamp(getText(details.lengthText)) / 1e3) : rvsParams && `${rvsParams.length_seconds}`,
          thumbnails: details.thumbnail.thumbnails,
          richThumbnails: details.richThumbnail ? details.richThumbnail.movingThumbnailRenderer.movingThumbnailDetails.thumbnails : [],
          isLive: !!(details.badges && details.badges.find((b) => b.metadataBadgeRenderer.label === "LIVE NOW"))
        };
        utils.deprecate(
          video,
          "author_thumbnail",
          video.author.thumbnails[0].url,
          "relatedVideo.author_thumbnail",
          "relatedVideo.author.thumbnails[0].url"
        );
        utils.deprecate(video, "ucid", video.author.id, "relatedVideo.ucid", "relatedVideo.author.id");
        utils.deprecate(
          video,
          "video_thumbnail",
          video.thumbnails[0].url,
          "relatedVideo.video_thumbnail",
          "relatedVideo.thumbnails[0].url"
        );
        return video;
      } catch (err) {
      }
    };
    exports.getRelatedVideos = (info) => {
      let rvsParams = [], secondaryResults = [];
      try {
        rvsParams = info.response.webWatchNextResponseExtensionData.relatedVideoArgs.split(",").map((e) => qs.parse(e));
      } catch (err) {
      }
      try {
        secondaryResults = info.response.contents.twoColumnWatchNextResults.secondaryResults.secondaryResults.results;
      } catch (err) {
        return [];
      }
      let videos = [];
      for (let result of secondaryResults || []) {
        let details = result.compactVideoRenderer;
        if (details) {
          let video = parseRelatedVideo(details, rvsParams);
          if (video)
            videos.push(video);
        } else {
          let autoplay = result.compactAutoplayRenderer || result.itemSectionRenderer;
          if (!autoplay || !Array.isArray(autoplay.contents))
            continue;
          for (let content of autoplay.contents) {
            let video = parseRelatedVideo(content.compactVideoRenderer, rvsParams);
            if (video)
              videos.push(video);
          }
        }
      }
      return videos;
    };
    exports.getLikes = (info) => {
      try {
        let contents = info.response.contents.twoColumnWatchNextResults.results.results.contents;
        let video = contents.find((r) => r.videoPrimaryInfoRenderer);
        let buttons = video.videoPrimaryInfoRenderer.videoActions.menuRenderer.topLevelButtons;
        let like = buttons.find((b) => b.toggleButtonRenderer && b.toggleButtonRenderer.defaultIcon.iconType === "LIKE");
        return parseInt(like.toggleButtonRenderer.defaultText.accessibility.accessibilityData.label.replace(/\D+/g, ""));
      } catch (err) {
        return null;
      }
    };
    exports.getDislikes = (info) => {
      try {
        let contents = info.response.contents.twoColumnWatchNextResults.results.results.contents;
        let video = contents.find((r) => r.videoPrimaryInfoRenderer);
        let buttons = video.videoPrimaryInfoRenderer.videoActions.menuRenderer.topLevelButtons;
        let dislike = buttons.find((b) => b.toggleButtonRenderer && b.toggleButtonRenderer.defaultIcon.iconType === "DISLIKE");
        return parseInt(dislike.toggleButtonRenderer.defaultText.accessibility.accessibilityData.label.replace(/\D+/g, ""));
      } catch (err) {
        return null;
      }
    };
    exports.cleanVideoDetails = (videoDetails, info) => {
      videoDetails.thumbnails = videoDetails.thumbnail.thumbnails;
      delete videoDetails.thumbnail;
      utils.deprecate(
        videoDetails,
        "thumbnail",
        { thumbnails: videoDetails.thumbnails },
        "videoDetails.thumbnail.thumbnails",
        "videoDetails.thumbnails"
      );
      videoDetails.description = videoDetails.shortDescription || getText(videoDetails.description);
      delete videoDetails.shortDescription;
      utils.deprecate(
        videoDetails,
        "shortDescription",
        videoDetails.description,
        "videoDetails.shortDescription",
        "videoDetails.description"
      );
      videoDetails.lengthSeconds = info.player_response.microformat && info.player_response.microformat.playerMicroformatRenderer.lengthSeconds || info.player_response.videoDetails.lengthSeconds;
      return videoDetails;
    };
    exports.getStoryboards = (info) => {
      const parts = info.player_response.storyboards && info.player_response.storyboards.playerStoryboardSpecRenderer && info.player_response.storyboards.playerStoryboardSpecRenderer.spec && info.player_response.storyboards.playerStoryboardSpecRenderer.spec.split("|");
      if (!parts)
        return [];
      const url = new URL(parts.shift());
      return parts.map((part, i) => {
        let [
          thumbnailWidth,
          thumbnailHeight,
          thumbnailCount,
          columns,
          rows,
          interval,
          nameReplacement,
          sigh
        ] = part.split("#");
        url.searchParams.set("sigh", sigh);
        thumbnailCount = parseInt(thumbnailCount, 10);
        columns = parseInt(columns, 10);
        rows = parseInt(rows, 10);
        const storyboardCount = Math.ceil(thumbnailCount / (columns * rows));
        return {
          templateUrl: url.toString().replace("$L", i).replace("$N", nameReplacement),
          thumbnailWidth: parseInt(thumbnailWidth, 10),
          thumbnailHeight: parseInt(thumbnailHeight, 10),
          thumbnailCount,
          interval: parseInt(interval, 10),
          columns,
          rows,
          storyboardCount
        };
      });
    };
    exports.getChapters = (info) => {
      const playerOverlayRenderer = info.response && info.response.playerOverlays && info.response.playerOverlays.playerOverlayRenderer;
      const playerBar = playerOverlayRenderer && playerOverlayRenderer.decoratedPlayerBarRenderer && playerOverlayRenderer.decoratedPlayerBarRenderer.decoratedPlayerBarRenderer && playerOverlayRenderer.decoratedPlayerBarRenderer.decoratedPlayerBarRenderer.playerBar;
      const markersMap = playerBar && playerBar.multiMarkersPlayerBarRenderer && playerBar.multiMarkersPlayerBarRenderer.markersMap;
      const marker = Array.isArray(markersMap) && markersMap.find((m) => m.value && Array.isArray(m.value.chapters));
      if (!marker)
        return [];
      const chapters = marker.value.chapters;
      return chapters.map((chapter) => ({
        title: getText(chapter.chapterRenderer.title),
        start_time: chapter.chapterRenderer.timeRangeStartMillis / 1e3
      }));
    };
  }
});

// node_modules/ytdl-core/lib/cache.js
var require_cache = __commonJS({
  "node_modules/ytdl-core/lib/cache.js"(exports, module) {
    var { setTimeout: setTimeout2 } = __require("timers");
    module.exports = class Cache extends Map {
      constructor(timeout = 1e3) {
        super();
        this.timeout = timeout;
      }
      set(key, value) {
        if (this.has(key)) {
          clearTimeout(super.get(key).tid);
        }
        super.set(key, {
          tid: setTimeout2(this.delete.bind(this, key), this.timeout).unref(),
          value
        });
      }
      get(key) {
        let entry = super.get(key);
        if (entry) {
          return entry.value;
        }
        return null;
      }
      getOrSet(key, fn) {
        if (this.has(key)) {
          return this.get(key);
        } else {
          let value = fn();
          this.set(key, value);
          (async () => {
            try {
              await value;
            } catch (err) {
              this.delete(key);
            }
          })();
          return value;
        }
      }
      delete(key) {
        let entry = super.get(key);
        if (entry) {
          clearTimeout(entry.tid);
          super.delete(key);
        }
      }
      clear() {
        for (let entry of this.values()) {
          clearTimeout(entry.tid);
        }
        super.clear();
      }
    };
  }
});

// node_modules/ytdl-core/lib/sig.js
var require_sig = __commonJS({
  "node_modules/ytdl-core/lib/sig.js"(exports) {
    var querystring = __require("querystring");
    var Cache = require_cache();
    var utils = require_utils();
    var vm = __require("vm");
    exports.cache = new Cache();
    exports.getFunctions = (html5playerfile, options) => exports.cache.getOrSet(html5playerfile, async () => {
      const body = await utils.exposedMiniget(html5playerfile, options).text();
      const functions = exports.extractFunctions(body);
      if (!functions || !functions.length) {
        throw Error("Could not extract functions");
      }
      exports.cache.set(html5playerfile, functions);
      return functions;
    });
    exports.extractFunctions = (body) => {
      const functions = [];
      const extractManipulations = (caller) => {
        const functionName = utils.between(caller, `a=a.split("");`, `.`);
        if (!functionName)
          return "";
        const functionStart = `var ${functionName}={`;
        const ndx = body.indexOf(functionStart);
        if (ndx < 0)
          return "";
        const subBody = body.slice(ndx + functionStart.length - 1);
        return `var ${functionName}=${utils.cutAfterJS(subBody)}`;
      };
      const extractDecipher = () => {
        const functionName = utils.between(body, `a.set("alr","yes");c&&(c=`, `(decodeURIC`);
        if (functionName && functionName.length) {
          const functionStart = `${functionName}=function(a)`;
          const ndx = body.indexOf(functionStart);
          if (ndx >= 0) {
            const subBody = body.slice(ndx + functionStart.length);
            let functionBody = `var ${functionStart}${utils.cutAfterJS(subBody)}`;
            functionBody = `${extractManipulations(functionBody)};${functionBody};${functionName}(sig);`;
            functions.push(functionBody);
          }
        }
      };
      const extractNCode = () => {
        let functionName = utils.between(body, `&&(b=a.get("n"))&&(b=`, `(b)`);
        if (functionName.includes("["))
          functionName = utils.between(body, `var ${functionName.split("[")[0]}=[`, `]`);
        if (functionName && functionName.length) {
          const functionStart = `${functionName}=function(a)`;
          const ndx = body.indexOf(functionStart);
          if (ndx >= 0) {
            const subBody = body.slice(ndx + functionStart.length);
            const functionBody = `var ${functionStart}${utils.cutAfterJS(subBody)};${functionName}(ncode);`;
            functions.push(functionBody);
          }
        }
      };
      extractDecipher();
      extractNCode();
      return functions;
    };
    exports.setDownloadURL = (format, decipherScript, nTransformScript) => {
      const decipher = (url2) => {
        const args = querystring.parse(url2);
        if (!args.s || !decipherScript)
          return args.url;
        const components = new URL(decodeURIComponent(args.url));
        components.searchParams.set(
          args.sp ? args.sp : "signature",
          decipherScript.runInNewContext({ sig: decodeURIComponent(args.s) })
        );
        return components.toString();
      };
      const ncode = (url2) => {
        const components = new URL(decodeURIComponent(url2));
        const n = components.searchParams.get("n");
        if (!n || !nTransformScript)
          return url2;
        components.searchParams.set("n", nTransformScript.runInNewContext({ ncode: n }));
        return components.toString();
      };
      const cipher = !format.url;
      const url = format.url || format.signatureCipher || format.cipher;
      format.url = cipher ? ncode(decipher(url)) : ncode(url);
      delete format.signatureCipher;
      delete format.cipher;
    };
    exports.decipherFormats = async (formats, html5player, options) => {
      let decipheredFormats = {};
      let functions = await exports.getFunctions(html5player, options);
      const decipherScript = functions.length ? new vm.Script(functions[0]) : null;
      const nTransformScript = functions.length > 1 ? new vm.Script(functions[1]) : null;
      formats.forEach((format) => {
        exports.setDownloadURL(format, decipherScript, nTransformScript);
        decipheredFormats[format.url] = format;
      });
      return decipheredFormats;
    };
  }
});

// node_modules/ytdl-core/lib/info.js
var require_info = __commonJS({
  "node_modules/ytdl-core/lib/info.js"(exports) {
    var querystring = __require("querystring");
    var sax = require_sax();
    var miniget = require_dist();
    var utils = require_utils();
    var { setTimeout: setTimeout2 } = __require("timers");
    var formatUtils = require_format_utils();
    var urlUtils = require_url_utils();
    var extras = require_info_extras();
    var sig = require_sig();
    var Cache = require_cache();
    var BASE_URL = "https://www.youtube.com/watch?v=";
    exports.cache = new Cache();
    exports.cookieCache = new Cache(1e3 * 60 * 60 * 24);
    exports.watchPageCache = new Cache();
    var cver = "2.20210622.10.00";
    var UnrecoverableError = class extends Error {
    };
    var AGE_RESTRICTED_URLS = [
      "support.google.com/youtube/?p=age_restrictions",
      "youtube.com/t/community_guidelines"
    ];
    exports.getBasicInfo = async (id, options) => {
      if (options.IPv6Block) {
        options.requestOptions = Object.assign({}, options.requestOptions, {
          family: 6,
          localAddress: utils.getRandomIPv6(options.IPv6Block)
        });
      }
      const retryOptions = Object.assign({}, miniget.defaultOptions, options.requestOptions);
      options.requestOptions = Object.assign({}, options.requestOptions, {});
      options.requestOptions.headers = Object.assign(
        {},
        {
          // eslint-disable-next-line max-len
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.101 Safari/537.36"
        },
        options.requestOptions.headers
      );
      const validate = (info2) => {
        let playErr = utils.playError(info2.player_response, ["ERROR"], UnrecoverableError);
        let privateErr = privateVideoError(info2.player_response);
        if (playErr || privateErr) {
          throw playErr || privateErr;
        }
        return info2 && info2.player_response && (info2.player_response.streamingData || isRental(info2.player_response) || isNotYetBroadcasted(info2.player_response));
      };
      let info = await pipeline([id, options], validate, retryOptions, [
        getWatchHTMLPage,
        getWatchJSONPage,
        getVideoInfoPage
      ]);
      Object.assign(info, {
        formats: parseFormats(info.player_response),
        related_videos: extras.getRelatedVideos(info)
      });
      const media = extras.getMedia(info);
      const additional = {
        author: extras.getAuthor(info),
        media,
        likes: extras.getLikes(info),
        dislikes: extras.getDislikes(info),
        age_restricted: !!(media && AGE_RESTRICTED_URLS.some((url) => Object.values(media).some((v) => typeof v === "string" && v.includes(url)))),
        // Give the standard link to the video.
        video_url: BASE_URL + id,
        storyboards: extras.getStoryboards(info),
        chapters: extras.getChapters(info)
      };
      info.videoDetails = extras.cleanVideoDetails(Object.assign(
        {},
        info.player_response && info.player_response.microformat && info.player_response.microformat.playerMicroformatRenderer,
        info.player_response && info.player_response.videoDetails,
        additional
      ), info);
      return info;
    };
    var privateVideoError = (player_response) => {
      let playability = player_response && player_response.playabilityStatus;
      if (playability && playability.status === "LOGIN_REQUIRED" && playability.messages && playability.messages.filter((m) => /This is a private video/.test(m)).length) {
        return new UnrecoverableError(playability.reason || playability.messages && playability.messages[0]);
      } else {
        return null;
      }
    };
    var isRental = (player_response) => {
      let playability = player_response.playabilityStatus;
      return playability && playability.status === "UNPLAYABLE" && playability.errorScreen && playability.errorScreen.playerLegacyDesktopYpcOfferRenderer;
    };
    var isNotYetBroadcasted = (player_response) => {
      let playability = player_response.playabilityStatus;
      return playability && playability.status === "LIVE_STREAM_OFFLINE";
    };
    var getWatchHTMLURL = (id, options) => `${BASE_URL + id}&hl=${options.lang || "en"}`;
    var getWatchHTMLPageBody = (id, options) => {
      const url = getWatchHTMLURL(id, options);
      return exports.watchPageCache.getOrSet(url, () => utils.exposedMiniget(url, options).text());
    };
    var EMBED_URL = "https://www.youtube.com/embed/";
    var getEmbedPageBody = (id, options) => {
      const embedUrl = `${EMBED_URL + id}?hl=${options.lang || "en"}`;
      return utils.exposedMiniget(embedUrl, options).text();
    };
    var getHTML5player = (body) => {
      let html5playerRes = /<script\s+src="([^"]+)"(?:\s+type="text\/javascript")?\s+name="player_ias\/base"\s*>|"jsUrl":"([^"]+)"/.exec(body);
      return html5playerRes ? html5playerRes[1] || html5playerRes[2] : null;
    };
    var getIdentityToken = (id, options, key, throwIfNotFound) => exports.cookieCache.getOrSet(key, async () => {
      let page = await getWatchHTMLPageBody(id, options);
      let match = page.match(/(["'])ID_TOKEN\1[:,]\s?"([^"]+)"/);
      if (!match && throwIfNotFound) {
        throw new UnrecoverableError("Cookie header used in request, but unable to find YouTube identity token");
      }
      return match && match[2];
    });
    var pipeline = async (args, validate, retryOptions, endpoints) => {
      let info;
      for (let func of endpoints) {
        try {
          const newInfo = await retryFunc(func, args.concat([info]), retryOptions);
          if (newInfo.player_response) {
            newInfo.player_response.videoDetails = assign(
              info && info.player_response && info.player_response.videoDetails,
              newInfo.player_response.videoDetails
            );
            newInfo.player_response = assign(info && info.player_response, newInfo.player_response);
          }
          info = assign(info, newInfo);
          if (validate(info, false)) {
            break;
          }
        } catch (err) {
          if (err instanceof UnrecoverableError || func === endpoints[endpoints.length - 1]) {
            throw err;
          }
        }
      }
      return info;
    };
    var assign = (target, source) => {
      if (!target || !source) {
        return target || source;
      }
      for (let [key, value] of Object.entries(source)) {
        if (value !== null && value !== void 0) {
          target[key] = value;
        }
      }
      return target;
    };
    var retryFunc = async (func, args, options) => {
      let currentTry = 0, result;
      while (currentTry <= options.maxRetries) {
        try {
          result = await func(...args);
          break;
        } catch (err) {
          if (err instanceof UnrecoverableError || err instanceof miniget.MinigetError && err.statusCode < 500 || currentTry >= options.maxRetries) {
            throw err;
          }
          let wait = Math.min(++currentTry * options.backoff.inc, options.backoff.max);
          await new Promise((resolve) => setTimeout2(resolve, wait));
        }
      }
      return result;
    };
    var jsonClosingChars = /^[)\]}'\s]+/;
    var parseJSON = (source, varName, json) => {
      if (!json || typeof json === "object") {
        return json;
      } else {
        try {
          json = json.replace(jsonClosingChars, "");
          return JSON.parse(json);
        } catch (err) {
          throw Error(`Error parsing ${varName} in ${source}: ${err.message}`);
        }
      }
    };
    var findJSON = (source, varName, body, left, right, prependJSON) => {
      let jsonStr = utils.between(body, left, right);
      if (!jsonStr) {
        throw Error(`Could not find ${varName} in ${source}`);
      }
      return parseJSON(source, varName, utils.cutAfterJS(`${prependJSON}${jsonStr}`));
    };
    var findPlayerResponse = (source, info) => {
      const player_response = info && (info.args && info.args.player_response || info.player_response || info.playerResponse || info.embedded_player_response);
      return parseJSON(source, "player_response", player_response);
    };
    var getWatchJSONURL = (id, options) => `${getWatchHTMLURL(id, options)}&pbj=1`;
    var getWatchJSONPage = async (id, options) => {
      const reqOptions = Object.assign({ headers: {} }, options.requestOptions);
      let cookie = reqOptions.headers.Cookie || reqOptions.headers.cookie;
      reqOptions.headers = Object.assign({
        "x-youtube-client-name": "1",
        "x-youtube-client-version": cver,
        "x-youtube-identity-token": exports.cookieCache.get(cookie || "browser") || ""
      }, reqOptions.headers);
      const setIdentityToken = async (key, throwIfNotFound) => {
        if (reqOptions.headers["x-youtube-identity-token"]) {
          return;
        }
        reqOptions.headers["x-youtube-identity-token"] = await getIdentityToken(id, options, key, throwIfNotFound);
      };
      if (cookie) {
        await setIdentityToken(cookie, true);
      }
      const jsonUrl = getWatchJSONURL(id, options);
      const body = await utils.exposedMiniget(jsonUrl, options, reqOptions).text();
      let parsedBody = parseJSON("watch.json", "body", body);
      if (parsedBody.reload === "now") {
        await setIdentityToken("browser", false);
      }
      if (parsedBody.reload === "now" || !Array.isArray(parsedBody)) {
        throw Error("Unable to retrieve video metadata in watch.json");
      }
      let info = parsedBody.reduce((part, curr) => Object.assign(curr, part), {});
      info.player_response = findPlayerResponse("watch.json", info);
      info.html5player = info.player && info.player.assets && info.player.assets.js;
      return info;
    };
    var getWatchHTMLPage = async (id, options) => {
      let body = await getWatchHTMLPageBody(id, options);
      let info = { page: "watch" };
      try {
        cver = utils.between(body, '{"key":"cver","value":"', '"}');
        info.player_response = findJSON(
          "watch.html",
          "player_response",
          body,
          /\bytInitialPlayerResponse\s*=\s*\{/i,
          "</script>",
          "{"
        );
      } catch (err) {
        let args = findJSON("watch.html", "player_response", body, /\bytplayer\.config\s*=\s*{/, "</script>", "{");
        info.player_response = findPlayerResponse("watch.html", args);
      }
      info.response = findJSON("watch.html", "response", body, /\bytInitialData("\])?\s*=\s*\{/i, "</script>", "{");
      info.html5player = getHTML5player(body);
      return info;
    };
    var INFO_HOST = "www.youtube.com";
    var INFO_PATH = "/get_video_info";
    var VIDEO_EURL = "https://youtube.googleapis.com/v/";
    var getVideoInfoPage = async (id, options) => {
      const url = new URL(`https://${INFO_HOST}${INFO_PATH}`);
      url.searchParams.set("video_id", id);
      url.searchParams.set("c", "TVHTML5");
      url.searchParams.set("cver", `7${cver.substr(1)}`);
      url.searchParams.set("eurl", VIDEO_EURL + id);
      url.searchParams.set("ps", "default");
      url.searchParams.set("gl", "US");
      url.searchParams.set("hl", options.lang || "en");
      url.searchParams.set("html5", "1");
      const body = await utils.exposedMiniget(url.toString(), options).text();
      let info = querystring.parse(body);
      info.player_response = findPlayerResponse("get_video_info", info);
      return info;
    };
    var parseFormats = (player_response) => {
      let formats = [];
      if (player_response && player_response.streamingData) {
        formats = formats.concat(player_response.streamingData.formats || []).concat(player_response.streamingData.adaptiveFormats || []);
      }
      return formats;
    };
    exports.getInfo = async (id, options) => {
      let info = await exports.getBasicInfo(id, options);
      const hasManifest = info.player_response && info.player_response.streamingData && (info.player_response.streamingData.dashManifestUrl || info.player_response.streamingData.hlsManifestUrl);
      let funcs = [];
      if (info.formats.length) {
        info.html5player = info.html5player || getHTML5player(await getWatchHTMLPageBody(id, options)) || getHTML5player(await getEmbedPageBody(id, options));
        if (!info.html5player) {
          throw Error("Unable to find html5player file");
        }
        const html5player = new URL(info.html5player, BASE_URL).toString();
        funcs.push(sig.decipherFormats(info.formats, html5player, options));
      }
      if (hasManifest && info.player_response.streamingData.dashManifestUrl) {
        let url = info.player_response.streamingData.dashManifestUrl;
        funcs.push(getDashManifest(url, options));
      }
      if (hasManifest && info.player_response.streamingData.hlsManifestUrl) {
        let url = info.player_response.streamingData.hlsManifestUrl;
        funcs.push(getM3U8(url, options));
      }
      let results = await Promise.all(funcs);
      info.formats = Object.values(Object.assign({}, ...results));
      info.formats = info.formats.map(formatUtils.addFormatMeta);
      info.formats.sort(formatUtils.sortFormats);
      info.full = true;
      return info;
    };
    var getDashManifest = (url, options) => new Promise((resolve, reject) => {
      let formats = {};
      const parser = sax.parser(false);
      parser.onerror = reject;
      let adaptationSet;
      parser.onopentag = (node) => {
        if (node.name === "ADAPTATIONSET") {
          adaptationSet = node.attributes;
        } else if (node.name === "REPRESENTATION") {
          const itag = parseInt(node.attributes.ID);
          if (!isNaN(itag)) {
            formats[url] = Object.assign({
              itag,
              url,
              bitrate: parseInt(node.attributes.BANDWIDTH),
              mimeType: `${adaptationSet.MIMETYPE}; codecs="${node.attributes.CODECS}"`
            }, node.attributes.HEIGHT ? {
              width: parseInt(node.attributes.WIDTH),
              height: parseInt(node.attributes.HEIGHT),
              fps: parseInt(node.attributes.FRAMERATE)
            } : {
              audioSampleRate: node.attributes.AUDIOSAMPLINGRATE
            });
          }
        }
      };
      parser.onend = () => {
        resolve(formats);
      };
      const req = utils.exposedMiniget(new URL(url, BASE_URL).toString(), options);
      req.setEncoding("utf8");
      req.on("error", reject);
      req.on("data", (chunk) => {
        parser.write(chunk);
      });
      req.on("end", parser.close.bind(parser));
    });
    var getM3U8 = async (url, options) => {
      url = new URL(url, BASE_URL);
      const body = await utils.exposedMiniget(url.toString(), options).text();
      let formats = {};
      body.split("\n").filter((line) => /^https?:\/\//.test(line)).forEach((line) => {
        const itag = parseInt(line.match(/\/itag\/(\d+)\//)[1]);
        formats[line] = { itag, url: line };
      });
      return formats;
    };
    for (let funcName of ["getBasicInfo", "getInfo"]) {
      const func = exports[funcName];
      exports[funcName] = async (link, options = {}) => {
        utils.checkForUpdates();
        let id = await urlUtils.getVideoID(link);
        const key = [funcName, id, options.lang].join("-");
        return exports.cache.getOrSet(key, () => func(id, options));
      };
    }
    exports.validateID = urlUtils.validateID;
    exports.validateURL = urlUtils.validateURL;
    exports.getURLVideoID = urlUtils.getURLVideoID;
    exports.getVideoID = urlUtils.getVideoID;
  }
});

// node_modules/ytdl-core/lib/index.js
var require_lib = __commonJS({
  "node_modules/ytdl-core/lib/index.js"(exports, module) {
    var PassThrough = __require("stream").PassThrough;
    var getInfo = require_info();
    var utils = require_utils();
    var formatUtils = require_format_utils();
    var urlUtils = require_url_utils();
    var sig = require_sig();
    var miniget = require_dist();
    var m3u8stream = require_dist2();
    var { parseTimestamp } = require_dist2();
    var ytdl2 = (link, options) => {
      const stream = createStream(options);
      ytdl2.getInfo(link, options).then((info) => {
        downloadFromInfoCallback(stream, info, options);
      }, stream.emit.bind(stream, "error"));
      return stream;
    };
    module.exports = ytdl2;
    ytdl2.getBasicInfo = getInfo.getBasicInfo;
    ytdl2.getInfo = getInfo.getInfo;
    ytdl2.chooseFormat = formatUtils.chooseFormat;
    ytdl2.filterFormats = formatUtils.filterFormats;
    ytdl2.validateID = urlUtils.validateID;
    ytdl2.validateURL = urlUtils.validateURL;
    ytdl2.getURLVideoID = urlUtils.getURLVideoID;
    ytdl2.getVideoID = urlUtils.getVideoID;
    ytdl2.cache = {
      sig: sig.cache,
      info: getInfo.cache,
      watch: getInfo.watchPageCache,
      cookie: getInfo.cookieCache
    };
    ytdl2.version = require_package().version;
    var createStream = (options) => {
      const stream = new PassThrough({
        highWaterMark: options && options.highWaterMark || 1024 * 512
      });
      stream._destroy = () => {
        stream.destroyed = true;
      };
      return stream;
    };
    var pipeAndSetEvents = (req, stream, end) => {
      [
        "abort",
        "request",
        "response",
        "error",
        "redirect",
        "retry",
        "reconnect"
      ].forEach((event) => {
        req.prependListener(event, stream.emit.bind(stream, event));
      });
      req.pipe(stream, { end });
    };
    var downloadFromInfoCallback = (stream, info, options) => {
      options = options || {};
      let err = utils.playError(info.player_response, ["UNPLAYABLE", "LIVE_STREAM_OFFLINE", "LOGIN_REQUIRED"]);
      if (err) {
        stream.emit("error", err);
        return;
      }
      if (!info.formats.length) {
        stream.emit("error", Error("This video is unavailable"));
        return;
      }
      let format;
      try {
        format = formatUtils.chooseFormat(info.formats, options);
      } catch (e) {
        stream.emit("error", e);
        return;
      }
      stream.emit("info", info, format);
      if (stream.destroyed) {
        return;
      }
      let contentLength, downloaded = 0;
      const ondata = (chunk) => {
        downloaded += chunk.length;
        stream.emit("progress", chunk.length, downloaded, contentLength);
      };
      if (options.IPv6Block) {
        options.requestOptions = Object.assign({}, options.requestOptions, {
          family: 6,
          localAddress: utils.getRandomIPv6(options.IPv6Block)
        });
      }
      const dlChunkSize = options.dlChunkSize || 1024 * 1024 * 10;
      let req;
      let shouldEnd = true;
      if (format.isHLS || format.isDashMPD) {
        req = m3u8stream(format.url, {
          chunkReadahead: +info.live_chunk_readahead,
          begin: options.begin || format.isLive && Date.now(),
          liveBuffer: options.liveBuffer,
          requestOptions: options.requestOptions,
          parser: format.isDashMPD ? "dash-mpd" : "m3u8",
          id: format.itag
        });
        req.on("progress", (segment, totalSegments) => {
          stream.emit("progress", segment.size, segment.num, totalSegments);
        });
        pipeAndSetEvents(req, stream, shouldEnd);
      } else {
        const requestOptions = Object.assign({}, options.requestOptions, {
          maxReconnects: 6,
          maxRetries: 3,
          backoff: { inc: 500, max: 1e4 }
        });
        let shouldBeChunked = dlChunkSize !== 0 && (!format.hasAudio || !format.hasVideo);
        if (shouldBeChunked) {
          let start = options.range && options.range.start || 0;
          let end = start + dlChunkSize;
          const rangeEnd = options.range && options.range.end;
          contentLength = options.range ? (rangeEnd ? rangeEnd + 1 : parseInt(format.contentLength)) - start : parseInt(format.contentLength);
          const getNextChunk = () => {
            if (!rangeEnd && end >= contentLength)
              end = 0;
            if (rangeEnd && end > rangeEnd)
              end = rangeEnd;
            shouldEnd = !end || end === rangeEnd;
            requestOptions.headers = Object.assign({}, requestOptions.headers, {
              Range: `bytes=${start}-${end || ""}`
            });
            req = miniget(format.url, requestOptions);
            req.on("data", ondata);
            req.on("end", () => {
              if (stream.destroyed) {
                return;
              }
              if (end && end !== rangeEnd) {
                start = end + 1;
                end += dlChunkSize;
                getNextChunk();
              }
            });
            pipeAndSetEvents(req, stream, shouldEnd);
          };
          getNextChunk();
        } else {
          if (options.begin) {
            format.url += `&begin=${parseTimestamp(options.begin)}`;
          }
          if (options.range && (options.range.start || options.range.end)) {
            requestOptions.headers = Object.assign({}, requestOptions.headers, {
              Range: `bytes=${options.range.start || "0"}-${options.range.end || ""}`
            });
          }
          req = miniget(format.url, requestOptions);
          req.on("response", (res) => {
            if (stream.destroyed) {
              return;
            }
            contentLength = contentLength || parseInt(res.headers["content-length"]);
          });
          req.on("data", ondata);
          pipeAndSetEvents(req, stream, shouldEnd);
        }
      }
      stream._destroy = () => {
        stream.destroyed = true;
        req.destroy();
        req.end();
      };
    };
    ytdl2.downloadFromInfo = (info, options) => {
      const stream = createStream(options);
      if (!info.full) {
        throw Error("Cannot use `ytdl.downloadFromInfo()` when called with info from `ytdl.getBasicInfo()`");
      }
      setImmediate(() => {
        downloadFromInfoCallback(stream, info, options);
      });
      return stream;
    };
  }
});

// api/vinfo.js
var import_ytdl_core = __toESM(require_lib());
async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const videoUrl = url.searchParams.get("url");
  if (!videoUrl || !import_ytdl_core.default.validateURL(videoUrl)) {
    return new Response(JSON.stringify({ error: "Invalid YouTube URL" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  const info = await import_ytdl_core.default.getInfo(videoUrl);
  return new Response(JSON.stringify({ title: info.videoDetails.title }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}
export {
  onRequest
};
/*! Bundled license information:

sax/lib/sax.js:
  (*! http://mths.be/fromcodepoint v0.1.0 by @mathias *)
*/
