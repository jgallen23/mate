var transitionEndEvent = {
  "-webkit-": "webkitTransitionEnd",
  "-moz-": "transitionend"
};

var select = function(str) {
  return document.getElementById(str);
};

var getVendorPrefix = function() {
  var ua = navigator.userAgent;
  if (ua.indexOf('WebKit') != -1)
    return "-webkit-";
  else if (ua.indexOf('Gecko') != -1)
    return "-moz-";
  return "";
};
var prefix = this.getVendorPrefix();

var Animation = function(el) {
  this.el = el;
  this.animations = [];
  this._delay = 0;
  this._offset = 0;
  this._duration = 500;
  this._ease = 'ease';
  this._then = null;
  this._repeat = false;
  this.queue = [];
  this.root = null;
};

Animation.prototype.getRoot = function() {
  return this.root || this;
};

Animation.prototype.getParent = function() {
  return this.parent || this;
};

Animation.prototype.at = function(offset) {
  var root = this.getRoot();
  var a = new Animation();
  a.root = root;
  a._offset = offset;
  root.animations.push(a);
  return a;
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
    return prefix+prop;
  return prop;
};

Animation.prototype.anim = function(prop, val) {
  this.queue.push({ prop: this.addVendorPrefix(prop), val: val });
  return this;
};

Animation.prototype.scale = function(val) {
  this.queue.push({ prop: this.addVendorPrefix('transform'), val: 'scale('+val+')' });
  return this;
};

Animation.prototype.rotate = function(val) {
  this.queue.push({ prop: this.addVendorPrefix('transform'), val: 'rotate('+val+')' });
  return this;
};

Animation.prototype.opacity = function(val) {
  this.queue.push({ prop: 'opacity', val: val });
  return this;
};

Animation.prototype.translate = function(x, y) {
  if (!y) y = 0;
  this.queue.push({ prop: this.addVendorPrefix('transform'), val: 'translate('+x+','+y+')' });
  return this;
};

Animation.prototype.repeatAnimation = function(cb) {
  var parent = this.parent || this;
  if (parent._repeat) {
    run(parent);
  }
};


Animation.prototype.animate = function(cb) {
  console.log(this.el, this.getParent()._offset);
  if (!this.el)
    return;
  var self = this;
  setTimeout(function() {
    self.el.style.setProperty(prefix+"transition", "all "+(self._duration/1000)+"s "+self._ease, '');

    var callback = function() {
      self.getParent()._offset = 0;
      self.el.removeEventListener(transitionEndEvent[prefix], callback);
      if (self._then) {
        self._then.animate();
      } else {
        self.repeatAnimation(cb);
      }
      if (cb) cb();
    };
    self.el.addEventListener(transitionEndEvent[prefix], callback);
    for (var i = 0, c = self.queue.length; i < c; i++) {
      var a = self.queue[i];
      self.el.style.setProperty(a.prop, a.val, '');
    }
  }, this._delay + this.getParent()._offset);
};

Animation.prototype.then = function() {
  var a = new Animation(this.el);
  a.root = this.root || this;
  a.parent = this.parent || this;
  this._then = a; 
  return a;
};

Animation.prototype.use = function(selector) {
  //use pops back to top
  var root = this.root || this;
  var a = new Animation(select(selector));
  a.root = root; 
  console.log(this._offset);
  a._offset = this._offset;
  root.animations.push(a);
  return a;
};

Animation.prototype.run = function() {
  var root = this.root || this;
  return run(root);
};

var run = function(anim) {
  console.log(anim);
  anim.animate();
  for (var i = 0, c = anim.animations.length; i < c; i++) {
    run(anim.animations[i]);
  }
  return anim;
};

var mate = function(selector) {
  return new Animation(select(selector));
};
