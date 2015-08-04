"use strict";

var FileHandler     = require('./file_handler');
var _               = require('lodash');
var request         = require('request');
var fs              = require('fs');

function Mail(params) {
  params = params || {};

  this.to         = params.to         || [];
  this.from       = params.from       || '';
  this.subject    = params.subject    || '';
  this.subject    = params.template   || '';
  this.text       = params.text       || '';
  this.html       = params.html       || '';
  this.bcc        = params.bcc        || [];
  this.cc         = params.cc         || [];
  this.replyto    = params.replyto    || '';
  this.date       = params.date       || '';
  this.merge_vars = params.merge_vars || {};
  this.headers    = params.headers    || {};

  this.attachments = [];
  if (params.attachments) {
    params.attachments.forEach(function(file) {
      this.attachments.push(new FileHandler(file));
    }, this);
  }
  this.images = [];
  if (params.images) {
    params.images.forEach(function(file) {
      this.images.push(new FileHandler(file));
    }, this);
  }
}

Mail.prototype.addHeader = function(obj_key, value) {
  if (typeof value === "undefined" || value === null) { 
    value = ""; 
  }

  if (_.isObject(obj_key)) {
    _.extend(this.headers, obj_key);
  } else {
    var object_to_add = {}
    object_to_add[obj_key] = value;
    _.extend(this.headers, object_to_add);
  }
  return this;
};

Mail.prototype.setHeaders = function(obj_key) {
  if (_.isObject(obj_key)) {
    this.headers = obj_key;
  }
  return this;
};

Mail.prototype.setFrom = function(from, name) {
  this.from = {email: from};
  if(name) from.name = name;
  return this;
};

Mail.prototype.addTo = function(to, name) {
  to = {email: to}
  if(name) to.name = name;
  this.to.push(to);
  return this;
};

Mail.prototype.addCc = function(cc) {
  this.cc.push(cc);
  return this;
};

Mail.prototype.addBcc = function(bcc) {
  this.bcc.push(bcc);
  return this;
};

Mail.prototype.setSubject = function(subject) {
  this.subject = subject;
  return this;
};

Mail.prototype.setText = function(text) {
  this.text = text;
  return this;
};

Mail.prototype.setHtml = function(html) {
  this.html = html;
  return this;
};

Mail.prototype.setTemplate = function(template) {
  this.smtpapi.setTemplate(template);
  return this;
};

Mail.prototype.addMergeVars = function(merge_vars) {
  this.merge_vars.push(merge_vars);
  return this;
};

Mail.prototype.addAttachment = function(file_object) {
  this.attachments.push(new FileHandler(file_object));
  return this;
};

Mail.prototype.addImage = function(file_object) {
  this.images.push(new FileHandler(file_object));
  return this;
};

Mail.prototype.setDate = function(date) {
  this.date = date;
  return this;
};

Mail.prototype.toWebFormat = function() {
  var web  = {
    to          : this.to,
    from        : this.from,
    subject     : this.subject,
    text        : this.text,
    html        : this.html,
    headers     : JSON.stringify(this.headers)
  };

  if (this.cc)          { web.cc           = this.cc; }
  if (this.bcc)         { web.bcc          = this.bcc; }
  if (this.html)        { web.html         = this.html; }
  if (this.template)    { web.template     = this.template; }
  if (this.merge_vars)  { web.merge_vars   = this.merge_vars; }
  if (this.replyto)     { web.replyto      = this.replyto; }
  if (this.date)        { web.date         = this.date; }

  if (this.attachments) {
    web.attachments = [];
    this.attachments.forEach(function(file) {

      if (file.url) {
        file.content  = request(file.url);
      } else if (file.path) {
        file.content  = fs.createReadStream(file.path);
      }

      web.attachments.push({
        name     : file.filename,
        content  : file.content || " ",
        type     : file.contentType
      });
    });
  }

  if (this.images) {
    web.images = [];
    this.images.forEach(function(file) {

      if (file.url) {
        file.content  = request(file.url);
      } else if (file.path) {
        file.content  = fs.createReadStream(file.path);
      }

      web.images.push({
        name     : file.filename,
        content  : file.content || " ",
        type     : file.contentType
      });
    });
  }

  return web;
};

module.exports = Mail;
