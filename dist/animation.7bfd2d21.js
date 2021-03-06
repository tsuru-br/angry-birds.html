// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"node_modules/framesync/dist/framesync.es.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.currentFrameTime = exports.timeSinceLastFrame = exports.cancelOnFrameEnd = exports.cancelOnFrameRender = exports.cancelOnFrameUpdate = exports.cancelOnFrameStart = exports.onFrameEnd = exports.onFrameRender = exports.onFrameUpdate = exports.onFrameStart = exports.currentTime = void 0;
var hasRAF = typeof window !== 'undefined' && window.requestAnimationFrame !== undefined;
var prevTime = 0;
var onNextFrame = hasRAF ? function (callback) {
  return window.requestAnimationFrame(callback);
} : function (callback) {
  var currentTime = Date.now();
  var timeToCall = Math.max(0, 16.7 - (currentTime - prevTime));
  prevTime = currentTime + timeToCall;
  setTimeout(function () {
    return callback(prevTime);
  }, timeToCall);
};

function createRenderStep(startRenderLoop) {
  var functionsToRun = [];
  var functionsToRunNextFrame = [];
  var numThisFrame = 0;
  var isProcessing = false;
  var i = 0;
  return {
    cancel: function (callback) {
      var indexOfCallback = functionsToRunNextFrame.indexOf(callback);

      if (indexOfCallback !== -1) {
        functionsToRunNextFrame.splice(indexOfCallback, 1);
      }
    },
    process: function () {
      isProcessing = true;
      _a = [functionsToRunNextFrame, functionsToRun], functionsToRun = _a[0], functionsToRunNextFrame = _a[1];
      functionsToRunNextFrame.length = 0;
      numThisFrame = functionsToRun.length;

      for (i = 0; i < numThisFrame; i++) {
        functionsToRun[i]();
      }

      isProcessing = false;

      var _a;
    },
    schedule: function (callback, immediate) {
      if (immediate === void 0) {
        immediate = false;
      }

      startRenderLoop();
      var addToCurrentBuffer = immediate && isProcessing;
      var buffer = addToCurrentBuffer ? functionsToRun : functionsToRunNextFrame;

      if (buffer.indexOf(callback) === -1) {
        buffer.push(callback);

        if (addToCurrentBuffer) {
          numThisFrame = functionsToRun.length;
        }
      }
    }
  };
}

var HAS_PERFORMANCE_NOW = typeof performance !== 'undefined' && performance.now !== undefined;
var currentTime = HAS_PERFORMANCE_NOW ? function () {
  return performance.now();
} : function () {
  return Date.now();
};
exports.currentTime = currentTime;
var willRenderNextFrame = false;
var MAX_ELAPSED = 40;
var defaultElapsed = 16.7;
var useDefaultElapsed = true;
var currentFramestamp = 0;
var elapsed = 0;

function startRenderLoop() {
  if (willRenderNextFrame) return;
  willRenderNextFrame = true;
  useDefaultElapsed = true;
  onNextFrame(processFrame);
}

var frameStart = createRenderStep(startRenderLoop);
var frameUpdate = createRenderStep(startRenderLoop);
var frameRender = createRenderStep(startRenderLoop);
var frameEnd = createRenderStep(startRenderLoop);

function processFrame(framestamp) {
  willRenderNextFrame = false;
  elapsed = useDefaultElapsed ? defaultElapsed : Math.max(Math.min(framestamp - currentFramestamp, MAX_ELAPSED), 1);
  if (!useDefaultElapsed) defaultElapsed = elapsed;
  currentFramestamp = framestamp;
  frameStart.process();
  frameUpdate.process();
  frameRender.process();
  frameEnd.process();
  if (willRenderNextFrame) useDefaultElapsed = false;
}

var onFrameStart = frameStart.schedule;
exports.onFrameStart = onFrameStart;
var onFrameUpdate = frameUpdate.schedule;
exports.onFrameUpdate = onFrameUpdate;
var onFrameRender = frameRender.schedule;
exports.onFrameRender = onFrameRender;
var onFrameEnd = frameEnd.schedule;
exports.onFrameEnd = onFrameEnd;
var cancelOnFrameStart = frameStart.cancel;
exports.cancelOnFrameStart = cancelOnFrameStart;
var cancelOnFrameUpdate = frameUpdate.cancel;
exports.cancelOnFrameUpdate = cancelOnFrameUpdate;
var cancelOnFrameRender = frameRender.cancel;
exports.cancelOnFrameRender = cancelOnFrameRender;
var cancelOnFrameEnd = frameEnd.cancel;
exports.cancelOnFrameEnd = cancelOnFrameEnd;

var timeSinceLastFrame = function () {
  return elapsed;
};

exports.timeSinceLastFrame = timeSinceLastFrame;

var currentFrameTime = function () {
  return currentFramestamp;
};

exports.currentFrameTime = currentFrameTime;
},{}],"node_modules/style-value-types/dist/style-value-types.es.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.splitColorValues = splitColorValues;
exports.color = exports.hex = exports.hsla = exports.rgba = exports.rgbUnit = exports.complex = exports.scale = exports.px = exports.percent = exports.degrees = exports.alpha = exports.number = exports.splitCommaDelimited = exports.getValueFromFunctionString = void 0;

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
var __assign = Object.assign || function __assign(t) {
  for (var s, i = 1, n = arguments.length; i < n; i++) {
    s = arguments[i];

    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
  }

  return t;
};

var clamp = function (min, max) {
  return function (v) {
    return Math.max(Math.min(v, max), min);
  };
};

var contains = function (term) {
  return function (v) {
    return typeof v === 'string' && v.indexOf(term) !== -1;
  };
};

var createUnitType = function (unit) {
  return {
    test: contains(unit),
    parse: parseFloat,
    transform: function (v) {
      return "" + v + unit;
    }
  };
};

var isFirstChars = function (term) {
  return function (v) {
    return typeof v === 'string' && v.indexOf(term) === 0;
  };
};

var getValueFromFunctionString = function (value) {
  return value.substring(value.indexOf('(') + 1, value.lastIndexOf(')'));
};

exports.getValueFromFunctionString = getValueFromFunctionString;

var splitCommaDelimited = function (value) {
  return typeof value === 'string' ? value.split(/,\s*/) : [value];
};

exports.splitCommaDelimited = splitCommaDelimited;

function splitColorValues(terms) {
  var numTerms = terms.length;
  return function (v) {
    var values = {};
    var valuesArray = splitCommaDelimited(getValueFromFunctionString(v));

    for (var i = 0; i < numTerms; i++) {
      values[terms[i]] = valuesArray[i] !== undefined ? parseFloat(valuesArray[i]) : 1;
    }

    return values;
  };
}

var number = {
  test: function (v) {
    return typeof v === 'number';
  },
  parse: parseFloat,
  transform: function (v) {
    return v;
  }
};
exports.number = number;

var alpha = __assign({}, number, {
  transform: clamp(0, 1)
});

exports.alpha = alpha;
var degrees = createUnitType('deg');
exports.degrees = degrees;
var percent = createUnitType('%');
exports.percent = percent;
var px = createUnitType('px');
exports.px = px;

var scale = __assign({}, number, {
  default: 1
});

exports.scale = scale;
var FLOAT_REGEX = /(-)?(\d[\d\.]*)/g;

var generateToken = function (token) {
  return '${' + token + '}';
};

var complex = {
  test: function (v) {
    var matches = v.match && v.match(FLOAT_REGEX);
    return matches !== undefined && matches.constructor === Array && matches.length > 1;
  },
  parse: function (v) {
    var parsedValue = {};
    v.match(FLOAT_REGEX).forEach(function (value, i) {
      return parsedValue[i] = parseFloat(value);
    });
    return parsedValue;
  },
  createTransformer: function (prop) {
    var counter = 0;
    var template = prop.replace(FLOAT_REGEX, function () {
      return generateToken("" + counter++);
    });
    return function (v) {
      var output = template;

      for (var key in v) {
        if (v.hasOwnProperty(key)) {
          output = output.replace(generateToken(key), v[key].toString());
        }
      }

      return output;
    };
  }
};
exports.complex = complex;
var clampRgbUnit = clamp(0, 255);

var rgbUnit = __assign({}, number, {
  transform: function (v) {
    return Math.round(clampRgbUnit(v));
  }
});

exports.rgbUnit = rgbUnit;

var rgbaTemplate = function (_a) {
  var red = _a.red,
      green = _a.green,
      blue = _a.blue,
      _b = _a.alpha,
      alpha = _b === void 0 ? 1 : _b;
  return "rgba(" + red + ", " + green + ", " + blue + ", " + alpha + ")";
};

var rgba = {
  test: isFirstChars('rgb'),
  parse: splitColorValues(['red', 'green', 'blue', 'alpha']),
  transform: function (_a) {
    var red = _a.red,
        green = _a.green,
        blue = _a.blue,
        alpha = _a.alpha;
    return rgbaTemplate({
      red: rgbUnit.transform(red),
      green: rgbUnit.transform(green),
      blue: rgbUnit.transform(blue),
      alpha: alpha
    });
  }
};
exports.rgba = rgba;

var hslaTemplate = function (_a) {
  var hue = _a.hue,
      saturation = _a.saturation,
      lightness = _a.lightness,
      _b = _a.alpha,
      alpha = _b === void 0 ? 1 : _b;
  return "hsla(" + hue + ", " + saturation + ", " + lightness + ", " + alpha + ")";
};

var hsla = {
  test: isFirstChars('hsl'),
  parse: splitColorValues(['hue', 'saturation', 'lightness', 'alpha']),
  transform: function (_a) {
    var hue = _a.hue,
        saturation = _a.saturation,
        lightness = _a.lightness,
        alpha = _a.alpha;
    return hslaTemplate({
      hue: Math.round(hue),
      saturation: percent.transform(saturation),
      lightness: percent.transform(lightness),
      alpha: alpha
    });
  }
};
exports.hsla = hsla;

var hex = __assign({}, rgba, {
  test: isFirstChars('#'),
  parse: function (v) {
    var r, g, b;

    if (v.length > 4) {
      r = v.substr(1, 2);
      g = v.substr(3, 2);
      b = v.substr(5, 2);
    } else {
      r = v.substr(1, 1);
      g = v.substr(2, 1);
      b = v.substr(3, 1);
      r += r;
      g += g;
      b += b;
    }

    return {
      red: parseInt(r, 16),
      green: parseInt(g, 16),
      blue: parseInt(b, 16),
      alpha: 1
    };
  }
});

exports.hex = hex;

var isRgba = function (v) {
  return v.red !== undefined;
};

var isHsla = function (v) {
  return v.hue !== undefined;
};

var color = {
  test: function (v) {
    return rgba.test(v) || hsla.test(v) || hex.test(v);
  },
  parse: function (v) {
    if (rgba.test(v)) {
      return rgba.parse(v);
    } else if (hsla.test(v)) {
      return hsla.parse(v);
    } else if (hex.test(v)) {
      return hex.parse(v);
    }

    return v;
  },
  transform: function (v) {
    if (isRgba(v)) {
      return rgba.transform(v);
    } else if (isHsla(v)) {
      return hsla.transform(v);
    }

    return v;
  }
};
exports.color = color;
},{}],"node_modules/popmotion/calc.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var isNum = function (v) { return typeof v === 'number'; };
exports.isPoint = function (point) {
    return point.x !== undefined && point.y !== undefined;
};
exports.isPoint3D = function (point) {
    return point.z !== undefined;
};
var toDecimal = function (num, precision) {
    if (precision === void 0) { precision = 2; }
    precision = Math.pow(10, precision);
    return Math.round(num * precision) / precision;
};
var ZERO_POINT = {
    x: 0,
    y: 0,
    z: 0
};
var distance1D = function (a, b) { return Math.abs(a - b); };
exports.angle = function (a, b) {
    if (b === void 0) { b = ZERO_POINT; }
    return exports.radiansToDegrees(Math.atan2(b.y - a.y, b.x - a.x));
};
exports.degreesToRadians = function (degrees) { return degrees * Math.PI / 180; };
exports.dilate = function (a, b, dilation) { return a + ((b - a) * dilation); };
exports.distance = function (a, b) {
    if (b === void 0) { b = ZERO_POINT; }
    if (isNum(a) && isNum(b)) {
        return distance1D(a, b);
    }
    else if (exports.isPoint(a) && exports.isPoint(b)) {
        var xDelta = distance1D(a.x, b.x);
        var yDelta = distance1D(a.y, b.y);
        var zDelta = (exports.isPoint3D(a) && exports.isPoint3D(b)) ? distance1D(a.z, b.z) : 0;
        return Math.sqrt((Math.pow(xDelta, 2)) + (Math.pow(yDelta, 2)) + (Math.pow(zDelta, 2)));
    }
    return 0;
};
exports.getProgressFromValue = function (from, to, value) {
    var toFromDifference = to - from;
    return toFromDifference === 0 ? 1 : (value - from) / toFromDifference;
};
exports.getValueFromProgress = function (from, to, progress) {
    return (-progress * from) + (progress * to) + from;
};
exports.pointFromAngleAndDistance = function (origin, angle, distance) {
    angle = exports.degreesToRadians(angle);
    return {
        x: distance * Math.cos(angle) + origin.x,
        y: distance * Math.sin(angle) + origin.y
    };
};
exports.radiansToDegrees = function (radians) { return radians * 180 / Math.PI; };
exports.smooth = function (newValue, oldValue, duration, smoothing) {
    if (smoothing === void 0) { smoothing = 0; }
    return toDecimal(oldValue + (duration * (newValue - oldValue) / Math.max(smoothing, duration)));
};
exports.speedPerFrame = function (xps, frameDuration) {
    return (isNum(xps)) ? xps / (1000 / frameDuration) : 0;
};
exports.speedPerSecond = function (velocity, frameDuration) {
    return frameDuration ? velocity * (1000 / frameDuration) : 0;
};
exports.stepProgress = function (steps, progress) {
    var segment = 1 / (steps - 1);
    var target = 1 - (1 / steps);
    var progressOfTarget = Math.min(progress / target, 1);
    return Math.floor(progressOfTarget / segment) * segment;
};

},{}],"node_modules/popmotion/transformers.js":[function(require,module,exports) {
"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var framesync_1 = require("framesync");
var style_value_types_1 = require("style-value-types");
var calc_1 = require("./calc");
var noop = function (v) { return v; };
exports.appendUnit = function (unit) { return function (v) { return "" + v + unit; }; };
exports.applyOffset = function (from, to) {
    var hasReceivedFrom = true;
    if (to === undefined) {
        to = from;
        hasReceivedFrom = false;
    }
    var getOffset = function (v) { return v - from; };
    var applyOffsetTo = function (v) { return v + to; };
    return function (v) {
        if (hasReceivedFrom) {
            return applyOffsetTo(getOffset(v));
        }
        else {
            from = v;
            hasReceivedFrom = true;
            return to;
        }
    };
};
var blend = function (from, to, v) {
    var fromExpo = from * from;
    var toExpo = to * to;
    return Math.sqrt(v * (toExpo - fromExpo) + fromExpo);
};
exports.blendColor = function (from, to) {
    var fromColor = (typeof from === 'string') ? style_value_types_1.color.parse(from) : from;
    var toColor = (typeof to === 'string') ? style_value_types_1.color.parse(to) : to;
    var blended = __assign({}, fromColor);
    var blendFunc = (from.hue !== undefined ||
        typeof from === 'string' && style_value_types_1.hsla.test(from)) ? calc_1.getValueFromProgress
        : blend;
    return function (v) {
        blended = __assign({}, blended);
        for (var key in blended) {
            if (key !== 'alpha' && blended.hasOwnProperty(key)) {
                blended[key] = blendFunc(fromColor[key], toColor[key], v);
            }
        }
        blended.alpha = calc_1.getValueFromProgress(fromColor.alpha, toColor.alpha, v);
        return blended;
    };
};
exports.clamp = function (min, max) { return function (v) { return Math.min(Math.max(v, min), max); }; };
var combineFunctions = function (a, b) { return function (v) { return b(a(v)); }; };
exports.pipe = function () {
    var transformers = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        transformers[_i] = arguments[_i];
    }
    return transformers.reduce(combineFunctions);
};
exports.conditional = function (check, apply) { return function (v) { return check(v) ? apply(v) : v; }; };
var slowInterpolate = function (input, output, rangeLength, rangeEasing) {
    var finalIndex = rangeLength - 1;
    if (input[0] > input[finalIndex]) {
        input.reverse();
        output.reverse();
    }
    return function (v) {
        if (v <= input[0]) {
            return output[0];
        }
        if (v >= input[finalIndex]) {
            return output[finalIndex];
        }
        var i = 1;
        for (; i < rangeLength; i++) {
            if (input[i] > v || i === finalIndex) {
                break;
            }
        }
        var progressInRange = calc_1.getProgressFromValue(input[i - 1], input[i], v);
        var easedProgress = (rangeEasing) ? rangeEasing[i - 1](progressInRange) : progressInRange;
        return calc_1.getValueFromProgress(output[i - 1], output[i], easedProgress);
    };
};
var fastInterpolate = function (minA, maxA, minB, maxB) { return function (v) {
    return (((v - minA) * (maxB - minB)) / (maxA - minA)) + minB;
}; };
exports.interpolate = function (input, output, rangeEasing) {
    var rangeLength = input.length;
    return rangeLength !== 2
        ? slowInterpolate(input, output, rangeLength, rangeEasing)
        : fastInterpolate(input[0], input[1], output[0], output[1]);
};
exports.generateStaticSpring = function (alterDisplacement) {
    if (alterDisplacement === void 0) { alterDisplacement = noop; }
    return function (constant, origin) { return function (v) {
        var displacement = origin - v;
        var springModifiedDisplacement = -constant * (0 - alterDisplacement(Math.abs(displacement)));
        return (displacement <= 0) ? origin + springModifiedDisplacement : origin - springModifiedDisplacement;
    }; };
};
exports.linearSpring = exports.generateStaticSpring();
exports.nonlinearSpring = exports.generateStaticSpring(Math.sqrt);
exports.wrap = function (min, max) { return function (v) {
    var rangeSize = max - min;
    return ((v - min) % rangeSize + rangeSize) % rangeSize + min;
}; };
exports.smooth = function (strength) {
    if (strength === void 0) { strength = 50; }
    var previousValue = 0;
    var lastUpdated = 0;
    return function (v) {
        var currentFramestamp = framesync_1.currentFrameTime();
        var timeDelta = (currentFramestamp !== lastUpdated) ? currentFramestamp - lastUpdated : 0;
        var newValue = timeDelta ? calc_1.smooth(v, previousValue, timeDelta, strength) : previousValue;
        lastUpdated = currentFramestamp;
        previousValue = newValue;
        return newValue;
    };
};
exports.snap = function (points) {
    if (typeof points === 'number') {
        return function (v) { return Math.round(v / points) * points; };
    }
    else {
        var i_1 = 0;
        var numPoints_1 = points.length;
        return function (v) {
            var lastDistance = Math.abs(points[0] - v);
            for (i_1 = 1; i_1 < numPoints_1; i_1++) {
                var point = points[i_1];
                var distance = Math.abs(point - v);
                if (distance === 0)
                    return point;
                if (distance > lastDistance)
                    return points[i_1 - 1];
                if (i_1 === numPoints_1 - 1)
                    return point;
                lastDistance = distance;
            }
        };
    }
};
exports.steps = function (st, min, max) {
    if (min === void 0) { min = 0; }
    if (max === void 0) { max = 1; }
    return function (v) {
        var progress = calc_1.getProgressFromValue(min, max, v);
        return calc_1.getValueFromProgress(min, max, calc_1.stepProgress(st, progress));
    };
};
exports.transformMap = function (childTransformers) { return function (v) {
    var output = __assign({}, v);
    for (var key in childTransformers) {
        if (childTransformers.hasOwnProperty(key)) {
            var childTransformer = childTransformers[key];
            output[key] = childTransformer(v[key]);
        }
    }
    return output;
}; };

},{"framesync":"node_modules/framesync/dist/framesync.es.js","style-value-types":"node_modules/style-value-types/dist/style-value-types.es.js","./calc":"node_modules/popmotion/calc.js"}],"node_modules/popmotion/chainable/index.js":[function(require,module,exports) {
"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var transformers_1 = require("../transformers");
var Chainable = (function () {
    function Chainable(props) {
        if (props === void 0) { props = {}; }
        this.props = props;
    }
    Chainable.prototype.applyMiddleware = function (middleware) {
        return this.create(__assign({}, this.props, { middleware: this.props.middleware ? [middleware].concat(this.props.middleware) : [middleware] }));
    };
    Chainable.prototype.pipe = function () {
        var funcs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            funcs[_i] = arguments[_i];
        }
        var pipedUpdate = funcs.length === 1 ? funcs[0] : transformers_1.pipe.apply(void 0, funcs);
        return this.applyMiddleware(function (update) { return function (v) { return update(pipedUpdate(v)); }; });
    };
    Chainable.prototype.while = function (predicate) {
        return this.applyMiddleware(function (update, complete) { return function (v) { return predicate(v) ? update(v) : complete(); }; });
    };
    Chainable.prototype.filter = function (predicate) {
        return this.applyMiddleware(function (update, complete) { return function (v) { return predicate(v) && update(v); }; });
    };
    return Chainable;
}());
exports.default = Chainable;

},{"../transformers":"node_modules/popmotion/transformers.js"}],"node_modules/popmotion/observer/index.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Observer = (function () {
    function Observer(_a, observer) {
        var middleware = _a.middleware, onComplete = _a.onComplete;
        var _this = this;
        this.isActive = true;
        this.update = function (v) {
            if (_this.observer.update)
                _this.updateObserver(v);
        };
        this.complete = function () {
            if (_this.observer.complete && _this.isActive)
                _this.observer.complete();
            if (_this.onComplete)
                _this.onComplete();
            _this.isActive = false;
        };
        this.error = function (err) {
            if (_this.observer.error && _this.isActive)
                _this.observer.error(err);
            _this.isActive = false;
        };
        this.observer = observer;
        this.updateObserver = function (v) { return observer.update(v); };
        this.onComplete = onComplete;
        if (observer.update && middleware && middleware.length) {
            middleware.forEach(function (m) { return _this.updateObserver = m(_this.updateObserver, _this.complete); });
        }
    }
    return Observer;
}());
exports.Observer = Observer;
exports.default = function (observerCandidate, _a, onComplete) {
    var middleware = _a.middleware;
    if (typeof observerCandidate === 'function') {
        return new Observer({ middleware: middleware, onComplete: onComplete }, { update: observerCandidate });
    }
    else {
        return new Observer({ middleware: middleware, onComplete: onComplete }, observerCandidate);
    }
};

},{}],"node_modules/popmotion/action/index.js":[function(require,module,exports) {
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var chainable_1 = require("../chainable");
var observer_1 = require("../observer");
var Action = (function (_super) {
    __extends(Action, _super);
    function Action() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Action.prototype.create = function (props) {
        return new Action(props);
    };
    Action.prototype.start = function (observerCandidate) {
        if (observerCandidate === void 0) { observerCandidate = {}; }
        var isComplete = false;
        var subscription = {
            stop: function () { return undefined; }
        };
        var _a = this.props, init = _a.init, observerProps = __rest(_a, ["init"]);
        var observer = observer_1.default(observerCandidate, observerProps, function () {
            isComplete = true;
            subscription.stop();
        });
        var api = init(observer);
        subscription = api
            ? __assign({}, subscription, api) : subscription;
        if (observerCandidate.registerParent) {
            observerCandidate.registerParent(subscription);
        }
        if (isComplete)
            subscription.stop();
        return subscription;
    };
    return Action;
}(chainable_1.default));
exports.Action = Action;
exports.default = function (init) { return new Action({ init: init }); };

},{"../chainable":"node_modules/popmotion/chainable/index.js","../observer":"node_modules/popmotion/observer/index.js"}],"node_modules/popmotion/reactions/index.js":[function(require,module,exports) {
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var chainable_1 = require("../chainable");
var observer_1 = require("../observer");
var BaseMulticast = (function (_super) {
    __extends(BaseMulticast, _super);
    function BaseMulticast() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.subscribers = [];
        return _this;
    }
    BaseMulticast.prototype.complete = function () {
        this.subscribers.forEach(function (subscriber) { return subscriber.complete(); });
    };
    BaseMulticast.prototype.error = function (err) {
        this.subscribers.forEach(function (subscriber) { return subscriber.error(err); });
    };
    BaseMulticast.prototype.update = function (v) {
        for (var i = 0; i < this.subscribers.length; i++) {
            this.subscribers[i].update(v);
        }
    };
    BaseMulticast.prototype.subscribe = function (observerCandidate) {
        var _this = this;
        var observer = observer_1.default(observerCandidate, this.props);
        this.subscribers.push(observer);
        var subscription = {
            unsubscribe: function () {
                var index = _this.subscribers.indexOf(observer);
                if (index !== -1)
                    _this.subscribers.splice(index, 1);
            }
        };
        return subscription;
    };
    BaseMulticast.prototype.stop = function () {
        if (this.parent)
            this.parent.stop();
    };
    BaseMulticast.prototype.registerParent = function (subscription) {
        this.stop();
        this.parent = subscription;
    };
    return BaseMulticast;
}(chainable_1.default));
exports.BaseMulticast = BaseMulticast;

},{"../chainable":"node_modules/popmotion/chainable/index.js","../observer":"node_modules/popmotion/observer/index.js"}],"node_modules/popmotion/reactions/multicast.js":[function(require,module,exports) {
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var _1 = require("./");
var Multicast = (function (_super) {
    __extends(Multicast, _super);
    function Multicast() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Multicast.prototype.create = function (props) {
        return new Multicast(props);
    };
    return Multicast;
}(_1.BaseMulticast));
exports.Multicast = Multicast;
exports.default = function () { return new Multicast(); };

},{"./":"node_modules/popmotion/reactions/index.js"}],"node_modules/popmotion/reactions/value.js":[function(require,module,exports) {
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var framesync_1 = require("framesync");
var calc_1 = require("../calc");
var _1 = require("./");
var isValueList = function (v) { return Array.isArray(v); };
var isSingleValue = function (v) {
    var typeOfV = typeof v;
    return (typeOfV === 'string' || typeOfV === 'number');
};
var ValueReaction = (function (_super) {
    __extends(ValueReaction, _super);
    function ValueReaction(props) {
        var _this = _super.call(this, props) || this;
        _this.scheduleVelocityCheck = function () { return framesync_1.onFrameEnd(_this.velocityCheck); };
        _this.velocityCheck = function () {
            if (framesync_1.currentFrameTime() !== _this.lastUpdated) {
                _this.prev = _this.current;
            }
        };
        _this.prev = _this.current = props.value || 0;
        if (isSingleValue(_this.current)) {
            _this.updateCurrent = function (v) { return _this.current = v; };
            _this.getVelocityOfCurrent = function () { return _this.getSingleVelocity(_this.current, _this.prev); };
        }
        else if (isValueList(_this.current)) {
            _this.updateCurrent = function (v) { return _this.current = v.slice(); };
            _this.getVelocityOfCurrent = function () { return _this.getListVelocity(); };
        }
        else {
            _this.updateCurrent = function (v) {
                _this.current = {};
                for (var key in v) {
                    if (v.hasOwnProperty(key)) {
                        _this.current[key] = v[key];
                    }
                }
            };
            _this.getVelocityOfCurrent = function () { return _this.getMapVelocity(); };
        }
        if (props.initialSubscription)
            _this.subscribe(props.initialSubscription);
        return _this;
    }
    ValueReaction.prototype.create = function (props) {
        return new ValueReaction(props);
    };
    ValueReaction.prototype.get = function () {
        return this.current;
    };
    ValueReaction.prototype.getVelocity = function () {
        return this.getVelocityOfCurrent();
    };
    ValueReaction.prototype.update = function (v) {
        _super.prototype.update.call(this, v);
        this.prev = this.current;
        this.updateCurrent(v);
        this.timeDelta = framesync_1.timeSinceLastFrame();
        this.lastUpdated = framesync_1.currentFrameTime();
        framesync_1.onFrameEnd(this.scheduleVelocityCheck);
    };
    ValueReaction.prototype.subscribe = function (observerCandidate) {
        var sub = _super.prototype.subscribe.call(this, observerCandidate);
        this.update(this.current);
        return sub;
    };
    ValueReaction.prototype.getSingleVelocity = function (current, prev) {
        return (typeof current === 'number' && typeof prev === 'number')
            ? calc_1.speedPerSecond(current - prev, this.timeDelta)
            : calc_1.speedPerSecond(parseFloat(current) - parseFloat(prev), this.timeDelta) || 0;
    };
    ValueReaction.prototype.getListVelocity = function () {
        var _this = this;
        return this.current.map(function (c, i) { return _this.getSingleVelocity(c, _this.prev[i]); });
    };
    ValueReaction.prototype.getMapVelocity = function () {
        var velocity = {};
        for (var key in this.current) {
            if (this.current.hasOwnProperty(key)) {
                velocity[key] = this.getSingleVelocity(this.current[key], this.prev[key]);
            }
        }
        return velocity;
    };
    return ValueReaction;
}(_1.BaseMulticast));
exports.ValueReaction = ValueReaction;
exports.default = function (value, initialSubscription) { return new ValueReaction({ value: value, initialSubscription: initialSubscription }); };

},{"framesync":"node_modules/framesync/dist/framesync.es.js","../calc":"node_modules/popmotion/calc.js","./":"node_modules/popmotion/reactions/index.js"}],"node_modules/popmotion/compositors/multi.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var framesync_1 = require("framesync");
var action_1 = require("../action");
var multi = function (_a) {
    var getCount = _a.getCount, getFirst = _a.getFirst, getOutput = _a.getOutput, mapApi = _a.mapApi, setProp = _a.setProp, startActions = _a.startActions;
    return function (actions) {
        return action_1.default(function (_a) {
            var update = _a.update, complete = _a.complete, error = _a.error;
            var numActions = getCount(actions);
            var output = getOutput();
            var updateOutput = function () { return update(output); };
            var numCompletedActions = 0;
            var subs = startActions(actions, function (a, name) {
                var hasCompleted = false;
                return a.start({
                    complete: function () {
                        if (!hasCompleted) {
                            hasCompleted = true;
                            numCompletedActions++;
                            if (numCompletedActions === numActions)
                                framesync_1.onFrameUpdate(complete);
                        }
                    },
                    error: error,
                    update: function (v) {
                        setProp(output, name, v);
                        framesync_1.onFrameUpdate(updateOutput, true);
                    }
                });
            });
            return Object.keys(getFirst(subs)).reduce(function (api, methodName) {
                api[methodName] = mapApi(subs, methodName);
                return api;
            }, {});
        });
    };
};
exports.default = multi;

},{"framesync":"node_modules/framesync/dist/framesync.es.js","../action":"node_modules/popmotion/action/index.js"}],"node_modules/popmotion/compositors/composite.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var multi_1 = require("./multi");
var composite = multi_1.default({
    getOutput: function () { return ({}); },
    getCount: function (subs) { return Object.keys(subs).length; },
    getFirst: function (subs) { return subs[Object.keys(subs)[0]]; },
    mapApi: function (subs, methodName) { return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return Object.keys(subs)
            .reduce(function (output, propKey) {
            if (subs[propKey][methodName]) {
                (args[0] && args[0][propKey] !== undefined)
                    ? output[propKey] = subs[propKey][methodName](args[0][propKey])
                    : output[propKey] = (_a = subs[propKey])[methodName].apply(_a, args);
            }
            return output;
            var _a;
        }, {});
    }; },
    setProp: function (output, name, v) { return output[name] = v; },
    startActions: function (actions, starter) { return Object.keys(actions)
        .reduce(function (subs, key) {
        subs[key] = starter(actions[key], key);
        return subs;
    }, {}); }
});
exports.default = composite;

},{"./multi":"node_modules/popmotion/compositors/multi.js"}],"node_modules/popmotion/compositors/parallel.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var multi_1 = require("./multi");
var parallel = multi_1.default({
    getOutput: function () { return ([]); },
    getCount: function (subs) { return subs.length; },
    getFirst: function (subs) { return subs[0]; },
    mapApi: function (subs, methodName) { return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return subs.map(function (sub, i) {
            if (sub[methodName]) {
                return Array.isArray(args[0])
                    ? sub[methodName](args[0][i])
                    : sub[methodName].apply(sub, args);
            }
        });
    }; },
    setProp: function (output, name, v) { return output[name] = v; },
    startActions: function (actions, starter) { return actions.map(function (action, i) { return starter(action, i); }); }
});
exports.default = function () {
    var actions = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        actions[_i] = arguments[_i];
    }
    return parallel(actions);
};

},{"./multi":"node_modules/popmotion/compositors/multi.js"}],"node_modules/popmotion/action/vector.js":[function(require,module,exports) {
"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var style_value_types_1 = require("style-value-types");
var composite_1 = require("../compositors/composite");
var parallel_1 = require("../compositors/parallel");
var transformers_1 = require("../transformers");
var isColor = style_value_types_1.color.test;
var convertToColorAction = function (init, props) { return (typeof props.from === 'string' && isColor(props.from) &&
    typeof props.to === 'string' && isColor(props.to)) ? init(__assign({}, props, { from: 0, to: 1 })).pipe(transformers_1.blendColor(props.from, props.to), style_value_types_1.color.transform)
    : init(props); };
var createVectorTests = function (typeTests) {
    var testNames = Object.keys(typeTests);
    return {
        getVectorKeys: function (props) { return testNames.reduce(function (vectorKeys, key) {
            if (props[key] !== undefined && !typeTests[key](props[key])) {
                vectorKeys.push(key);
            }
            return vectorKeys;
        }, []); },
        test: function (props) { return props && testNames.reduce(function (isVector, key) {
            return isVector || (props[key] !== undefined && !typeTests[key](props[key]));
        }, false); }
    };
};
var reduceArrayValue = function (i) { return function (props, key) {
    props[key] = props[key][i];
    return props;
}; };
var createArrayVector = function (init, props, vectorKeys) {
    var firstVectorKey = vectorKeys[0];
    var actionList = props[firstVectorKey].map(function (v, i) {
        return convertToColorAction(init, vectorKeys.reduce(reduceArrayValue(i), __assign({}, props)));
    });
    return parallel_1.default.apply(void 0, actionList);
};
var reduceObjectValue = function (key) { return function (props, propKey) {
    props[propKey] = props[propKey][key];
    return props;
}; };
var createObjectVector = function (init, props, vectorKeys) {
    var firstVectorKey = vectorKeys[0];
    var actionMap = Object.keys(props[firstVectorKey]).reduce(function (map, key) {
        map[key] = convertToColorAction(init, vectorKeys.reduce(reduceObjectValue(key), __assign({}, props)));
        return map;
    }, {});
    return composite_1.default(actionMap);
};
var createColorVector = function (init, props) { return convertToColorAction(init, props); };
var vectorAction = function (init, typeTests) {
    var _a = createVectorTests(typeTests), test = _a.test, getVectorKeys = _a.getVectorKeys;
    return function (props) {
        var isVector = test(props);
        if (!isVector)
            return init(props);
        var vectorKeys = getVectorKeys(props);
        var testKey = vectorKeys[0];
        var testProp = props[testKey];
        if (Array.isArray(testProp)) {
            return createArrayVector(init, props, vectorKeys);
        }
        else if (typeof testProp === 'string' && isColor(testProp)) {
            return createColorVector(init, props, vectorKeys);
        }
        else {
            return createObjectVector(init, props, vectorKeys);
        }
    };
};
exports.default = vectorAction;

},{"style-value-types":"node_modules/style-value-types/dist/style-value-types.es.js","../compositors/composite":"node_modules/popmotion/compositors/composite.js","../compositors/parallel":"node_modules/popmotion/compositors/parallel.js","../transformers":"node_modules/popmotion/transformers.js"}],"node_modules/popmotion/animations/every-frame/index.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var framesync_1 = require("framesync");
var action_1 = require("../../action");
var frame = function () { return action_1.default(function (_a) {
    var update = _a.update;
    var isActive = true;
    var startTime = framesync_1.currentTime();
    var nextFrame = function () {
        if (!isActive)
            return;
        update(Math.max(framesync_1.currentFrameTime() - startTime, 0));
        framesync_1.onFrameUpdate(nextFrame);
    };
    framesync_1.onFrameUpdate(nextFrame);
    return {
        stop: function () { return isActive = false; }
    };
}); };
exports.default = frame;

},{"framesync":"node_modules/framesync/dist/framesync.es.js","../../action":"node_modules/popmotion/action/index.js"}],"node_modules/popmotion/animations/decay/index.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var framesync_1 = require("framesync");
var style_value_types_1 = require("style-value-types");
var action_1 = require("../../action");
var vector_1 = require("../../action/vector");
var every_frame_1 = require("../every-frame");
var decay = function (props) {
    if (props === void 0) { props = {}; }
    return action_1.default(function (_a) {
        var complete = _a.complete, update = _a.update;
        var _b = props.velocity, velocity = _b === void 0 ? 0 : _b, _c = props.from, from = _c === void 0 ? 0 : _c, _d = props.power, power = _d === void 0 ? 0.8 : _d, _e = props.timeConstant, timeConstant = _e === void 0 ? 350 : _e, _f = props.restDelta, restDelta = _f === void 0 ? 0.5 : _f, modifyTarget = props.modifyTarget;
        var elapsed = 0;
        var amplitude = power * velocity;
        var idealTarget = Math.round(from + amplitude);
        var target = (typeof modifyTarget === 'undefined')
            ? idealTarget
            : modifyTarget(idealTarget);
        var timer = every_frame_1.default().start(function () {
            elapsed += framesync_1.timeSinceLastFrame();
            var delta = -amplitude * Math.exp(-elapsed / timeConstant);
            var isMoving = (delta > restDelta || delta < -restDelta);
            var current = isMoving ? target + delta : target;
            update(current);
            if (!isMoving) {
                timer.stop();
                complete();
            }
        });
        return {
            stop: function () { return timer.stop(); }
        };
    });
};
exports.default = vector_1.default(decay, {
    from: style_value_types_1.number.test,
    modifyTarget: function (func) { return typeof func === 'function'; },
    velocity: style_value_types_1.number.test
});

},{"framesync":"node_modules/framesync/dist/framesync.es.js","style-value-types":"node_modules/style-value-types/dist/style-value-types.es.js","../../action":"node_modules/popmotion/action/index.js","../../action/vector":"node_modules/popmotion/action/vector.js","../every-frame":"node_modules/popmotion/animations/every-frame/index.js"}],"node_modules/popmotion/easing.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DEFAULT_OVERSHOOT_STRENGTH = 1.525;
exports.createReversedEasing = function (easing) {
    return function (p) { return 1 - easing(1 - p); };
};
exports.createMirroredEasing = function (easing) {
    return function (p) { return (p <= 0.5) ? easing(2 * p) / 2 : (2 - easing(2 * (1 - p))) / 2; };
};
exports.linear = function (p) { return p; };
exports.createExpoIn = function (power) { return function (p) { return Math.pow(p, power); }; };
exports.easeIn = exports.createExpoIn(2);
exports.easeOut = exports.createReversedEasing(exports.easeIn);
exports.easeInOut = exports.createMirroredEasing(exports.easeIn);
exports.circIn = function (p) { return 1 - Math.sin(Math.acos(p)); };
exports.circOut = exports.createReversedEasing(exports.circIn);
exports.circInOut = exports.createMirroredEasing(exports.circOut);
exports.createBackIn = function (power) { return function (p) { return (p * p) * ((power + 1) * p - power); }; };
exports.backIn = exports.createBackIn(DEFAULT_OVERSHOOT_STRENGTH);
exports.backOut = exports.createReversedEasing(exports.backIn);
exports.backInOut = exports.createMirroredEasing(exports.backIn);
exports.createAnticipateEasing = function (power) {
    var backEasing = exports.createBackIn(power);
    return function (p) { return ((p *= 2) < 1) ? 0.5 * backEasing(p) : 0.5 * (2 - Math.pow(2, -10 * (p - 1))); };
};
exports.anticipate = exports.createAnticipateEasing(DEFAULT_OVERSHOOT_STRENGTH);
var NEWTON_ITERATIONS = 8;
var NEWTON_MIN_SLOPE = 0.001;
var SUBDIVISION_PRECISION = 0.0000001;
var SUBDIVISION_MAX_ITERATIONS = 10;
var K_SPLINE_TABLE_SIZE = 11;
var K_SAMPLE_STEP_SIZE = 1.0 / (K_SPLINE_TABLE_SIZE - 1.0);
var FLOAT_32_SUPPORTED = (typeof Float32Array !== 'undefined');
var a = function (a1, a2) { return 1.0 - 3.0 * a2 + 3.0 * a1; };
var b = function (a1, a2) { return 3.0 * a2 - 6.0 * a1; };
var c = function (a1) { return 3.0 * a1; };
var getSlope = function (t, a1, a2) { return 3.0 * a(a1, a2) * t * t + 2.0 * b(a1, a2) * t + c(a1); };
var calcBezier = function (t, a1, a2) { return ((a(a1, a2) * t + b(a1, a2)) * t + c(a1)) * t; };
function cubicBezier(mX1, mY1, mX2, mY2) {
    var sampleValues = FLOAT_32_SUPPORTED ? new Float32Array(K_SPLINE_TABLE_SIZE) : new Array(K_SPLINE_TABLE_SIZE);
    var _precomputed = false;
    var binarySubdivide = function (aX, aA, aB) {
        var i = 0;
        var currentX;
        var currentT;
        do {
            currentT = aA + (aB - aA) / 2.0;
            currentX = calcBezier(currentT, mX1, mX2) - aX;
            if (currentX > 0.0) {
                aB = currentT;
            }
            else {
                aA = currentT;
            }
        } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
        return currentT;
    };
    var newtonRaphsonIterate = function (aX, aGuessT) {
        var i = 0;
        var currentSlope = 0;
        var currentX;
        for (; i < NEWTON_ITERATIONS; ++i) {
            currentSlope = getSlope(aGuessT, mX1, mX2);
            if (currentSlope === 0.0) {
                return aGuessT;
            }
            currentX = calcBezier(aGuessT, mX1, mX2) - aX;
            aGuessT -= currentX / currentSlope;
        }
        return aGuessT;
    };
    var calcSampleValues = function () {
        for (var i = 0; i < K_SPLINE_TABLE_SIZE; ++i) {
            sampleValues[i] = calcBezier(i * K_SAMPLE_STEP_SIZE, mX1, mX2);
        }
    };
    var getTForX = function (aX) {
        var intervalStart = 0.0;
        var currentSample = 1;
        var lastSample = K_SPLINE_TABLE_SIZE - 1;
        var dist = 0.0;
        var guessForT = 0.0;
        var initialSlope = 0.0;
        for (; currentSample != lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
            intervalStart += K_SAMPLE_STEP_SIZE;
        }
        --currentSample;
        dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
        guessForT = intervalStart + dist * K_SAMPLE_STEP_SIZE;
        initialSlope = getSlope(guessForT, mX1, mX2);
        if (initialSlope >= NEWTON_MIN_SLOPE) {
            return newtonRaphsonIterate(aX, guessForT);
        }
        else if (initialSlope === 0.0) {
            return guessForT;
        }
        else {
            return binarySubdivide(aX, intervalStart, intervalStart + K_SAMPLE_STEP_SIZE);
        }
    };
    var precompute = function () {
        _precomputed = true;
        if (mX1 != mY1 || mX2 != mY2) {
            calcSampleValues();
        }
    };
    var resolver = function (aX) {
        var returnValue;
        if (!_precomputed) {
            precompute();
        }
        if (mX1 === mY1 && mX2 === mY2) {
            returnValue = aX;
        }
        else if (aX === 0) {
            returnValue = 0;
        }
        else if (aX === 1) {
            returnValue = 1;
        }
        else {
            returnValue = calcBezier(getTForX(aX), mY1, mY2);
        }
        return returnValue;
    };
    return resolver;
}
exports.cubicBezier = cubicBezier;
;

},{}],"node_modules/popmotion/animations/tween/scrubber.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var style_value_types_1 = require("style-value-types");
var action_1 = require("../../action");
var vector_1 = require("../../action/vector");
var calc_1 = require("../../calc");
var easing_1 = require("../../easing");
var scrubber = function (_a) {
    var _b = _a.from, from = _b === void 0 ? 0 : _b, _c = _a.to, to = _c === void 0 ? 1 : _c, _d = _a.ease, ease = _d === void 0 ? easing_1.linear : _d;
    return action_1.default(function (_a) {
        var update = _a.update;
        return ({
            seek: function (progress) { return update(progress); }
        });
    }).pipe(ease, function (v) { return calc_1.getValueFromProgress(from, to, v); });
};
exports.default = vector_1.default(scrubber, {
    ease: function (func) { return typeof func === 'function'; },
    from: style_value_types_1.number.test,
    to: style_value_types_1.number.test
});

},{"style-value-types":"node_modules/style-value-types/dist/style-value-types.es.js","../../action":"node_modules/popmotion/action/index.js","../../action/vector":"node_modules/popmotion/action/vector.js","../../calc":"node_modules/popmotion/calc.js","../../easing":"node_modules/popmotion/easing.js"}],"node_modules/popmotion/animations/tween/index.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var framesync_1 = require("framesync");
var action_1 = require("../../action");
var calc_1 = require("../../calc");
var easing_1 = require("../../easing");
var transformers_1 = require("../../transformers");
var every_frame_1 = require("../every-frame");
var scrubber_1 = require("./scrubber");
var clampProgress = transformers_1.clamp(0, 1);
var tween = function (props) {
    if (props === void 0) { props = {}; }
    return action_1.default(function (_a) {
        var update = _a.update, complete = _a.complete;
        var _b = props.duration, duration = _b === void 0 ? 300 : _b, _c = props.ease, ease = _c === void 0 ? easing_1.easeOut : _c, _d = props.flip, flip = _d === void 0 ? 0 : _d, _e = props.loop, loop = _e === void 0 ? 0 : _e, _f = props.yoyo, yoyo = _f === void 0 ? 0 : _f;
        var _g = props.from, from = _g === void 0 ? 0 : _g, _h = props.to, to = _h === void 0 ? 1 : _h, _j = props.elapsed, elapsed = _j === void 0 ? 0 : _j, _k = props.playDirection, playDirection = _k === void 0 ? 1 : _k, _l = props.flipCount, flipCount = _l === void 0 ? 0 : _l, _m = props.yoyoCount, yoyoCount = _m === void 0 ? 0 : _m, _o = props.loopCount, loopCount = _o === void 0 ? 0 : _o;
        var playhead = scrubber_1.default({ from: from, to: to, ease: ease }).start(update);
        var progress = 0;
        var tweenTimer;
        var isActive = false;
        var reverseTween = function () { return playDirection *= -1; };
        var isTweenComplete = function () {
            var isComplete = (playDirection === 1)
                ? isActive && elapsed >= duration
                : isActive && elapsed <= 0;
            if (!isComplete)
                return false;
            if (isComplete && !loop && !flip && !yoyo)
                return true;
            var isStepTaken = false;
            if (loop && loopCount < loop) {
                elapsed = 0;
                loopCount++;
                isStepTaken = true;
            }
            else if (flip && flipCount < flip) {
                elapsed = duration - elapsed;
                _a = [to, from], from = _a[0], to = _a[1];
                playhead = scrubber_1.default({ from: from, to: to, ease: ease }).start(update);
                flipCount++;
                isStepTaken = true;
            }
            else if (yoyo && yoyoCount < yoyo) {
                reverseTween();
                yoyoCount++;
                isStepTaken = true;
            }
            return !isStepTaken;
            var _a;
        };
        var updateTween = function () {
            progress = clampProgress(calc_1.getProgressFromValue(0, duration, elapsed));
            playhead.seek(progress);
        };
        var startTimer = function () {
            isActive = true;
            tweenTimer = every_frame_1.default().start(function () {
                elapsed += framesync_1.timeSinceLastFrame() * playDirection;
                updateTween();
                if (isTweenComplete() && complete) {
                    tweenTimer.stop();
                    framesync_1.onFrameUpdate(complete, true);
                }
            });
        };
        var stopTimer = function () {
            isActive = false;
            if (tweenTimer)
                tweenTimer.stop();
        };
        startTimer();
        return {
            isActive: function () { return isActive; },
            getElapsed: function () { return transformers_1.clamp(0, duration)(elapsed); },
            getProgress: function () { return progress; },
            stop: function () {
                stopTimer();
            },
            pause: function () {
                stopTimer();
                return this;
            },
            resume: function () {
                startTimer();
                return this;
            },
            seek: function (newProgress) {
                elapsed = calc_1.getValueFromProgress(0, duration, newProgress);
                framesync_1.onFrameUpdate(updateTween, true);
                return this;
            },
            reverse: function () {
                reverseTween();
                return this;
            }
        };
    });
};
exports.default = tween;

},{"framesync":"node_modules/framesync/dist/framesync.es.js","../../action":"node_modules/popmotion/action/index.js","../../calc":"node_modules/popmotion/calc.js","../../easing":"node_modules/popmotion/easing.js","../../transformers":"node_modules/popmotion/transformers.js","../every-frame":"node_modules/popmotion/animations/every-frame/index.js","./scrubber":"node_modules/popmotion/animations/tween/scrubber.js"}],"node_modules/popmotion/animations/keyframes/index.js":[function(require,module,exports) {
"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var calc_1 = require("../../calc");
var easing_1 = require("../../easing");
var transformers_1 = require("../../transformers");
var tween_1 = require("../tween");
var scrubber_1 = require("../tween/scrubber");
var clampProgress = transformers_1.clamp(0, 1);
var defaultEasings = function (values, easing) {
    return values.map(function () { return easing || easing_1.easeOut; }).splice(0, values.length - 1);
};
var defaultTimings = function (values) {
    var numValues = values.length;
    return values.map(function (value, i) { return (i !== 0) ? i / (numValues - 1) : 0; });
};
var interpolateScrubbers = function (input, scrubbers, update) {
    var rangeLength = input.length;
    var finalInputIndex = rangeLength - 1;
    var finalScrubberIndex = finalInputIndex - 1;
    var subs = scrubbers.map(function (scrub) { return scrub.start(update); });
    return function (v) {
        if (v <= input[0]) {
            subs[0].seek(0);
        }
        if (v >= input[finalInputIndex]) {
            subs[finalScrubberIndex].seek(1);
        }
        var i = 1;
        for (; i < rangeLength; i++) {
            if (input[i] > v || i === finalInputIndex)
                break;
        }
        var progressInRange = calc_1.getProgressFromValue(input[i - 1], input[i], v);
        subs[i - 1].seek(clampProgress(progressInRange));
    };
};
var keyframes = function (_a) {
    var easings = _a.easings, _b = _a.ease, ease = _b === void 0 ? easing_1.linear : _b, times = _a.times, values = _a.values, tweenProps = __rest(_a, ["easings", "ease", "times", "values"]);
    easings = Array.isArray(easings)
        ? easings
        : defaultEasings(values, easings);
    times = times || defaultTimings(values);
    var scrubbers = easings.map(function (easing, i) { return scrubber_1.default({
        from: values[i],
        to: values[i + 1],
        ease: easing
    }); });
    return tween_1.default(__assign({}, tweenProps, { ease: ease })).applyMiddleware(function (update) { return interpolateScrubbers(times, scrubbers, update); });
};
exports.default = keyframes;

},{"../../calc":"node_modules/popmotion/calc.js","../../easing":"node_modules/popmotion/easing.js","../../transformers":"node_modules/popmotion/transformers.js","../tween":"node_modules/popmotion/animations/tween/index.js","../tween/scrubber":"node_modules/popmotion/animations/tween/scrubber.js"}],"node_modules/popmotion/animations/physics/index.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var framesync_1 = require("framesync");
var style_value_types_1 = require("style-value-types");
var action_1 = require("../../action");
var vector_1 = require("../../action/vector");
var calc_1 = require("../../calc");
var every_frame_1 = require("../every-frame");
var physics = function (props) {
    if (props === void 0) { props = {}; }
    return action_1.default(function (_a) {
        var complete = _a.complete, update = _a.update;
        var _b = props.acceleration, acceleration = _b === void 0 ? 0 : _b, _c = props.friction, friction = _c === void 0 ? 0 : _c, _d = props.velocity, velocity = _d === void 0 ? 0 : _d, springStrength = props.springStrength, to = props.to;
        var _e = props.restSpeed, restSpeed = _e === void 0 ? 0.001 : _e, _f = props.from, from = _f === void 0 ? 0 : _f;
        var current = from;
        var timer = every_frame_1.default().start(function () {
            var elapsed = Math.max(framesync_1.timeSinceLastFrame(), 16);
            if (acceleration)
                velocity += calc_1.speedPerFrame(acceleration, elapsed);
            if (friction)
                velocity *= Math.pow((1 - friction), (elapsed / 100));
            if (springStrength !== undefined && to !== undefined) {
                var distanceToTarget = to - current;
                velocity += distanceToTarget * calc_1.speedPerFrame(springStrength, elapsed);
            }
            current += calc_1.speedPerFrame(velocity, elapsed);
            update(current);
            var isComplete = (restSpeed !== false && (!velocity || Math.abs(velocity) <= restSpeed));
            if (isComplete) {
                timer.stop();
                complete();
            }
        });
        return {
            set: function (v) {
                current = v;
                return this;
            },
            setAcceleration: function (v) {
                acceleration = v;
                return this;
            },
            setFriction: function (v) {
                friction = v;
                return this;
            },
            setSpringStrength: function (v) {
                springStrength = v;
                return this;
            },
            setSpringTarget: function (v) {
                to = v;
                return this;
            },
            setVelocity: function (v) {
                velocity = v;
                return this;
            },
            stop: function () { return timer.stop(); }
        };
    });
};
exports.default = vector_1.default(physics, {
    acceleration: style_value_types_1.number.test,
    friction: style_value_types_1.number.test,
    velocity: style_value_types_1.number.test,
    from: style_value_types_1.number.test,
    to: style_value_types_1.number.test,
    springStrength: style_value_types_1.number.test
});

},{"framesync":"node_modules/framesync/dist/framesync.es.js","style-value-types":"node_modules/style-value-types/dist/style-value-types.es.js","../../action":"node_modules/popmotion/action/index.js","../../action/vector":"node_modules/popmotion/action/vector.js","../../calc":"node_modules/popmotion/calc.js","../every-frame":"node_modules/popmotion/animations/every-frame/index.js"}],"node_modules/popmotion/animations/spring/index.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var framesync_1 = require("framesync");
var style_value_types_1 = require("style-value-types");
var action_1 = require("../../action");
var vector_1 = require("../../action/vector");
var calc_1 = require("../../calc");
var every_frame_1 = require("../every-frame");
var spring = function (props) {
    if (props === void 0) { props = {}; }
    return action_1.default(function (_a) {
        var update = _a.update, complete = _a.complete;
        var _b = props.velocity, velocity = _b === void 0 ? 0.0 : _b;
        var _c = props.from, from = _c === void 0 ? 0.0 : _c, _d = props.to, to = _d === void 0 ? 0.0 : _d, _e = props.stiffness, stiffness = _e === void 0 ? 100 : _e, _f = props.damping, damping = _f === void 0 ? 10 : _f, _g = props.mass, mass = _g === void 0 ? 1.0 : _g, _h = props.restSpeed, restSpeed = _h === void 0 ? 0.01 : _h, _j = props.restDelta, restDelta = _j === void 0 ? 0.01 : _j;
        var initialVelocity = velocity ? -(velocity / 1000) : 0.0;
        var t = 0;
        var delta = to - from;
        var position = from;
        var prevPosition = position;
        var springTimer = every_frame_1.default().start(function () {
            var timeDelta = framesync_1.timeSinceLastFrame();
            t += timeDelta;
            var dampingRatio = damping / (2 * Math.sqrt(stiffness * mass));
            var angularFreq = Math.sqrt(stiffness / mass) / 1000;
            prevPosition = position;
            if (dampingRatio < 1) {
                var envelope = Math.exp(-dampingRatio * angularFreq * t);
                var expoDecay = angularFreq * Math.sqrt(1.0 - dampingRatio * dampingRatio);
                position = to - envelope * ((initialVelocity + dampingRatio * angularFreq * delta)
                    / expoDecay * Math.sin(expoDecay * t)
                    + delta * Math.cos(expoDecay * t));
            }
            else {
                var envelope = Math.exp(-angularFreq * t);
                position = to - envelope * (delta + (initialVelocity + angularFreq * delta) * t);
            }
            velocity = calc_1.speedPerSecond(position - prevPosition, timeDelta);
            var isBelowVelocityThreshold = Math.abs(velocity) <= restSpeed;
            var isBelowDisplacementThreshold = Math.abs(to - position) <= restDelta;
            if (isBelowVelocityThreshold && isBelowDisplacementThreshold) {
                position = to;
                update(position);
                springTimer.stop();
                complete();
            }
            else {
                update(position);
            }
        });
        return {
            stop: function () { return springTimer.stop(); }
        };
    });
};
exports.default = vector_1.default(spring, {
    from: style_value_types_1.number.test,
    to: style_value_types_1.number.test,
    stiffness: style_value_types_1.number.test,
    damping: style_value_types_1.number.test,
    mass: style_value_types_1.number.test,
    velocity: style_value_types_1.number.test
});

},{"framesync":"node_modules/framesync/dist/framesync.es.js","style-value-types":"node_modules/style-value-types/dist/style-value-types.es.js","../../action":"node_modules/popmotion/action/index.js","../../action/vector":"node_modules/popmotion/action/vector.js","../../calc":"node_modules/popmotion/calc.js","../every-frame":"node_modules/popmotion/animations/every-frame/index.js"}],"node_modules/popmotion/animations/timeline/index.js":[function(require,module,exports) {
"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var keyframes_1 = require("../keyframes");
var easing_1 = require("../../easing");
var composite_1 = require("../../compositors/composite");
var DEFAULT_DURATION = 300;
var flattenTimings = function (instructions) {
    var flatInstructions = [];
    var lastArg = instructions[instructions.length - 1];
    var isStaggered = typeof lastArg === 'number';
    var staggerDelay = isStaggered ? lastArg : 0;
    var segments = isStaggered ? instructions.slice(0, -1) : instructions;
    var numSegments = segments.length;
    var offset = 0;
    segments.forEach(function (item, i) {
        flatInstructions.push(item);
        if (i !== numSegments - 1) {
            var duration = item.duration || DEFAULT_DURATION;
            offset += staggerDelay;
            flatInstructions.push("-" + (duration - offset));
        }
    });
    return flatInstructions;
};
var flattenArrayInstructions = function (instructions, instruction) {
    Array.isArray(instruction)
        ? instructions.push.apply(instructions, flattenTimings(instruction)) : instructions.push(instruction);
    return instructions;
};
var convertDefToProps = function (props, def, i) {
    var duration = props.duration, easings = props.easings, times = props.times, values = props.values;
    var numValues = values.length;
    var prevTimeTo = times[numValues - 1];
    var timeFrom = def.at === 0 ? 0 : def.at / duration;
    var timeTo = (def.at + def.duration) / duration;
    if (i === 0) {
        values.push(def.from);
        times.push(timeFrom);
    }
    else {
        if (prevTimeTo !== timeFrom) {
            if (def.from !== undefined) {
                values.push(values[numValues - 1]);
                times.push(timeFrom);
                easings.push(easing_1.linear);
            }
            var from = def.from !== undefined ? def.from : values[numValues - 1];
            values.push(from);
            times.push(timeFrom);
            easings.push(easing_1.linear);
        }
        else if (def.from !== undefined) {
            values.push(def.from);
            times.push(timeFrom);
            easings.push(easing_1.linear);
        }
    }
    values.push(def.to);
    times.push(timeTo);
    easings.push(def.ease || easing_1.easeInOut);
    return props;
};
var timeline = function (instructions, _a) {
    var _b = _a === void 0 ? {} : _a, duration = _b.duration, elapsed = _b.elapsed, ease = _b.ease, loop = _b.loop, flip = _b.flip, yoyo = _b.yoyo;
    var playhead = 0;
    var calculatedDuration = 0;
    var flatInstructions = instructions.reduce(flattenArrayInstructions, []);
    var animationDefs = [];
    flatInstructions.forEach(function (instruction) {
        if (typeof instruction === 'string') {
            playhead += parseFloat(instruction);
        }
        else if (typeof instruction === 'number') {
            playhead = instruction;
        }
        else {
            var def = __assign({}, instruction, { at: playhead });
            def.duration = def.duration === undefined ? DEFAULT_DURATION : def.duration;
            animationDefs.push(def);
            playhead += def.duration;
            calculatedDuration = Math.max(calculatedDuration, def.at + def.duration);
        }
    });
    var tracks = {};
    var numDefs = animationDefs.length;
    for (var i = 0; i < numDefs; i++) {
        var def = animationDefs[i];
        var track = def.track;
        if (track === undefined) {
            throw new Error('No track defined');
        }
        if (!tracks.hasOwnProperty(track))
            tracks[track] = [];
        tracks[track].push(def);
    }
    var trackKeyframes = {};
    for (var key in tracks) {
        if (tracks.hasOwnProperty(key)) {
            var keyframeProps = tracks[key].reduce(convertDefToProps, {
                duration: calculatedDuration,
                easings: [],
                times: [],
                values: []
            });
            trackKeyframes[key] = keyframes_1.default(__assign({}, keyframeProps, { duration: duration || calculatedDuration, ease: ease,
                elapsed: elapsed,
                loop: loop,
                yoyo: yoyo,
                flip: flip }));
        }
    }
    return composite_1.default(trackKeyframes);
};
exports.default = timeline;

},{"../keyframes":"node_modules/popmotion/animations/keyframes/index.js","../../easing":"node_modules/popmotion/easing.js","../../compositors/composite":"node_modules/popmotion/compositors/composite.js"}],"node_modules/popmotion/input/listen/index.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var action_1 = require("../../action");
var listen = function (element, events, options) { return action_1.default(function (_a) {
    var update = _a.update;
    var eventNames = events.split(' ').map(function (eventName) {
        element.addEventListener(eventName, update, options);
        return eventName;
    });
    return {
        stop: function () { return eventNames.forEach(function (eventName) { return element.removeEventListener(eventName, update, options); }); }
    };
}); };
exports.default = listen;

},{"../../action":"node_modules/popmotion/action/index.js"}],"node_modules/popmotion/input/pointer/utils.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultPointerPos = function () { return ({
    clientX: 0,
    clientY: 0,
    pageX: 0,
    pageY: 0,
    x: 0,
    y: 0
}); };
exports.eventToPoint = function (e, point) {
    if (point === void 0) { point = exports.defaultPointerPos(); }
    point.clientX = point.x = e.clientX;
    point.clientY = point.y = e.clientY;
    point.pageX = e.pageX;
    point.pageY = e.pageY;
    return point;
};

},{}],"node_modules/popmotion/input/multitouch/index.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var framesync_1 = require("framesync");
var action_1 = require("../../action");
var calc_1 = require("../../calc");
var listen_1 = require("../listen");
var utils_1 = require("../pointer/utils");
var points = [utils_1.defaultPointerPos()];
var isTouchDevice = false;
if (typeof document !== 'undefined') {
    var updatePointsLocation = function (_a) {
        var touches = _a.touches;
        isTouchDevice = true;
        var numTouches = touches.length;
        points.length = 0;
        for (var i = 0; i < numTouches; i++) {
            var thisTouch = touches[i];
            points.push(utils_1.eventToPoint(thisTouch));
        }
    };
    listen_1.default(document, 'touchstart touchmove', true)
        .start(updatePointsLocation);
}
var multitouch = function (_a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.preventDefault, preventDefault = _c === void 0 ? true : _c, _d = _b.scale, scale = _d === void 0 ? 1.0 : _d, _e = _b.rotate, rotate = _e === void 0 ? 0.0 : _e;
    return action_1.default(function (_a) {
        var update = _a.update;
        var output = {
            touches: points,
            scale: scale,
            rotate: rotate
        };
        var initialDistance = 0.0;
        var initialRotation = 0.0;
        var isGesture = points.length > 1;
        if (isGesture) {
            var firstTouch = points[0], secondTouch = points[1];
            initialDistance = calc_1.distance(firstTouch, secondTouch);
            initialRotation = calc_1.angle(firstTouch, secondTouch);
        }
        var updatePoint = function () {
            if (isGesture) {
                var firstTouch = points[0], secondTouch = points[1];
                var newDistance = calc_1.distance(firstTouch, secondTouch);
                var newRotation = calc_1.angle(firstTouch, secondTouch);
                output.scale = scale * (newDistance / initialDistance);
                output.rotate = rotate + (newRotation - initialRotation);
            }
            update(output);
        };
        var onMove = function (e) {
            if (preventDefault || e.touches.length > 1)
                e.preventDefault();
            framesync_1.onFrameUpdate(updatePoint);
        };
        var updateOnMove = listen_1.default(document, 'touchmove', { passive: !preventDefault })
            .start(onMove);
        if (isTouchDevice)
            framesync_1.onFrameUpdate(updatePoint);
        return {
            stop: function () {
                framesync_1.cancelOnFrameUpdate(updatePoint);
                updateOnMove.stop();
            }
        };
    });
};
exports.default = multitouch;
exports.getIsTouchDevice = function () { return isTouchDevice; };

},{"framesync":"node_modules/framesync/dist/framesync.es.js","../../action":"node_modules/popmotion/action/index.js","../../calc":"node_modules/popmotion/calc.js","../listen":"node_modules/popmotion/input/listen/index.js","../pointer/utils":"node_modules/popmotion/input/pointer/utils.js"}],"node_modules/popmotion/input/pointer/mouse.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var framesync_1 = require("framesync");
var action_1 = require("../../action");
var listen_1 = require("../listen");
var utils_1 = require("../pointer/utils");
var point = utils_1.defaultPointerPos();
var isMouseDevice = false;
if (typeof document !== 'undefined') {
    var updatePointLocation = function (e) {
        isMouseDevice = true;
        utils_1.eventToPoint(e, point);
    };
    listen_1.default(document, 'mousedown mousemove', true)
        .start(updatePointLocation);
}
var mouse = function (_a) {
    var _b = (_a === void 0 ? {} : _a).preventDefault, preventDefault = _b === void 0 ? true : _b;
    return action_1.default(function (_a) {
        var update = _a.update;
        var updatePoint = function () { return update(point); };
        var onMove = function (e) {
            if (preventDefault)
                e.preventDefault();
            framesync_1.onFrameUpdate(updatePoint);
        };
        var updateOnMove = listen_1.default(document, 'mousemove').start(onMove);
        if (isMouseDevice)
            framesync_1.onFrameUpdate(updatePoint);
        return {
            stop: function () {
                framesync_1.cancelOnFrameUpdate(updatePoint);
                updateOnMove.stop();
            }
        };
    });
};
exports.default = mouse;

},{"framesync":"node_modules/framesync/dist/framesync.es.js","../../action":"node_modules/popmotion/action/index.js","../listen":"node_modules/popmotion/input/listen/index.js","../pointer/utils":"node_modules/popmotion/input/pointer/utils.js"}],"node_modules/popmotion/input/pointer/index.js":[function(require,module,exports) {
"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var transformers_1 = require("../../transformers");
var multitouch_1 = require("../multitouch");
var mouse_1 = require("./mouse");
var getFirstTouch = function (_a) {
    var firstTouch = _a[0];
    return firstTouch;
};
var pointer = function (props) {
    if (props === void 0) { props = {}; }
    return multitouch_1.getIsTouchDevice()
        ? multitouch_1.default(props).pipe(function (_a) {
            var touches = _a.touches;
            return touches;
        }, getFirstTouch)
        : mouse_1.default(props);
};
exports.default = function (_a) {
    if (_a === void 0) { _a = {}; }
    var x = _a.x, y = _a.y, props = __rest(_a, ["x", "y"]);
    if (x !== undefined || y !== undefined) {
        var applyXOffset_1 = transformers_1.applyOffset(x || 0);
        var applyYOffset_1 = transformers_1.applyOffset(y || 0);
        var delta_1 = { x: 0, y: 0 };
        return pointer(props).pipe(function (point) {
            delta_1.x = applyXOffset_1(point.x);
            delta_1.y = applyYOffset_1(point.y);
            return delta_1;
        });
    }
    else {
        return pointer(props);
    }
};

},{"../../transformers":"node_modules/popmotion/transformers.js","../multitouch":"node_modules/popmotion/input/multitouch/index.js","./mouse":"node_modules/popmotion/input/pointer/mouse.js"}],"node_modules/popmotion/compositors/chain.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var action_1 = require("../action");
var chain = function () {
    var actions = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        actions[_i] = arguments[_i];
    }
    return action_1.default(function (_a) {
        var update = _a.update, complete = _a.complete;
        var i = 0;
        var current;
        var playCurrent = function () {
            current = actions[i].start({
                complete: function () {
                    i++;
                    (i >= actions.length) ? complete() : playCurrent();
                },
                update: update
            });
        };
        playCurrent();
        return {
            stop: function () { return current && current.stop(); }
        };
    });
};
exports.default = chain;

},{"../action":"node_modules/popmotion/action/index.js"}],"node_modules/popmotion/compositors/crossfade.js":[function(require,module,exports) {
"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var action_1 = require("../action");
var calc_1 = require("../calc");
var parallel_1 = require("./parallel");
var crossfade = function (a, b) { return action_1.default(function (observer) {
    var balance = 0;
    var fadable = parallel_1.default(a, b).start(__assign({}, observer, { update: function (_a) {
            var va = _a[0], vb = _a[1];
            observer.update(calc_1.getValueFromProgress(va, vb, balance));
        } }));
    return {
        setBalance: function (v) { return balance = v; },
        stop: function () { return fadable.stop(); }
    };
}); };
exports.default = crossfade;

},{"../action":"node_modules/popmotion/action/index.js","../calc":"node_modules/popmotion/calc.js","./parallel":"node_modules/popmotion/compositors/parallel.js"}],"node_modules/popmotion/compositors/delay.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var action_1 = require("../action");
var delay = function (timeToDelay) { return action_1.default(function (_a) {
    var complete = _a.complete;
    var timeout = setTimeout(complete, timeToDelay);
    return {
        stop: function () { return clearTimeout(timeout); }
    };
}); };
exports.default = delay;

},{"../action":"node_modules/popmotion/action/index.js"}],"node_modules/popmotion/compositors/merge.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var action_1 = require("../action");
var merge = function () {
    var actions = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        actions[_i] = arguments[_i];
    }
    return action_1.default(function (observer) {
        var subs = actions.map(function (thisAction) { return thisAction.start(observer); });
        return {
            stop: function () { return subs.forEach(function (sub) { return sub.stop(); }); }
        };
    });
};
exports.default = merge;

},{"../action":"node_modules/popmotion/action/index.js"}],"node_modules/popmotion/compositors/schedule.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var action_1 = require("../action");
var schedule = function (scheduler, schedulee) { return action_1.default(function (_a) {
    var update = _a.update, complete = _a.complete;
    var latest;
    var schedulerSub = scheduler.start({
        update: function () { return latest !== undefined && update(latest); },
        complete: complete
    });
    var scheduleeSub = schedulee.start({
        update: function (v) { return latest = v; },
        complete: complete
    });
    return {
        stop: function () {
            schedulerSub.stop();
            scheduleeSub.stop();
        }
    };
}); };
exports.default = schedule;

},{"../action":"node_modules/popmotion/action/index.js"}],"node_modules/popmotion/compositors/stagger.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chain_1 = require("./chain");
var delay_1 = require("./delay");
var parallel_1 = require("./parallel");
var stagger = function (actions, interval) {
    var intervalIsNumber = typeof interval === 'number';
    var actionsWithDelay = actions.map(function (a, i) {
        var timeToDelay = intervalIsNumber ? interval * i : interval(i);
        return chain_1.default(delay_1.default(timeToDelay), a);
    });
    return parallel_1.default.apply(void 0, actionsWithDelay);
};
exports.default = stagger;

},{"./chain":"node_modules/popmotion/compositors/chain.js","./delay":"node_modules/popmotion/compositors/delay.js","./parallel":"node_modules/popmotion/compositors/parallel.js"}],"node_modules/stylefire/styler/index.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var framesync_1 = require("framesync");
var createStyler = function (_a) {
    var onRead = _a.onRead, onRender = _a.onRender, _b = _a.aliasMap, aliasMap = _b === void 0 ? {} : _b, _c = _a.useCache, useCache = _c === void 0 ? true : _c;
    return function (props) {
        var state = {};
        var changedValues = [];
        var hasChanged = false;
        var setValue = function (unmappedKey, value) {
            var key = aliasMap[unmappedKey] || unmappedKey;
            var currentValue = state[key];
            state[key] = value;
            if (state[key] !== currentValue) {
                if (changedValues.indexOf(key) === -1) {
                    changedValues.push(key);
                }
                if (!hasChanged) {
                    hasChanged = true;
                    framesync_1.onFrameRender(render);
                }
            }
        };
        function render(forceRender) {
            if (forceRender === void 0) { forceRender = false; }
            if (forceRender || hasChanged) {
                onRender(state, props, changedValues);
                hasChanged = false;
                changedValues.length = 0;
            }
            return this;
        }
        return {
            get: function (unmappedKey) {
                var key = aliasMap[unmappedKey] || unmappedKey;
                return (key)
                    ? (useCache && state[key] !== undefined)
                        ? state[key]
                        : onRead(key, props)
                    : state;
            },
            set: function (values, value) {
                if (typeof values === 'string') {
                    if (value !== undefined) {
                        setValue(values, value);
                    }
                    else {
                        return function (v) { return setValue(values, v); };
                    }
                }
                else {
                    for (var key in values) {
                        if (values.hasOwnProperty(key)) {
                            setValue(key, values[key]);
                        }
                    }
                }
                return this;
            },
            render: render,
        };
    };
};
exports.default = createStyler;

},{"framesync":"node_modules/framesync/dist/framesync.es.js"}],"node_modules/stylefire/styler/utils.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CAMEL_CASE_PATTERN = /([a-z])([A-Z])/g;
var REPLACE_TEMPLATE = '$1-$2';
exports.camelToDash = function (str) { return str.replace(CAMEL_CASE_PATTERN, REPLACE_TEMPLATE).toLowerCase(); };
exports.setDomAttrs = function (element, attrs) {
    for (var key in attrs) {
        if (attrs.hasOwnProperty(key)) {
            element.setAttribute(key, attrs[key]);
        }
    }
};

},{}],"node_modules/stylefire/css/prefixer.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../styler/utils");
var camelCache = new Map();
var dashCache = new Map();
var prefixes = ['Webkit', 'Moz', 'O', 'ms', ''];
var numPrefixes = prefixes.length;
var testElement;
var testPrefix = function (key) {
    if (typeof document === 'undefined')
        return;
    testElement = testElement || document.createElement('div');
    for (var i = 0; i < numPrefixes; i++) {
        var prefix = prefixes[i];
        var noPrefix = (prefix === '');
        var prefixedPropertyName = noPrefix ? key : prefix + key.charAt(0).toUpperCase() + key.slice(1);
        if (prefixedPropertyName in testElement.style) {
            camelCache.set(key, prefixedPropertyName);
            dashCache.set(key, "" + (noPrefix ? '' : '-') + utils_1.camelToDash(prefixedPropertyName));
        }
    }
};
exports.default = function (key, asDashCase) {
    if (asDashCase === void 0) { asDashCase = false; }
    var cache = asDashCase ? dashCache : camelCache;
    if (!cache.has(key))
        testPrefix(key);
    return cache.get(key) || key;
};

},{"../styler/utils":"node_modules/stylefire/styler/utils.js"}],"node_modules/stylefire/css/transform-props.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var axes = ['', 'X', 'Y', 'Z'];
var order = ['translate', 'scale', 'rotate', 'skew', 'transformPerspective'];
var TRANSFORM_ORIGIN_X = 'transformOriginX';
var TRANSFORM_ORIGIN_Y = 'transformOriginY';
var transformProps = order.reduce(function (acc, key) {
    return axes.reduce(function (axesAcc, axesKey) {
        axesAcc.push(key + axesKey);
        return axesAcc;
    }, acc);
}, ['x', 'y', 'z']);
var transformPropDictionary = transformProps.reduce(function (dict, key) {
    dict[key] = true;
    return dict;
}, {});
exports.isTransformProp = function (key) { return transformPropDictionary[key] === true; };
exports.sortTransformProps = function (a, b) { return transformProps.indexOf(a) - transformProps.indexOf(b); };
exports.isTransformOriginProp = function (key) { return key === TRANSFORM_ORIGIN_X || key === TRANSFORM_ORIGIN_Y; };

},{}],"node_modules/stylefire/css/value-types.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var style_value_types_1 = require("style-value-types");
var valueTypes = {
    color: style_value_types_1.color,
    backgroundColor: style_value_types_1.color,
    outlineColor: style_value_types_1.color,
    fill: style_value_types_1.color,
    stroke: style_value_types_1.color,
    borderColor: style_value_types_1.color,
    borderTopColor: style_value_types_1.color,
    borderRightColor: style_value_types_1.color,
    borderBottomColor: style_value_types_1.color,
    borderLeftColor: style_value_types_1.color,
    borderRadius: style_value_types_1.px,
    width: style_value_types_1.px,
    maxWidth: style_value_types_1.px,
    height: style_value_types_1.px,
    maxHeight: style_value_types_1.px,
    top: style_value_types_1.px,
    left: style_value_types_1.px,
    bottom: style_value_types_1.px,
    right: style_value_types_1.px,
    rotate: style_value_types_1.degrees,
    rotateX: style_value_types_1.degrees,
    rotateY: style_value_types_1.degrees,
    rotateZ: style_value_types_1.degrees,
    scale: style_value_types_1.scale,
    scaleX: style_value_types_1.scale,
    scaleY: style_value_types_1.scale,
    scaleZ: style_value_types_1.scale,
    skewX: style_value_types_1.degrees,
    skewY: style_value_types_1.degrees,
    distance: style_value_types_1.px,
    translateX: style_value_types_1.px,
    translateY: style_value_types_1.px,
    translateZ: style_value_types_1.px,
    perspective: style_value_types_1.px,
    opacity: style_value_types_1.alpha,
    transformOriginX: style_value_types_1.percent,
    transformOriginY: style_value_types_1.percent,
    transformOriginZ: style_value_types_1.px
};
exports.default = function (key) { return valueTypes[key]; };

},{"style-value-types":"node_modules/style-value-types/dist/style-value-types.es.js"}],"node_modules/stylefire/css/render.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var transform_props_1 = require("./transform-props");
var prefixer_1 = require("./prefixer");
var value_types_1 = require("./value-types");
exports.aliasMap = {
    x: 'translateX',
    y: 'translateY',
    z: 'translateZ',
    originX: 'transformOriginX',
    originY: 'transformOriginY',
    originZ: 'transformOriginZ'
};
var NUMBER = 'number';
var OBJECT = 'object';
var COLON = ':';
var SEMI_COLON = ';';
var TRANSFORM_ORIGIN = 'transform-origin';
var TRANSFORM = 'transform';
var TRANSLATE_Z = 'translateZ';
var TRANSFORM_NONE = ';transform: none';
var styleRule = function (key, value) { return "" + SEMI_COLON + key + COLON + value; };
function buildStylePropertyString(state, changedValues, enableHardwareAcceleration) {
    if (changedValues === void 0) { changedValues = true; }
    if (enableHardwareAcceleration === void 0) { enableHardwareAcceleration = true; }
    var valuesToChange = (changedValues === true) ? Object.keys(state) : changedValues;
    var propertyString = '';
    var transformString = '';
    var hasTransformOrigin = false;
    var transformIsDefault = true;
    var hasTransform = false;
    var transformHasZ = false;
    var numChangedValues = valuesToChange.length;
    for (var i = 0; i < numChangedValues; i++) {
        var key = valuesToChange[i];
        if (transform_props_1.isTransformProp(key)) {
            hasTransform = true;
            for (var stateKey in state) {
                if (transform_props_1.isTransformProp(stateKey) && valuesToChange.indexOf(stateKey) === -1) {
                    valuesToChange.push(stateKey);
                }
            }
            break;
        }
    }
    valuesToChange.sort(transform_props_1.sortTransformProps);
    var totalNumChangedValues = valuesToChange.length;
    for (var i = 0; i < totalNumChangedValues; i++) {
        var key = valuesToChange[i];
        var isTransformKey = transform_props_1.isTransformProp(key);
        var value = state[key];
        var valueType = value_types_1.default(key);
        if (isTransformKey) {
            if ((valueType.default && value !== valueType.default) || (!valueType.default && value !== 0)) {
                transformIsDefault = false;
            }
        }
        if (valueType && (typeof value === NUMBER || typeof value === OBJECT) && valueType.transform) {
            value = valueType.transform(value);
        }
        if (isTransformKey) {
            transformString += key + '(' + value + ') ';
            transformHasZ = (key === TRANSLATE_Z) ? true : transformHasZ;
        }
        else if (transform_props_1.isTransformOriginProp(key)) {
            state[key] = value;
            hasTransformOrigin = true;
        }
        else {
            propertyString += styleRule(prefixer_1.default(key, true), value);
        }
    }
    if (hasTransformOrigin) {
        propertyString += styleRule(TRANSFORM_ORIGIN, (state.transformOriginX || 0) + " " + (state.transformOriginY || 0) + " " + (state.transformOriginZ || 0));
    }
    if (hasTransform) {
        if (!transformHasZ && enableHardwareAcceleration) {
            transformString += TRANSLATE_Z + "(0)";
        }
        propertyString += styleRule(TRANSFORM, transformIsDefault ? TRANSFORM_NONE : transformString);
    }
    return propertyString;
}
exports.default = buildStylePropertyString;

},{"./transform-props":"node_modules/stylefire/css/transform-props.js","./prefixer":"node_modules/stylefire/css/prefixer.js","./value-types":"node_modules/stylefire/css/value-types.js"}],"node_modules/stylefire/css/index.js":[function(require,module,exports) {
"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var styler_1 = require("../styler");
var prefixer_1 = require("./prefixer");
var render_1 = require("./render");
var transform_props_1 = require("./transform-props");
var value_types_1 = require("./value-types");
var cssStyler = styler_1.default({
    onRead: function (key, _a) {
        var element = _a.element, preparseOutput = _a.preparseOutput;
        var valueType = value_types_1.default(key);
        if (transform_props_1.isTransformProp(key)) {
            return (valueType)
                ? valueType.default || 0
                : 0;
        }
        else {
            var domValue = window.getComputedStyle(element, null).getPropertyValue(prefixer_1.default(key, true)) || 0;
            return (preparseOutput && valueType && valueType.parse) ? valueType.parse(domValue) : domValue;
        }
    },
    onRender: function (state, _a, changedValues) {
        var element = _a.element, enableHardwareAcceleration = _a.enableHardwareAcceleration;
        element.style.cssText += render_1.default(state, changedValues, enableHardwareAcceleration);
    },
    aliasMap: render_1.aliasMap
});
exports.default = function (element, props) {
    return cssStyler(__assign({ element: element, enableHardwareAcceleration: true, preparseOutput: true }, props));
};

},{"../styler":"node_modules/stylefire/styler/index.js","./prefixer":"node_modules/stylefire/css/prefixer.js","./render":"node_modules/stylefire/css/render.js","./transform-props":"node_modules/stylefire/css/transform-props.js","./value-types":"node_modules/stylefire/css/value-types.js"}],"node_modules/stylefire/svg/build.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../styler/utils");
var transform_props_1 = require("../css/transform-props");
var ZERO_NOT_ZERO = 0.0000001;
var percentToPixels = function (percent, length) {
    return (percent / 100) * length + 'px';
};
var build = function (state, dimensions, isPath, pathLength) {
    var hasTransform = false;
    var hasDashArray = false;
    var props = {};
    var dashArrayStyles = isPath ? {
        pathLength: '0',
        pathSpacing: "" + pathLength
    } : undefined;
    var scale = state.scale !== undefined ? state.scale || ZERO_NOT_ZERO : state.scaleX || 1;
    var scaleY = state.scaleY !== undefined ? state.scaleY || ZERO_NOT_ZERO : scale || 1;
    var transformOriginX = dimensions.width * ((state.originX || 50) / 100) + dimensions.x;
    var transformOriginY = dimensions.height * ((state.originY || 50) / 100) + dimensions.y;
    var scaleTransformX = -transformOriginX * (scale * 1);
    var scaleTransformY = -transformOriginY * (scaleY * 1);
    var scaleReplaceX = transformOriginX / scale;
    var scaleReplaceY = transformOriginY / scaleY;
    var transform = {
        translate: "translate(" + state.translateX + ", " + state.translateY + ") ",
        scale: "translate(" + scaleTransformX + ", " + scaleTransformY + ") scale(" + scale + ", " + scaleY + ") translate(" + scaleReplaceX + ", " + scaleReplaceY + ") ",
        rotate: "rotate(" + state.rotate + ", " + transformOriginX + ", " + transformOriginY + ") ",
        skewX: "skewX(" + state.skewX + ") ",
        skewY: "skewY(" + state.skewY + ") "
    };
    for (var key in state) {
        if (state.hasOwnProperty(key)) {
            var value = state[key];
            if (transform_props_1.isTransformProp(key)) {
                hasTransform = true;
            }
            else if (isPath && (key === 'pathLength' || key === 'pathSpacing') && typeof value === 'number') {
                hasDashArray = true;
                dashArrayStyles[key] = percentToPixels(value, pathLength);
            }
            else if (isPath && key === 'pathOffset') {
                props['stroke-dashoffset'] = percentToPixels(-value, pathLength);
            }
            else {
                props[utils_1.camelToDash(key)] = value;
            }
        }
    }
    if (hasDashArray) {
        props['stroke-dasharray'] = dashArrayStyles.pathLength + ' ' + dashArrayStyles.pathSpacing;
    }
    if (hasTransform) {
        props.transform = '';
        for (var key in transform) {
            if (transform.hasOwnProperty(key)) {
                var defaultValue = (key === 'scale') ? '1' : '0';
                props.transform += transform[key].replace(/undefined/g, defaultValue);
            }
        }
    }
    return props;
};
exports.default = build;

},{"../styler/utils":"node_modules/stylefire/styler/utils.js","../css/transform-props":"node_modules/stylefire/css/transform-props.js"}],"node_modules/stylefire/svg/value-types.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var style_value_types_1 = require("style-value-types");
var valueTypes = {
    fill: style_value_types_1.color,
    stroke: style_value_types_1.color,
    scale: style_value_types_1.scale,
    scaleX: style_value_types_1.scale,
    scaleY: style_value_types_1.scale,
    opacity: style_value_types_1.alpha,
    fillOpacity: style_value_types_1.alpha,
    strokeOpacity: style_value_types_1.alpha
};
exports.default = function (key) { return valueTypes[key]; };

},{"style-value-types":"node_modules/style-value-types/dist/style-value-types.es.js"}],"node_modules/stylefire/svg/index.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var transform_props_1 = require("../css/transform-props");
var styler_1 = require("../styler");
var utils_1 = require("../styler/utils");
var build_1 = require("./build");
var value_types_1 = require("./value-types");
var svgStyler = styler_1.default({
    onRead: function (key, _a) {
        var element = _a.element;
        if (!transform_props_1.isTransformProp(key)) {
            return element.getAttribute(key);
        }
        else {
            var valueType = value_types_1.default(key);
            return valueType ? valueType.default : 0;
        }
    },
    onRender: function (state, _a, changedValues) {
        var dimensions = _a.dimensions, element = _a.element, isPath = _a.isPath, pathLength = _a.pathLength;
        utils_1.setDomAttrs(element, build_1.default(state, dimensions, isPath, pathLength));
    },
    aliasMap: {
        x: 'translateX',
        y: 'translateY',
        background: 'fill'
    }
});
exports.default = function (element) {
    var _a = element.getBBox(), x = _a.x, y = _a.y, width = _a.width, height = _a.height;
    var props = {
        element: element,
        dimensions: { x: x, y: y, width: width, height: height },
        isPath: false
    };
    if (element.tagName === 'path') {
        props.isPath = true;
        props.pathLength = element.getTotalLength();
    }
    return svgStyler(props);
};

},{"../css/transform-props":"node_modules/stylefire/css/transform-props.js","../styler":"node_modules/stylefire/styler/index.js","../styler/utils":"node_modules/stylefire/styler/utils.js","./build":"node_modules/stylefire/svg/build.js","./value-types":"node_modules/stylefire/svg/value-types.js"}],"node_modules/stylefire/index.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var css_1 = require("./css");
var render_1 = require("./css/render");
exports.buildStyles = render_1.default;
var styler_1 = require("./styler");
exports.createStyler = styler_1.default;
var svg_1 = require("./svg");
var cache = new WeakMap();
var createDOMStyler = function (node, props) {
    var styler = node instanceof SVGElement ? svg_1.default(node) : css_1.default(node, props);
    cache.set(node, styler);
    return styler;
};
var getStyler = function (node, props) {
    return cache.has(node) ? cache.get(node) : createDOMStyler(node, props);
};
function default_1(nodeOrSelector, props) {
    var node = typeof nodeOrSelector === "string"
        ? document.querySelector(nodeOrSelector)
        : nodeOrSelector;
    return getStyler(node, props);
}
exports.default = default_1;

},{"./css":"node_modules/stylefire/css/index.js","./css/render":"node_modules/stylefire/css/render.js","./styler":"node_modules/stylefire/styler/index.js","./svg":"node_modules/stylefire/svg/index.js"}],"node_modules/popmotion/index.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var action_1 = require("./action");
exports.action = action_1.default;
var multicast_1 = require("./reactions/multicast");
exports.multicast = multicast_1.default;
var value_1 = require("./reactions/value");
exports.value = value_1.default;
var decay_1 = require("./animations/decay");
exports.decay = decay_1.default;
var every_frame_1 = require("./animations/every-frame");
exports.everyFrame = every_frame_1.default;
var keyframes_1 = require("./animations/keyframes");
exports.keyframes = keyframes_1.default;
var physics_1 = require("./animations/physics");
exports.physics = physics_1.default;
var spring_1 = require("./animations/spring");
exports.spring = spring_1.default;
var timeline_1 = require("./animations/timeline");
exports.timeline = timeline_1.default;
var tween_1 = require("./animations/tween");
exports.tween = tween_1.default;
var listen_1 = require("./input/listen");
exports.listen = listen_1.default;
var multitouch_1 = require("./input/multitouch");
exports.multitouch = multitouch_1.default;
var pointer_1 = require("./input/pointer");
exports.pointer = pointer_1.default;
var mouse_1 = require("./input/pointer/mouse");
exports.mouse = mouse_1.default;
var chain_1 = require("./compositors/chain");
exports.chain = chain_1.default;
var composite_1 = require("./compositors/composite");
exports.composite = composite_1.default;
var crossfade_1 = require("./compositors/crossfade");
exports.crossfade = crossfade_1.default;
var delay_1 = require("./compositors/delay");
exports.delay = delay_1.default;
var merge_1 = require("./compositors/merge");
exports.merge = merge_1.default;
var parallel_1 = require("./compositors/parallel");
exports.parallel = parallel_1.default;
var schedule_1 = require("./compositors/schedule");
exports.schedule = schedule_1.default;
var stagger_1 = require("./compositors/stagger");
exports.stagger = stagger_1.default;
var calc = require("./calc");
exports.calc = calc;
var easing = require("./easing");
exports.easing = easing;
var transform = require("./transformers");
exports.transform = transform;
var stylefire_1 = require("stylefire");
exports.styler = stylefire_1.default;
var css_1 = require("stylefire/css");
exports.css = css_1.default;
var svg_1 = require("stylefire/svg");
exports.svg = svg_1.default;
var valueTypes = require("style-value-types");
exports.valueTypes = valueTypes;

},{"./action":"node_modules/popmotion/action/index.js","./reactions/multicast":"node_modules/popmotion/reactions/multicast.js","./reactions/value":"node_modules/popmotion/reactions/value.js","./animations/decay":"node_modules/popmotion/animations/decay/index.js","./animations/every-frame":"node_modules/popmotion/animations/every-frame/index.js","./animations/keyframes":"node_modules/popmotion/animations/keyframes/index.js","./animations/physics":"node_modules/popmotion/animations/physics/index.js","./animations/spring":"node_modules/popmotion/animations/spring/index.js","./animations/timeline":"node_modules/popmotion/animations/timeline/index.js","./animations/tween":"node_modules/popmotion/animations/tween/index.js","./input/listen":"node_modules/popmotion/input/listen/index.js","./input/multitouch":"node_modules/popmotion/input/multitouch/index.js","./input/pointer":"node_modules/popmotion/input/pointer/index.js","./input/pointer/mouse":"node_modules/popmotion/input/pointer/mouse.js","./compositors/chain":"node_modules/popmotion/compositors/chain.js","./compositors/composite":"node_modules/popmotion/compositors/composite.js","./compositors/crossfade":"node_modules/popmotion/compositors/crossfade.js","./compositors/delay":"node_modules/popmotion/compositors/delay.js","./compositors/merge":"node_modules/popmotion/compositors/merge.js","./compositors/parallel":"node_modules/popmotion/compositors/parallel.js","./compositors/schedule":"node_modules/popmotion/compositors/schedule.js","./compositors/stagger":"node_modules/popmotion/compositors/stagger.js","./calc":"node_modules/popmotion/calc.js","./easing":"node_modules/popmotion/easing.js","./transformers":"node_modules/popmotion/transformers.js","stylefire":"node_modules/stylefire/index.js","stylefire/css":"node_modules/stylefire/css/index.js","stylefire/svg":"node_modules/stylefire/svg/index.js","style-value-types":"node_modules/style-value-types/dist/style-value-types.es.js"}],"useless.js":[function(require,module,exports) {
console.log("this is entirely a useless file");
},{}],"animation.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.y = exports.x = void 0;

var _popmotion = require("popmotion");

require("./useless");

// code taken from one of the examples on popmotion.io
var ball = document.querySelector(".box");
var divStyler = (0, _popmotion.styler)(ball);
var ballXY = (0, _popmotion.value)({
  x: 0,
  y: 0
}, divStyler.set);
(0, _popmotion.listen)(ball, "mousedown touchstart").start(function (e) {
  e.preventDefault();
  (0, _popmotion.pointer)(ballXY.get()).start(ballXY);
});
(0, _popmotion.listen)(document, "mouseup").start(function () {
  (0, _popmotion.spring)({
    from: ballXY.get(),
    velocity: ballXY.getVelocity(),
    to: {
      x: 0,
      y: 0
    },
    stiffness: 200
  }).start(ballXY);
});

var __assign = void 0 && (void 0).__assign || Object.assign || function (t) {
  for (var s, i = 1, n = arguments.length; i < n; i++) {
    s = arguments[i];

    for (var p in s) {
      if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }
  }

  return t;
};

var x = {};
exports.x = x;

var y = __assign({}, x);

exports.y = y;
},{"popmotion":"node_modules/popmotion/index.js","./useless":"useless.js"}],"../../../../../usr/local/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "41395" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ??? Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] ????  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">????</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../../../../../usr/local/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","animation.js"], null)
//# sourceMappingURL=/animation.7bfd2d21.js.map