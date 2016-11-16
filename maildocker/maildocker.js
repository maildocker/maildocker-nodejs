"use strict";

var package_json    = require('./package.json');
var _               = require('lodash');
var request         = require('request');
var Mail           = require('./message');

var Maildocker = function(apiKey, apiSecret, options) {

  if( !(this instanceof Maildocker) ) {
    return new Maildocker(apiKey, apiSecret, options);
  }

  if( !apiKey || !apiSecret ) {
    throw new Error('Need a username + password or api key!');
  }

  this.api_key = apiKey;
  this.api_secret = apiSecret;
  this.options = options || {};

  var _this = this;
  
  var uriParts = {};
  uriParts.protocol = this.options.protocol || "https";
  uriParts.host = this.options.host || "ecentry.io";
  uriParts.port = this.options.port || "";
  uriParts.endpoint = this.options.endpoint || "/api/maildocker/" + package_json.version + "/mail/";
  delete this.options.protocol;
  delete this.options.host;
  delete this.options.port;
  delete this.options.endpoint;
  this.options.uriParts = uriParts;

  this.options.uri = this.options.uri || uriParts.protocol + "://" + uriParts.host + (uriParts.port ? ":" + uriParts.port : "") + uriParts.endpoint;

  var send = function(email, callback) {
    var callback    = callback || function() { };
    if (email.constructor !== Mail) {
      email = new Mail(email);
    }

    _send.bind(this)(email, callback);
  };

  var _send = function(email, callback) {
    var postOptions = {
      method    : 'POST',
      headers   : {
        'Content-Type': 'application/json'
      }
    };

    postOptions.headers['Authorization'] = 'Basic ' + new Buffer(this.api_key + ':' + this.api_secret).toString('base64');

    var options = _.merge(postOptions, this.options);

    var req = request(options, function(err, resp, body) {
      var json;

      if(err) return callback(err, null);
      
      try {
        json = JSON.parse(body);
      } catch (e) {
        e.message = e.message + " JsonParseError: " + body;
        return callback(new Error(e), null);
      }

      if (json.message !== 'success') {
        var error = 'MaildockerError';
        if (json.errors) { error = json.errors.shift(); }
        return callback(new Error(error), null);
      }

      return callback(null, json);
    });

    var form = email.toWebFormat();

    var reqForm = req.form();

    var _reqFormAppend = function(field, value) {
      reqForm.append(field, value);
    };

    for (var field in form) {
      var value = form[field];
      try {
        if(!Array.isArray(value)){
          _reqFormAppend.bind(this)(field, value);
        } else {
          value.forEach(_reqFormAppend.bind(this, field));
        }
      } catch(err) {}
    }
  };

  this.version         = package_json.version;
  this.Mail            = Mail;
  this.send            = send;
  this.options         = this.options;
  return this;
};

module.exports = Maildocker;
