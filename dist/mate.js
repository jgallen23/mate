/*!
  * Mate - an animation library 
  * v0.0.1
  * https://github.com/jgallen23/cookie-monster
  * copyright JGA 2011
  * MIT License
  */

!function (name, definition) {
  if (typeof module != 'undefined' && module.exports) module.exports = definition();
  else if (typeof define == 'function' && typeof define.amd == 'object') define(definition);
  else this[name] = definition();
}('mate', function() {

var transitionEndEvent = {
  "-webkit-": "webkitTransitionEnd",
  "-moz-": "transitionend"
};

var select = function(str) {
  return document.getElementById(str);
};

var Mate = function() {
  this.animations = [];
  this.prefix = this.getVendorPrefix();
};

Mate.prototype.getVendorPrefix = function() {
  var ua = navigator.userAgent;
  if (ua.indexOf('WebKit') != -1)
    return "-webkit-";
  else if (ua.indexOf('Gecko') != -1)
    return "-moz-";
  return "";
};

Mate.prototype.with = function(selector) {
  var a = new Animation(select(selector));
  a.mate = this;
  this.animations.push(a);
  return a;
};

Mate.prototype.run = function() {
  for (var i = 0, c = this.animations.length; i < c; i++) {
    var anim = this.animations[i];
    anim.animate();
  }
};

var Animation = function(el) {
  this.el = el;
  this.mate = null;
  this._delay = 0;
  this._duration = 500;
  this._ease = 'ease';
  this._then = null;
  this._repeat = false;
  this._parent = null;
  this.queue = [];
};

Animation.prototype.duration = function(dur) {
  this._duration = dur;
  return this;
};

Animation.prototype.ease = function(ease) {
  this._ease = ease;
  return this;
};

Animation.prototype.delay = function(delay) {
  this._delay = delay;
  return this;
};

Animation.prototype.repeat = function() {
  this._repeat = true;
  return this;
};

Animation.prototype.addVendorPrefix = function(prop) {
  if (prop == "transform")
    return this.mate.prefix+prop;
  return prop;
};

Animation.prototype.do = function(prop, val) {
  this.queue.push({ prop: this.addVendorPrefix(prop), val: val });
  return this;
};

Animation.prototype.repeatAnimation = function(cb) {
  var a = this._parent || this;
  if (a._repeat) {
    a.animate(cb);
  }
};

Animation.prototype.animate = function(cb) {
  var self = this;
  setTimeout(function() {
    self.el.style.setProperty(self.mate.prefix+"transition", "all "+(self._duration/1000)+"s "+self._ease, '');

    var callback = function() {
      self.el.removeEventListener(transitionEndEvent[self.mate.prefix], callback);
      if (self._then) {
        self._then.animate();
      } else {
        self.repeatAnimation(cb);
      }
      if (cb) cb();
    };
    self.el.addEventListener(transitionEndEvent[self.mate.prefix], callback);
    for (var i = 0, c = self.queue.length; i < c; i++) {
      var a = self.queue[i];
      self.el.style.setProperty(a.prop, a.val, '');
    }
  }, this._delay);
};

Animation.prototype.then = function() {
  var a = new Animation(this.el);
  a.mate = this.mate;
  a._parent = this._parent || this;
  this._then = a; 
  return a;
};

Animation.prototype.with = function(selector) {
  return this.mate.with(selector);
};

Animation.prototype.run = function() {
  return this.mate.run();
};

var mate = function() {
  return new Mate();
};

  return mate;
});
