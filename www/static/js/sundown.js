(function() {

/**
*
*  UTF-8 data encode / decode
*  http://www.webtoolkit.info/
*
**/
 
var Utf8 = {
 
	// public method for url encoding
	encode : function (string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";
 
		for (var n = 0; n < string.length; n++) {
 
			var c = string.charCodeAt(n);
 
			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
 
		}
 
		return utftext;
	},
 
	// public method for url decoding
	decode : function (utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;
 
		while ( i < utftext.length ) {
 
			c = utftext.charCodeAt(i);
 
			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			}
			else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			}
			else {
				c2 = utftext.charCodeAt(i+1);
				c3 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
 
		}
 
		return string;
	}
}


// algospot-flavored customized sundown
// https://github.com/beingryu/sundown
// Note: For maximum-speed code, see "Optimizing Code" on the Emscripten wiki, https://github.com/kripken/emscripten/wiki/Optimizing-Code
// Note: Some Emscripten settings may limit the speed of the generated code.
try {
  this['Module'] = Module;
  Module.test;
} catch(e) {
  this['Module'] = Module = {};
}
// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
if (typeof module === "object") {
  module.exports = Module;
}
if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  Module['print'] = function(x) {
    process['stdout'].write(x + '\n');
  };
  Module['printErr'] = function(x) {
    process['stderr'].write(x + '\n');
  };
  var nodeFS = require('fs');
  var nodePath = require('path');
  Module['read'] = function(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };
  Module['readBinary'] = function(filename) { return Module['read'](filename, true) };
  Module['load'] = function(f) {
    globalEval(read(f));
  };
  if (!Module['arguments']) {
    Module['arguments'] = process['argv'].slice(2);
  }
}
if (ENVIRONMENT_IS_SHELL) {
  Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm
  Module['read'] = read;
  Module['readBinary'] = function(f) {
    return read(f, 'binary');
  };
  if (!Module['arguments']) {
    if (typeof scriptArgs != 'undefined') {
      Module['arguments'] = scriptArgs;
    } else if (typeof arguments != 'undefined') {
      Module['arguments'] = arguments;
    }
  }
}
if (ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER) {
  if (!Module['print']) {
    Module['print'] = function(x) {
      console.log(x);
    };
  }
  if (!Module['printErr']) {
    Module['printErr'] = function(x) {
      console.log(x);
    };
  }
}
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };
  if (!Module['arguments']) {
    if (typeof arguments != 'undefined') {
      Module['arguments'] = arguments;
    }
  }
}
if (ENVIRONMENT_IS_WORKER) {
  // We can do very little here...
  var TRY_USE_DUMP = false;
  if (!Module['print']) {
    Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }
  Module['load'] = importScripts;
}
if (!ENVIRONMENT_IS_WORKER && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_SHELL) {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}
function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***
// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];
// Callbacks
if (!Module['preRun']) Module['preRun'] = [];
if (!Module['postRun']) Module['postRun'] = [];
// === Auto-generated preamble library stuff ===
//========================================
// Runtime code shared with compiler
//========================================
var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      var logg = log2(quantum);
      return '((((' +target + ')+' + (quantum-1) + ')>>' + logg + ')<<' + logg + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?{ ?[^}]* ?}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type, quantumSize) {
    if (Runtime.QUANTUM_SIZE == 1) return 1;
    var size = {
      '%i1': 1,
      '%i8': 1,
      '%i16': 2,
      '%i32': 4,
      '%i64': 8,
      "%float": 4,
      "%double": 8
    }['%'+type]; // add '%' since float and double confuse Closure compiler as keys, and also spidermonkey as a compiler will remove 's from '_i8' etc
    if (!size) {
      if (type.charAt(type.length-1) == '*') {
        size = Runtime.QUANTUM_SIZE; // A pointer
      } else if (type[0] == 'i') {
        var bits = parseInt(type.substr(1));
        assert(bits % 8 == 0);
        size = bits/8;
      }
    }
    return size;
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (type == 'i64' || type == 'double' || vararg) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    type.flatIndexes = type.fields.map(function(field) {
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        size = Types.types[field].flatSize;
        alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else {
        throw 'Unclear type in struct: ' + field + ', in ' + type.name_ + ' :: ' + dump(Types.types[type.name_]);
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      if (!args.splice) args = Array.prototype.slice.call(args);
      args.splice(0, 0, ptr);
      return Module['dynCall_' + sig].apply(null, args);
    } else {
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2 + 2*i;
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index-2)/2] = null;
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xff;
      if (needed) {
        buffer.push(code);
        needed--;
      }
      if (buffer.length == 0) {
        if (code < 128) return String.fromCharCode(code);
        buffer.push(code);
        if (code > 191 && code < 224) {
          needed = 1;
        } else {
          needed = 2;
        }
        return '';
      }
      if (needed > 0) return '';
      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var ret;
      if (c1 > 191 && c1 < 224) {
        ret = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
      } else {
        ret = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function(string) {
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = ((((STACKTOP)+7)>>3)<<3); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = ((((STATICTOP)+7)>>3)<<3); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + size)|0;DYNAMICTOP = ((((DYNAMICTOP)+7)>>3)<<3); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+(((low)>>>(0))))+((+(((high)>>>(0))))*(+(4294967296)))) : ((+(((low)>>>(0))))+((+(((high)|(0))))*(+(4294967296))))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}
//========================================
// Runtime essentials
//========================================
var __THREW__ = 0; // Used in checking for thrown exceptions.
var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;
function abort(text) {
  Module.print(text + ':\n' + (new Error).stack);
  ABORT = true;
  throw "Assertion: " + text;
}
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}
var globalScope = this;
// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;
// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = globalScope['Module']['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}
// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length+1);
      writeStringToMemory(value, ret);
      return ret;
    } else if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}
// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;
// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,((Math.min((+(Math.floor((value)/(+(4294967296))))), (+(4294967295))))|0)>>>0],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;
// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;
var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;
// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }
  var singleType = typeof types === 'string' ? types : null;
  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }
  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)|0)]=0;
    }
    return ret;
  }
  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }
  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];
    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }
    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }
    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later
    setValue(ret+i, curr, type);
    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }
  return ret;
}
Module['allocate'] = allocate;
function Pointer_stringify(ptr, /* optional */ length) {
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    t = HEAPU8[(((ptr)+(i))|0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;
  var ret = '';
  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }
  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    t = HEAPU8[(((ptr)+(i))|0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;
// Memory management
var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return ((x+4095)>>12)<<12;
}
var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk
function enlargeMemory() {
  abort('Cannot enlarge memory arrays in asm.js. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value, or (2) set Module.TOTAL_MEMORY before the program runs.');
}
var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;
// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(!!Int32Array && !!Float64Array && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'Cannot fallback to non-typed array case: Code is too specialized');
var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);
// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');
Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;
function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}
var __ATINIT__ = []; // functions called during startup
var __ATMAIN__ = []; // functions called when main() is to be run
var __ATEXIT__ = []; // functions called during shutdown
var runtimeInitialized = false;
function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}
function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}
function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
}
// Tools
// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;
function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;
// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))|0)]=chr
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;
function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;
function unSign(value, bits, ignore, sig) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore, sig) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}
if (!Math['imul']) Math['imul'] = function(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyTracking = {};
var calledInit = false, calledRun = false;
var runDependencyWatcher = null;
function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
  } else {
    Module.printErr('warning: run dependency added without ID');
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    Module.printErr('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    } 
    // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
    if (!calledRun && shouldRunNow) run();
  }
}
Module['removeRunDependency'] = removeRunDependency;
Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data
function addPreRun(func) {
  if (!Module['preRun']) Module['preRun'] = [];
  else if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
  Module['preRun'].push(func);
}
var awaitingMemoryInitializer = false;
function loadMemoryInitializer(filename) {
  function applyData(data) {
    HEAPU8.set(data, STATIC_BASE);
    runPostSets();
  }
  // always do this asynchronously, to keep shell and web as similar as possible
  addPreRun(function() {
    if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
      applyData(Module['readBinary'](filename));
    } else {
      Browser.asyncLoad(filename, function(data) {
        applyData(data);
      }, function(data) {
        throw 'could not load memory initializer ' + filename;
      });
    }
  });
  awaitingMemoryInitializer = false;
}
// === Body ===
STATIC_BASE = 8;
STATICTOP = STATIC_BASE + 2880;
/* memory initializer */ allocate([8,0,0,0,2,0,0,0,4,0,0,0,12,0,0,0,2,0,0,0,6,0,0,0,4,0,0,0,8,0,0,0,10,0,0,0,6,0,0,0,2,0,0,0,2,0,0,0,16,0,0,0,4,0,0,0,6,0,0,0,22,0,0,0,2,0,0,0,14,0,0,0,8,0,0,0,2,0,0,0,14,0,0,0,12,0,0,0,10,0,0,0,0,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,239,187,191,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,0,0,0,12,0,0,0,26,0,0,0,4,0,0,0,8,0,0,0,18,0,0,0,2,0,0,0,6,0,0,0,16,0,0,0,24,0,0,0,20,0,0,0,48,49,50,51,52,53,54,55,56,57,65,66,67,68,69,70,0,0,0,0,0,0,0,0,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,8,30,25,20,15,10,38,38,38,38,38,38,38,38,38,38,0,38,0,38,5,5,5,15,0,38,38,0,15,10,0,38,38,15,0,5,38,38,38,38,38,38,38,38,38,38,38,38,0,38,0,38,5,5,5,15,0,38,38,0,15,10,0,38,38,15,0,5,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,0,0,0,0,0,0,0,24,6,0,0,232,6,0,0,224,5,0,0,168,4,0,0,216,2,0,0,96,3,0,0,24,6,0,0,240,2,0,0,208,2,0,0,176,2,0,0,144,2,0,0,224,6,0,0,208,6,0,0,168,6,0,0,24,6,0,0,144,6,0,0,24,6,0,0,104,6,0,0,240,5,0,0,24,6,0,0,24,6,0,0,200,2,0,0,32,6,0,0,248,5,0,0,24,6,0,0,168,2,0,0,216,5,0,0,200,5,0,0,184,5,0,0,24,6,0,0,24,6,0,0,24,6,0,0,168,5,0,0,24,6,0,0,24,6,0,0,24,6,0,0,24,6,0,0,144,5,0,0,60,105,109,103,32,115,114,99,61,34,0,0,0,0,0,0,98,108,111,99,107,113,117,111,116,101,0,0,0,0,0,0,60,98,114,62,10,0,0,0,115,116,121,108,101,0,0,0,102,111,114,109,0,0,0,0,60,98,114,47,62,10,0,0,63,33,46,44,0,0,0,0,115,99,114,105,112,116,0,0,100,101,108,0,0,0,0,0,109,97,116,104,0,0,0,0,46,43,45,95,0,0,0,0,38,103,116,59,0,0,0,0,117,108,0,0,0,0,0,0,60,47,99,111,100,101,62,0,60,99,111,100,101,62,0,0,34,62,0,0,0,0,0,0,60,47,115,116,114,111,110,103,62,0,0,0,0,0,0,0,119,119,119,46,0,0,0,0,60,47,101,109,62,0,0,0,60,47,101,109,62,60,47,115,116,114,111,110,103,62,0,0,38,108,116,59,0,0,0,0,60,115,116,114,111,110,103,62,60,101,109,62,0,0,0,0,60,47,100,101,108,62,0,0,116,97,98,108,101,0,0,0,60,100,101,108,62,0,0,0,60,47,115,117,112,62,0,0,60,115,117,112,62,0,0,0,34,32,116,105,116,108,101,61,34,0,0,0,0,0,0,0,60,47,115,117,98,62,0,0,60,115,117,98,62,0,0,0,60,47,99,111,100,101,62,60,47,112,114,101,62,10,0,0,47,0,0,0,0,0,0,0,60,112,114,101,62,60,99,111,100,101,62,0,0,0,0,0,38,35,52,55,59,0,0,0,60,112,114,101,62,60,99,111,100,101,32,99,108,97,115,115,61,34,0,0,0,0,0,0,60,47,98,108,111,99,107,113,117,111,116,101,62,10,0,0,60,98,108,111,99,107,113,117,111,116,101,62,10,0,0,0,60,47,104,37,100,62,10,0,60,104,37,100,62,0,0,0,60,97,32,104,114,101,102,61,34,0,0,0,0,0,0,0,60,104,37,100,32,105,100,61,34,116,111,99,95,37,100,34,62,0,0,0,0,0,0,0,60,104,114,62,10,0,0,0,102,116,112,58,47,47,0,0,60,104,114,47,62,10,0,0,60,47,117,108,62,10,0,0,60,47,111,108,62,10,0,0,60,117,108,62,10,0,0,0,38,35,51,57,59,0,0,0,115,114,99,47,98,117,102,102,101,114,46,99,0,0,0,0,60,111,108,62,10,0,0,0,92,96,42,95,123,125,91,93,40,41,35,43,45,46,33,58,124,38,60,62,94,126,0,0,100,105,118,0,0,0,0,0,60,47,108,105,62,10,0,0,109,100,45,62,119,111,114,107,95,98,117,102,115,91,66,85,70,70,69,82,95,66,76,79,67,75,93,46,115,105,122,101,32,61,61,32,48,0,0,0,60,47,112,62,10,0,0,0,109,100,45,62,119,111,114,107,95,98,117,102,115,91,66,85,70,70,69,82,95,83,80,65,78,93,46,115,105,122,101,32,61,61,32,48,0,0,0,0,60,112,62,0,0,0,0,0,109,97,120,95,110,101,115,116,105,110,103,32,62,32,48,32,38,38,32,99,97,108,108,98,97,99,107,115,0,0,0,0,105,109,103,0,0,0,0,0,60,47,116,98,111,100,121,62,60,47,116,97,98,108,101,62,10,0,0,0,0,0,0,0,115,114,99,47,109,97,114,107,100,111,119,110,46,99,0,0,60,47,116,104,101,97,100,62,60,116,98,111,100,121,62,10,0,0,0,0,0,0,0,0,104,116,116,112,115,58,47,47,0,0,0,0,0,0,0,0,104,50,0,0,0,0,0,0,60,116,97,98,108,101,62,60,116,104,101,97,100,62,10,0,104,51,0,0,0,0,0,0,60,47,116,114,62,10,0,0,105,110,115,0,0,0,0,0,60,116,114,62,10,0,0,0,104,52,0,0,0,0,0,0,60,47,116,100,62,10,0,0,105,102,114,97,109,101,0,0,100,108,0,0,0,0,0,0,60,47,116,104,62,10,0,0,112,114,101,0,0,0,0,0,110,111,115,99,114,105,112,116,0,0,0,0,0,0,0,0,32,97,108,105,103,110,61,34,114,105,103,104,116,34,62,0,0,0,0,0,0,0,0,0,104,53,0,0,0,0,0,0,32,97,108,105,103,110,61,34,108,101,102,116,34,62,0,0,97,0,0,0,0,0,0,0,32,97,108,105,103,110,61,34,99,101,110,116,101,114,34,62,0,0,0,0,0,0,0,0,60,116,100,0,0,0,0,0,104,116,116,112,58,47,47,0,104,54,0,0,0,0,0,0,60,116,104,0,0,0,0,0,98,117,102,32,38,38,32,98,117,102,45,62,117,110,105,116,0,0,0,0,0,0,0,0,104,49,0,0,0,0,0,0,109,97,105,108,116,111,58,0,38,97,109,112,59,0,0,0,102,105,101,108,100,115,101,116,0,0,0,0,0,0,0,0,34,47,62,0,0,0,0,0,38,35,120,50,55,59,0,0,38,113,117,111,116,59,0,0,111,108,0,0,0,0,0,0,34,32,97,108,116,61,34,0,102,105,103,117,114,101,0,0,112,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,115,100,95,109,97,114,107,100,111,119,110,95,114,101,110,100,101,114,0,0,0,0,0,0,115,100,95,109,97,114,107,100,111,119,110,95,110,101,119,0,98,117,102,112,117,116,99,0,98,117,102,112,117,116,0,0,98,117,102,112,114,105,110,116,102,0,0,0,0,0,0,0,98,117,102,112,114,101,102,105,120,0,0,0,0,0,0,0,98,117,102,103,114,111,119,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,3,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,5,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,6,0,0,200,6,0,0,160,6,0,0,112,4,0,0,200,3,0,0,64,3,0,0,232,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE)
function runPostSets() {
}
if (!awaitingMemoryInitializer) runPostSets();
var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);
assert(tempDoublePtr % 8 == 0);
function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
}
function copyTempDouble(ptr) {
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];
  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];
  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];
  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];
}
  Module["_tolower"] = _tolower; 
  Module["_strncasecmp"] = _strncasecmp;
  function ___assert_func(filename, line, func, condition) {
      throw 'Assertion failed: ' + (condition ? Pointer_stringify(condition) : 'unknown condition') + ', at: ' + [filename ? Pointer_stringify(filename) : 'unknown filename', line, func ? Pointer_stringify(func) : 'unknown function'] + ' at ' + new Error().stack;
    }
  Module["_memcpy"] = _memcpy;var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;
  Module["_memset"] = _memset;var _llvm_memset_p0i8_i32=_memset;
  Module["_memcmp"] = _memcmp;
  function _isalnum(chr) {
      return (chr >= 48 && chr <= 57) ||
             (chr >= 97 && chr <= 122) ||
             (chr >= 65 && chr <= 90);
    }
  Module["_memmove"] = _memmove;var _llvm_memmove_p0i8_p0i8_i32=_memmove;
  function _strncmp(px, py, n) {
      var i = 0;
      while (i < n) {
        var x = HEAPU8[(((px)+(i))|0)];
        var y = HEAPU8[(((py)+(i))|0)];
        if (x == y && x == 0) return 0;
        if (x == 0) return -1;
        if (y == 0) return 1;
        if (x == y) {
          i ++;
          continue;
        } else {
          return x > y ? 1 : -1;
        }
      }
      return 0;
    }function _strcmp(px, py) {
      return _strncmp(px, py, TOTAL_MEMORY);
    }
  Module["_strlen"] = _strlen;
  var _llvm_va_start=undefined;
  function __reallyNegative(x) {
      return x < 0 || (x === 0 && (1/x) === -Infinity);
    }function __formatString(format, varargs) {
      var textIndex = format;
      var argIndex = 0;
      function getNextArg(type) {
        // NOTE: Explicitly ignoring type safety. Otherwise this fails:
        //       int x = 4; printf("%c\n", (char)x);
        var ret;
        if (type === 'double') {
          ret = HEAPF64[(((varargs)+(argIndex))>>3)];
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+8))>>2)]];
          argIndex += 8; // each 32-bit chunk is in a 64-bit block
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Math.max(Runtime.getNativeFieldSize(type), Runtime.getAlignSize(type, null, true));
        return ret;
      }
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP8[(textIndex)];
        if (curr === 0) break;
        next = HEAP8[((textIndex+1)|0)];
        if (curr == 37) {
          // Handle flags.
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true;
                break;
              case 45:
                flagLeftAlign = true;
                break;
              case 35:
                flagAlternative = true;
                break;
              case 48:
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          }
          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP8[((textIndex+1)|0)];
            }
          }
          // Handle precision.
          var precisionSet = false;
          if (next == 46) {
            var precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP8[((textIndex+1)|0)];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP8[((textIndex+1)|0)];
          } else {
            var precision = 6; // Standard default.
          }
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 108) {
                textIndex++;
                argSize = 8; // long long
              } else {
                argSize = 4; // long
              }
              break;
            case 'L': // long long
            case 'q': // int64_t
            case 'j': // intmax_t
              argSize = 8;
              break;
            case 'z': // size_t
            case 't': // ptrdiff_t
            case 'I': // signed ptrdiff_t or unsigned size_t
              argSize = 4;
              break;
            default:
              argSize = null;
          }
          if (argSize) textIndex++;
          next = HEAP8[((textIndex+1)|0)];
          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
              // Flatten i64-1 [low, high] into a (slightly rounded) double
              if (argSize == 8) {
                currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
              }
              // Truncate to requested size.
              if (argSize <= 4) {
                var limit = Math.pow(256, argSize) - 1;
                currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
              }
              // Format the number.
              var currAbsArg = Math.abs(currArg);
              var prefix = '';
              if (next == 100 || next == 105) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
                argText = reSign(currArg, 8 * argSize, 1).toString(10);
              } else if (next == 117) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
                argText = unSign(currArg, 8 * argSize, 1).toString(10);
                currArg = Math.abs(currArg);
              } else if (next == 111) {
                argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
              } else if (next == 120 || next == 88) {
                prefix = (flagAlternative && currArg != 0) ? '0x' : '';
                if (argSize == 8 && i64Math) {
                  if (origArg[1]) {
                    argText = (origArg[1]>>>0).toString(16);
                    var lower = (origArg[0]>>>0).toString(16);
                    while (lower.length < 8) lower = '0' + lower;
                    argText += lower;
                  } else {
                    argText = (origArg[0]>>>0).toString(16);
                  }
                } else
                if (currArg < 0) {
                  // Represent negative numbers in hex as 2's complement.
                  currArg = -currArg;
                  argText = (currAbsArg - 1).toString(16);
                  var buffer = [];
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
                  }
                  argText = buffer.join('');
                  while (argText.length < argSize * 2) argText = 'f' + argText;
                } else {
                  argText = currAbsArg.toString(16);
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase();
                  argText = argText.toUpperCase();
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = '(nil)';
                } else {
                  prefix = '0x';
                  argText = currAbsArg.toString(16);
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = '0' + argText;
                }
              }
              // Add sign if needed
              if (flagAlwaysSigned) {
                if (currArg < 0) {
                  prefix = '-' + prefix;
                } else {
                  prefix = '+' + prefix;
                }
              }
              // Add padding.
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad) {
                    argText = '0' + argText;
                  } else {
                    prefix = ' ' + prefix;
                  }
                }
              }
              // Insert the result into the buffer.
              argText = prefix + argText;
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
              // Float.
              var currArg = getNextArg('double');
              var argText;
              if (isNaN(currArg)) {
                argText = 'nan';
                flagZeroPad = false;
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? '-' : '') + 'inf';
                flagZeroPad = false;
              } else {
                var isGeneral = false;
                var effectivePrecision = Math.min(precision, 20);
                // Convert g/G to f/F or e/E, as per:
                // http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
                if (next == 103 || next == 71) {
                  isGeneral = true;
                  precision = precision || 1;
                  var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                  if (precision > exponent && exponent >= -4) {
                    next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
                    precision -= exponent + 1;
                  } else {
                    next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
                    precision--;
                  }
                  effectivePrecision = Math.min(precision, 20);
                }
                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision);
                  // Make sure the exponent has at least 2 digits.
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision);
                  if (currArg === 0 && __reallyNegative(currArg)) {
                    argText = '-' + argText;
                  }
                }
                var parts = argText.split('e');
                if (isGeneral && !flagAlternative) {
                  // Discard trailing zeros and periods.
                  while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
                         (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')) {
                    parts[0] = parts[0].slice(0, -1);
                  }
                } else {
                  // Make sure we have a period in alternative mode.
                  if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
                  // Zero pad until required precision.
                  while (precision > effectivePrecision++) parts[0] += '0';
                }
                argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');
                // Capitalize 'E' if needed.
                if (next == 69) argText = argText.toUpperCase();
                // Add sign.
                if (flagAlwaysSigned && currArg >= 0) {
                  argText = '+' + argText;
                }
              }
              // Add padding.
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                    argText = argText[0] + '0' + argText.slice(1);
                  } else {
                    argText = (flagZeroPad ? '0' : ' ') + argText;
                  }
                }
              }
              // Adjust case.
              if (next < 97) argText = argText.toUpperCase();
              // Insert the result into the buffer.
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 's': {
              // String.
              var arg = getNextArg('i8*');
              var argLength = arg ? _strlen(arg) : '(null)'.length;
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              if (arg) {
                for (var i = 0; i < argLength; i++) {
                  ret.push(HEAPU8[((arg++)|0)]);
                }
              } else {
                ret = ret.concat(intArrayFromString('(null)'.substr(0, argLength), true));
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              break;
            }
            case 'c': {
              // Character.
              if (flagLeftAlign) ret.push(getNextArg('i8'));
              while (--width > 0) {
                ret.push(32);
              }
              if (!flagLeftAlign) ret.push(getNextArg('i8'));
              break;
            }
            case 'n': {
              // Write the length written so far to the next parameter.
              var ptr = getNextArg('i32*');
              HEAP32[((ptr)>>2)]=ret.length
              break;
            }
            case '%': {
              // Literal percent sign.
              ret.push(curr);
              break;
            }
            default: {
              // Unknown specifiers remain untouched.
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP8[(i)]);
              }
            }
          }
          textIndex += 2;
          // TODO: Support a/A (hex float) and m (last error) specifiers.
          // TODO: Support %1${specifier} for arg selection.
        } else {
          ret.push(curr);
          textIndex += 1;
        }
      }
      return ret;
    }function _snprintf(s, n, format, varargs) {
      // int snprintf(char *restrict s, size_t n, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var limit = (n === undefined) ? result.length
                                    : Math.min(result.length, Math.max(n - 1, 0));
      if (s < 0) {
        s = -s;
        var buf = _malloc(limit+1);
        HEAP32[((s)>>2)]=buf;
        s = buf;
      }
      for (var i = 0; i < limit; i++) {
        HEAP8[(((s)+(i))|0)]=result[i];
      }
      if (limit < n || (n === undefined)) HEAP8[(((s)+(i))|0)]=0;
      return result.length;
    }function _vsnprintf(s, n, format, va_arg) {
      return _snprintf(s, n, format, HEAP32[((va_arg)>>2)]);
    }
  function _llvm_va_end() {}
  function _ispunct(chr) {
      return (chr >= 33 && chr <= 47) ||
             (chr >= 58 && chr <= 64) ||
             (chr >= 91 && chr <= 96) ||
             (chr >= 123 && chr <= 126);
    }
  function _isspace(chr) {
      return chr in { 32: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0 };
    }
  function _isalpha(chr) {
      return (chr >= 97 && chr <= 122) ||
             (chr >= 65 && chr <= 90);
    }
  function _abort() {
      ABORT = true;
      throw 'abort() at ' + (new Error().stack);
    }
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value
      return value;
    }function ___errno_location() {
      return ___errno_state;
    }var ___errno=___errno_location;
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:35,EIDRM:36,ECHRNG:37,EL2NSYNC:38,EL3HLT:39,EL3RST:40,ELNRNG:41,EUNATCH:42,ENOCSI:43,EL2HLT:44,EDEADLK:45,ENOLCK:46,EBADE:50,EBADR:51,EXFULL:52,ENOANO:53,EBADRQC:54,EBADSLT:55,EDEADLOCK:56,EBFONT:57,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:74,ELBIN:75,EDOTDOT:76,EBADMSG:77,EFTYPE:79,ENOTUNIQ:80,EBADFD:81,EREMCHG:82,ELIBACC:83,ELIBBAD:84,ELIBSCN:85,ELIBMAX:86,ELIBEXEC:87,ENOSYS:88,ENMFILE:89,ENOTEMPTY:90,ENAMETOOLONG:91,ELOOP:92,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:106,EPROTOTYPE:107,ENOTSOCK:108,ENOPROTOOPT:109,ESHUTDOWN:110,ECONNREFUSED:111,EADDRINUSE:112,ECONNABORTED:113,ENETUNREACH:114,ENETDOWN:115,ETIMEDOUT:116,EHOSTDOWN:117,EHOSTUNREACH:118,EINPROGRESS:119,EALREADY:120,EDESTADDRREQ:121,EMSGSIZE:122,EPROTONOSUPPORT:123,ESOCKTNOSUPPORT:124,EADDRNOTAVAIL:125,ENETRESET:126,EISCONN:127,ENOTCONN:128,ETOOMANYREFS:129,EPROCLIM:130,EUSERS:131,EDQUOT:132,ESTALE:133,ENOTSUP:134,ENOMEDIUM:135,ENOSHARE:136,ECASECLASH:137,EILSEQ:138,EOVERFLOW:139,ECANCELED:140,ENOTRECOVERABLE:141,EOWNERDEAD:142,ESTRPIPE:143};function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 8: return PAGE_SIZE;
        case 54:
        case 56:
        case 21:
        case 61:
        case 63:
        case 22:
        case 67:
        case 23:
        case 24:
        case 25:
        case 26:
        case 27:
        case 69:
        case 28:
        case 101:
        case 70:
        case 71:
        case 29:
        case 30:
        case 199:
        case 75:
        case 76:
        case 32:
        case 43:
        case 44:
        case 80:
        case 46:
        case 47:
        case 45:
        case 48:
        case 49:
        case 42:
        case 82:
        case 33:
        case 7:
        case 108:
        case 109:
        case 107:
        case 112:
        case 119:
        case 121:
          return 200809;
        case 13:
        case 104:
        case 94:
        case 95:
        case 34:
        case 35:
        case 77:
        case 81:
        case 83:
        case 84:
        case 85:
        case 86:
        case 87:
        case 88:
        case 89:
        case 90:
        case 91:
        case 94:
        case 95:
        case 110:
        case 111:
        case 113:
        case 114:
        case 115:
        case 116:
        case 117:
        case 118:
        case 120:
        case 40:
        case 16:
        case 79:
        case 19:
          return -1;
        case 92:
        case 93:
        case 5:
        case 72:
        case 6:
        case 74:
        case 92:
        case 93:
        case 96:
        case 97:
        case 98:
        case 99:
        case 102:
        case 103:
        case 105:
          return 1;
        case 38:
        case 66:
        case 50:
        case 51:
        case 4:
          return 1024;
        case 15:
        case 64:
        case 41:
          return 32;
        case 55:
        case 37:
        case 17:
          return 2147483647;
        case 18:
        case 1:
          return 47839;
        case 59:
        case 57:
          return 99;
        case 68:
        case 58:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 14: return 32768;
        case 73: return 32767;
        case 39: return 16384;
        case 60: return 1000;
        case 106: return 700;
        case 52: return 256;
        case 62: return 255;
        case 2: return 100;
        case 65: return 64;
        case 36: return 20;
        case 100: return 16;
        case 20: return 6;
        case 53: return 4;
        case 10: return 1;
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }
  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret
      }
      return ret;
    }
  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }
  function _memchr(ptr, chr, num) {
      chr = unSign(chr);
      for (var i = 0; i < num; i++) {
        if (HEAP8[(ptr)] == chr) return ptr;
        ptr++;
      }
      return 0;
    }
  function _llvm_lifetime_start() {}
  function _llvm_lifetime_end() {}
  var Browser={mainLoop:{scheduler:null,shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
        if (Browser.initted || ENVIRONMENT_IS_WORKER) return;
        Browser.initted = true;
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : console.log("warning: cannot create object URLs");
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
        function getMimetype(name) {
          return {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'bmp': 'image/bmp',
            'ogg': 'audio/ogg',
            'wav': 'audio/wav',
            'mp3': 'audio/mpeg'
          }[name.substr(name.lastIndexOf('.')+1)];
        }
        var imagePlugin = {};
        imagePlugin['canHandle'] = function(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/.exec(name);
        };
        imagePlugin['handle'] = function(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: getMimetype(name) });
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          var img = new Image();
          img.onload = function() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
        var audioPlugin = {};
        audioPlugin['canHandle'] = function(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
        // Canvas event setup
        var canvas = Module['canvas'];
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'];
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'] ||
                                 function(){}; // no-op if function does not exist
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas;
        }
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
        if (Module['elementPointerLock']) {
          canvas.addEventListener("click", function(ev) {
            if (!Browser.pointerLock && canvas.requestPointerLock) {
              canvas.requestPointerLock();
              ev.preventDefault();
            }
          }, false);
        }
      },createContext:function (canvas, useWebGL, setInModule) {
        var ctx;
        try {
          if (useWebGL) {
            ctx = canvas.getContext('experimental-webgl', {
              alpha: false
            });
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas - ' + e);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement']) === canvas) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'];
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else if (Browser.resizeCanvas){
            Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
        }
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
        }
        canvas.requestFullScreen = canvas['requestFullScreen'] ||
                                   canvas['mozRequestFullScreen'] ||
                                   (canvas['webkitRequestFullScreen'] ? function() { canvas['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvas.requestFullScreen();
      },requestAnimationFrame:function (func) {
        if (!window.requestAnimationFrame) {
          window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                         window['mozRequestAnimationFrame'] ||
                                         window['webkitRequestAnimationFrame'] ||
                                         window['msRequestAnimationFrame'] ||
                                         window['oRequestAnimationFrame'] ||
                                         window['setTimeout'];
        }
        window.requestAnimationFrame(func);
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var x = event.pageX - (window.scrollX + rect.left);
          var y = event.pageY - (window.scrollY + rect.top);
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        canvas.width = width;
        canvas.height = height;
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        var canvas = Module['canvas'];
        this.windowedWidth = canvas.width;
        this.windowedHeight = canvas.height;
        canvas.width = screen.width;
        canvas.height = screen.height;
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        var canvas = Module['canvas'];
        canvas.width = this.windowedWidth;
        canvas.height = this.windowedHeight;
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      }};
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
Module["requestFullScreen"] = function(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function(func) { Browser.requestAnimationFrame(func) };
  Module["pauseMainLoop"] = function() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function() { Browser.getUserMedia() }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);
staticSealed = true; // seal the static portion of memory
STACK_MAX = STACK_BASE + 5242880;
DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);
assert(DYNAMIC_BASE < TOTAL_MEMORY); // Stack must fit in TOTAL_MEMORY; allocations from here on may enlarge TOTAL_MEMORY
var Math_min = Math.min;
function invoke_ii(index,a1) {
  try {
    return Module["dynCall_ii"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_vi(index,a1) {
  try {
    Module["dynCall_vi"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_vii(index,a1,a2) {
  try {
    Module["dynCall_vii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iiiiii(index,a1,a2,a3,a4,a5) {
  try {
    return Module["dynCall_iiiiii"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iiii(index,a1,a2,a3) {
  try {
    return Module["dynCall_iiii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viii(index,a1,a2,a3) {
  try {
    Module["dynCall_viii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_v(index) {
  try {
    Module["dynCall_v"](index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iiiii(index,a1,a2,a3,a4) {
  try {
    return Module["dynCall_iiiii"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iii(index,a1,a2) {
  try {
    return Module["dynCall_iii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_viiii(index,a1,a2,a3,a4) {
  try {
    Module["dynCall_viiii"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function asmPrintInt(x, y) {
  Module.print('int ' + x + ',' + y);// + ' ' + new Error().stack);
}
function asmPrintFloat(x, y) {
  Module.print('float ' + x + ',' + y);// + ' ' + new Error().stack);
}
// EMSCRIPTEN_START_ASM
var asm=(function(global,env,buffer){"use asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer);var c=new global.Int32Array(buffer);var d=new global.Uint8Array(buffer);var e=new global.Uint16Array(buffer);var f=new global.Uint32Array(buffer);var g=new global.Float32Array(buffer);var h=new global.Float64Array(buffer);var i=env.STACKTOP|0;var j=env.STACK_MAX|0;var k=env.tempDoublePtr|0;var l=env.ABORT|0;var m=+env.NaN;var n=+env.Infinity;var o=0;var p=0;var q=0;var r=0;var s=0,t=0,u=0,v=0,w=0.0,x=0,y=0,z=0,A=0.0;var B=0;var C=0;var D=0;var E=0;var F=0;var G=0;var H=0;var I=0;var J=0;var K=0;var L=global.Math.floor;var M=global.Math.abs;var N=global.Math.sqrt;var O=global.Math.pow;var P=global.Math.cos;var Q=global.Math.sin;var R=global.Math.tan;var S=global.Math.acos;var T=global.Math.asin;var U=global.Math.atan;var V=global.Math.atan2;var W=global.Math.exp;var X=global.Math.log;var Y=global.Math.ceil;var Z=global.Math.imul;var _=env.abort;var $=env.assert;var aa=env.asmPrintInt;var ab=env.asmPrintFloat;var ac=env.min;var ad=env.invoke_ii;var ae=env.invoke_vi;var af=env.invoke_vii;var ag=env.invoke_iiiiii;var ah=env.invoke_iiii;var ai=env.invoke_viii;var aj=env.invoke_v;var ak=env.invoke_iiiii;var al=env.invoke_iii;var am=env.invoke_viiii;var an=env._strncmp;var ao=env._snprintf;var ap=env._vsnprintf;var aq=env._abort;var ar=env._ispunct;var as=env._sysconf;var at=env._isalnum;var au=env.___setErrNo;var av=env.__reallyNegative;var aw=env._isalpha;var ax=env._llvm_lifetime_end;var ay=env._isspace;var az=env.__formatString;var aA=env._llvm_va_end;var aB=env.___assert_func;var aC=env._sbrk;var aD=env.___errno_location;var aE=env._llvm_lifetime_start;var aF=env._time;var aG=env._strcmp;var aH=env._memchr;
// EMSCRIPTEN_START_FUNCS
function aS(a){a=a|0;var b=0;b=i;i=i+a|0;i=i+7>>3<<3;return b|0}function aT(){return i|0}function aU(a){a=a|0;i=a}function aV(a,b){a=a|0;b=b|0;if((o|0)==0){o=a;p=b}}function aW(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0]}function aX(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0];a[k+4|0]=a[b+4|0];a[k+5|0]=a[b+5|0];a[k+6|0]=a[b+6|0];a[k+7|0]=a[b+7|0]}function aY(a){a=a|0;B=a}function aZ(a){a=a|0;C=a}function a_(a){a=a|0;D=a}function a$(a){a=a|0;E=a}function a0(a){a=a|0;F=a}function a1(a){a=a|0;G=a}function a2(a){a=a|0;H=a}function a3(a){a=a|0;I=a}function a4(a){a=a|0;J=a}function a5(a){a=a|0;K=a}function a6(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;if((d|0)==0|(e|0)==0){aB(1368,2410,2272,1304);return 0}g=b1(436)|0;h=g;if((g|0)==0){i=0;return i|0}j=e;ca(g|0,j|0,108)|0;j=g+400|0;c[j>>2]=0;e=g+404|0;c[e>>2]=0;k=g+408|0;c[k>>2]=0;l=b4(0,16)|0;m=l;do{if((l|0)!=0){n=c[k>>2]|0;cb(m+(n<<2)|0,0,4-n<<2|0);c[j>>2]=m;c[k>>2]=4;if((c[e>>2]|0)>>>0<=4){break}c[e>>2]=4}}while(0);e=g+412|0;c[e>>2]=0;k=g+416|0;c[k>>2]=0;m=g+420|0;c[m>>2]=0;j=b4(0,32)|0;l=j;do{if((j|0)!=0){n=c[m>>2]|0;cb(l+(n<<2)|0,0,8-n<<2|0);c[e>>2]=l;c[m>>2]=8;if((c[k>>2]|0)>>>0<=8){break}c[k>>2]=8}}while(0);cb(g+144|0,0,256);do{if((c[g+56>>2]|0)==0){if((c[g+52>>2]|0)!=0){o=13;break}if((c[g+76>>2]|0)!=0){o=13}}else{o=13}}while(0);do{if((o|0)==13){a[g+186|0]=1;if((b&16|0)==0){break}a[g+270|0]=1}}while(0);if((c[g+48>>2]|0)!=0){a[g+240|0]=2}if((c[g+64>>2]|0)!=0){a[g+154|0]=3}if((c[g+60>>2]|0)==0){if((c[g+68>>2]|0)!=0){o=21}}else{o=21}if((o|0)==21){a[g+235|0]=4}a[g+204|0]=5;a[g+236|0]=6;a[g+182|0]=7;if((b&8|0)!=0){a[g+202|0]=8;a[g+208|0]=9;a[g+263|0]=10}if((b&128|0)!=0){a[g+238|0]=11}if((b&512|0)!=0){a[g+239|0]=11}c[g+424>>2]=b;c[g+108>>2]=f;c[g+428>>2]=d;c[g+432>>2]=0;i=h;return i|0}function a7(b,e,f,g){b=b|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0;h=b1(16)|0;if((h|0)==0){return}i=h;c[i>>2]=0;j=h+8|0;c[j>>2]=0;k=h+4|0;c[k>>2]=0;l=h+12|0;c[l>>2]=64;do{if(f>>>0>16777216){m=g+112|0;cb(m|0,0,32);n=m;o=42}else{if((f|0)==0){m=g+112|0;cb(m|0,0,32);p=0;q=m;break}if(f>>>0>64){m=64;while(1){r=m+64|0;if(r>>>0<f>>>0){m=r}else{s=r;break}}}else{s=64}m=b4(0,s)|0;if((m|0)!=0){c[i>>2]=m;c[j>>2]=s}m=g+112|0;cb(m|0,0,32);if(f>>>0>2){n=m;o=42}else{p=0;q=m}}}while(0);if((o|0)==42){p=(cc(e|0,120,3)|0)==0?3:0;q=n}L63:do{if(p>>>0<f>>>0){n=(q|0)==0;s=p;L65:while(1){m=s+3|0;L67:do{if(m>>>0<f>>>0){do{if((a[e+s|0]|0)==32){if((a[e+(s+1)|0]|0)!=32){t=1;break}if((a[e+(s+2)|0]|0)!=32){t=2;break}if((a[e+m|0]|0)==32){o=121;break L67}else{t=3}}else{t=0}}while(0);r=t+s|0;if((a[e+r|0]|0)!=91){o=121;break}u=r+1|0;if(u>>>0<f>>>0){v=u}else{o=121;break}while(1){r=a[e+v|0]|0;if((r<<24>>24|0)==93){break}else if((r<<24>>24|0)==10|(r<<24>>24|0)==13){o=121;break L67}r=v+1|0;if(r>>>0<f>>>0){v=r}else{o=121;break L67}}r=v+1|0;if(r>>>0>=f>>>0){o=121;break}if((a[e+r|0]|0)!=58){o=121;break}r=v+2|0;L81:do{if(r>>>0<f>>>0){w=r;while(1){x=a[e+w|0]|0;if((x<<24>>24|0)==10|(x<<24>>24|0)==13){break}else if((x<<24>>24|0)!=32){y=w;break L81}z=w+1|0;if(z>>>0<f>>>0){w=z}else{y=z;break L81}}z=w+1|0;if(z>>>0>=f>>>0){y=z;break}if((a[e+z|0]|0)!=13){y=z;break}y=x<<24>>24==10?w+2|0:z}else{y=r}}while(0);while(1){if(y>>>0>=f>>>0){o=121;break L67}A=a[e+y|0]|0;if(A<<24>>24==32){y=y+1|0}else{break}}r=(A<<24>>24==60&1)+y|0;L92:do{if(r>>>0<f>>>0){z=r;while(1){B=a[e+z|0]|0;if((B<<24>>24|0)==32|(B<<24>>24|0)==10|(B<<24>>24|0)==13){C=z;break L92}B=z+1|0;if(B>>>0<f>>>0){z=B}else{C=B;break}}}else{C=r}}while(0);z=C-1|0;w=(a[e+z|0]|0)==62?z:C;L97:do{if(C>>>0<f>>>0){z=C;while(1){B=a[e+z|0]|0;if((B<<24>>24|0)==34|(B<<24>>24|0)==39|(B<<24>>24|0)==40){break}else if((B<<24>>24|0)==13|(B<<24>>24|0)==10){D=z;E=z;break L97}else if((B<<24>>24|0)!=32){o=121;break L67}B=z+1|0;if(B>>>0<f>>>0){z=B}else{D=B;E=B;break L97}}D=0;E=z}else{D=C;E=C}}while(0);B=E+1|0;do{if(B>>>0<f>>>0){if((a[e+E|0]|0)!=10){F=D;break}F=(a[e+B|0]|0)==13?B:D}else{F=D}}while(0);L107:do{if((F|0)==0){G=E}else{B=F;while(1){H=B+1|0;if(H>>>0>=f>>>0){G=H;break L107}if((a[e+H|0]|0)==32){B=H}else{G=H;break}}}}while(0);B=G+1|0;L112:do{if(B>>>0<f>>>0){z=a[e+G|0]|0;if((z<<24>>24|0)==39|(z<<24>>24|0)==34|(z<<24>>24|0)==40){I=B}else{J=F;K=0;L=0;break}while(1){if(I>>>0>=f>>>0){o=80;break}z=a[e+I|0]|0;H=I+1|0;if((z<<24>>24|0)==13|(z<<24>>24|0)==10){M=H;break}else{I=H}}if((o|0)==80){o=0;M=I+1|0}do{if(M>>>0<f>>>0){if((a[e+I|0]|0)!=10){o=85;break}if((a[e+M|0]|0)==13){N=M}else{o=85}}else{o=85}}while(0);if((o|0)==85){o=0;N=I}H=I;while(1){O=H-1|0;if(O>>>0<=B>>>0){J=F;K=N;L=B;break L112}z=a[e+O|0]|0;if((z<<24>>24|0)==32){H=O}else if((z<<24>>24|0)==39|(z<<24>>24|0)==34|(z<<24>>24|0)==41){break}else{J=F;K=N;L=B;break L112}}J=N;K=O;L=B}else{J=F;K=0;L=0}}while(0);if((J|0)==0|(w|0)==(r|0)){o=121;break}if(n){P=J;break}B=v-u|0;Q=b3(1,16)|0;H=Q;if((Q|0)==0){o=121;break}if((v|0)==(u|0)){R=0}else{z=0;S=0;while(1){T=(b8(d[e+(z+u)|0]|0)|0)-S+(S*65600&-1)|0;U=z+1|0;if(U>>>0<B>>>0){z=U;S=T}else{R=T;break}}}c[Q>>2]=R;S=q+((R&7)<<2)|0;c[Q+12>>2]=c[S>>2];c[S>>2]=H;S=w-r|0;z=b1(16)|0;V=z;if((z|0)==0){o=98;break L65}B=z;c[B>>2]=0;u=z+8|0;c[u>>2]=0;T=z+4|0;c[T>>2]=0;U=z+12|0;c[U>>2]=S;c[Q+4>>2]=V;z=e+r|0;W=c[U>>2]|0;if((W|0)==0){o=207;break L65}U=c[T>>2]|0;X=U+S|0;Y=c[u>>2]|0;do{if(X>>>0>Y>>>0){if(X>>>0>16777216){break}Z=Y+W|0;if(Z>>>0<X>>>0){_=Z;while(1){$=_+W|0;if($>>>0<X>>>0){_=$}else{aa=$;break}}}else{aa=Z}_=b4(c[B>>2]|0,aa)|0;if((_|0)==0){break}c[B>>2]=_;c[u>>2]=aa;ab=c[T>>2]|0;ac=_;o=107}else{ab=U;ac=c[B>>2]|0;o=107}}while(0);if((o|0)==107){o=0;B=ac+ab|0;ca(B|0,z|0,S)|0;c[T>>2]=(c[T>>2]|0)+S}if(K>>>0<=L>>>0){P=J;break}B=K-L|0;U=b1(16)|0;ad=U;if((U|0)==0){o=111;break L65}u=U;c[u>>2]=0;X=U+8|0;c[X>>2]=0;W=U+4|0;c[W>>2]=0;Y=U+12|0;c[Y>>2]=B;c[Q+8>>2]=ad;U=e+L|0;r=c[Y>>2]|0;if((r|0)==0){o=209;break L65}Y=c[W>>2]|0;w=Y+B|0;H=c[X>>2]|0;if(w>>>0>H>>>0){if(w>>>0>16777216){P=J;break}_=H+r|0;if(_>>>0<w>>>0){H=_;while(1){$=H+r|0;if($>>>0<w>>>0){H=$}else{ae=$;break}}}else{ae=_}H=b4(c[u>>2]|0,ae)|0;if((H|0)==0){P=J;break}c[u>>2]=H;c[X>>2]=ae;af=c[W>>2]|0;ag=H}else{af=Y;ag=c[u>>2]|0}H=ag+af|0;ca(H|0,U|0,B)|0;c[W>>2]=(c[W>>2]|0)+B;P=J}else{o=121}}while(0);L165:do{if((o|0)==121){o=0;L167:do{if(s>>>0<f>>>0){m=s;while(1){H=a[e+m|0]|0;if((H<<24>>24|0)==13|(H<<24>>24|0)==10){ah=m;break}H=m+1|0;if(H>>>0<f>>>0){m=H}else{ah=H;break}}if(ah>>>0<=s>>>0){ai=ah;break}m=ah-s|0;if((ah|0)==(s|0)){ai=ah;break}else{aj=0;ak=0}while(1){if(ak>>>0<m>>>0){al=aj;am=ak}else{ai=ah;break L167}while(1){if((a[e+(am+s)|0]|0)==9){an=al;ao=am;ap=1;break}Z=am+1|0;H=al+1|0;if(Z>>>0<m>>>0){al=H;am=Z}else{an=H;ao=Z;ap=0;break}}do{if(ao>>>0>ak>>>0){Z=e+(ak+s)|0;H=ao-ak|0;w=c[l>>2]|0;if((w|0)==0){o=131;break L65}r=c[k>>2]|0;S=r+H|0;T=c[j>>2]|0;if(S>>>0>T>>>0){if(S>>>0>16777216){o=140;break}z=T+w|0;if(z>>>0<S>>>0){T=z;while(1){$=T+w|0;if($>>>0<S>>>0){T=$}else{aq=$;break}}}else{aq=z}T=b4(c[i>>2]|0,aq)|0;if((T|0)==0){o=140;break}c[i>>2]=T;c[j>>2]=aq;ar=c[k>>2]|0;as=T}else{ar=r;as=c[i>>2]|0}T=as+ar|0;ca(T|0,Z|0,H)|0;c[k>>2]=(c[k>>2]|0)+H;if(ap){at=an}else{ai=ah;break L167}}else{o=140}}while(0);if((o|0)==140){o=0;if(ap){at=an}else{ai=ah;break L167}}do{T=c[l>>2]|0;if((T|0)==0){o=142;break L65}S=c[k>>2]|0;w=S+1|0;$=c[j>>2]|0;do{if(w>>>0>$>>>0){if(w>>>0>16777216){break}au=$+T|0;if(au>>>0<w>>>0){av=au;while(1){aw=av+T|0;if(aw>>>0<w>>>0){av=aw}else{ax=aw;break}}}else{ax=au}av=b4(c[i>>2]|0,ax)|0;if((av|0)==0){break}c[i>>2]=av;c[j>>2]=ax;ay=c[k>>2]|0;az=av;o=150}else{ay=S;az=c[i>>2]|0;o=150}}while(0);if((o|0)==150){o=0;a[az+ay|0]=32;c[k>>2]=(c[k>>2]|0)+1}at=at+1|0;}while((at&3|0)!=0);S=ao+1|0;if(S>>>0<m>>>0){aj=at;ak=S}else{ai=ah;break}}}else{ai=s}}while(0);if(ai>>>0<f>>>0){aA=ai}else{P=ai;break}while(1){B=a[e+aA|0]|0;do{if((B<<24>>24|0)==13){W=aA+1|0;if(W>>>0>=f>>>0){break}if((a[e+W|0]|0)!=10){o=157}}else if((B<<24>>24|0)==10){o=157}else{P=aA;break L165}}while(0);do{if((o|0)==157){o=0;B=c[l>>2]|0;if((B|0)==0){o=158;break L65}W=c[k>>2]|0;U=W+1|0;u=c[j>>2]|0;if(U>>>0>u>>>0){if(U>>>0>16777216){break}Y=u+B|0;if(Y>>>0<U>>>0){u=Y;while(1){X=u+B|0;if(X>>>0<U>>>0){u=X}else{aC=X;break}}}else{aC=Y}u=b4(c[i>>2]|0,aC)|0;if((u|0)==0){break}c[i>>2]=u;c[j>>2]=aC;aD=c[k>>2]|0;aE=u}else{aD=W;aE=c[i>>2]|0}a[aE+aD|0]=10;c[k>>2]=(c[k>>2]|0)+1}}while(0);u=aA+1|0;if(u>>>0<f>>>0){aA=u}else{P=u;break}}}}while(0);if(P>>>0<f>>>0){s=P}else{break L63}}if((o|0)==98){c[Q+4>>2]=V;aB(1144,157,2296,1656)}else if((o|0)==111){c[Q+8>>2]=ad;aB(1144,157,2296,1656)}else if((o|0)==131){aB(1144,157,2296,1656)}else if((o|0)==142){aB(1144,178,2288,1656)}else if((o|0)==158){aB(1144,178,2288,1656)}else if((o|0)==207){aB(1144,157,2296,1656)}else if((o|0)==209){aB(1144,157,2296,1656)}}}while(0);o=c[k>>2]|0;ad=(o>>>1)+o|0;if((b|0)==0){aB(1144,58,2336,1656)}o=c[b+12>>2]|0;if((o|0)==0){aB(1144,58,2336,1656)}do{if(ad>>>0<=16777216){Q=b+8|0;V=c[Q>>2]|0;if(V>>>0>=ad>>>0){break}P=V+o|0;if(P>>>0<ad>>>0){V=P;while(1){f=V+o|0;if(f>>>0<ad>>>0){V=f}else{aF=f;break}}}else{aF=P}V=b|0;f=b4(c[V>>2]|0,aF)|0;if((f|0)==0){break}c[V>>2]=f;c[Q>>2]=aF}}while(0);aF=c[g+100>>2]|0;if((aF|0)!=0){aK[aF&3](b,c[g+108>>2]|0)}aF=c[k>>2]|0;if((aF|0)!=0){ad=c[i>>2]|0;o=a[ad+(aF-1)|0]|0;L262:do{if((o<<24>>24|0)==10|(o<<24>>24|0)==13){aG=aF}else{f=c[l>>2]|0;if((f|0)==0){aB(1144,178,2288,1656)}V=aF+1|0;aA=c[j>>2]|0;do{if(V>>>0>aA>>>0){if(V>>>0>16777216){aG=aF;break L262}aD=aA+f|0;if(aD>>>0<V>>>0){aE=aD;while(1){aC=aE+f|0;if(aC>>>0<V>>>0){aE=aC}else{aH=aC;break}}}else{aH=aD}aE=b4(ad,aH)|0;if((aE|0)==0){aG=c[k>>2]|0;break L262}else{c[i>>2]=aE;c[j>>2]=aH;aI=c[k>>2]|0;aJ=aE;break}}else{aI=aF;aJ=ad}}while(0);a[aJ+aI|0]=10;V=(c[k>>2]|0)+1|0;c[k>>2]=V;aG=V}}while(0);a8(b,g,c[i>>2]|0,aG)}aG=c[g+104>>2]|0;if((aG|0)!=0){aK[aG&3](b,c[g+108>>2]|0)}b2(c[i>>2]|0);b2(h);h=0;do{i=c[q+(h<<2)>>2]|0;if((i|0)!=0){b=i;while(1){i=c[b+12>>2]|0;aG=c[b+4>>2]|0;if((aG|0)!=0){b2(c[aG>>2]|0);b2(aG)}aG=c[b+8>>2]|0;if((aG|0)!=0){b2(c[aG>>2]|0);b2(aG)}b2(b);if((i|0)==0){break}else{b=i}}}h=h+1|0;}while(h>>>0<8);if((c[g+416>>2]|0)!=0){aB(1368,2533,2248,1256)}if((c[g+404>>2]|0)==0){return}else{aB(1368,2534,2248,1208)}}function a8(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aL=0,aM=0,aO=0,aP=0,aQ=0,aS=0,aT=0,aU=0,aV=0,aW=0,aX=0,aY=0,aZ=0,a_=0,a$=0,a0=0,a1=0,a2=0,a3=0,a4=0,a5=0,a6=0,a7=0,a9=0,be=0,bf=0,bh=0,bi=0,bj=0,bk=0,bl=0,bm=0,bn=0,bo=0,bp=0,bq=0,br=0,bs=0,bu=0,bv=0,bw=0,bx=0,by=0,bz=0,bA=0,bB=0,bC=0,bD=0,bE=0,bF=0,bG=0,bH=0,bI=0,bJ=0,bK=0,bL=0,bM=0,bN=0,bO=0,bP=0,bQ=0,bR=0,bS=0,bT=0,bU=0,bV=0,bW=0,bX=0,bY=0,bZ=0,b_=0,b$=0,b0=0,b5=0,b6=0,b7=0,b8=0,b9=0,cc=0,ce=0,cf=0,cg=0,ch=0,ci=0,cj=0,ck=0,cl=0,cm=0,cn=0,co=0,cp=0,cq=0,cr=0,cs=0,ct=0,cu=0,cv=0,cw=0,cx=0,cy=0,cz=0,cA=0,cB=0,cC=0,cD=0,cE=0,cF=0,cG=0,cH=0,cI=0,cJ=0,cK=0,cL=0,cM=0,cN=0,cO=0,cP=0,cQ=0,cR=0,cS=0,cT=0,cU=0,cV=0,cW=0,cX=0,cY=0,cZ=0,c_=0,c$=0;g=i;i=i+32|0;h=g|0;j=g+16|0;k=d+416|0;l=d+404|0;if(((c[l>>2]|0)+(c[k>>2]|0)|0)>>>0>(c[d+428>>2]|0)>>>0|(f|0)==0){i=g;return}m=d+424|0;n=d+420|0;o=d+412|0;p=d+12|0;q=d+108|0;r=d+8|0;s=d+408|0;t=d+400|0;u=d+4|0;v=d|0;w=d+28|0;x=d+32|0;y=h;z=j;A=j+4|0;B=h+4|0;C=d+16|0;D=0;L306:while(1){E=e+D|0;F=f-D|0;G=a[E]|0;L308:do{if((G<<24>>24|0)==35){do{if((c[m>>2]&64|0)==0){H=0}else{I=0;while(1){J=I>>>0<F>>>0;if(!(J&I>>>0<6)){K=221;break}L=e+(I+D)|0;if((a[L]|0)==35){I=I+1|0}else{M=L;break}}if((K|0)==221){K=0;if(!J){H=0;break}M=e+(I+D)|0}if((a[M]|0)==32){H=0;break}if(G<<24>>24==60){K=250;break L308}else{K=254;break L308}}}while(0);while(1){if(!(H>>>0<F>>>0&H>>>0<6)){N=H;break}if((a[e+(H+D)|0]|0)==35){H=H+1|0}else{N=H;break}}while(1){if(N>>>0>=F>>>0){O=N;break}if((a[e+(N+D)|0]|0)==32){N=N+1|0}else{O=N;break}}while(1){if(O>>>0>=F>>>0){P=O;break}if((a[e+(O+D)|0]|0)==10){P=O;break}else{O=O+1|0}}while(1){if((P|0)==0){Q=0;break}L=P-1|0;if((a[e+(L+D)|0]|0)==35){P=L}else{Q=P;break}}while(1){if((Q|0)==0){break}L=Q-1|0;if((a[e+(L+D)|0]|0)==32){Q=L}else{K=234;break}}do{if((K|0)==234){K=0;if(Q>>>0<=N>>>0){break}L=c[k>>2]|0;do{if(L>>>0<(c[n>>2]|0)>>>0){R=(c[o>>2]|0)+(L<<2)|0;if((c[R>>2]|0)==0){K=238;break}c[k>>2]=L+1;S=c[R>>2]|0;c[S+4>>2]=0;T=S}else{K=238}}while(0);L340:do{if((K|0)==238){K=0;L=b1(16)|0;I=L;if((L|0)!=0){c[L>>2]=0;c[L+8>>2]=0;c[L+4>>2]=0;c[L+12>>2]=64}S=c[k>>2]|0;R=S<<1;U=c[o>>2]|0;do{if((c[n>>2]|0)>>>0<R>>>0){V=b4(U,S<<3)|0;W=V;if((V|0)==0){T=I;break L340}V=c[n>>2]|0;cb(W+(V<<2)|0,0,R-V<<2|0);c[o>>2]=W;c[n>>2]=R;V=c[k>>2]|0;if(V>>>0<=R>>>0){X=V;Y=W;break}c[k>>2]=R;X=R;Y=W}else{X=S;Y=U}}while(0);c[k>>2]=X+1;c[Y+(X<<2)>>2]=L;T=I}}while(0);bg(T,d,e+(N+D)|0,Q-N|0);U=c[p>>2]|0;if((U|0)!=0){aR[U&15](b,T,H,c[q>>2]|0)}c[k>>2]=(c[k>>2]|0)-1}}while(0);Z=O+D|0}else if((G<<24>>24|0)==60){K=250}else{K=254}}while(0);do{if((K|0)==250){K=0;if((c[r>>2]|0)==0){K=254;break}G=ba(b,d,E,F,1)|0;if((G|0)==0){K=254;break}Z=G+D|0}}while(0);L359:do{if((K|0)==254){K=0;do{if((D|0)==(f|0)){_=1}else{G=0;while(1){U=a[e+(G+D)|0]|0;if((U<<24>>24|0)==10){$=G;K=257;break}else if((U<<24>>24|0)!=32){break}U=G+1|0;if(U>>>0<F>>>0){G=U}else{$=U;K=257;break}}if((K|0)==257){K=0;G=$+1|0;if((G|0)!=0){_=G;break}}L368:do{if(F>>>0>=3){do{if((a[E]|0)==32){if((a[e+(D+1)|0]|0)!=32){aa=1;break}aa=(a[e+(D+2)|0]|0)==32?3:2}else{aa=0}}while(0);if((aa+2|0)>>>0>=F>>>0){break}I=a[e+(aa+D)|0]|0;if(!((I<<24>>24|0)==42|(I<<24>>24|0)==45|(I<<24>>24|0)==95)){break}if(aa>>>0<F>>>0){ab=I;ac=0;ad=aa}else{break}while(1){if(ab<<24>>24==I<<24>>24){ae=ac+1|0}else{if(ab<<24>>24==32){ae=ac}else{break L368}}L=ad+1|0;if(L>>>0>=F>>>0){break}G=a[e+(L+D)|0]|0;if(G<<24>>24==10){break}else{ab=G;ac=ae;ad=L}}if(ae>>>0<=2){break}I=c[C>>2]|0;if((I|0)==0){af=D}else{aK[I&3](b,c[q>>2]|0);af=D}while(1){if(af>>>0>=f>>>0){break}I=af+1|0;if((a[e+af|0]|0)==10){Z=I;break L359}else{af=I}}Z=af+1|0;break L359}}while(0);do{if((c[m>>2]&4|0)!=0){cb(y|0,0,16);I=bd(E,F,h)|0;if((I|0)==0){break}L=c[l>>2]|0;do{if(L>>>0<(c[s>>2]|0)>>>0){G=(c[t>>2]|0)+(L<<2)|0;if((c[G>>2]|0)==0){K=282;break}c[l>>2]=L+1;U=c[G>>2]|0;c[U+4>>2]=0;ag=U}else{K=282}}while(0);L398:do{if((K|0)==282){K=0;L=b1(16)|0;U=L;if((L|0)!=0){c[L>>2]=0;c[L+8>>2]=0;c[L+4>>2]=0;c[L+12>>2]=256}G=c[l>>2]|0;S=G<<1;R=c[t>>2]|0;do{if((c[s>>2]|0)>>>0<S>>>0){W=b4(R,G<<3)|0;V=W;if((W|0)==0){ag=U;break L398}W=c[s>>2]|0;cb(V+(W<<2)|0,0,S-W<<2|0);c[t>>2]=V;c[s>>2]=S;W=c[l>>2]|0;if(W>>>0<=S>>>0){ah=W;ai=V;break}c[l>>2]=S;ah=S;ai=V}else{ah=G;ai=R}}while(0);c[l>>2]=ah+1;c[ai+(ah<<2)>>2]=L;ag=U}}while(0);L409:do{if(I>>>0<F>>>0){R=(ag|0)==0;G=ag+12|0;S=ag+4|0;V=ag+8|0;W=ag|0;aj=I;while(1){cb(z|0,0,16);ak=aj+D|0;al=e+ak|0;am=bd(al,F-aj|0,j)|0;if((am|0)==0){an=aj}else{if((c[A>>2]|0)==0){break}else{an=aj}}while(1){ao=an+1|0;if(ao>>>0>=F>>>0){ap=0;break}if((a[e+(an+D)|0]|0)==10){ap=1;break}else{an=ao}}L420:do{if(aj>>>0<ao>>>0){aq=ao-aj|0;do{if((ao|0)!=(aj|0)){ar=0;while(1){as=a[e+(ak+ar)|0]|0;if((as<<24>>24|0)==10){au=ar;K=302;break}else if((as<<24>>24|0)!=32){break}as=ar+1|0;if(as>>>0<aq>>>0){ar=as}else{au=as;K=302;break}}if((K|0)==302){K=0;if((au|0)!=-1){break}}if(R){K=708;break L306}ar=c[G>>2]|0;if((ar|0)==0){K=709;break L306}as=c[S>>2]|0;av=as+aq|0;aw=c[V>>2]|0;if(av>>>0>aw>>>0){if(av>>>0>16777216){break L420}ax=aw+ar|0;if(ax>>>0<av>>>0){aw=ax;while(1){ay=aw+ar|0;if(ay>>>0<av>>>0){aw=ay}else{az=ay;break}}}else{az=ax}aw=b4(c[W>>2]|0,az)|0;if((aw|0)==0){break L420}c[W>>2]=aw;c[V>>2]=az;aA=c[S>>2]|0;aC=aw}else{aA=as;aC=c[W>>2]|0}aw=aC+aA|0;ca(aw|0,al|0,aq)|0;c[S>>2]=(c[S>>2]|0)+aq;break L420}}while(0);if(R){K=706;break L306}aq=c[G>>2]|0;if((aq|0)==0){K=707;break L306}aw=c[S>>2]|0;av=aw+1|0;ar=c[V>>2]|0;if(av>>>0>ar>>>0){if(av>>>0>16777216){break}ay=ar+aq|0;if(ay>>>0<av>>>0){ar=ay;while(1){aD=ar+aq|0;if(aD>>>0<av>>>0){ar=aD}else{aE=aD;break}}}else{aE=ay}ar=b4(c[W>>2]|0,aE)|0;if((ar|0)==0){break}c[W>>2]=ar;c[V>>2]=aE;aF=c[S>>2]|0;aG=ar}else{aF=aw;aG=c[W>>2]|0}a[aG+aF|0]=10;c[S>>2]=(c[S>>2]|0)+1}}while(0);if(ap){aj=ao}else{aH=ao;aI=S;break L409}}aH=am+aj|0;aI=S}else{aH=I;aI=ag+4|0}}while(0);I=c[aI>>2]|0;do{if((I|0)!=0){W=ag|0;V=c[W>>2]|0;if((a[V+(I-1)|0]|0)==10){break}if((ag|0)==0){K=710;break L306}G=c[ag+12>>2]|0;if((G|0)==0){K=711;break L306}R=I+1|0;U=ag+8|0;L=c[U>>2]|0;if(R>>>0>L>>>0){if(R>>>0>16777216){break}al=L+G|0;if(al>>>0<R>>>0){L=al;while(1){ak=L+G|0;if(ak>>>0<R>>>0){L=ak}else{aJ=ak;break}}}else{aJ=al}L=b4(V,aJ)|0;if((L|0)==0){break}c[W>>2]=L;c[U>>2]=aJ;aL=c[aI>>2]|0;aM=L}else{aL=I;aM=V}a[aM+aL|0]=10;c[aI>>2]=(c[aI>>2]|0)+1}}while(0);I=c[v>>2]|0;if((I|0)!=0){aR[I&15](b,ag,(c[B>>2]|0)!=0?h:0,c[q>>2]|0)}c[l>>2]=(c[l>>2]|0)-1;if((aH|0)==0){break}Z=aH+D|0;break L359}}while(0);do{if((c[m>>2]&2|0)!=0){I=c[k>>2]|0;do{if(I>>>0<(c[n>>2]|0)>>>0){L=(c[o>>2]|0)+(I<<2)|0;if((c[L>>2]|0)==0){K=345;break}c[k>>2]=I+1;R=c[L>>2]|0;c[R+4>>2]=0;aO=R}else{K=345}}while(0);L482:do{if((K|0)==345){K=0;I=b1(16)|0;R=I;if((I|0)!=0){c[I>>2]=0;c[I+8>>2]=0;c[I+4>>2]=0;c[I+12>>2]=64}L=c[k>>2]|0;G=L<<1;S=c[o>>2]|0;do{if((c[n>>2]|0)>>>0<G>>>0){aj=b4(S,L<<3)|0;ak=aj;if((aj|0)==0){aO=R;break L482}aj=c[n>>2]|0;cb(ak+(aj<<2)|0,0,G-aj<<2|0);c[o>>2]=ak;c[n>>2]=G;aj=c[k>>2]|0;if(aj>>>0<=G>>>0){aP=aj;aQ=ak;break}c[k>>2]=G;aP=G;aQ=ak}else{aP=L;aQ=S}}while(0);c[k>>2]=aP+1;c[aQ+(aP<<2)>>2]=I;aO=R}}while(0);S=c[l>>2]|0;do{if(S>>>0<(c[s>>2]|0)>>>0){L=(c[t>>2]|0)+(S<<2)|0;if((c[L>>2]|0)==0){K=355;break}c[l>>2]=S+1;G=c[L>>2]|0;c[G+4>>2]=0;aS=G}else{K=355}}while(0);L496:do{if((K|0)==355){K=0;S=b1(16)|0;G=S;if((S|0)!=0){c[S>>2]=0;c[S+8>>2]=0;c[S+4>>2]=0;c[S+12>>2]=256}L=c[l>>2]|0;V=L<<1;U=c[t>>2]|0;do{if((c[s>>2]|0)>>>0<V>>>0){W=b4(U,L<<3)|0;al=W;if((W|0)==0){aS=G;break L496}W=c[s>>2]|0;cb(al+(W<<2)|0,0,V-W<<2|0);c[t>>2]=al;c[s>>2]=V;W=c[l>>2]|0;if(W>>>0<=V>>>0){aT=W;aU=al;break}c[l>>2]=V;aT=V;aU=al}else{aT=L;aU=U}}while(0);c[l>>2]=aT+1;c[aU+(aT<<2)>>2]=S;aS=G}}while(0);U=0;L=0;while(1){V=a[e+(L+D)|0]|0;if(V<<24>>24==10){aV=U;aW=L;break}R=L+1|0;I=(V<<24>>24==124&1)+U|0;if(R>>>0<F>>>0){U=I;L=R}else{aV=I;aW=R;break}}do{if((aW|0)==(F|0)|(aV|0)==0){aX=0;aY=0}else{L513:do{if((aW|0)==0){K=367}else{L=aW;while(1){U=L-1|0;aZ=a[e+(U+D)|0]|0;if(!((aZ<<24>>24|0)==32|(aZ<<24>>24|0)==10)){break}if((U|0)==0){K=367;break L513}else{L=U}}a_=((aZ<<24>>24==124)<<31>>31)+aV+(((a[E]|0)==124)<<31>>31)|0;a$=L}}while(0);if((K|0)==367){K=0;a_=(((a[E]|0)==124)<<31>>31)+aV|0;a$=0}G=a_+1|0;S=b3(G,4)|0;U=aW+1|0;if(U>>>0<F>>>0){a0=(a[e+(U+D)|0]|0)==124?aW+2|0:U}else{a0=U}U=a0;while(1){if(U>>>0>=F>>>0){break}if((a[e+(U+D)|0]|0)==10){break}else{U=U+1|0}}L528:do{if((G|0)!=0&a0>>>0<U>>>0){R=a0;I=0;while(1){V=R;while(1){a1=a[e+(V+D)|0]|0;if(V>>>0>=U>>>0){K=380;break}al=V+1|0;if((a1<<24>>24|0)==32){V=al}else if((a1<<24>>24|0)==58){a2=al;K=382;break}else{a3=0;a4=V;break}}do{if((K|0)==380){K=0;if(a1<<24>>24!=58){a3=0;a4=V;break}a2=V+1|0;K=382}}while(0);if((K|0)==382){K=0;V=S+(I<<2)|0;c[V>>2]=c[V>>2]|1;a3=1;a4=a2}L540:do{if(a4>>>0<U>>>0){V=a4;aw=a3;while(1){ay=a[e+(V+D)|0]|0;if((ay<<24>>24|0)==58){break}else if((ay<<24>>24|0)!=45){a5=aw;a6=V;break L540}ay=V+1|0;al=aw+1|0;if(ay>>>0<U>>>0){V=ay;aw=al}else{a5=al;a6=ay;break L540}}as=S+(I<<2)|0;c[as>>2]=c[as>>2]|2;a5=aw+1|0;a6=V+1|0}else{a5=a3;a6=a4}}while(0);as=a6;while(1){if(as>>>0>=U>>>0){K=391;break}a7=a[e+(as+D)|0]|0;a9=as+1|0;if(a7<<24>>24==32){as=a9}else{K=390;break}}if((K|0)==390){K=0;if(a7<<24>>24!=124|a5>>>0<3){be=I;break L528}else{bf=a9}}else if((K|0)==391){K=0;if(a5>>>0<3){be=I;break L528}bf=as+1|0}ax=I+1|0;if(ax>>>0<G>>>0&bf>>>0<U>>>0){R=bf;I=ax}else{be=ax;break}}}else{be=0}}while(0);if(be>>>0<G>>>0){aX=0;aY=S;break}bt(aO,d,E,a$,G,S,4);I=U+1|0;if((I|0)==0){aX=0;aY=S;break}L557:do{if(I>>>0<F>>>0){R=I;while(1){if(R>>>0<F>>>0){bh=R;bi=0}else{bj=R;break L557}while(1){L=a[e+(bh+D)|0]|0;if(L<<24>>24==10){bk=bh;bl=bi;break}ax=bh+1|0;ay=(L<<24>>24==124&1)+bi|0;if(ax>>>0<F>>>0){bh=ax;bi=ay}else{bk=ax;bl=ay;break}}if((bl|0)==0|(bk|0)==(F|0)){bj=R;break L557}bt(aS,d,e+(R+D)|0,bk-R|0,G,S,0);as=bk+1|0;if(as>>>0<F>>>0){R=as}else{bj=as;break}}}else{bj=I}}while(0);I=c[x>>2]|0;if((I|0)==0){aX=bj;aY=S;break}aR[I&15](b,aO,aS,c[q>>2]|0);aX=bj;aY=S}}while(0);b2(aY);c[k>>2]=(c[k>>2]|0)-1;c[l>>2]=(c[l>>2]|0)-1;if((aX|0)==0){break}Z=aX+D|0;break L359}}while(0);I=(a[E]|0)==32&1;if(I>>>0<F>>>0){bm=((a[e+(I+D)|0]|0)==32&1)+I|0}else{bm=I}if(bm>>>0<F>>>0){bn=((a[e+(bm+D)|0]|0)==32&1)+bm|0}else{bn=bm}do{if(bn>>>0<F>>>0){if((a[e+(bn+D)|0]|0)!=62){break}I=bn+1|0;if(I>>>0<F>>>0){bo=(a[e+(I+D)|0]|0)==32?bn+2|0:I}else{bo=I}if((bo|0)==0){break}I=c[l>>2]|0;do{if(I>>>0<(c[s>>2]|0)>>>0){G=(c[t>>2]|0)+(I<<2)|0;if((c[G>>2]|0)==0){K=418;break}c[l>>2]=I+1;U=c[G>>2]|0;c[U+4>>2]=0;bp=U}else{K=418}}while(0);L586:do{if((K|0)==418){K=0;I=b1(16)|0;U=I;if((I|0)!=0){c[I>>2]=0;c[I+8>>2]=0;c[I+4>>2]=0;c[I+12>>2]=256}G=c[l>>2]|0;R=G<<1;as=c[t>>2]|0;do{if((c[s>>2]|0)>>>0<R>>>0){ay=b4(as,G<<3)|0;ax=ay;if((ay|0)==0){bp=U;break L586}ay=c[s>>2]|0;cb(ax+(ay<<2)|0,0,R-ay<<2|0);c[t>>2]=ax;c[s>>2]=R;ay=c[l>>2]|0;if(ay>>>0<=R>>>0){bq=ay;br=ax;break}c[l>>2]=R;bq=R;br=ax}else{bq=G;br=as}}while(0);c[l>>2]=bq+1;c[br+(bq<<2)>>2]=I;bp=U}}while(0);as=0;G=0;R=0;L597:while(1){S=R;while(1){if(S>>>0<F>>>0){bs=S}else{bu=S;break L597}while(1){bv=bs+1|0;if(bv>>>0>=F>>>0){bw=0;break}if((a[e+(bs+D)|0]|0)==10){bw=1;break}else{bs=bv}}ax=S+D|0;ay=bv-S|0;L=(bv|0)==(S|0);if(L){bx=0}else{bx=(a[e+ax|0]|0)==32&1}if(bx>>>0<ay>>>0){by=((a[e+(bx+ax)|0]|0)==32&1)+bx|0}else{by=bx}if(by>>>0<ay>>>0){bz=((a[e+(by+ax)|0]|0)==32&1)+by|0}else{bz=by}do{if(bz>>>0<ay>>>0){if((a[e+(bz+ax)|0]|0)!=62){K=442;break}al=bz+1|0;if(al>>>0<ay>>>0){bA=(a[e+(al+ax)|0]|0)==32?bz+2|0:al}else{bA=al}if((bA|0)==0){K=442;break}bB=bA+S|0;bC=bv}else{K=442}}while(0);L621:do{if((K|0)==442){K=0;if(!L){al=0;while(1){W=a[e+(al+ax)|0]|0;if((W<<24>>24|0)==10){bD=al;break}else if((W<<24>>24|0)!=32){bB=S;bC=bv;break L621}W=al+1|0;if(W>>>0<ay>>>0){al=W}else{bD=W;break}}if((bD|0)==-1){bB=S;bC=bv;break}}if(!bw){bu=bv;break L597}al=bv+D|0;W=F-bv|0;ak=(F|0)==(bv|0);if(ak){bE=0}else{bE=(a[e+al|0]|0)==32&1}if(bE>>>0<W>>>0){bF=((a[e+(bE+al)|0]|0)==32&1)+bE|0}else{bF=bE}if(bF>>>0<W>>>0){bG=((a[e+(bF+al)|0]|0)==32&1)+bF|0}else{bG=bF}do{if(bG>>>0<W>>>0){if((a[e+(bG+al)|0]|0)!=62){K=458;break}aj=bG+1|0;if(aj>>>0<W>>>0){bH=(a[e+(aj+al)|0]|0)==32?bG+2|0:aj}else{bH=aj}if((bH|0)!=0|ak){bB=S;bC=bv;break L621}else{bI=0}}else{K=458}}while(0);if((K|0)==458){K=0;if(ak){bB=S;bC=F;break}else{bI=0}}while(1){aj=a[e+(bI+al)|0]|0;if((aj<<24>>24|0)==10){bJ=bI;break}else if((aj<<24>>24|0)!=32){bu=bv;break L597}aj=bI+1|0;if(aj>>>0<W>>>0){bI=aj}else{bJ=aj;break}}if((bJ|0)==-1){bu=bv;break L597}else{bB=S;bC=bv}}}while(0);if(bB>>>0<bv>>>0){break}else{S=bC}}S=e+(bB+D)|0;do{if((as|0)==0){bK=S}else{U=as+G|0;if((S|0)==(U|0)){bK=as;break}cd(U|0,S|0,bC-bB|0);bK=as}}while(0);as=bK;G=bC+G-bB|0;R=bC}a8(bp,d,as,G);R=c[u>>2]|0;if((R|0)!=0){aN[R&15](b,bp,c[q>>2]|0)}c[l>>2]=(c[l>>2]|0)-1;Z=bu+D|0;break L359}}while(0);do{if(F>>>0>3){if((a[E]|0)!=32){break}R=D+1|0;if((a[e+R|0]|0)!=32){break}S=D+2|0;if((a[e+S|0]|0)!=32){break}U=D+3|0;if((a[e+U|0]|0)!=32){break}I=c[l>>2]|0;do{if(I>>>0<(c[s>>2]|0)>>>0){ay=(c[t>>2]|0)+(I<<2)|0;if((c[ay>>2]|0)==0){K=478;break}c[l>>2]=I+1;ax=c[ay>>2]|0;c[ax+4>>2]=0;bL=ax}else{K=478}}while(0);L671:do{if((K|0)==478){K=0;I=b1(16)|0;G=I;if((I|0)!=0){c[I>>2]=0;c[I+8>>2]=0;c[I+4>>2]=0;c[I+12>>2]=256}as=c[l>>2]|0;ax=as<<1;ay=c[t>>2]|0;do{if((c[s>>2]|0)>>>0<ax>>>0){L=b4(ay,as<<3)|0;W=L;if((L|0)==0){bL=G;break L671}L=c[s>>2]|0;cb(W+(L<<2)|0,0,ax-L<<2|0);c[t>>2]=W;c[s>>2]=ax;L=c[l>>2]|0;if(L>>>0<=ax>>>0){bM=L;bN=W;break}c[l>>2]=ax;bM=ax;bN=W}else{bM=as;bN=ay}}while(0);c[l>>2]=bM+1;c[bN+(bM<<2)>>2]=I;bL=G}}while(0);ay=(bL|0)==0;as=bL+12|0;ax=bL+4|0;W=bL+8|0;L=bL|0;al=0;L682:while(1){ak=al;while(1){bO=ak+1|0;if(bO>>>0>=F>>>0){bP=0;break}if((a[e+(ak+D)|0]|0)==10){bP=1;break}else{ak=bO}}ak=bO-al|0;do{if(ak>>>0>3){G=al+D|0;if((a[e+G|0]|0)!=32){bQ=G;K=497;break}if((a[e+(R+al)|0]|0)!=32){bQ=G;K=497;break}if((a[e+(S+al)|0]|0)!=32){bQ=G;K=497;break}if((a[e+(U+al)|0]|0)!=32){bQ=G;K=497;break}bR=al+4|0}else{if((bO|0)==(al|0)){bR=al;break}bQ=al+D|0;K=497}}while(0);if((K|0)==497){K=0;G=0;while(1){I=a[e+(bQ+G)|0]|0;if((I<<24>>24|0)==10){bS=G;break}else if((I<<24>>24|0)!=32){bT=al;break L682}I=G+1|0;if(I>>>0<ak>>>0){G=I}else{bS=I;break}}if((bS|0)==-1){bT=al;break}else{bR=al}}L703:do{if(bR>>>0<bO>>>0){G=bR+D|0;ak=e+G|0;I=bO-bR|0;do{if((bO|0)!=(bR|0)){aj=0;while(1){ar=a[e+(G+aj)|0]|0;if((ar<<24>>24|0)==10){bU=aj;K=508;break}else if((ar<<24>>24|0)!=32){break}ar=aj+1|0;if(ar>>>0<I>>>0){aj=ar}else{bU=ar;K=508;break}}if((K|0)==508){K=0;if((bU|0)!=-1){break}}if(ay){K=714;break L306}aj=c[as>>2]|0;if((aj|0)==0){K=715;break L306}ar=c[ax>>2]|0;av=ar+I|0;aq=c[W>>2]|0;if(av>>>0>aq>>>0){if(av>>>0>16777216){break L703}aD=aq+aj|0;if(aD>>>0<av>>>0){aq=aD;while(1){bV=aq+aj|0;if(bV>>>0<av>>>0){aq=bV}else{bW=bV;break}}}else{bW=aD}aq=b4(c[L>>2]|0,bW)|0;if((aq|0)==0){break L703}c[L>>2]=aq;c[W>>2]=bW;bX=c[ax>>2]|0;bY=aq}else{bX=ar;bY=c[L>>2]|0}aq=bY+bX|0;ca(aq|0,ak|0,I)|0;c[ax>>2]=(c[ax>>2]|0)+I;break L703}}while(0);if(ay){K=712;break L306}I=c[as>>2]|0;if((I|0)==0){K=713;break L306}ak=c[ax>>2]|0;G=ak+1|0;aq=c[W>>2]|0;if(G>>>0>aq>>>0){if(G>>>0>16777216){break}av=aq+I|0;if(av>>>0<G>>>0){aq=av;while(1){aj=aq+I|0;if(aj>>>0<G>>>0){aq=aj}else{bZ=aj;break}}}else{bZ=av}aq=b4(c[L>>2]|0,bZ)|0;if((aq|0)==0){break}c[L>>2]=aq;c[W>>2]=bZ;b_=c[ax>>2]|0;b$=aq}else{b_=ak;b$=c[L>>2]|0}a[b$+b_|0]=10;c[ax>>2]=(c[ax>>2]|0)+1}}while(0);if(bP){al=bO}else{bT=bO;break}}al=c[ax>>2]|0;L739:do{if((al|0)==0){b0=0}else{L=c[bL>>2]|0;W=al;while(1){as=W-1|0;if((a[L+as|0]|0)!=10){b0=W;break L739}c[ax>>2]=as;if((as|0)==0){break}else{W=as}}if((bL|0)==0){K=716;break L306}else{b0=0}}}while(0);al=c[bL+12>>2]|0;if((al|0)==0){K=717;break L306}W=b0+1|0;L=bL+8|0;as=c[L>>2]|0;do{if(W>>>0>as>>>0){if(W>>>0>16777216){break}ay=as+al|0;if(ay>>>0<W>>>0){U=ay;while(1){S=U+al|0;if(S>>>0<W>>>0){U=S}else{b5=S;break}}}else{b5=ay}U=bL|0;S=b4(c[U>>2]|0,b5)|0;if((S|0)==0){break}c[U>>2]=S;c[L>>2]=b5;b6=c[ax>>2]|0;b7=S;K=543}else{b6=b0;b7=c[bL>>2]|0;K=543}}while(0);if((K|0)==543){K=0;a[b7+b6|0]=10;c[ax>>2]=(c[ax>>2]|0)+1}L=c[v>>2]|0;if((L|0)!=0){aR[L&15](b,bL,0,c[q>>2]|0)}c[l>>2]=(c[l>>2]|0)-1;Z=bT+D|0;break L359}}while(0);L=(a[E]|0)==32&1;if(L>>>0<F>>>0){b8=((a[e+(L+D)|0]|0)==32&1)+L|0}else{b8=L}if(b8>>>0<F>>>0){b9=((a[e+(b8+D)|0]|0)==32&1)+b8|0}else{b9=b8}L=b9+1|0;L769:do{if(L>>>0<F>>>0){W=b9+D|0;al=a[e+W|0]|0;if(!((al<<24>>24|0)==42|(al<<24>>24|0)==43|(al<<24>>24|0)==45)){break}if((a[e+(L+D)|0]|0)!=32){break}al=F-b9|0;as=0;while(1){if(as>>>0>=al>>>0){K=556;break}S=as+1|0;if((a[e+(as+W)|0]|0)==10){cc=S;break}else{as=S}}if((K|0)==556){K=0;cc=as+1|0}do{if(cc>>>0<al>>>0){ax=cc+W|0;S=al-cc|0;U=a[e+ax|0]|0;if((U<<24>>24|0)==61){R=1;while(1){if(R>>>0>=S>>>0){ce=R;break}if((a[e+(ax+R)|0]|0)==61){R=R+1|0}else{ce=R;break}}while(1){if(ce>>>0>=S>>>0){break L769}cf=a[e+(ax+ce)|0]|0;if(cf<<24>>24==32){ce=ce+1|0}else{break}}cg=cf<<24>>24==10&1;break}else if((U<<24>>24|0)==45){R=1;while(1){if(R>>>0>=S>>>0){ch=R;break}if((a[e+(ax+R)|0]|0)==45){R=R+1|0}else{ch=R;break}}while(1){if(ch>>>0>=S>>>0){break L769}ci=a[e+(ax+ch)|0]|0;if(ci<<24>>24==32){ch=ch+1|0}else{break}}cg=ci<<24>>24==10?2:0;break}else{cg=0;break}}else{cg=0}}while(0);if((b9|0)==-2|(cg|0)!=0){break}Z=(bb(b,d,E,F,0)|0)+D|0;break L359}}while(0);if((bc(E,F)|0)!=0){Z=(bb(b,d,E,F,1)|0)+D|0;break L359}L=D+1|0;al=D+2|0;W=0;L802:while(1){as=W;while(1){cj=as+1|0;if(cj>>>0>=F>>>0){ck=0;break}if((a[e+(as+D)|0]|0)==10){ck=1;break}else{as=cj}}as=W+D|0;ax=e+as|0;S=F-W|0;if((W|0)==(F|0)){cl=cj;cm=0;cn=F;break}else{co=0}while(1){R=a[e+(as+co)|0]|0;if((R<<24>>24|0)==10){cp=co;K=581;break}else if((R<<24>>24|0)!=32){break}R=co+1|0;if(R>>>0<S>>>0){co=R}else{cp=R;K=581;break}}if((K|0)==581){K=0;if((cp|0)!=-1){cl=cj;cm=0;cn=W;break}}R=a[ax]|0;if((R<<24>>24|0)==61){U=1;while(1){if(U>>>0>=S>>>0){cq=U;break}if((a[e+(as+U)|0]|0)==61){U=U+1|0}else{cq=U;break}}while(1){if(cq>>>0>=S>>>0){cl=cj;cm=1;cn=W;break L802}cr=a[e+(as+cq)|0]|0;if(cr<<24>>24==32){cq=cq+1|0}else{break}}cs=cr<<24>>24==10&1;K=593}else if((R<<24>>24|0)==45){U=1;while(1){if(U>>>0>=S>>>0){ct=U;break}if((a[e+(as+U)|0]|0)==45){U=U+1|0}else{ct=U;break}}while(1){if(ct>>>0>=S>>>0){cl=cj;cm=2;cn=W;break L802}cu=a[e+(as+ct)|0]|0;if(cu<<24>>24==32){ct=ct+1|0}else{break}}cs=cu<<24>>24==10?2:0;K=593}else if((R<<24>>24|0)==35){K=595}if((K|0)==593){K=0;if((cs|0)!=0){cl=cj;cm=cs;cn=W;break}if(R<<24>>24==35){K=595}}if((K|0)==595){K=0;if((c[m>>2]&64|0)==0){cl=W;cm=0;cn=W;break}else{cv=0}while(1){cw=cv>>>0<S>>>0;if(!(cw&cv>>>0<6)){K=598;break}U=a[e+(as+cv)|0]|0;if(U<<24>>24==35){cv=cv+1|0}else{cx=U;break}}if((K|0)==598){K=0;if(!cw){cl=W;cm=0;cn=W;break}cx=a[e+(as+cv)|0]|0}if(cx<<24>>24==32){cl=W;cm=0;cn=W;break}}L842:do{if(S>>>0>=3){do{if(R<<24>>24==32){if((a[e+(L+W)|0]|0)!=32){cy=1;break}cy=(a[e+(al+W)|0]|0)==32?3:2}else{cy=0}}while(0);if((cy+2|0)>>>0>=S>>>0){break}U=a[e+(as+cy)|0]|0;if(!((U<<24>>24|0)==42|(U<<24>>24|0)==45|(U<<24>>24|0)==95)){break}if(cy>>>0<S>>>0){cz=U;cA=0;cB=cy}else{break}while(1){if(cz<<24>>24==U<<24>>24){cC=cA+1|0}else{if(cz<<24>>24==32){cC=cA}else{break L842}}ay=cB+1|0;if(ay>>>0>=S>>>0){break}aq=a[e+(as+ay)|0]|0;if(aq<<24>>24==10){break}else{cz=aq;cA=cC;cB=ay}}if(cC>>>0>2){cl=W;cm=0;cn=W;break L802}}}while(0);U=R<<24>>24==32&1;if(U>>>0<S>>>0){cD=((a[e+(as+U)|0]|0)==32&1)+U|0}else{cD=U}if(cD>>>0<S>>>0){cE=((a[e+(as+cD)|0]|0)==32&1)+cD|0}else{cE=cD}do{if(cE>>>0<S>>>0){if((a[e+(as+cE)|0]|0)!=62){break}U=cE+1|0;if(U>>>0<S>>>0){cF=(a[e+(as+U)|0]|0)==32?cE+2|0:U}else{cF=U}if((cF|0)!=0){cl=W;cm=0;cn=W;break L802}}}while(0);do{if((c[m>>2]&256|0)!=0){if((at(R&255|0)|0)!=0){break}if((bc(ax,S)|0)!=0){cl=W;cm=0;cn=W;break L802}U=a[ax]|0;ay=U<<24>>24==32&1;if(ay>>>0<S>>>0){cG=((a[e+(as+ay)|0]|0)==32&1)+ay|0}else{cG=ay}if(cG>>>0<S>>>0){cH=((a[e+(as+cG)|0]|0)==32&1)+cG|0}else{cH=cG}ay=cH+1|0;L882:do{if(ay>>>0<S>>>0){aq=cH+W|0;G=aq+D|0;I=a[e+G|0]|0;if(!((I<<24>>24|0)==42|(I<<24>>24|0)==43|(I<<24>>24|0)==45)){break}if((a[e+(as+ay)|0]|0)!=32){break}I=S-cH|0;aj=0;while(1){if(aj>>>0>=I>>>0){K=635;break}bV=aj+1|0;if((a[e+(G+aj)|0]|0)==10){cI=bV;break}else{aj=bV}}if((K|0)==635){K=0;cI=aj+1|0}do{if(cI>>>0<I>>>0){G=cI+aq+D|0;ak=I-cI|0;av=a[e+G|0]|0;if((av<<24>>24|0)==61){bV=1;while(1){if(bV>>>0>=ak>>>0){cJ=bV;break}if((a[e+(G+bV)|0]|0)==61){bV=bV+1|0}else{cJ=bV;break}}while(1){if(cJ>>>0>=ak>>>0){break L882}cK=a[e+(G+cJ)|0]|0;if(cK<<24>>24==32){cJ=cJ+1|0}else{break}}cL=cK<<24>>24==10&1;break}else if((av<<24>>24|0)==45){bV=1;while(1){if(bV>>>0>=ak>>>0){cM=bV;break}if((a[e+(G+bV)|0]|0)==45){bV=bV+1|0}else{cM=bV;break}}while(1){if(cM>>>0>=ak>>>0){break L882}cN=a[e+(G+cM)|0]|0;if(cN<<24>>24==32){cM=cM+1|0}else{break}}cL=cN<<24>>24==10?2:0;break}else{cL=0;break}}else{cL=0}}while(0);if(!((cH|0)==-2|(cL|0)!=0)){cl=W;cm=0;cn=W;break L802}}}while(0);do{if(U<<24>>24==60){if((c[r>>2]|0)==0){break}if((ba(b,d,ax,S,0)|0)!=0){cl=W;cm=0;cn=W;break L802}}}while(0);if((c[m>>2]&4|0)==0){break}U=(bd(ax,S,0)|0)!=0;ay=U?W:cj;if(U|ck^1){cl=ay;cm=0;cn=ay;break L802}else{W=cj;continue L802}}}while(0);if(ck){W=cj}else{cl=cj;cm=0;cn=cj;break}}W=cn;while(1){if((W|0)==0){cO=0;cP=0;break}al=W-1|0;if((a[e+(al+D)|0]|0)==10){W=al}else{cO=W;cP=1;break}}if((cm|0)==0){W=c[l>>2]|0;do{if(W>>>0<(c[s>>2]|0)>>>0){al=(c[t>>2]|0)+(W<<2)|0;if((c[al>>2]|0)==0){K=663;break}c[l>>2]=W+1;L=c[al>>2]|0;c[L+4>>2]=0;cQ=L}else{K=663}}while(0);L927:do{if((K|0)==663){K=0;W=b1(16)|0;L=W;if((W|0)!=0){c[W>>2]=0;c[W+8>>2]=0;c[W+4>>2]=0;c[W+12>>2]=256}al=c[l>>2]|0;S=al<<1;ax=c[t>>2]|0;do{if((c[s>>2]|0)>>>0<S>>>0){as=b4(ax,al<<3)|0;R=as;if((as|0)==0){cQ=L;break L927}as=c[s>>2]|0;cb(R+(as<<2)|0,0,S-as<<2|0);c[t>>2]=R;c[s>>2]=S;as=c[l>>2]|0;if(as>>>0<=S>>>0){cR=as;cS=R;break}c[l>>2]=S;cR=S;cS=R}else{cR=al;cS=ax}}while(0);c[l>>2]=cR+1;c[cS+(cR<<2)>>2]=W;cQ=L}}while(0);bg(cQ,d,E,cO);ax=c[w>>2]|0;if((ax|0)!=0){aN[ax&15](b,cQ,c[q>>2]|0)}c[l>>2]=(c[l>>2]|0)-1}else{L942:do{if(cP){ax=cO;while(1){al=ax-1|0;if((al|0)==0){cT=0;break}if((a[e+(al+D)|0]|0)==10){cT=al;break}else{ax=al}}while(1){if((cT|0)==0){cU=cO;cV=E;break L942}L=cT-1|0;if((a[e+(L+D)|0]|0)==10){cT=L}else{break}}L=c[l>>2]|0;do{if(L>>>0<(c[s>>2]|0)>>>0){W=(c[t>>2]|0)+(L<<2)|0;if((c[W>>2]|0)==0){K=681;break}c[l>>2]=L+1;al=c[W>>2]|0;c[al+4>>2]=0;cW=al}else{K=681}}while(0);L953:do{if((K|0)==681){K=0;L=b1(16)|0;al=L;if((L|0)!=0){c[L>>2]=0;c[L+8>>2]=0;c[L+4>>2]=0;c[L+12>>2]=256}W=c[l>>2]|0;S=W<<1;R=c[t>>2]|0;do{if((c[s>>2]|0)>>>0<S>>>0){as=b4(R,W<<3)|0;ay=as;if((as|0)==0){cW=al;break L953}as=c[s>>2]|0;cb(ay+(as<<2)|0,0,S-as<<2|0);c[t>>2]=ay;c[s>>2]=S;as=c[l>>2]|0;if(as>>>0<=S>>>0){cX=as;cY=ay;break}c[l>>2]=S;cX=S;cY=ay}else{cX=W;cY=R}}while(0);c[l>>2]=cX+1;c[cY+(cX<<2)>>2]=L;cW=al}}while(0);bg(cW,d,E,cT);R=c[w>>2]|0;if((R|0)!=0){aN[R&15](b,cW,c[q>>2]|0)}c[l>>2]=(c[l>>2]|0)-1;cU=cO-ax|0;cV=e+(ax+D)|0}else{cU=0;cV=E}}while(0);R=c[k>>2]|0;do{if(R>>>0<(c[n>>2]|0)>>>0){W=(c[o>>2]|0)+(R<<2)|0;if((c[W>>2]|0)==0){K=694;break}c[k>>2]=R+1;S=c[W>>2]|0;c[S+4>>2]=0;cZ=S}else{K=694}}while(0);L971:do{if((K|0)==694){K=0;R=b1(16)|0;S=R;if((R|0)!=0){c[R>>2]=0;c[R+8>>2]=0;c[R+4>>2]=0;c[R+12>>2]=64}W=c[k>>2]|0;ay=W<<1;as=c[o>>2]|0;do{if((c[n>>2]|0)>>>0<ay>>>0){U=b4(as,W<<3)|0;I=U;if((U|0)==0){cZ=S;break L971}U=c[n>>2]|0;cb(I+(U<<2)|0,0,ay-U<<2|0);c[o>>2]=I;c[n>>2]=ay;U=c[k>>2]|0;if(U>>>0<=ay>>>0){c_=U;c$=I;break}c[k>>2]=ay;c_=ay;c$=I}else{c_=W;c$=as}}while(0);c[k>>2]=c_+1;c[c$+(c_<<2)>>2]=R;cZ=S}}while(0);bg(cZ,d,cV,cU);as=c[p>>2]|0;if((as|0)!=0){aR[as&15](b,cZ,cm,c[q>>2]|0)}c[k>>2]=(c[k>>2]|0)-1}Z=cl+D|0;break L359}}while(0);Z=_+D|0}}while(0);if(Z>>>0<f>>>0){D=Z}else{K=719;break}}if((K|0)==706){aB(1144,178,2288,1656)}else if((K|0)==707){aB(1144,178,2288,1656)}else if((K|0)==708){aB(1144,157,2296,1656)}else if((K|0)==709){aB(1144,157,2296,1656)}else if((K|0)==710){aB(1144,178,2288,1656)}else if((K|0)==711){aB(1144,178,2288,1656)}else if((K|0)==712){aB(1144,178,2288,1656)}else if((K|0)==713){aB(1144,178,2288,1656)}else if((K|0)==714){aB(1144,157,2296,1656)}else if((K|0)==715){aB(1144,157,2296,1656)}else if((K|0)==716){aB(1144,178,2288,1656)}else if((K|0)==717){aB(1144,178,2288,1656)}else if((K|0)==719){i=g;return}}function a9(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0;b=a+412|0;d=a+420|0;e=c[d>>2]|0;if((e|0)!=0){f=b|0;g=0;h=e;while(1){e=c[(c[f>>2]|0)+(g<<2)>>2]|0;if((e|0)==0){i=h}else{b2(c[e>>2]|0);b2(e);i=c[d>>2]|0}e=g+1|0;if(e>>>0<i>>>0){g=e;h=i}else{break}}}i=a+400|0;h=a+408|0;g=c[h>>2]|0;if((g|0)!=0){f=i|0;e=0;j=g;while(1){g=c[(c[f>>2]|0)+(e<<2)>>2]|0;if((g|0)==0){k=j}else{b2(c[g>>2]|0);b2(g);k=c[h>>2]|0}g=e+1|0;if(g>>>0<k>>>0){e=g;j=k}else{break}}}do{if((b|0)==0){if((i|0)!=0){break}l=a;b2(l);return}else{k=b|0;b2(c[k>>2]|0);c[k>>2]=0;c[a+416>>2]=0;c[d>>2]=0}}while(0);d=i|0;b2(c[d>>2]|0);c[d>>2]=0;c[a+404>>2]=0;c[h>>2]=0;l=a;b2(l);return}function ba(b,e,f,g,h){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;j=i;i=i+16|0;k=j|0;c[k>>2]=f;l=k+4|0;c[l>>2]=0;c[k+8>>2]=0;c[k+12>>2]=0;L1026:do{if(g>>>0<2){m=0}else{if((a[f]|0)==60&g>>>0>1){n=1}else{m=0;break}while(1){o=a[f+n|0]|0;if((o<<24>>24|0)==62|(o<<24>>24|0)==32){p=741;break}o=n+1|0;if(o>>>0<g>>>0){n=o}else{break}}do{if((p|0)==741){o=f+1|0;q=n-1|0;if(!(q>>>0<11&(q|0)!=0)){break}if((q|0)==1){r=1}else{r=(d[(d[f+2|0]|0)+225|0]|0)+q|0}s=a[o]|0;t=(d[224+(s&255)|0]|0)+r|0;if(t>>>0>=38){break}u=c[488+(t<<2)>>2]|0;if(((a[u]^s)&-33)<<24>>24!=0){break}if((b9(o|0,u|0,q|0)|0)!=0){break}if((a[u+q|0]|0)!=0){break}q=bu(u,f,g,1)|0;if((q|0)==0){if((aG(u|0,1464)|0)==0){m=0;break L1026}if((aG(u|0,720)|0)==0){m=0;break L1026}o=bu(u,f,g,0)|0;if((o|0)==0){m=0;break L1026}else{v=o}}else{v=q}c[l>>2]=v;if((h|0)==0){m=v;break L1026}q=c[e+8>>2]|0;if((q|0)==0){m=v;break L1026}aN[q&15](b,k,c[e+108>>2]|0);m=v;break L1026}}while(0);L1049:do{if(g>>>0>5){if((a[f+1|0]|0)!=33){break}if((a[f+2|0]|0)!=45){break}if((a[f+3|0]|0)==45){w=5}else{break}L1053:while(1){do{if((a[f+(w-2)|0]|0)==45){if((a[f+(w-1)|0]|0)!=45){p=754;break}q=w+1|0;if((a[f+w|0]|0)==62){x=q;break L1053}else{y=q}}else{p=754}}while(0);if((p|0)==754){p=0;y=w+1|0}if(y>>>0<g>>>0){w=y}else{p=757;break}}if((p|0)==757){x=y+1|0}if(x>>>0>=g>>>0){break}q=g-x|0;if((x|0)==(g|0)){z=1}else{o=0;while(1){u=a[f+(o+x)|0]|0;if((u<<24>>24|0)==10){A=o;break}else if((u<<24>>24|0)!=32){break L1049}u=o+1|0;if(u>>>0<q>>>0){o=u}else{A=u;break}}o=A+1|0;if((o|0)==0){break}else{z=o}}o=z+x|0;c[l>>2]=o;if((h|0)==0){m=o;break L1026}q=c[e+8>>2]|0;if((q|0)==0){m=o;break L1026}aN[q&15](b,k,c[e+108>>2]|0);m=c[l>>2]|0;break L1026}}while(0);if(g>>>0<=4){m=0;break}q=a[f+1|0]|0;if(!((q<<24>>24|0)==104|(q<<24>>24|0)==72)){m=0;break}q=a[f+2|0]|0;if((q<<24>>24|0)==114|(q<<24>>24|0)==82){B=3}else{m=0;break}while(1){if(B>>>0>=g>>>0){p=770;break}q=B+1|0;if((a[f+B|0]|0)==62){C=q;break}else{B=q}}if((p|0)==770){C=B+1|0}if(C>>>0>=g>>>0){m=0;break}q=g-C|0;if((C|0)==(g|0)){D=1}else{o=0;while(1){u=a[f+(o+C)|0]|0;if((u<<24>>24|0)==10){E=o;break}else if((u<<24>>24|0)!=32){m=0;break L1026}u=o+1|0;if(u>>>0<q>>>0){o=u}else{E=u;break}}o=E+1|0;if((o|0)==0){m=0;break}else{D=o}}o=D+C|0;c[l>>2]=o;if((h|0)==0){m=o;break}q=c[e+8>>2]|0;if((q|0)==0){m=o;break}aN[q&15](b,k,c[e+108>>2]|0);m=c[l>>2]|0}}while(0);i=j;return m|0}function bb(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0,aM=0,aN=0,aO=0,aP=0,aQ=0,aS=0,aT=0,aU=0,aV=0,aW=0,aX=0,aY=0,aZ=0,a_=0,a$=0,a0=0;h=d+400|0;i=d+404|0;j=c[i>>2]|0;k=d+408|0;do{if(j>>>0<(c[k>>2]|0)>>>0){l=(c[h>>2]|0)+(j<<2)|0;if((c[l>>2]|0)==0){m=791;break}c[i>>2]=j+1;n=c[l>>2]|0;c[n+4>>2]=0;o=n}else{m=791}}while(0);L1096:do{if((m|0)==791){j=b1(16)|0;n=j;if((j|0)!=0){c[j>>2]=0;c[j+8>>2]=0;c[j+4>>2]=0;c[j+12>>2]=256}l=c[i>>2]|0;p=l<<1;q=h|0;r=c[q>>2]|0;do{if((c[k>>2]|0)>>>0<p>>>0){s=b4(r,l<<3)|0;t=s;if((s|0)==0){o=n;break L1096}s=c[k>>2]|0;cb(t+(s<<2)|0,0,p-s<<2|0);c[q>>2]=t;c[k>>2]=p;s=c[i>>2]|0;if(s>>>0<=p>>>0){u=s;v=t;break}c[i>>2]=p;u=p;v=t}else{u=l;v=r}}while(0);c[i>>2]=u+1;c[v+(u<<2)>>2]=j;o=n}}while(0);u=d+416|0;v=d+420|0;k=d+412|0;h=d+24|0;r=d+108|0;l=d+424|0;p=0;q=g;L1107:while(1){if(p>>>0>=f>>>0){w=p;x=q;m=966;break}g=e+p|0;t=f-p|0;s=0;while(1){if(!(s>>>0<3&s>>>0<t>>>0)){break}if((a[e+(s+p)|0]|0)==32){s=s+1|0}else{break}}if((p|0)==(f|0)){y=0}else{y=(a[g]|0)==32&1}if(y>>>0<t>>>0){z=((a[e+(y+p)|0]|0)==32&1)+y|0}else{z=y}if(z>>>0<t>>>0){A=((a[e+(z+p)|0]|0)==32&1)+z|0}else{A=z}n=A+1|0;L1123:do{if(n>>>0<t>>>0){j=A+p|0;B=a[e+j|0]|0;if(!((B<<24>>24|0)==42|(B<<24>>24|0)==43|(B<<24>>24|0)==45)){m=829;break}if((a[e+(n+p)|0]|0)!=32){m=829;break}B=t-A|0;C=0;while(1){if(C>>>0>=B>>>0){m=814;break}D=C+1|0;if((a[e+(C+j)|0]|0)==10){E=D;break}else{C=D}}if((m|0)==814){m=0;E=C+1|0}do{if(E>>>0<B>>>0){D=E+j|0;F=B-E|0;G=a[e+D|0]|0;if((G<<24>>24|0)==61){H=1;while(1){if(H>>>0>=F>>>0){I=H;break}if((a[e+(D+H)|0]|0)==61){H=H+1|0}else{I=H;break}}while(1){if(I>>>0>=F>>>0){m=829;break L1123}J=a[e+(D+I)|0]|0;if(J<<24>>24==32){I=I+1|0}else{break}}K=J<<24>>24==10&1;break}else if((G<<24>>24|0)==45){H=1;while(1){if(H>>>0>=F>>>0){L=H;break}if((a[e+(D+H)|0]|0)==45){H=H+1|0}else{L=H;break}}while(1){if(L>>>0>=F>>>0){m=829;break L1123}M=a[e+(D+L)|0]|0;if(M<<24>>24==32){L=L+1|0}else{break}}K=M<<24>>24==10?2:0;break}else{K=0;break}}else{K=0}}while(0);B=(K|0)==0?A+2|0:0;if((B|0)==0){m=829}else{N=B}}else{m=829}}while(0);if((m|0)==829){m=0;n=bc(g,t)|0;if((n|0)==0){w=p;x=q;m=966;break}else{N=n}}n=p-1|0;B=N;while(1){O=B>>>0<t>>>0;if(!O){break}if((a[e+(n+B)|0]|0)==10){break}else{B=B+1|0}}n=c[u>>2]|0;do{if(n>>>0<(c[v>>2]|0)>>>0){g=(c[k>>2]|0)+(n<<2)|0;if((c[g>>2]|0)==0){m=836;break}c[u>>2]=n+1;j=c[g>>2]|0;c[j+4>>2]=0;P=j}else{m=836}}while(0);L1161:do{if((m|0)==836){m=0;n=b1(16)|0;j=n;if((n|0)!=0){c[n>>2]=0;c[n+8>>2]=0;c[n+4>>2]=0;c[n+12>>2]=64}g=c[u>>2]|0;C=g<<1;D=c[k>>2]|0;do{if((c[v>>2]|0)>>>0<C>>>0){F=b4(D,g<<3)|0;H=F;if((F|0)==0){P=j;break L1161}F=c[v>>2]|0;cb(H+(F<<2)|0,0,C-F<<2|0);c[k>>2]=H;c[v>>2]=C;F=c[u>>2]|0;if(F>>>0<=C>>>0){Q=F;R=H;break}c[u>>2]=C;Q=C;R=H}else{Q=g;R=D}}while(0);c[u>>2]=Q+1;c[R+(Q<<2)>>2]=n;P=j}}while(0);D=c[u>>2]|0;do{if(D>>>0<(c[v>>2]|0)>>>0){g=(c[k>>2]|0)+(D<<2)|0;if((c[g>>2]|0)==0){m=846;break}c[u>>2]=D+1;C=c[g>>2]|0;c[C+4>>2]=0;S=C}else{m=846}}while(0);L1175:do{if((m|0)==846){m=0;D=b1(16)|0;C=D;if((D|0)!=0){c[D>>2]=0;c[D+8>>2]=0;c[D+4>>2]=0;c[D+12>>2]=64}g=c[u>>2]|0;H=g<<1;F=c[k>>2]|0;do{if((c[v>>2]|0)>>>0<H>>>0){G=b4(F,g<<3)|0;T=G;if((G|0)==0){S=C;break L1175}G=c[v>>2]|0;cb(T+(G<<2)|0,0,H-G<<2|0);c[k>>2]=T;c[v>>2]=H;G=c[u>>2]|0;if(G>>>0<=H>>>0){U=G;V=T;break}c[u>>2]=H;U=H;V=T}else{U=g;V=F}}while(0);c[u>>2]=U+1;c[V+(U<<2)>>2]=D;S=C}}while(0);F=e+(N+p)|0;g=B-N|0;if((P|0)==0){m=972;break}H=P+12|0;j=c[H>>2]|0;if((j|0)==0){m=971;break}n=P+4|0;T=c[n>>2]|0;G=T+g|0;W=P+8|0;X=c[W>>2]|0;do{if(G>>>0>X>>>0){if(G>>>0>16777216){break}Y=X+j|0;if(Y>>>0<G>>>0){Z=Y;while(1){_=Z+j|0;if(_>>>0<G>>>0){Z=_}else{$=_;break}}}else{$=Y}Z=P|0;C=b4(c[Z>>2]|0,$)|0;if((C|0)==0){break}c[Z>>2]=C;c[W>>2]=$;aa=c[n>>2]|0;ab=C;m=863}else{aa=T;ab=c[P>>2]|0;m=863}}while(0);if((m|0)==863){m=0;T=ab+aa|0;ca(T|0,F|0,g)|0;c[n>>2]=(c[n>>2]|0)+g}L1200:do{if(O){T=q&1;G=(T|0)==0;j=(T|0)!=0;T=P|0;X=B;C=0;Z=0;D=0;L1202:while(1){ac=X;_=0;L1204:while(1){ad=ac;while(1){ae=ad+1|0;af=ae>>>0<t>>>0;if(!af){break}if((a[e+(ad+p)|0]|0)==10){break}else{ad=ae}}ag=ac+p|0;ah=ae-ac|0;if((ae|0)==(ac|0)){ai=ac}else{ad=0;while(1){aj=a[e+(ag+ad)|0]|0;if((aj<<24>>24|0)==10){ak=ad;break}else if((aj<<24>>24|0)!=32){al=0;break L1204}aj=ad+1|0;if(aj>>>0<ah>>>0){ad=aj}else{ak=aj;break}}if((ak|0)==-1){al=0;break}else{ai=ae}}if(af){ac=ai;_=1}else{am=Z;an=q;ao=ai;ap=C;break L1200}}while(1){if(al>>>0>=4){break}ad=al+ac|0;if(ad>>>0>=ae>>>0){break}if((a[e+(ad+p)|0]|0)==32){al=al+1|0}else{break}}do{if((c[l>>2]&4|0)==0){aq=D}else{if((bd(e+(ag+al)|0,ah-al|0,0)|0)==0){aq=D;break}aq=(D|0)==0&1}}while(0);if((aq|0)==0){ad=ag+al|0;aj=e+ad|0;ar=ah-al|0;if((ah|0)==(al|0)){as=0}else{as=(a[aj]|0)==32&1}if(as>>>0<ar>>>0){at=((a[e+(as+ad)|0]|0)==32&1)+as|0}else{at=as}if(at>>>0<ar>>>0){au=((a[e+(at+ad)|0]|0)==32&1)+at|0}else{au=at}av=au+1|0;do{if(av>>>0<ar>>>0){aw=au+ad|0;ax=a[e+aw|0]|0;if(!((ax<<24>>24|0)==42|(ax<<24>>24|0)==43|(ax<<24>>24|0)==45)){ay=0;break}if((a[e+(av+ad)|0]|0)!=32){ay=0;break}ax=ar-au|0;az=0;while(1){if(az>>>0>=ax>>>0){m=893;break}aA=az+1|0;if((a[e+(az+aw)|0]|0)==10){aC=aA;break}else{az=aA}}if((m|0)==893){m=0;aC=az+1|0}L1246:do{if(aC>>>0<ax>>>0){aA=aC+aw|0;aD=ax-aC|0;aE=a[e+aA|0]|0;if((aE<<24>>24|0)==61){aF=1;while(1){if(aF>>>0>=aD>>>0){aG=aF;break}if((a[e+(aA+aF)|0]|0)==61){aF=aF+1|0}else{aG=aF;break}}while(1){if(aG>>>0>=aD>>>0){aH=1;break L1246}aI=a[e+(aA+aG)|0]|0;if(aI<<24>>24==32){aG=aG+1|0}else{break}}aH=aI<<24>>24==10&1;break}else if((aE<<24>>24|0)==45){aF=1;while(1){if(aF>>>0>=aD>>>0){aJ=aF;break}if((a[e+(aA+aF)|0]|0)==45){aF=aF+1|0}else{aJ=aF;break}}while(1){if(aJ>>>0>=aD>>>0){aH=2;break L1246}aK=a[e+(aA+aJ)|0]|0;if(aK<<24>>24==32){aJ=aJ+1|0}else{break}}aH=aK<<24>>24==10?2:0;break}else{aH=0;break}}else{aH=0}}while(0);ay=(aH|0)==0?au+2|0:0}else{ay=0}}while(0);aL=bc(aj,ar)|0;aM=ay}else{aL=0;aM=0}ad=(_|0)!=0;if(ad){if(!(G|(aM|0)==0)){m=912;break}if(!(j|(aL|0)==0)){m=912;break}}L1270:do{if((aM|0)==0){if((aL|0)==0){m=931}else{m=928}}else{av=ag+al|0;ax=ah-al|0;if(ax>>>0<3){m=928;break}do{if((a[e+av|0]|0)==32){if((a[e+(av+1)|0]|0)!=32){aN=1;break}aN=(a[e+(av+2)|0]|0)==32?3:2}else{aN=0}}while(0);if((aN+2|0)>>>0>=ax>>>0){m=928;break}aw=a[e+(aN+av)|0]|0;if(!((aw<<24>>24|0)==42|(aw<<24>>24|0)==45|(aw<<24>>24|0)==95)){m=928;break}if(aN>>>0<ax>>>0){aO=aw;aP=0;aQ=aN}else{m=928;break}while(1){if(aO<<24>>24==aw<<24>>24){aS=aP+1|0}else{if(aO<<24>>24==32){aS=aP}else{m=928;break L1270}}az=aQ+1|0;if(az>>>0>=ax>>>0){break}aA=a[e+(az+av)|0]|0;if(aA<<24>>24==10){break}else{aO=aA;aP=aS;aQ=az}}if(aS>>>0>2&(aL|0)==0){m=931}else{m=928}}}while(0);do{if((m|0)==928){m=0;_=ad?1:Z;if((al|0)==(s|0)){am=_;an=q;ao=ac;ap=C;break L1200}if((C|0)!=0){aT=_;aU=C;break}aT=_;aU=c[n>>2]|0}else if((m|0)==931){m=0;if(ad&(al|0)==0){m=932;break L1202}if(!ad){aT=Z;aU=C;break}_=c[H>>2]|0;if((_|0)==0){m=935;break L1107}ar=c[n>>2]|0;aj=ar+1|0;av=c[W>>2]|0;if(aj>>>0>av>>>0){if(aj>>>0>16777216){aT=1;aU=C;break}ax=av+_|0;if(ax>>>0<aj>>>0){av=ax;while(1){aw=av+_|0;if(aw>>>0<aj>>>0){av=aw}else{aV=aw;break}}}else{aV=ax}av=b4(c[T>>2]|0,aV)|0;if((av|0)==0){aT=1;aU=C;break}c[T>>2]=av;c[W>>2]=aV;aW=c[n>>2]|0;aX=av}else{aW=ar;aX=c[T>>2]|0}a[aX+aW|0]=10;c[n>>2]=(c[n>>2]|0)+1;aT=1;aU=C}}while(0);ad=e+(ag+al)|0;av=ah-al|0;aj=c[H>>2]|0;if((aj|0)==0){m=945;break L1107}_=c[n>>2]|0;aw=_+av|0;az=c[W>>2]|0;do{if(aw>>>0>az>>>0){if(aw>>>0>16777216){break}aA=az+aj|0;if(aA>>>0<aw>>>0){aD=aA;while(1){aF=aD+aj|0;if(aF>>>0<aw>>>0){aD=aF}else{aY=aF;break}}}else{aY=aA}aD=b4(c[T>>2]|0,aY)|0;if((aD|0)==0){break}c[T>>2]=aD;c[W>>2]=aY;aZ=c[n>>2]|0;a_=aD;m=953}else{aZ=_;a_=c[T>>2]|0;m=953}}while(0);if((m|0)==953){m=0;_=a_+aZ|0;ca(_|0,ad|0,av)|0;c[n>>2]=(c[n>>2]|0)+av}if(af){X=ae;C=aU;Z=aT;D=aq}else{am=aT;an=q;ao=ae;ap=aU;break L1200}}if((m|0)==912){m=0;am=Z;an=q|8;ao=ac;ap=C;break}else if((m|0)==932){m=0;am=Z;an=q|8;ao=ac;ap=C;break}}else{am=0;an=q;ao=B;ap=0}}while(0);B=(am|0)==0?an:an|2;W=c[n>>2]|0;H=(ap|0)!=0&ap>>>0<W>>>0;s=P|0;t=c[s>>2]|0;do{if((B&2|0)==0){if(H){bg(S,d,t,ap);a8(S,d,(c[s>>2]|0)+ap|0,(c[n>>2]|0)-ap|0);break}else{bg(S,d,t,W);break}}else{if(H){a8(S,d,t,ap);a8(S,d,(c[s>>2]|0)+ap|0,(c[n>>2]|0)-ap|0);break}else{a8(S,d,t,W);break}}}while(0);W=c[h>>2]|0;if((W|0)!=0){aR[W&15](o,S,B,c[r>>2]|0)}c[u>>2]=(c[u>>2]|0)-2;W=ao+p|0;if((ao|0)==0){w=W;x=B;m=966;break}if((B&8|0)==0){p=W;q=B}else{w=W;x=B;m=966;break}}if((m|0)==966){q=c[d+20>>2]|0;if((q|0)==0){a$=c[i>>2]|0;a0=a$-1|0;c[i>>2]=a0;return w|0}aR[q&15](b,o,x,c[r>>2]|0);a$=c[i>>2]|0;a0=a$-1|0;c[i>>2]=a0;return w|0}else if((m|0)==971){aB(1144,157,2296,1656);return 0}else if((m|0)==972){aB(1144,157,2296,1656);return 0}else if((m|0)==935){aB(1144,178,2288,1656);return 0}else if((m|0)==945){aB(1144,157,2296,1656);return 0}return 0}function bc(b,c){b=b|0;c=c|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;if((c|0)==0){d=0}else{d=(a[b]|0)==32&1}if(d>>>0<c>>>0){e=((a[b+d|0]|0)==32&1)+d|0}else{e=d}if(e>>>0<c>>>0){f=((a[b+e|0]|0)==32&1)+e|0}else{f=e}if(f>>>0>=c>>>0){return 0}if(((a[b+f|0]|0)-48&255)>9){return 0}else{g=f}while(1){if(g>>>0>=c>>>0){h=982;break}f=g+1|0;if(((a[b+g|0]|0)-48&255)<10){g=f}else{i=f;break}}if((h|0)==982){i=g+1|0}if(i>>>0>=c>>>0){return 0}if((a[b+g|0]|0)!=46){return 0}if((a[b+i|0]|0)!=32){return 0}i=c-g|0;c=0;while(1){if(c>>>0>=i>>>0){h=989;break}f=c+1|0;if((a[b+(c+g)|0]|0)==10){j=f;break}else{c=f}}if((h|0)==989){j=c+1|0}if(j>>>0>=i>>>0){k=0;l=(k|0)==0;m=g+2|0;n=l?m:0;return n|0}c=j+g|0;f=i-j|0;j=a[b+c|0]|0;if((j<<24>>24|0)==61){i=1;while(1){if(i>>>0>=f>>>0){o=i;break}if((a[b+(c+i)|0]|0)==61){i=i+1|0}else{o=i;break}}while(1){if(o>>>0>=f>>>0){k=1;h=1007;break}p=a[b+(c+o)|0]|0;if(p<<24>>24==32){o=o+1|0}else{break}}if((h|0)==1007){l=(k|0)==0;m=g+2|0;n=l?m:0;return n|0}k=p<<24>>24==10&1;l=(k|0)==0;m=g+2|0;n=l?m:0;return n|0}else if((j<<24>>24|0)==45){j=1;while(1){if(j>>>0>=f>>>0){q=j;break}if((a[b+(c+j)|0]|0)==45){j=j+1|0}else{q=j;break}}while(1){if(q>>>0>=f>>>0){k=2;h=1009;break}r=a[b+(c+q)|0]|0;if(r<<24>>24==32){q=q+1|0}else{break}}if((h|0)==1009){l=(k|0)==0;m=g+2|0;n=l?m:0;return n|0}k=r<<24>>24==10?2:0;l=(k|0)==0;m=g+2|0;n=l?m:0;return n|0}else{k=0;l=(k|0)==0;m=g+2|0;n=l?m:0;return n|0}return 0}function bd(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;if(d>>>0<3){f=0;return f|0}do{if((a[b]|0)==32){if((a[b+1|0]|0)!=32){g=1;break}g=(a[b+2|0]|0)==32?3:2}else{g=0}}while(0);if((g+2|0)>>>0>=d>>>0){f=0;return f|0}h=a[b+g|0]|0;if(!((h<<24>>24|0)==126|(h<<24>>24|0)==96)){f=0;return f|0}if(g>>>0<d>>>0){i=0;j=g}else{f=0;return f|0}do{i=i+1|0;j=j+1|0;if(j>>>0>=d>>>0){break}}while((a[b+j|0]|0)==h<<24>>24);h=i>>>0<3?0:j;if((h|0)==0){f=0;return f|0}else{k=h}while(1){l=k>>>0<d>>>0;m=b+k|0;if(!l){n=m;o=0;p=k;break}h=a[m]|0;q=k+1|0;if((h<<24>>24|0)==32){k=q}else if((h<<24>>24|0)==123){r=1029;break}else{r=1027;break}}L1434:do{if((r|0)==1027){if(l){s=k;t=0}else{n=m;o=0;p=k;break}while(1){h=a[b+s|0]|0;if((h<<24>>24|0)==32|(h<<24>>24|0)==10){n=m;o=t;p=s;break L1434}h=t+1|0;j=s+1|0;if(j>>>0<d>>>0){s=j;t=h}else{n=m;o=h;p=j;break}}}else if((r|0)==1029){j=b+q|0;L1440:do{if(q>>>0<d>>>0){h=k;i=0;g=q;while(1){u=a[b+g|0]|0;if((u<<24>>24|0)==125|(u<<24>>24|0)==10){v=h;w=i;x=g;break L1440}u=i+1|0;y=g+1|0;if(y>>>0<d>>>0){h=g;i=u;g=y}else{v=g;w=u;x=y;break}}}else{v=k;w=0;x=q}}while(0);if((x|0)==(d|0)){f=0;return f|0}if((a[b+x|0]|0)!=125){f=0;return f|0}L1451:do{if((w|0)==0){z=0;A=j}else{g=w;i=j;while(1){h=a[i]|0;if(!((h<<24>>24|0)==32|(h<<24>>24|0)==10)){break}h=i+1|0;y=g-1|0;if((y|0)==0){z=0;A=h;break L1451}else{g=y;i=h}}if((g|0)==0){z=0;A=i;break}else{B=g}while(1){h=B-1|0;y=a[i+h|0]|0;if(!((y<<24>>24|0)==32|(y<<24>>24|0)==10)){z=B;A=i;break L1451}if((h|0)==0){z=0;A=i;break}else{B=h}}}}while(0);n=A;o=z;p=v+2|0}}while(0);if((e|0)!=0){c[e>>2]=n;c[e+4>>2]=o}L1464:do{if(p>>>0<d>>>0){o=p;while(1){e=a[b+o|0]|0;if((e<<24>>24|0)==10){C=o;break L1464}else if((e<<24>>24|0)!=32){f=0;break}e=o+1|0;if(e>>>0<d>>>0){o=e}else{C=e;break L1464}}return f|0}else{C=p}}while(0);f=C+1|0;return f|0}function be(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0;h=a[e]|0;do{if((c[d+424>>2]&1|0)==0|(f|0)==0){i=1062}else{j=a[e-1|0]|0;if((j<<24>>24|0)==32|(j<<24>>24|0)==10){i=1062;break}if(j<<24>>24==62&g>>>0>2){break}else{k=0}return k|0}}while(0);do{if((i|0)==1062){if(g>>>0>2){break}else{k=0}return k|0}}while(0);f=e+1|0;j=a[f]|0;if(j<<24>>24!=h<<24>>24){if(h<<24>>24==126|j<<24>>24==32|j<<24>>24==10){k=0;return k|0}else{j=bp(b,d,f,g-1|0,h)|0;return((j|0)==0?0:j+1|0)|0}}if(g>>>0<=3){k=0;return k|0}j=e+2|0;l=a[j]|0;if(l<<24>>24!=h<<24>>24){if((l<<24>>24|0)==32|(l<<24>>24|0)==10){k=0;return k|0}l=bs(b,d,j,g-2|0,h)|0;k=(l|0)==0?0:l+2|0;return k|0}if(g>>>0<=4){k=0;return k|0}l=e+2|0;if((a[l]|0)!=h<<24>>24){k=0;return k|0}j=e+3|0;m=a[j]|0;if(m<<24>>24==h<<24>>24|h<<24>>24==126|m<<24>>24==32|m<<24>>24==10){k=0;return k|0}m=g-3|0;L1505:do{if((m|0)==0){n=0}else{o=0;while(1){p=br(e+(o+3)|0,m-o|0,h)|0;if((p|0)==0){n=0;break L1505}q=p+o|0;r=q+3|0;if((a[e+r|0]|0)==h<<24>>24){s=q+2|0;p=a[e+s|0]|0;if(!((p<<24>>24|0)==32|(p<<24>>24|0)==10)){break}}if(q>>>0<m>>>0){o=q}else{n=0;break L1505}}o=q+1|0;do{if(s>>>0<m>>>0){if((a[e+(q+4)|0]|0)!=h<<24>>24){break}if((a[e+(q+5)|0]|0)!=h<<24>>24){break}p=d+76|0;if((c[p>>2]|0)==0){break}t=d+412|0;u=d+416|0;v=c[u>>2]|0;w=d+420|0;do{if(v>>>0<(c[w>>2]|0)>>>0){x=(c[t>>2]|0)+(v<<2)|0;if((c[x>>2]|0)==0){i=1085;break}c[u>>2]=v+1;y=c[x>>2]|0;c[y+4>>2]=0;z=y}else{i=1085}}while(0);L1521:do{if((i|0)==1085){v=b1(16)|0;y=v;if((v|0)!=0){c[v>>2]=0;c[v+8>>2]=0;c[v+4>>2]=0;c[v+12>>2]=64}x=c[u>>2]|0;A=x<<1;B=t|0;C=c[B>>2]|0;do{if((c[w>>2]|0)>>>0<A>>>0){D=b4(C,x<<3)|0;E=D;if((D|0)==0){z=y;break L1521}D=c[w>>2]|0;cb(E+(D<<2)|0,0,A-D<<2|0);c[B>>2]=E;c[w>>2]=A;D=c[u>>2]|0;if(D>>>0<=A>>>0){F=D;G=E;break}c[u>>2]=A;F=A;G=E}else{F=x;G=C}}while(0);c[u>>2]=F+1;c[G+(F<<2)>>2]=v;z=y}}while(0);bg(z,d,j,q);w=aM[c[p>>2]&31](b,z,c[d+108>>2]|0)|0;c[u>>2]=(c[u>>2]|0)-1;n=(w|0)==0?0:r;break L1505}}while(0);do{if(o>>>0<m>>>0){if((a[e+(q+4)|0]|0)!=h<<24>>24){break}w=bp(b,d,f,g-1|0,h)|0;n=(w|0)==0?0:w-2|0;break L1505}}while(0);o=bs(b,d,l,g-2|0,h)|0;n=(o|0)==0?0:o-1|0}}while(0);k=(n|0)==0?0:n+3|0;return k|0}function bf(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;f=i;i=i+16|0;h=f|0;j=0;while(1){k=j>>>0<g>>>0;if(!k){l=j;m=0;n=0;o=1115;break}if((a[e+j|0]|0)==96){j=j+1|0}else{o=1112;break}}L1543:do{if((o|0)==1112){if(k&(j|0)!=0){p=j;q=1}else{r=j;break}while(1){s=(a[e+p|0]|0)==96?q:0;t=p+1|0;u=t>>>0<g>>>0;if(!(u&s>>>0<j>>>0)){l=t;m=s;n=u;o=1115;break L1543}p=t;q=s+1|0}}}while(0);do{if((o|0)==1115){if(m>>>0>=j>>>0|n){r=l;break}else{v=0}i=f;return v|0}}while(0);l=j;while(1){if(l>>>0>=r>>>0){break}if((a[e+l|0]|0)==32){l=l+1|0}else{break}}n=r-j|0;while(1){if(n>>>0<=j>>>0){break}m=n-1|0;if((a[e+m|0]|0)==32){n=m}else{break}}if(l>>>0>=n>>>0){j=(aM[c[d+48>>2]&31](b,0,c[d+108>>2]|0)|0)==0?0:r;i=f;return j|0}c[h>>2]=e+l;c[h+4>>2]=n-l;c[h+8>>2]=0;c[h+12>>2]=0;v=(aM[c[d+48>>2]&31](b,h,c[d+108>>2]|0)|0)==0?0:r;i=f;return v|0}function bg(b,e,f,g){b=b|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;h=i;i=i+16|0;j=h|0;cb(j|0,0,16);if(((c[e+404>>2]|0)+(c[e+416>>2]|0)|0)>>>0>(c[e+428>>2]|0)>>>0|(g|0)==0){i=h;return}k=e+96|0;l=(b|0)==0;m=b+12|0;n=b+4|0;o=b+8|0;p=b|0;q=j|0;r=j+4|0;s=e+108|0;t=0;u=0;v=0;L1568:while(1){w=v;x=u;while(1){if(x>>>0>=g>>>0){y=w;z=0;break}A=a[(d[f+x|0]|0)+(e+144)|0]|0;if(A<<24>>24==0){w=0;x=x+1|0}else{y=A;z=1;break}}w=c[k>>2]|0;A=f+t|0;do{if((w|0)==0){B=x-t|0;if(l){C=1149;break L1568}D=c[m>>2]|0;if((D|0)==0){C=1150;break L1568}E=c[n>>2]|0;F=E+B|0;G=c[o>>2]|0;if(F>>>0>G>>>0){if(F>>>0>16777216){break}H=G+D|0;if(H>>>0<F>>>0){G=H;while(1){I=G+D|0;if(I>>>0<F>>>0){G=I}else{J=I;break}}}else{J=H}G=b4(c[p>>2]|0,J)|0;if((G|0)==0){break}c[p>>2]=G;c[o>>2]=J;K=c[n>>2]|0;L=G}else{K=E;L=c[p>>2]|0}G=L+K|0;ca(G|0,A|0,B)|0;c[n>>2]=(c[n>>2]|0)+B}else{c[q>>2]=A;c[r>>2]=x-t;aN[w&15](b,j,c[s>>2]|0)}}while(0);if(!z){C=1152;break}w=aL[c[152+((y&255)<<2)>>2]&31](b,e,f+x|0,x,g-x|0)|0;A=w+x|0;if(A>>>0<g>>>0){t=A;u=(w|0)==0?x+1|0:A;v=y}else{C=1153;break}}if((C|0)==1150){aB(1144,157,2296,1656)}else if((C|0)==1152){i=h;return}else if((C|0)==1153){i=h;return}else if((C|0)==1149){aB(1144,157,2296,1656)}}function bh(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0;if(f>>>0<2){h=0;return h|0}if((a[e-1|0]|0)!=32){h=0;return h|0}if((a[e-2|0]|0)!=32){h=0;return h|0}e=b+4|0;f=c[e>>2]|0;L1606:do{if((f|0)!=0){g=c[b>>2]|0;i=f;do{i=i-1|0;if((a[g+i|0]|0)!=32){break L1606}c[e>>2]=i;}while((i|0)!=0)}}while(0);h=(aQ[c[d+64>>2]&3](b,c[d+108>>2]|0)|0)!=0&1;return h|0}function bi(b,e,f,g,h){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,aq=0,ar=0,as=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aC=0,aD=0,aE=0,aF=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aM=0,aN=0,aO=0,aP=0,aQ=0,aR=0,aS=0,aT=0,aU=0,aV=0,aW=0,aX=0,aY=0,aZ=0,a_=0,a$=0,a0=0,a1=0,a2=0,a3=0,a4=0,a5=0,a6=0,a7=0,a8=0,a9=0,ba=0,bb=0,bc=0,bd=0,be=0,bf=0,bh=0,bi=0;do{if((g|0)==0){i=e+416|0;j=i;k=c[i>>2]|0;l=1171}else{i=e+416|0;m=c[i>>2]|0;if((a[f-1|0]|0)!=33){j=i;k=m;l=1171;break}if((c[e+60>>2]|0)==0){n=1;o=0;p=i;q=m}else{r=1;s=i;t=m;break}c[p>>2]=q;u=(o|0)!=0;v=u?n:0;return v|0}}while(0);do{if((l|0)==1171){if((c[e+68>>2]|0)==0){n=1;o=0;p=j;q=k}else{r=0;s=j;t=k;break}c[p>>2]=q;u=(o|0)!=0;v=u?n:0;return v|0}}while(0);if(h>>>0>1){w=0;x=1;y=1}else{n=1;o=0;p=s;q=t;c[p>>2]=q;u=(o|0)!=0;v=u?n:0;return v|0}L1625:while(1){k=a[f+x|0]|0;do{if(k<<24>>24==10){z=y;A=1}else{B=x-1|0;if((a[f+B|0]|0)==92){z=y;A=w;break}if((k<<24>>24|0)==91){z=y+1|0;A=w;break}else if((k<<24>>24|0)==93){j=y-1|0;if((j|0)<1){break L1625}else{z=j;A=w;break}}else{z=y;A=w;break}}}while(0);k=x+1|0;if(k>>>0<h>>>0){w=A;x=k;y=z}else{n=k;o=0;p=s;q=t;l=1446;break}}if((l|0)==1446){c[p>>2]=q;u=(o|0)!=0;v=u?n:0;return v|0}z=x+1|0;L1637:do{if(z>>>0<h>>>0){y=z;while(1){A=a[f+y|0]|0;if((A<<24>>24|0)==40){break}else if((A<<24>>24|0)==91){l=1255;break}else if(!((A<<24>>24|0)==32|(A<<24>>24|0)==10)){C=y;l=1307;break L1637}A=y+1|0;if(A>>>0<h>>>0){y=A}else{C=A;l=1307;break L1637}}if((l|0)==1255){A=y+1|0;k=A;while(1){if(k>>>0>=h>>>0){n=k;o=0;p=s;q=t;l=1448;break}D=k+1|0;if((a[f+k|0]|0)==93){break}else{k=D}}if((l|0)==1448){c[p>>2]=q;u=(o|0)!=0;v=u?n:0;return v|0}do{if((A|0)==(k|0)){if((w|0)==0){E=f+1|0;F=B;break}j=e+412|0;g=e+420|0;do{if(t>>>0<(c[g>>2]|0)>>>0){m=(c[j>>2]|0)+(t<<2)|0;if((c[m>>2]|0)==0){l=1263;break}c[s>>2]=t+1;i=c[m>>2]|0;c[i+4>>2]=0;G=i}else{l=1263}}while(0);L1658:do{if((l|0)==1263){i=b1(16)|0;m=i;if((i|0)!=0){c[i>>2]=0;c[i+8>>2]=0;c[i+4>>2]=0;c[i+12>>2]=64}H=c[s>>2]|0;I=H<<1;J=j|0;K=c[J>>2]|0;do{if((c[g>>2]|0)>>>0<I>>>0){L=b4(K,H<<3)|0;M=L;if((L|0)==0){G=m;break L1658}L=c[g>>2]|0;cb(M+(L<<2)|0,0,I-L<<2|0);c[J>>2]=M;c[g>>2]=I;L=c[s>>2]|0;if(L>>>0<=I>>>0){N=L;O=M;break}c[s>>2]=I;N=I;O=M}else{N=H;O=K}}while(0);c[s>>2]=N+1;c[O+(N<<2)>>2]=i;G=m}}while(0);L1669:do{if(x>>>0>1){g=(G|0)==0;j=G+12|0;K=G+4|0;H=G+8|0;I=G|0;J=1;L1672:while(1){M=a[f+J|0]|0;do{if(M<<24>>24==10){if((a[f+(J-1)|0]|0)==32){break}if(g){l=1429;break L1672}L=c[j>>2]|0;if((L|0)==0){l=1430;break L1672}P=c[K>>2]|0;Q=P+1|0;R=c[H>>2]|0;if(Q>>>0>R>>>0){if(Q>>>0>16777216){break}S=R+L|0;if(S>>>0<Q>>>0){R=S;while(1){T=R+L|0;if(T>>>0<Q>>>0){R=T}else{U=T;break}}}else{U=S}R=b4(c[I>>2]|0,U)|0;if((R|0)==0){break}c[I>>2]=R;c[H>>2]=U;V=c[K>>2]|0;W=R}else{V=P;W=c[I>>2]|0}a[W+V|0]=32;c[K>>2]=(c[K>>2]|0)+1}else{if(g){l=1427;break L1672}R=c[j>>2]|0;if((R|0)==0){l=1428;break L1672}Q=c[K>>2]|0;L=Q+1|0;T=c[H>>2]|0;if(L>>>0>T>>>0){if(L>>>0>16777216){break}X=T+R|0;if(X>>>0<L>>>0){T=X;while(1){Y=T+R|0;if(Y>>>0<L>>>0){T=Y}else{Z=Y;break}}}else{Z=X}T=b4(c[I>>2]|0,Z)|0;if((T|0)==0){break}c[I>>2]=T;c[H>>2]=Z;_=c[K>>2]|0;$=T}else{_=Q;$=c[I>>2]|0}a[$+_|0]=M;c[K>>2]=(c[K>>2]|0)+1}}while(0);M=J+1|0;if(M>>>0<x>>>0){J=M}else{aa=I;ab=K;break L1669}}if((l|0)==1427){aB(1144,178,2288,1656);return 0}else if((l|0)==1428){aB(1144,178,2288,1656);return 0}else if((l|0)==1429){aB(1144,178,2288,1656);return 0}else if((l|0)==1430){aB(1144,178,2288,1656);return 0}}else{aa=G|0;ab=G+4|0}}while(0);E=c[aa>>2]|0;F=c[ab>>2]|0}else{E=f+A|0;F=k-A|0}}while(0);if((F|0)==0){ac=0}else{A=0;K=0;while(1){I=(b8(d[E+A|0]|0)|0)-K+(K*65600&-1)|0;J=A+1|0;if(J>>>0<F>>>0){A=J;K=I}else{ac=I;break}}}K=e+112+((ac&7)<<2)|0;while(1){ad=c[K>>2]|0;if((ad|0)==0){n=k;o=0;p=s;q=t;l=1438;break}if((c[ad>>2]|0)==(ac|0)){l=1306;break}else{K=ad+12|0}}if((l|0)==1306){ae=D;af=c[ad+8>>2]|0;ag=c[ad+4>>2]|0;break}else if((l|0)==1438){c[p>>2]=q;u=(o|0)!=0;v=u?n:0;return v|0}}K=y+1|0;L1721:do{if(K>>>0<h>>>0){k=y;A=K;while(1){I=a[f+A|0]|0;if(!((I<<24>>24|0)==32|(I<<24>>24|0)==10)){ah=k;ai=A;break L1721}I=A+1|0;if(I>>>0<h>>>0){k=A;A=I}else{ah=A;ai=I;break}}}else{ah=y;ai=K}}while(0);if(ai>>>0<h>>>0){aj=ai}else{n=ai;o=0;p=s;q=t;c[p>>2]=q;u=(o|0)!=0;v=u?n:0;return v|0}L1728:while(1){ak=a[f+aj|0]|0;if((ak<<24>>24|0)==41){al=aj;am=aj;an=0;ao=0;break}else if((ak<<24>>24|0)==92){ap=aj+2|0}else{do{if((aj|0)!=0){K=a[f+(aj-1)|0]|0;if(!((K<<24>>24|0)==32|(K<<24>>24|0)==10)){break}if((ak<<24>>24|0)==39|(ak<<24>>24|0)==34){l=1193;break L1728}}}while(0);ap=aj+1|0}if(ap>>>0<h>>>0){aj=ap}else{n=ap;o=0;p=s;q=t;l=1445;break}}if((l|0)==1445){c[p>>2]=q;u=(o|0)!=0;v=u?n:0;return v|0}do{if((l|0)==1193){K=aj+1|0;if(K>>>0<h>>>0){aq=0;ar=K}else{n=K;o=0;p=s;q=t;c[p>>2]=q;u=(o|0)!=0;v=u?n:0;return v|0}L1744:while(1){as=ar;while(1){y=a[f+as|0]|0;if(y<<24>>24==92){at=as+2|0}else{if(y<<24>>24==ak<<24>>24){break}if(y<<24>>24==41&aq){l=1202;break L1744}at=as+1|0}if(at>>>0<h>>>0){as=at}else{n=at;o=0;p=s;q=t;l=1447;break L1744}}y=as+1|0;if(y>>>0<h>>>0){aq=1;ar=y}else{n=y;o=0;p=s;q=t;l=1443;break}}if((l|0)==1443){c[p>>2]=q;u=(o|0)!=0;v=u?n:0;return v|0}else if((l|0)==1447){c[p>>2]=q;u=(o|0)!=0;v=u?n:0;return v|0}else if((l|0)==1202){y=as-1|0;L1759:do{if(y>>>0>K>>>0){A=y;while(1){k=a[f+A|0]|0;if(!((k<<24>>24|0)==32|(k<<24>>24|0)==10)){au=A;break L1759}k=A-1|0;if(k>>>0>K>>>0){A=k}else{au=k;break}}}else{au=y}}while(0);y=a[f+au|0]|0;if((y<<24>>24|0)==39|(y<<24>>24|0)==34){al=as;am=aj;an=K;ao=au;break}al=as;am=as;an=0;ao=0;break}}}while(0);L1766:do{if(am>>>0>ai>>>0){y=am;while(1){A=y-1|0;k=a[f+A|0]|0;if(!((k<<24>>24|0)==32|(k<<24>>24|0)==10)){av=y;break L1766}if(A>>>0>ai>>>0){y=A}else{av=A;break}}}else{av=am}}while(0);y=(a[f+ai|0]|0)==60?ah+2|0:ai;K=av-1|0;A=(a[f+K|0]|0)==62?K:av;do{if(A>>>0>y>>>0){K=e+412|0;k=e+420|0;do{if(t>>>0<(c[k>>2]|0)>>>0){I=(c[K>>2]|0)+(t<<2)|0;if((c[I>>2]|0)==0){l=1214;break}c[s>>2]=t+1;J=c[I>>2]|0;c[J+4>>2]=0;aw=J}else{l=1214}}while(0);L1776:do{if((l|0)==1214){J=b1(16)|0;I=J;if((J|0)!=0){c[J>>2]=0;c[J+8>>2]=0;c[J+4>>2]=0;c[J+12>>2]=64}H=c[s>>2]|0;j=H<<1;g=K|0;m=c[g>>2]|0;do{if((c[k>>2]|0)>>>0<j>>>0){i=b4(m,H<<3)|0;M=i;if((i|0)==0){aw=I;break L1776}i=c[k>>2]|0;cb(M+(i<<2)|0,0,j-i<<2|0);c[g>>2]=M;c[k>>2]=j;i=c[s>>2]|0;if(i>>>0<=j>>>0){ax=i;ay=M;break}c[s>>2]=j;ax=j;ay=M}else{ax=H;ay=m}}while(0);c[s>>2]=ax+1;c[ay+(ax<<2)>>2]=J;aw=I}}while(0);k=f+y|0;K=A-y|0;if((aw|0)==0){aB(1144,157,2296,1656);return 0}m=c[aw+12>>2]|0;if((m|0)==0){aB(1144,157,2296,1656);return 0}H=aw+4|0;j=c[H>>2]|0;g=j+K|0;M=aw+8|0;i=c[M>>2]|0;if(g>>>0>i>>>0){if(g>>>0>16777216){az=aw;break}T=i+m|0;if(T>>>0<g>>>0){i=T;while(1){L=i+m|0;if(L>>>0<g>>>0){i=L}else{aA=L;break}}}else{aA=T}i=aw|0;g=b4(c[i>>2]|0,aA)|0;if((g|0)==0){az=aw;break}c[i>>2]=g;c[M>>2]=aA;aC=c[H>>2]|0;aD=g}else{aC=j;aD=c[aw>>2]|0}g=aD+aC|0;ca(g|0,k|0,K)|0;c[H>>2]=(c[H>>2]|0)+K;az=aw}else{az=0}}while(0);do{if(ao>>>0>an>>>0){y=e+412|0;A=c[s>>2]|0;g=e+420|0;do{if(A>>>0<(c[g>>2]|0)>>>0){i=(c[y>>2]|0)+(A<<2)|0;if((c[i>>2]|0)==0){l=1236;break}c[s>>2]=A+1;m=c[i>>2]|0;c[m+4>>2]=0;aE=m}else{l=1236}}while(0);L1809:do{if((l|0)==1236){A=b1(16)|0;K=A;if((A|0)!=0){c[A>>2]=0;c[A+8>>2]=0;c[A+4>>2]=0;c[A+12>>2]=64}H=c[s>>2]|0;k=H<<1;j=y|0;M=c[j>>2]|0;do{if((c[g>>2]|0)>>>0<k>>>0){T=b4(M,H<<3)|0;m=T;if((T|0)==0){aE=K;break L1809}T=c[g>>2]|0;cb(m+(T<<2)|0,0,k-T<<2|0);c[j>>2]=m;c[g>>2]=k;T=c[s>>2]|0;if(T>>>0<=k>>>0){aF=T;aG=m;break}c[s>>2]=k;aF=k;aG=m}else{aF=H;aG=M}}while(0);c[s>>2]=aF+1;c[aG+(aF<<2)>>2]=A;aE=K}}while(0);g=f+an|0;y=ao-an|0;if((aE|0)==0){aB(1144,157,2296,1656);return 0}M=c[aE+12>>2]|0;if((M|0)==0){aB(1144,157,2296,1656);return 0}H=aE+4|0;k=c[H>>2]|0;j=k+y|0;I=aE+8|0;J=c[I>>2]|0;if(j>>>0>J>>>0){if(j>>>0>16777216){aH=aE;break}m=J+M|0;if(m>>>0<j>>>0){J=m;while(1){T=J+M|0;if(T>>>0<j>>>0){J=T}else{aI=T;break}}}else{aI=m}J=aE|0;j=b4(c[J>>2]|0,aI)|0;if((j|0)==0){aH=aE;break}c[J>>2]=j;c[I>>2]=aI;aJ=c[H>>2]|0;aK=j}else{aJ=k;aK=c[aE>>2]|0}j=aK+aJ|0;ca(j|0,g|0,y)|0;c[H>>2]=(c[H>>2]|0)+y;aH=aE}else{aH=0}}while(0);ae=al+1|0;af=aH;ag=az}else{C=z;l=1307}}while(0);do{if((l|0)==1307){if((w|0)==0){aM=f+1|0;aN=B}else{az=e+412|0;aH=e+420|0;do{if(t>>>0<(c[aH>>2]|0)>>>0){al=(c[az>>2]|0)+(t<<2)|0;if((c[al>>2]|0)==0){l=1311;break}c[s>>2]=t+1;aE=c[al>>2]|0;c[aE+4>>2]=0;aO=aE}else{l=1311}}while(0);L1844:do{if((l|0)==1311){aE=b1(16)|0;al=aE;if((aE|0)!=0){c[aE>>2]=0;c[aE+8>>2]=0;c[aE+4>>2]=0;c[aE+12>>2]=64}aJ=c[s>>2]|0;aK=aJ<<1;aI=az|0;an=c[aI>>2]|0;do{if((c[aH>>2]|0)>>>0<aK>>>0){ao=b4(an,aJ<<3)|0;aF=ao;if((ao|0)==0){aO=al;break L1844}ao=c[aH>>2]|0;cb(aF+(ao<<2)|0,0,aK-ao<<2|0);c[aI>>2]=aF;c[aH>>2]=aK;ao=c[s>>2]|0;if(ao>>>0<=aK>>>0){aP=ao;aQ=aF;break}c[s>>2]=aK;aP=aK;aQ=aF}else{aP=aJ;aQ=an}}while(0);c[s>>2]=aP+1;c[aQ+(aP<<2)>>2]=aE;aO=al}}while(0);L1855:do{if(x>>>0>1){aH=(aO|0)==0;az=aO+12|0;an=aO+4|0;aJ=aO+8|0;aK=aO|0;aI=1;L1858:while(1){y=a[f+aI|0]|0;do{if(y<<24>>24==10){if((a[f+(aI-1)|0]|0)==32){break}if(aH){l=1452;break L1858}H=c[az>>2]|0;if((H|0)==0){l=1451;break L1858}g=c[an>>2]|0;k=g+1|0;I=c[aJ>>2]|0;if(k>>>0>I>>>0){if(k>>>0>16777216){break}m=I+H|0;if(m>>>0<k>>>0){I=m;while(1){aF=I+H|0;if(aF>>>0<k>>>0){I=aF}else{aR=aF;break}}}else{aR=m}I=b4(c[aK>>2]|0,aR)|0;if((I|0)==0){break}c[aK>>2]=I;c[aJ>>2]=aR;aS=c[an>>2]|0;aT=I}else{aS=g;aT=c[aK>>2]|0}a[aT+aS|0]=32;c[an>>2]=(c[an>>2]|0)+1}else{if(aH){l=1453;break L1858}I=c[az>>2]|0;if((I|0)==0){l=1454;break L1858}k=c[an>>2]|0;H=k+1|0;aF=c[aJ>>2]|0;if(H>>>0>aF>>>0){if(H>>>0>16777216){break}ao=aF+I|0;if(ao>>>0<H>>>0){aF=ao;while(1){aG=aF+I|0;if(aG>>>0<H>>>0){aF=aG}else{aU=aG;break}}}else{aU=ao}aF=b4(c[aK>>2]|0,aU)|0;if((aF|0)==0){break}c[aK>>2]=aF;c[aJ>>2]=aU;aV=c[an>>2]|0;aW=aF}else{aV=k;aW=c[aK>>2]|0}a[aW+aV|0]=y;c[an>>2]=(c[an>>2]|0)+1}}while(0);y=aI+1|0;if(y>>>0<x>>>0){aI=y}else{aX=aK;aY=an;break L1855}}if((l|0)==1451){aB(1144,178,2288,1656);return 0}else if((l|0)==1452){aB(1144,178,2288,1656);return 0}else if((l|0)==1453){aB(1144,178,2288,1656);return 0}else if((l|0)==1454){aB(1144,178,2288,1656);return 0}}else{aX=aO|0;aY=aO+4|0}}while(0);aM=c[aX>>2]|0;aN=c[aY>>2]|0}if((aN|0)==0){aZ=0}else{an=0;aK=0;while(1){aI=(b8(d[aM+an|0]|0)|0)-aK+(aK*65600&-1)|0;aJ=an+1|0;if(aJ>>>0<aN>>>0){an=aJ;aK=aI}else{aZ=aI;break}}}aK=e+112+((aZ&7)<<2)|0;while(1){a_=c[aK>>2]|0;if((a_|0)==0){n=C;o=0;p=s;q=t;l=1440;break}if((c[a_>>2]|0)==(aZ|0)){l=1353;break}else{aK=a_+12|0}}if((l|0)==1440){c[p>>2]=q;u=(o|0)!=0;v=u?n:0;return v|0}else if((l|0)==1353){ae=z;af=c[a_+8>>2]|0;ag=c[a_+4>>2]|0;break}}}while(0);do{if(x>>>0>1){a_=e+412|0;z=c[s>>2]|0;aZ=e+420|0;do{if(z>>>0<(c[aZ>>2]|0)>>>0){C=(c[a_>>2]|0)+(z<<2)|0;if((c[C>>2]|0)==0){l=1358;break}c[s>>2]=z+1;aN=c[C>>2]|0;c[aN+4>>2]=0;a$=aN}else{l=1358}}while(0);L1913:do{if((l|0)==1358){z=b1(16)|0;aN=z;if((z|0)!=0){c[z>>2]=0;c[z+8>>2]=0;c[z+4>>2]=0;c[z+12>>2]=64}C=c[s>>2]|0;aM=C<<1;aY=a_|0;aX=c[aY>>2]|0;do{if((c[aZ>>2]|0)>>>0<aM>>>0){aO=b4(aX,C<<3)|0;aV=aO;if((aO|0)==0){a$=aN;break L1913}aO=c[aZ>>2]|0;cb(aV+(aO<<2)|0,0,aM-aO<<2|0);c[aY>>2]=aV;c[aZ>>2]=aM;aO=c[s>>2]|0;if(aO>>>0<=aM>>>0){a0=aO;a1=aV;break}c[s>>2]=aM;a0=aM;a1=aV}else{a0=C;a1=aX}}while(0);c[s>>2]=a0+1;c[a1+(a0<<2)>>2]=z;a$=aN}}while(0);if(!r){aZ=e+432|0;c[aZ>>2]=1;bg(a$,e,f+1|0,B);c[aZ>>2]=0;a2=a$;a3=0;break}aZ=f+1|0;if((a$|0)==0){aB(1144,157,2296,1656);return 0}a_=c[a$+12>>2]|0;if((a_|0)==0){aB(1144,157,2296,1656);return 0}aX=a$+4|0;C=c[aX>>2]|0;aM=C+B|0;aY=a$+8|0;aV=c[aY>>2]|0;if(aM>>>0>aV>>>0){if(aM>>>0>16777216){a2=a$;a3=1;break}aO=aV+a_|0;if(aO>>>0<aM>>>0){aV=aO;while(1){aW=aV+a_|0;if(aW>>>0<aM>>>0){aV=aW}else{a4=aW;break}}}else{a4=aO}aV=a$|0;aM=b4(c[aV>>2]|0,a4)|0;if((aM|0)==0){a2=a$;a3=1;break}c[aV>>2]=aM;c[aY>>2]=a4;a5=c[aX>>2]|0;a6=aM}else{a5=C;a6=c[a$>>2]|0}aM=a6+a5|0;ca(aM|0,aZ|0,B)|0;c[aX>>2]=(c[aX>>2]|0)+B;a2=a$;a3=1}else{a2=0;a3=r}}while(0);L1944:do{if((ag|0)==0){a7=0}else{r=e+412|0;a$=c[s>>2]|0;B=e+420|0;do{if(a$>>>0<(c[B>>2]|0)>>>0){a5=(c[r>>2]|0)+(a$<<2)|0;if((c[a5>>2]|0)==0){l=1382;break}c[s>>2]=a$+1;a6=c[a5>>2]|0;c[a6+4>>2]=0;a8=a6}else{l=1382}}while(0);L1949:do{if((l|0)==1382){a$=b1(16)|0;aX=a$;if((a$|0)!=0){c[a$>>2]=0;c[a$+8>>2]=0;c[a$+4>>2]=0;c[a$+12>>2]=64}aZ=c[s>>2]|0;C=aZ<<1;aY=r|0;aO=c[aY>>2]|0;do{if((c[B>>2]|0)>>>0<C>>>0){a6=b4(aO,aZ<<3)|0;a5=a6;if((a6|0)==0){a8=aX;break L1949}a6=c[B>>2]|0;cb(a5+(a6<<2)|0,0,C-a6<<2|0);c[aY>>2]=a5;c[B>>2]=C;a6=c[s>>2]|0;if(a6>>>0<=C>>>0){a9=a6;ba=a5;break}c[s>>2]=C;a9=C;ba=a5}else{a9=aZ;ba=aO}}while(0);c[s>>2]=a9+1;c[ba+(a9<<2)>>2]=a$;a8=aX}}while(0);B=ag+4|0;r=c[B>>2]|0;if((r|0)==0){a7=a8;break}aO=ag|0;aZ=(a8|0)==0;C=a8+12|0;aY=a8+4|0;aN=a8+8|0;z=a8|0;a5=0;a6=r;while(1){r=a5;while(1){if(r>>>0>=a6>>>0){break}if((a[(c[aO>>2]|0)+r|0]|0)==92){break}else{r=r+1|0}}if(r>>>0>a5>>>0){aX=(c[aO>>2]|0)+a5|0;a$=r-a5|0;if(aZ){l=1431;break}a4=c[C>>2]|0;if((a4|0)==0){l=1432;break}f=c[aY>>2]|0;a0=f+a$|0;a1=c[aN>>2]|0;do{if(a0>>>0>a1>>>0){if(a0>>>0>16777216){break}x=a1+a4|0;if(x>>>0<a0>>>0){aM=x;while(1){aV=aM+a4|0;if(aV>>>0<a0>>>0){aM=aV}else{bb=aV;break}}}else{bb=x}aM=b4(c[z>>2]|0,bb)|0;if((aM|0)==0){break}c[z>>2]=aM;c[aN>>2]=bb;bc=c[aY>>2]|0;bd=aM;l=1405}else{bc=f;bd=c[z>>2]|0;l=1405}}while(0);if((l|0)==1405){l=0;f=bd+bc|0;ca(f|0,aX|0,a$)|0;c[aY>>2]=(c[aY>>2]|0)+a$}be=c[B>>2]|0}else{be=a6}f=r+1|0;if(f>>>0>=be>>>0){a7=a8;break L1944}a0=a[(c[aO>>2]|0)+f|0]|0;if(aZ){l=1433;break}f=c[C>>2]|0;if((f|0)==0){l=1434;break}a4=c[aY>>2]|0;a1=a4+1|0;aM=c[aN>>2]|0;do{if(a1>>>0>aM>>>0){if(a1>>>0>16777216){break}aV=aM+f|0;if(aV>>>0<a1>>>0){a_=aV;while(1){aW=a_+f|0;if(aW>>>0<a1>>>0){a_=aW}else{bf=aW;break}}}else{bf=aV}a_=b4(c[z>>2]|0,bf)|0;if((a_|0)==0){break}c[z>>2]=a_;c[aN>>2]=bf;bh=c[aY>>2]|0;bi=a_;l=1418}else{bh=a4;bi=c[z>>2]|0;l=1418}}while(0);if((l|0)==1418){l=0;a[bi+bh|0]=a0;c[aY>>2]=(c[aY>>2]|0)+1}a4=r+2|0;a1=c[B>>2]|0;if(a4>>>0<a1>>>0){a5=a4;a6=a1}else{a7=a8;break L1944}}if((l|0)==1431){aB(1144,157,2296,1656);return 0}else if((l|0)==1432){aB(1144,157,2296,1656);return 0}else if((l|0)==1433){aB(1144,178,2288,1656);return 0}else if((l|0)==1434){aB(1144,178,2288,1656);return 0}}}while(0);if(!a3){n=ae;o=aL[c[e+68>>2]&31](b,a7,af,a2,c[e+108>>2]|0)|0;p=s;q=t;c[p>>2]=q;u=(o|0)!=0;v=u?n:0;return v|0}a3=b+4|0;l=c[a3>>2]|0;do{if((l|0)!=0){a8=l-1|0;if((a[(c[b>>2]|0)+a8|0]|0)!=33){break}c[a3>>2]=a8}}while(0);n=ae;o=aL[c[e+60>>2]&31](b,a7,af,a2,c[e+108>>2]|0)|0;p=s;q=t;c[p>>2]=q;u=(o|0)!=0;v=u?n:0;return v|0}function bj(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;g=i;i=i+8|0;h=g|0;j=b+44|0;if((c[j>>2]|0)==0){k=0;i=g;return k|0}if((c[b+432>>2]|0)!=0){k=0;i=g;return k|0}l=b+412|0;m=b+416|0;n=c[m>>2]|0;o=b+420|0;do{if(n>>>0<(c[o>>2]|0)>>>0){p=(c[l>>2]|0)+(n<<2)|0;if((c[p>>2]|0)==0){q=1464;break}c[m>>2]=n+1;r=c[p>>2]|0;c[r+4>>2]=0;s=r}else{q=1464}}while(0);L2024:do{if((q|0)==1464){n=b1(16)|0;r=n;if((n|0)!=0){c[n>>2]=0;c[n+8>>2]=0;c[n+4>>2]=0;c[n+12>>2]=64}p=c[m>>2]|0;t=p<<1;u=l|0;v=c[u>>2]|0;do{if((c[o>>2]|0)>>>0<t>>>0){w=b4(v,p<<3)|0;x=w;if((w|0)==0){s=r;break L2024}w=c[o>>2]|0;cb(x+(w<<2)|0,0,t-w<<2|0);c[u>>2]=x;c[o>>2]=t;w=c[m>>2]|0;if(w>>>0<=t>>>0){y=w;z=x;break}c[m>>2]=t;y=t;z=x}else{y=p;z=v}}while(0);c[m>>2]=y+1;c[z+(y<<2)>>2]=n;s=r}}while(0);y=bB(h,s,d,e,f,0)|0;if((y|0)!=0){f=a+4|0;c[f>>2]=(c[f>>2]|0)-(c[h>>2]|0);h=c[j>>2]|0;j=c[b+108>>2]|0;aP[h&3](a,s,1,j)|0}c[m>>2]=(c[m>>2]|0)-1;k=y;i=g;return k|0}function bk(b,e,f,g,h){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0;g=i;i=i+16|0;j=g|0;L2040:do{if(h>>>0<3){k=0;l=0}else{if((a[f]|0)!=60){k=0;l=0;break}m=(a[f+1|0]|0)==47?2:1;if((at(d[f+m|0]|0)|0)==0){k=0;l=0;break}L2044:do{if(m>>>0<h>>>0){n=m;while(1){o=f+n|0;if((at(d[o]|0)|0)==0){p=a[o]|0;if(!((p<<24>>24|0)==46|(p<<24>>24|0)==43|(p<<24>>24|0)==45)){q=n;break L2044}}p=n+1|0;if(p>>>0<h>>>0){n=p}else{q=p;break}}}else{q=m}}while(0);do{if(q>>>0>1){m=f+q|0;L2053:do{if((a[m]|0)==64){n=h-q|0;if((q|0)==(h|0)){break}else{r=0;s=0}L2055:while(1){p=f+(r+q)|0;do{if((at(d[p]|0)|0)==0){o=d[p]|0;if((o|0)==45|(o|0)==46|(o|0)==95){t=s;break}else if((o|0)==62){break L2055}else if((o|0)!=64){break L2053}t=s+1|0}else{t=s}}while(0);p=r+1|0;if(p>>>0<n>>>0){r=p;s=t}else{break L2053}}n=(s|0)==1?r+1|0:0;if((n|0)==0){break}k=n+q|0;l=2;break L2040}}while(0);if(q>>>0<=2){u=q;break}n=(a[m]|0)==58;p=n&1;o=p+q|0;if(o>>>0>=h>>>0|n^1){u=o;break}else{v=o}while(1){w=a[f+v|0]|0;if((w<<24>>24|0)==92){x=v+2|0}else if((w<<24>>24|0)==62|(w<<24>>24|0)==39|(w<<24>>24|0)==34|(w<<24>>24|0)==32|(w<<24>>24|0)==10){break}else{x=v+1|0}if(x>>>0<h>>>0){v=x}else{k=0;l=p;break L2040}}if(!(v>>>0>o>>>0&w<<24>>24==62)){u=v;break}k=v+1|0;l=p;break L2040}else{u=q}}while(0);while(1){if(u>>>0>=h>>>0){k=0;l=0;break L2040}m=u+1|0;if((a[f+u|0]|0)==62){k=m;l=0;break}else{u=m}}}}while(0);u=j|0;c[u>>2]=f;h=j+4|0;c[h>>2]=k;c[j+8>>2]=0;c[j+12>>2]=0;if(k>>>0<=2){y=0;z=(y|0)==0;A=z?0:k;i=g;return A|0}q=e+44|0;if((c[q>>2]|0)==0|(l|0)==0){v=c[e+72>>2]|0;if((v|0)==0){y=0;z=(y|0)==0;A=z?0:k;i=g;return A|0}y=aM[v&31](b,j,c[e+108>>2]|0)|0;z=(y|0)==0;A=z?0:k;i=g;return A|0}j=e+412|0;v=e+416|0;w=c[v>>2]|0;x=e+420|0;do{if(w>>>0<(c[x>>2]|0)>>>0){r=(c[j>>2]|0)+(w<<2)|0;if((c[r>>2]|0)==0){B=1509;break}c[v>>2]=w+1;s=c[r>>2]|0;c[s+4>>2]=0;C=s}else{B=1509}}while(0);L2090:do{if((B|0)==1509){w=b1(16)|0;s=w;if((w|0)!=0){c[w>>2]=0;c[w+8>>2]=0;c[w+4>>2]=0;c[w+12>>2]=64}r=c[v>>2]|0;t=r<<1;m=j|0;n=c[m>>2]|0;do{if((c[x>>2]|0)>>>0<t>>>0){D=b4(n,r<<3)|0;E=D;if((D|0)==0){C=s;break L2090}D=c[x>>2]|0;cb(E+(D<<2)|0,0,t-D<<2|0);c[m>>2]=E;c[x>>2]=t;D=c[v>>2]|0;if(D>>>0<=t>>>0){F=D;G=E;break}c[v>>2]=t;F=t;G=E}else{F=r;G=n}}while(0);c[v>>2]=F+1;c[G+(F<<2)>>2]=w;C=s}}while(0);F=f+1|0;c[u>>2]=F;f=k-2|0;c[h>>2]=f;L2101:do{if((f|0)!=0){G=(C|0)==0;x=C+12|0;j=C+4|0;n=C+8|0;r=C|0;t=0;m=f;E=F;while(1){D=t;while(1){if(D>>>0>=m>>>0){break}if((a[E+D|0]|0)==92){break}else{D=D+1|0}}if(D>>>0>t>>>0){p=E+t|0;o=D-t|0;if(G){B=1552;break}H=c[x>>2]|0;if((H|0)==0){B=1553;break}I=c[j>>2]|0;J=I+o|0;K=c[n>>2]|0;do{if(J>>>0>K>>>0){if(J>>>0>16777216){break}L=K+H|0;if(L>>>0<J>>>0){M=L;while(1){N=M+H|0;if(N>>>0<J>>>0){M=N}else{O=N;break}}}else{O=L}M=b4(c[r>>2]|0,O)|0;if((M|0)==0){break}c[r>>2]=M;c[n>>2]=O;P=c[j>>2]|0;Q=M;B=1532}else{P=I;Q=c[r>>2]|0;B=1532}}while(0);if((B|0)==1532){B=0;I=Q+P|0;ca(I|0,p|0,o)|0;c[j>>2]=(c[j>>2]|0)+o}R=c[h>>2]|0}else{R=m}I=D+1|0;if(I>>>0>=R>>>0){break L2101}J=a[(c[u>>2]|0)+I|0]|0;if(G){B=1554;break}I=c[x>>2]|0;if((I|0)==0){B=1555;break}H=c[j>>2]|0;K=H+1|0;M=c[n>>2]|0;do{if(K>>>0>M>>>0){if(K>>>0>16777216){break}N=M+I|0;if(N>>>0<K>>>0){S=N;while(1){T=S+I|0;if(T>>>0<K>>>0){S=T}else{U=T;break}}}else{U=N}S=b4(c[r>>2]|0,U)|0;if((S|0)==0){break}c[r>>2]=S;c[n>>2]=U;V=c[j>>2]|0;W=S;B=1545}else{V=H;W=c[r>>2]|0;B=1545}}while(0);if((B|0)==1545){B=0;a[W+V|0]=J;c[j>>2]=(c[j>>2]|0)+1}H=D+2|0;K=c[h>>2]|0;if(H>>>0>=K>>>0){break L2101}t=H;m=K;E=c[u>>2]|0}if((B|0)==1552){aB(1144,157,2296,1656);return 0}else if((B|0)==1553){aB(1144,157,2296,1656);return 0}else if((B|0)==1554){aB(1144,178,2288,1656);return 0}else if((B|0)==1555){aB(1144,178,2288,1656);return 0}}}while(0);B=aP[c[q>>2]&3](b,C,l,c[e+108>>2]|0)|0;c[v>>2]=(c[v>>2]|0)-1;y=B;z=(y|0)==0;A=z?0:k;i=g;return A|0}function bl(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;f=i;i=i+16|0;h=f|0;cb(h|0,0,16);if(g>>>0<=1){if((g|0)!=1){j=2;i=f;return j|0}g=a[e]|0;if((b|0)==0){aB(1144,178,2288,1656);return 0}k=c[b+12>>2]|0;if((k|0)==0){aB(1144,178,2288,1656);return 0}l=b+4|0;m=c[l>>2]|0;n=m+1|0;o=b+8|0;p=c[o>>2]|0;do{if(n>>>0>p>>>0){if(n>>>0>16777216){j=2;i=f;return j|0}q=p+k|0;if(q>>>0<n>>>0){r=q;while(1){s=r+k|0;if(s>>>0<n>>>0){r=s}else{t=s;break}}}else{t=q}r=b|0;s=b4(c[r>>2]|0,t)|0;if((s|0)==0){j=2;i=f;return j|0}else{c[r>>2]=s;c[o>>2]=t;u=c[l>>2]|0;v=s;break}}else{u=m;v=c[b>>2]|0}}while(0);a[v+u|0]=g;c[l>>2]=(c[l>>2]|0)+1;j=2;i=f;return j|0}l=e+1|0;e=a[l]|0;if((aH(1168,e&255|0,23)|0)==0){j=0;i=f;return j|0}g=c[d+96>>2]|0;if((g|0)!=0){c[h>>2]=l;c[h+4>>2]=1;aN[g&15](b,h,c[d+108>>2]|0);j=2;i=f;return j|0}if((b|0)==0){aB(1144,178,2288,1656);return 0}d=c[b+12>>2]|0;if((d|0)==0){aB(1144,178,2288,1656);return 0}h=b+4|0;g=c[h>>2]|0;l=g+1|0;u=b+8|0;v=c[u>>2]|0;do{if(l>>>0>v>>>0){if(l>>>0>16777216){j=2;i=f;return j|0}m=v+d|0;if(m>>>0<l>>>0){t=m;while(1){o=t+d|0;if(o>>>0<l>>>0){t=o}else{w=o;break}}}else{w=m}t=b|0;q=b4(c[t>>2]|0,w)|0;if((q|0)==0){j=2;i=f;return j|0}else{c[t>>2]=q;c[u>>2]=w;x=c[h>>2]|0;y=q;break}}else{x=g;y=c[b>>2]|0}}while(0);a[y+x|0]=e;c[h>>2]=(c[h>>2]|0)+1;j=2;i=f;return j|0}function bm(b,e,f,g,h){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;g=i;i=i+16|0;j=g|0;cb(j|0,0,16);if(h>>>0>1){k=(a[f+1|0]|0)==35?2:1}else{k=1}do{if(k>>>0>=h>>>0){l=0;m=1621;break}n=f+k|0;k=k+1|0}while((at(d[n]|0)|0)!=0);if((m|0)==1621){i=g;return l|0}if((a[n]|0)!=59){l=0;i=g;return l|0}n=c[e+92>>2]|0;if((n|0)!=0){c[j>>2]=f;c[j+4>>2]=k;aN[n&15](b,j,c[e+108>>2]|0);l=k;i=g;return l|0}if((b|0)==0){aB(1144,157,2296,1656);return 0}e=c[b+12>>2]|0;if((e|0)==0){aB(1144,157,2296,1656);return 0}j=b+4|0;n=c[j>>2]|0;m=n+k|0;h=b+8|0;o=c[h>>2]|0;do{if(m>>>0>o>>>0){if(m>>>0>16777216){l=k;i=g;return l|0}p=o+e|0;if(p>>>0<m>>>0){q=p;while(1){r=q+e|0;if(r>>>0<m>>>0){q=r}else{s=r;break}}}else{s=p}q=b|0;r=b4(c[q>>2]|0,s)|0;if((r|0)==0){l=k;i=g;return l|0}else{c[q>>2]=r;c[h>>2]=s;t=c[j>>2]|0;u=r;break}}else{t=n;u=c[b>>2]|0}}while(0);b=u+t|0;ca(b|0,f|0,k)|0;c[j>>2]=(c[j>>2]|0)+k;l=k;i=g;return l|0}function bn(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;g=i;i=i+8|0;h=g|0;j=b+44|0;if((c[j>>2]|0)==0){k=0;i=g;return k|0}if((c[b+432>>2]|0)!=0){k=0;i=g;return k|0}l=b+412|0;m=b+416|0;n=c[m>>2]|0;o=b+420|0;do{if(n>>>0<(c[o>>2]|0)>>>0){p=(c[l>>2]|0)+(n<<2)|0;if((c[p>>2]|0)==0){q=1633;break}c[m>>2]=n+1;r=c[p>>2]|0;c[r+4>>2]=0;s=r}else{q=1633}}while(0);L2252:do{if((q|0)==1633){n=b1(16)|0;r=n;if((n|0)!=0){c[n>>2]=0;c[n+8>>2]=0;c[n+4>>2]=0;c[n+12>>2]=64}p=c[m>>2]|0;t=p<<1;u=l|0;v=c[u>>2]|0;do{if((c[o>>2]|0)>>>0<t>>>0){w=b4(v,p<<3)|0;x=w;if((w|0)==0){s=r;break L2252}w=c[o>>2]|0;cb(x+(w<<2)|0,0,t-w<<2|0);c[u>>2]=x;c[o>>2]=t;w=c[m>>2]|0;if(w>>>0<=t>>>0){y=w;z=x;break}c[m>>2]=t;y=t;z=x}else{y=p;z=v}}while(0);c[m>>2]=y+1;c[z+(y<<2)>>2]=n;s=r}}while(0);y=bA(h,s,d,e,f,0)|0;if((y|0)!=0){f=a+4|0;c[f>>2]=(c[f>>2]|0)-(c[h>>2]|0);h=c[j>>2]|0;j=c[b+108>>2]|0;aP[h&3](a,s,2,j)|0}c[m>>2]=(c[m>>2]|0)-1;k=y;i=g;return k|0}function bo(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;f=a[e]|0;if((f<<24>>24|0)==95){h=d+88|0}else if((f<<24>>24|0)==94){h=d+84|0}else{i=0;return i|0}f=c[h>>2]|0;if((f|0)==0|g>>>0<2){i=0;return i|0}if((a[e+1|0]|0)==123){j=2}else{i=0;return i|0}while(1){if(j>>>0>=g>>>0){break}if((a[e+j|0]|0)==125){break}if((a[e+(j-1)|0]|0)==92){break}else{j=j+1|0}}if((j|0)==(g|0)){i=0;return i|0}g=j-2|0;if((g|0)==0){i=3;return i|0}h=d+412|0;k=d+416|0;l=c[k>>2]|0;m=d+420|0;do{if(l>>>0<(c[m>>2]|0)>>>0){n=(c[h>>2]|0)+(l<<2)|0;if((c[n>>2]|0)==0){o=1660;break}c[k>>2]=l+1;p=c[n>>2]|0;c[p+4>>2]=0;q=p}else{o=1660}}while(0);L2292:do{if((o|0)==1660){l=b1(16)|0;p=l;if((l|0)!=0){c[l>>2]=0;c[l+8>>2]=0;c[l+4>>2]=0;c[l+12>>2]=64}n=c[k>>2]|0;r=n<<1;s=h|0;t=c[s>>2]|0;do{if((c[m>>2]|0)>>>0<r>>>0){u=b4(t,n<<3)|0;v=u;if((u|0)==0){q=p;break L2292}u=c[m>>2]|0;cb(v+(u<<2)|0,0,r-u<<2|0);c[s>>2]=v;c[m>>2]=r;u=c[k>>2]|0;if(u>>>0<=r>>>0){w=u;x=v;break}c[k>>2]=r;w=r;x=v}else{w=n;x=t}}while(0);c[k>>2]=w+1;c[x+(w<<2)>>2]=l;q=p}}while(0);bg(q,d,e+2|0,g);aM[f&31](b,q,c[d+108>>2]|0)|0;c[k>>2]=(c[k>>2]|0)-1;i=j+1|0;return i|0}function bp(b,e,f,g,h){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;var i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;i=e+56|0;if((c[i>>2]|0)==0){j=0;return j|0}do{if(g>>>0>1){if((a[f]|0)!=h<<24>>24){k=0;break}k=(a[f+1|0]|0)==h<<24>>24&1}else{k=0}}while(0);if(k>>>0>=g>>>0){j=0;return j|0}l=e+424|0;m=k;while(1){k=br(f+m|0,g-m|0,h)|0;if((k|0)==0){j=0;n=1700;break}o=k+m|0;if(o>>>0>=g>>>0){j=0;n=1702;break}if((a[f+o|0]|0)!=h<<24>>24){m=o;continue}k=a[f+(o-1)|0]|0;if((k<<24>>24|0)==32|(k<<24>>24|0)==10){m=o;continue}if((c[l>>2]&1|0)==0){n=1688;break}k=o+1|0;if(k>>>0>=g>>>0){n=1688;break}if((at(d[f+k|0]|0)|0)==0){n=1688;break}else{m=o}}if((n|0)==1688){m=e+412|0;g=e+416|0;l=c[g>>2]|0;h=e+420|0;do{if(l>>>0<(c[h>>2]|0)>>>0){k=(c[m>>2]|0)+(l<<2)|0;if((c[k>>2]|0)==0){n=1691;break}c[g>>2]=l+1;p=c[k>>2]|0;c[p+4>>2]=0;q=p}else{n=1691}}while(0);L2328:do{if((n|0)==1691){l=b1(16)|0;p=l;if((l|0)!=0){c[l>>2]=0;c[l+8>>2]=0;c[l+4>>2]=0;c[l+12>>2]=64}k=c[g>>2]|0;r=k<<1;s=m|0;t=c[s>>2]|0;do{if((c[h>>2]|0)>>>0<r>>>0){u=b4(t,k<<3)|0;v=u;if((u|0)==0){q=p;break L2328}u=c[h>>2]|0;cb(v+(u<<2)|0,0,r-u<<2|0);c[s>>2]=v;c[h>>2]=r;u=c[g>>2]|0;if(u>>>0<=r>>>0){w=u;x=v;break}c[g>>2]=r;w=r;x=v}else{w=k;x=t}}while(0);c[g>>2]=w+1;c[x+(w<<2)>>2]=l;q=p}}while(0);bg(q,e,f,o);f=aM[c[i>>2]&31](b,q,c[e+108>>2]|0)|0;c[g>>2]=(c[g>>2]|0)-1;j=(f|0)==0?0:o+1|0;return j|0}else if((n|0)==1702){return j|0}else if((n|0)==1700){return j|0}return 0}function bq(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;h=i;i=i+8|0;j=h|0;k=d+68|0;if((c[k>>2]|0)==0){l=0;i=h;return l|0}if((c[d+432>>2]|0)!=0){l=0;i=h;return l|0}m=d+412|0;n=d+416|0;o=c[n>>2]|0;p=d+420|0;do{if(o>>>0<(c[p>>2]|0)>>>0){q=(c[m>>2]|0)+(o<<2)|0;if((c[q>>2]|0)==0){r=1710;break}c[n>>2]=o+1;s=c[q>>2]|0;c[s+4>>2]=0;t=s}else{r=1710}}while(0);L2352:do{if((r|0)==1710){o=b1(16)|0;s=o;if((o|0)!=0){c[o>>2]=0;c[o+8>>2]=0;c[o+4>>2]=0;c[o+12>>2]=64}q=c[n>>2]|0;u=q<<1;v=m|0;w=c[v>>2]|0;do{if((c[p>>2]|0)>>>0<u>>>0){x=b4(w,q<<3)|0;y=x;if((x|0)==0){t=s;break L2352}x=c[p>>2]|0;cb(y+(x<<2)|0,0,u-x<<2|0);c[v>>2]=y;c[p>>2]=u;x=c[n>>2]|0;if(x>>>0<=u>>>0){z=x;A=y;break}c[n>>2]=u;z=u;A=y}else{z=q;A=w}}while(0);c[n>>2]=z+1;c[A+(z<<2)>>2]=o;t=s}}while(0);z=bz(j,t,e,f,g,0)|0;g=c[n>>2]|0;if((z|0)==0){B=g}else{do{if(g>>>0<(c[p>>2]|0)>>>0){f=(c[m>>2]|0)+(g<<2)|0;if((c[f>>2]|0)==0){r=1721;break}c[n>>2]=g+1;e=c[f>>2]|0;c[e+4>>2]=0;C=e}else{r=1721}}while(0);L2368:do{if((r|0)==1721){g=b1(16)|0;e=g;if((g|0)!=0){c[g>>2]=0;c[g+8>>2]=0;c[g+4>>2]=0;c[g+12>>2]=64}f=c[n>>2]|0;A=f<<1;w=m|0;q=c[w>>2]|0;do{if((c[p>>2]|0)>>>0<A>>>0){u=b4(q,f<<3)|0;v=u;if((u|0)==0){C=e;break L2368}u=c[p>>2]|0;cb(v+(u<<2)|0,0,A-u<<2|0);c[w>>2]=v;c[p>>2]=A;u=c[n>>2]|0;if(u>>>0<=A>>>0){D=u;E=v;break}c[n>>2]=A;D=A;E=v}else{D=f;E=q}}while(0);c[n>>2]=D+1;c[E+(D<<2)>>2]=g;C=e}}while(0);if((C|0)==0){aB(1144,157,2296,1656);return 0}D=C+12|0;E=c[D>>2]|0;if((E|0)==0){aB(1144,157,2296,1656);return 0}q=C+4|0;f=c[q>>2]|0;A=f+7|0;w=C+8|0;s=c[w>>2]|0;do{if(A>>>0>s>>>0){if(A>>>0>16777216){break}o=s+E|0;if(o>>>0<A>>>0){v=o;while(1){u=v+E|0;if(u>>>0<A>>>0){v=u}else{F=u;break}}}else{F=o}v=C|0;e=b4(c[v>>2]|0,F)|0;if((e|0)==0){break}c[v>>2]=e;c[w>>2]=F;G=c[q>>2]|0;H=e;r=1738}else{G=f;H=c[C>>2]|0;r=1738}}while(0);if((r|0)==1738){f=H+G|0;a[f]=a[1632]|0;a[f+1|0]=a[1633|0]|0;a[f+2|0]=a[1634|0]|0;a[f+3|0]=a[1635|0]|0;a[f+4|0]=a[1636|0]|0;a[f+5|0]=a[1637|0]|0;a[f+6|0]=a[1638|0]|0;c[q>>2]=(c[q>>2]|0)+7}f=c[t>>2]|0;G=c[t+4>>2]|0;H=c[D>>2]|0;if((H|0)==0){aB(1144,157,2296,1656);return 0}D=c[q>>2]|0;F=D+G|0;A=c[w>>2]|0;do{if(F>>>0>A>>>0){if(F>>>0>16777216){break}E=A+H|0;if(E>>>0<F>>>0){s=E;while(1){e=s+H|0;if(e>>>0<F>>>0){s=e}else{I=e;break}}}else{I=E}s=C|0;o=b4(c[s>>2]|0,I)|0;if((o|0)==0){break}c[s>>2]=o;c[w>>2]=I;J=c[q>>2]|0;K=o;r=1748}else{J=D;K=c[C>>2]|0;r=1748}}while(0);if((r|0)==1748){D=K+J|0;ca(D|0,f|0,G)|0;c[q>>2]=(c[q>>2]|0)+G}G=b+4|0;c[G>>2]=(c[G>>2]|0)-(c[j>>2]|0);j=d+96|0;if((c[j>>2]|0)==0){G=c[k>>2]|0;q=c[d+108>>2]|0;aL[G&31](b,C,0,t,q)|0;L=c[n>>2]|0}else{q=c[n>>2]|0;do{if(q>>>0<(c[p>>2]|0)>>>0){G=(c[m>>2]|0)+(q<<2)|0;if((c[G>>2]|0)==0){r=1753;break}c[n>>2]=q+1;f=c[G>>2]|0;c[f+4>>2]=0;M=f}else{r=1753}}while(0);L2417:do{if((r|0)==1753){q=b1(16)|0;f=q;if((q|0)!=0){c[q>>2]=0;c[q+8>>2]=0;c[q+4>>2]=0;c[q+12>>2]=64}G=c[n>>2]|0;D=G<<1;J=m|0;K=c[J>>2]|0;do{if((c[p>>2]|0)>>>0<D>>>0){I=b4(K,G<<3)|0;w=I;if((I|0)==0){M=f;break L2417}I=c[p>>2]|0;cb(w+(I<<2)|0,0,D-I<<2|0);c[J>>2]=w;c[p>>2]=D;I=c[n>>2]|0;if(I>>>0<=D>>>0){N=I;O=w;break}c[n>>2]=D;N=D;O=w}else{N=G;O=K}}while(0);c[n>>2]=N+1;c[O+(N<<2)>>2]=q;M=f}}while(0);N=d+108|0;aN[c[j>>2]&15](M,t,c[N>>2]|0);t=c[k>>2]|0;k=c[N>>2]|0;aL[t&31](b,C,0,M,k)|0;k=(c[n>>2]|0)-1|0;c[n>>2]=k;L=k}k=L-1|0;c[n>>2]=k;B=k}c[n>>2]=B-1;l=z;i=h;return l|0}function br(b,c,d){b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;if(c>>>0>1){e=1}else{f=0;return f|0}L2435:while(1){L2437:do{if(e>>>0<c>>>0){g=e;while(1){h=a[b+g|0]|0;if(h<<24>>24==d<<24>>24){i=g;break L2437}if((h<<24>>24|0)==96|(h<<24>>24|0)==91){i=g;break L2437}h=g+1|0;if(h>>>0<c>>>0){g=h}else{i=h;break}}}else{i=e}}while(0);if((i|0)==(c|0)){f=0;j=1816;break}g=a[b+i|0]|0;if(g<<24>>24==d<<24>>24){f=i;j=1814;break}do{if((i|0)==0){j=1781}else{if((a[b+(i-1)|0]|0)!=92){j=1781;break}k=i+1|0}}while(0);do{if((j|0)==1781){j=0;if((g<<24>>24|0)==96){if(i>>>0<c>>>0){l=i;m=0;n=1}else{f=0;j=1807;break L2435}while(1){if(!n){break}h=l+1|0;if(h>>>0>=c>>>0){f=0;j=1806;break L2435}l=h;m=m+1|0;n=(a[b+h|0]|0)==96}h=l>>>0<c>>>0;if(h&(m|0)!=0){o=l;p=0;q=0;while(1){r=a[b+o|0]|0;if((q|0)==0){s=r<<24>>24==d<<24>>24?o:0}else{s=q}t=r<<24>>24==96?p+1|0:0;r=o+1|0;u=r>>>0<c>>>0;if(u&t>>>0<m>>>0){o=r;p=t;q=s}else{v=r;w=s;x=u;break}}}else{v=l;w=0;x=h}if(x){k=v;break}else{f=w;j=1813;break L2435}}else if((g<<24>>24|0)!=91){k=i;break}q=i+1|0;L2465:do{if(q>>>0<c>>>0){p=i;o=0;u=q;while(1){r=a[b+u|0]|0;if(r<<24>>24==93){y=p;z=o;break L2465}t=(o|0)==0&r<<24>>24==d<<24>>24?u:o;r=u+1|0;if(r>>>0<c>>>0){p=u;o=t;u=r}else{y=u;z=t;break}}}else{y=i;z=0}}while(0);q=y+2|0;if(q>>>0<c>>>0){A=q}else{f=z;j=1808;break L2435}while(1){B=a[b+A|0]|0;if(!((B<<24>>24|0)==32|(B<<24>>24|0)==10)){break}q=A+1|0;if(q>>>0<c>>>0){A=q}else{f=z;j=1809;break L2435}}q=B&255;if((q|0)==40){C=41}else if((q|0)==91){C=93}else{if((z|0)==0){k=A;break}else{f=z;j=1810;break L2435}}q=A+1|0;if(q>>>0<c>>>0){D=A;E=z;F=q}else{f=z;j=1811;break L2435}while(1){q=a[b+F|0]|0;if((q&255|0)==(C|0)){break}h=(E|0)==0&q<<24>>24==d<<24>>24?F:E;q=F+1|0;if(q>>>0<c>>>0){D=F;E=h;F=q}else{f=h;j=1812;break L2435}}k=D+2|0}}while(0);if(k>>>0<c>>>0){e=k}else{f=0;j=1815;break}}if((j|0)==1814){return f|0}else if((j|0)==1815){return f|0}else if((j|0)==1816){return f|0}else if((j|0)==1806){return f|0}else if((j|0)==1807){return f|0}else if((j|0)==1808){return f|0}else if((j|0)==1809){return f|0}else if((j|0)==1810){return f|0}else if((j|0)==1811){return f|0}else if((j|0)==1812){return f|0}else if((j|0)==1813){return f|0}return 0}function bs(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;h=c[(g<<24>>24==126?d+80|0:d+52|0)>>2]|0;if((h|0)==0|(f|0)==0){i=0;return i|0}else{j=0}while(1){k=br(e+j|0,f-j|0,g)|0;if((k|0)==0){i=0;l=1836;break}m=k+j|0;k=m+1|0;n=k>>>0<f>>>0;if(!n){i=0;l=1837;break}if((a[e+m|0]|0)!=g<<24>>24){j=k;continue}if(!((a[e+k|0]|0)!=g<<24>>24|(m|0)==0)){o=a[e+(m-1)|0]|0;if(!((o<<24>>24|0)==32|(o<<24>>24|0)==10)){l=1824;break}}if(n){j=k}else{i=0;l=1839;break}}if((l|0)==1824){j=d+412|0;g=d+416|0;f=c[g>>2]|0;k=d+420|0;do{if(f>>>0<(c[k>>2]|0)>>>0){n=(c[j>>2]|0)+(f<<2)|0;if((c[n>>2]|0)==0){l=1827;break}c[g>>2]=f+1;o=c[n>>2]|0;c[o+4>>2]=0;p=o}else{l=1827}}while(0);L2511:do{if((l|0)==1827){f=b1(16)|0;o=f;if((f|0)!=0){c[f>>2]=0;c[f+8>>2]=0;c[f+4>>2]=0;c[f+12>>2]=64}n=c[g>>2]|0;q=n<<1;r=j|0;s=c[r>>2]|0;do{if((c[k>>2]|0)>>>0<q>>>0){t=b4(s,n<<3)|0;u=t;if((t|0)==0){p=o;break L2511}t=c[k>>2]|0;cb(u+(t<<2)|0,0,q-t<<2|0);c[r>>2]=u;c[k>>2]=q;t=c[g>>2]|0;if(t>>>0<=q>>>0){v=t;w=u;break}c[g>>2]=q;v=q;w=u}else{v=n;w=s}}while(0);c[g>>2]=v+1;c[w+(v<<2)>>2]=f;p=o}}while(0);bg(p,d,e,m);e=aM[h&31](b,p,c[d+108>>2]|0)|0;c[g>>2]=(c[g>>2]|0)-1;i=(e|0)==0?0:m+2|0;return i|0}else if((l|0)==1837){return i|0}else if((l|0)==1836){return i|0}else if((l|0)==1839){return i|0}return 0}function bt(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0;k=i;i=i+16|0;l=k|0;m=d+40|0;if((c[m>>2]|0)==0){i=k;return}n=d+36|0;if((c[n>>2]|0)==0){i=k;return}o=d+412|0;p=d+416|0;q=c[p>>2]|0;r=d+420|0;do{if(q>>>0<(c[r>>2]|0)>>>0){s=(c[o>>2]|0)+(q<<2)|0;if((c[s>>2]|0)==0){t=1846;break}c[p>>2]=q+1;u=c[s>>2]|0;c[u+4>>2]=0;v=u}else{t=1846}}while(0);L2536:do{if((t|0)==1846){q=b1(16)|0;u=q;if((q|0)!=0){c[q>>2]=0;c[q+8>>2]=0;c[q+4>>2]=0;c[q+12>>2]=64}s=c[p>>2]|0;w=s<<1;x=o|0;y=c[x>>2]|0;do{if((c[r>>2]|0)>>>0<w>>>0){z=b4(y,s<<3)|0;A=z;if((z|0)==0){v=u;break L2536}z=c[r>>2]|0;cb(A+(z<<2)|0,0,w-z<<2|0);c[x>>2]=A;c[r>>2]=w;z=c[p>>2]|0;if(z>>>0<=w>>>0){B=z;C=A;break}c[p>>2]=w;B=w;C=A}else{B=s;C=y}}while(0);c[p>>2]=B+1;c[C+(B<<2)>>2]=q;v=u}}while(0);if((f|0)==0){D=0}else{D=(a[e]|0)==124&1}if((g|0)!=0&D>>>0<f>>>0){B=o|0;o=d+108|0;C=0;y=D;D=c[p>>2]|0;while(1){do{if(D>>>0<(c[r>>2]|0)>>>0){s=(c[B>>2]|0)+(D<<2)|0;if((c[s>>2]|0)==0){t=1863;break}c[p>>2]=D+1;w=c[s>>2]|0;c[w+4>>2]=0;E=w}else{t=1863}}while(0);L2557:do{if((t|0)==1863){t=0;u=b1(16)|0;q=u;if((u|0)!=0){c[u>>2]=0;c[u+8>>2]=0;c[u+4>>2]=0;c[u+12>>2]=64}w=c[p>>2]|0;s=w<<1;x=c[B>>2]|0;do{if((c[r>>2]|0)>>>0<s>>>0){A=b4(x,w<<3)|0;z=A;if((A|0)==0){E=q;break L2557}A=c[r>>2]|0;cb(z+(A<<2)|0,0,s-A<<2|0);c[B>>2]=z;c[r>>2]=s;A=c[p>>2]|0;if(A>>>0<=s>>>0){F=A;G=z;break}c[p>>2]=s;F=s;G=z}else{F=w;G=x}}while(0);c[p>>2]=F+1;c[G+(F<<2)>>2]=u;E=q}}while(0);L2568:do{if(y>>>0<f>>>0){x=y;while(1){w=a[e+x|0]|0;if(!((w<<24>>24|0)==32|(w<<24>>24|0)==10)){H=x;break L2568}w=x+1|0;if(w>>>0<f>>>0){x=w}else{H=w;break}}}else{H=y}}while(0);x=H;while(1){if(x>>>0>=f>>>0){break}if((a[e+x|0]|0)==124){break}else{x=x+1|0}}q=x-1|0;L2577:do{if(q>>>0>H>>>0){u=x;w=q;while(1){s=a[e+w|0]|0;if(!((s<<24>>24|0)==32|(s<<24>>24|0)==10)){I=u;break L2577}s=w-1|0;if(s>>>0>H>>>0){u=w;w=s}else{I=w;break}}}else{I=x}}while(0);bg(E,d,e+H|0,I-H|0);aR[c[m>>2]&15](v,E,c[h+(C<<2)>>2]|j,c[o>>2]|0);q=(c[p>>2]|0)-1|0;c[p>>2]=q;w=x+1|0;u=C+1|0;if(u>>>0<g>>>0&w>>>0<f>>>0){C=u;y=w;D=q}else{J=u;break}}}else{J=0}if(J>>>0<g>>>0){D=l;y=d+108|0;C=J;while(1){cb(D|0,0,16);aR[c[m>>2]&15](v,l,c[h+(C<<2)>>2]|j,c[y>>2]|0);J=C+1|0;if(J>>>0<g>>>0){C=J}else{K=y;break}}}else{K=d+108|0}aN[c[n>>2]&15](b,v,c[K>>2]|0);c[p>>2]=(c[p>>2]|0)-1;i=k;return}function bu(b,c,d,e){b=b|0;c=c|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0;f=ce(b|0)|0;if(d>>>0<=1){g=0;return g|0}h=(e|0)!=0;e=f+3|0;i=f+2|0;j=1;k=0;L2594:while(1){l=j+1|0;L2596:do{if(l>>>0<d>>>0){m=j;n=k;o=l;p=a[c+j|0]|0;while(1){q=a[c+o|0]|0;if(p<<24>>24==60&q<<24>>24==47){r=m;s=n;t=o;break L2596}u=(q<<24>>24==10&1)+n|0;v=o+1|0;if(v>>>0<d>>>0){m=o;n=u;o=v;p=q}else{r=o;s=u;t=v;break}}}else{r=j;s=k;t=l}}while(0);if(h&(s|0)>0){if((a[c+(r-1)|0]|0)==10){w=1894}}else{w=1894}L2604:do{if((w|0)==1894){w=0;l=e+r|0;if(l>>>0>=d>>>0){g=0;w=1914;break L2594}o=d-t+1|0;if(e>>>0>=o>>>0){break}if((b9(c+(r+2)|0,b|0,f|0)|0)!=0){break}if((a[c+(i+r)|0]|0)!=62){break}p=o-e|0;if((e|0)==(o|0)){x=1}else{n=0;while(1){m=a[c+(l+n)|0]|0;if((m<<24>>24|0)==10){y=n;break}else if((m<<24>>24|0)!=32){break L2604}m=n+1|0;if(m>>>0<p>>>0){n=m}else{y=m;break}}n=y+1|0;if((n|0)==0){break}else{x=n}}n=x+e|0;L2616:do{if(n>>>0<o>>>0){p=o-n|0;L2618:do{if((n|0)==(o|0)){z=0}else{l=n+r|0;m=0;while(1){v=a[c+(l+m)|0]|0;if((v<<24>>24|0)==10){z=m;break L2618}else if((v<<24>>24|0)!=32){A=0;break L2616}v=m+1|0;if(v>>>0<p>>>0){m=v}else{z=v;break}}}}while(0);A=z+1|0}else{A=0}}while(0);B=A+n|0;if((B|0)!=0){w=1910;break L2594}}}while(0);if(t>>>0<d>>>0){j=t;k=s}else{g=0;w=1912;break}}if((w|0)==1910){g=B+r|0;return g|0}else if((w|0)==1912){return g|0}else if((w|0)==1914){return g|0}return 0}function bv(a,b){a=a|0;b=b|0;var c=0;do{if(b>>>0>1){do{if((b9(a|0,944,1)|0)==0){if((at(d[a+1|0]|0|0)|0)==0){break}else{c=1}return c|0}}while(0);do{if(b>>>0>7){do{if((b9(a|0,1632,7)|0)==0){if((at(d[a+7|0]|0|0)|0)==0){break}else{c=1}return c|0}}while(0);if(b>>>0<=8){break}if((b9(a|0,1408,8)|0)!=0){break}if((at(d[a+8|0]|0|0)|0)==0){break}else{c=1}return c|0}}while(0);if(b>>>0<=6){break}do{if((b9(a|0,1096,6)|0)==0){if((at(d[a+6|0]|0|0)|0)==0){break}else{c=1}return c|0}}while(0);if(b>>>0<=7){break}if((b9(a|0,1688,7)|0)!=0){break}if((at(d[a+7|0]|0|0)|0)==0){break}else{c=1}return c|0}}while(0);c=0;return c|0}function bw(b,c){b=b|0;c=c|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;e=0;while(1){if(e>>>0>=c>>>0){f=c;break}if((a[b+e|0]|0)==60){f=e;break}else{e=e+1|0}}if((f|0)==0){g=0;return g|0}else{h=f}L2665:while(1){i=h-1|0;j=a[b+i|0]|0;k=j&255;do{if((aH(704,k|0,5)|0)==0){if(j<<24>>24!=59){break L2665}f=h-2|0;e=f;while(1){if((e|0)==0){l=0;break}if((aw(d[b+e|0]|0)|0)==0){l=e;break}else{e=e-1|0}}if(l>>>0<f>>>0){if((a[b+l|0]|0)==38){m=l;break}}m=i}else{m=i}}while(0);if((m|0)==0){g=0;n=1965;break}else{h=m}}if((n|0)==1965){return g|0}if((k|0)==34|(k|0)==39){o=k}else if((k|0)==125){o=123}else if((k|0)==41){o=40}else if((k|0)==93){o=91}else{g=h;return g|0}if((h|0)==0){p=0;q=0;r=(p|0)==(q|0);s=r?h:i;return s|0}else{t=0;u=0;v=0}while(1){g=a[b+v|0]|0;if((g&255|0)==(o|0)){w=u+1|0;x=t}else{w=u;x=(g<<24>>24==j<<24>>24&1)+t|0}g=v+1|0;if(g>>>0<h>>>0){t=x;u=w;v=g}else{p=x;q=w;break}}r=(p|0)==(q|0);s=r?h:i;return s|0}function bx(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;e=i;i=i+16|0;f=e|0;if((a|0)==0){aB(1144,119,2304,1656)}g=a+12|0;h=c[g>>2]|0;if((h|0)==0){aB(1144,119,2304,1656)}j=a+4|0;k=c[j>>2]|0;l=a+8|0;m=c[l>>2]|0;do{if(k>>>0>=m>>>0){n=k+1|0;if(n>>>0>16777216){i=e;return}if(m>>>0>=n>>>0){break}o=m+h|0;if(o>>>0<n>>>0){p=o;while(1){q=p+h|0;if(q>>>0<n>>>0){p=q}else{r=q;break}}}else{r=o}p=a|0;n=b4(c[p>>2]|0,r)|0;if((n|0)==0){i=e;return}else{c[p>>2]=n;c[l>>2]=r;break}}}while(0);r=f|0;h=f;c[h>>2]=d;c[h+4>>2]=0;f=a|0;a=c[j>>2]|0;m=ap((c[f>>2]|0)+a|0,(c[l>>2]|0)-a|0,b|0,r|0)|0;if((m|0)<0){i=e;return}a=c[l>>2]|0;k=c[j>>2]|0;do{if(m>>>0<(a-k|0)>>>0){s=m;t=k}else{n=m+1+k|0;p=c[g>>2]|0;if((p|0)==0){aB(1144,58,2336,1656)}if(n>>>0>16777216){i=e;return}do{if(a>>>0<n>>>0){q=p+a|0;if(q>>>0<n>>>0){u=q;while(1){v=u+p|0;if(v>>>0<n>>>0){u=v}else{w=v;break}}}else{w=q}u=b4(c[f>>2]|0,w)|0;if((u|0)==0){i=e;return}else{c[f>>2]=u;c[l>>2]=w;break}}}while(0);c[h>>2]=d;c[h+4>>2]=0;n=c[j>>2]|0;p=ap((c[f>>2]|0)+n|0,(c[l>>2]|0)-n|0,b|0,r|0)|0;if((p|0)<0){i=e;return}else{s=p;t=c[j>>2]|0;break}}}while(0);c[j>>2]=t+s;i=e;return}function by(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;d=ce(b|0)|0;if((a|0)==0){aB(1144,157,2296,1656)}e=c[a+12>>2]|0;if((e|0)==0){aB(1144,157,2296,1656)}f=a+4|0;g=c[f>>2]|0;h=g+d|0;i=a+8|0;j=c[i>>2]|0;do{if(h>>>0>j>>>0){if(h>>>0>16777216){return}k=j+e|0;if(k>>>0<h>>>0){l=k;while(1){m=l+e|0;if(m>>>0<h>>>0){l=m}else{n=m;break}}}else{n=k}l=a|0;m=b4(c[l>>2]|0,n)|0;if((m|0)==0){return}else{c[l>>2]=m;c[i>>2]=n;o=c[f>>2]|0;p=m;break}}else{o=g;p=c[a>>2]|0}}while(0);a=p+o|0;ca(a|0,b|0,d)|0;c[f>>2]=(c[f>>2]|0)+d;return}function bz(b,e,f,g,h,i){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;do{if((g|0)==0){j=2021}else{i=f-1|0;if((ar(d[i]|0)|0)!=0){j=2021;break}if((ay(d[i]|0)|0)==0|h>>>0<4){k=0}else{break}return k|0}}while(0);do{if((j|0)==2021){if(h>>>0<4){k=0}else{break}return k|0}}while(0);if((cc(f|0,800,4)|0)!=0){k=0;return k|0}if((at(d[f]|0)|0)==0){k=0;return k|0}g=h-1|0;if(g>>>0>1){l=1;m=0}else{k=0;return k|0}L2782:while(1){i=f+l|0;n=a[i]|0;do{if(n<<24>>24==46){o=m+1|0}else{if((at(n&255|0)|0)!=0){o=m;break}if((a[i]|0)==45){o=m}else{p=l;q=m;break L2782}}}while(0);i=l+1|0;if(i>>>0<g>>>0){l=i;m=o}else{p=i;q=o;break}}o=(q|0)!=0?p:0;if((o|0)==0){k=0;return k|0}else{r=o}while(1){if(r>>>0>=h>>>0){break}if((ay(d[f+r|0]|0)|0)==0){r=r+1|0}else{break}}h=bw(f,r)|0;if((h|0)==0){k=0;return k|0}if((e|0)==0){aB(1144,157,2296,1656);return 0}r=c[e+12>>2]|0;if((r|0)==0){aB(1144,157,2296,1656);return 0}o=e+4|0;p=c[o>>2]|0;q=p+h|0;m=e+8|0;l=c[m>>2]|0;do{if(q>>>0>l>>>0){if(q>>>0>16777216){break}g=l+r|0;if(g>>>0<q>>>0){i=g;while(1){n=i+r|0;if(n>>>0<q>>>0){i=n}else{s=n;break}}}else{s=g}i=e|0;n=b4(c[i>>2]|0,s)|0;if((n|0)==0){break}c[i>>2]=n;c[m>>2]=s;t=c[o>>2]|0;u=n;j=2044}else{t=p;u=c[e>>2]|0;j=2044}}while(0);if((j|0)==2044){j=u+t|0;ca(j|0,f|0,h)|0;c[o>>2]=(c[o>>2]|0)+h}c[b>>2]=0;k=h;return k|0}function bA(b,e,f,g,h,i){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;if((g|0)==0){j=0;return j|0}else{k=0}while(1){i=d[f+(k^-1)|0]|0;if((at(i|0)|0)==0){if((aH(736,i|0,5)|0)==0){l=k;break}}i=k+1|0;if(i>>>0<g>>>0){k=i}else{l=i;break}}if((l|0)==0){j=0;return j|0}k=h-1|0;if((h|0)==0){j=0;return j|0}else{m=0;n=0;o=0}L2832:while(1){g=a[f+o|0]|0;do{if((at(g&255|0)|0)==0){if((g<<24>>24|0)==64){p=n;q=m+1|0;break}else if((g<<24>>24|0)==45|(g<<24>>24|0)==95){p=n;q=m;break}else if((g<<24>>24|0)!=46){r=m;s=n;t=o;break L2832}if(o>>>0>=k>>>0){r=m;s=n;t=o;break L2832}p=n+1|0;q=m}else{p=n;q=m}}while(0);g=o+1|0;if(g>>>0<h>>>0){m=q;n=p;o=g}else{r=q;s=p;t=g;break}}if((r|0)!=1|t>>>0<2|(s|0)==0){j=0;return j|0}if((aw(d[f+(t-1)|0]|0|0)|0)==0){j=0;return j|0}s=bw(f,t)|0;if((s|0)==0){j=0;return j|0}t=f+(-l|0)|0;f=s+l|0;if((e|0)==0){aB(1144,157,2296,1656);return 0}r=c[e+12>>2]|0;if((r|0)==0){aB(1144,157,2296,1656);return 0}p=e+4|0;q=c[p>>2]|0;o=q+f|0;n=e+8|0;m=c[n>>2]|0;do{if(o>>>0>m>>>0){if(o>>>0>16777216){break}h=m+r|0;if(h>>>0<o>>>0){k=h;while(1){g=k+r|0;if(g>>>0<o>>>0){k=g}else{u=g;break}}}else{u=h}k=e|0;g=b4(c[k>>2]|0,u)|0;if((g|0)==0){break}c[k>>2]=g;c[n>>2]=u;v=c[p>>2]|0;w=g;x=2082}else{v=q;w=c[e>>2]|0;x=2082}}while(0);if((x|0)==2082){x=w+v|0;ca(x|0,t|0,f)|0;c[p>>2]=(c[p>>2]|0)+f}c[b>>2]=l;j=s;return j|0}function bB(b,e,f,g,h,i){b=b|0;e=e|0;f=f|0;g=g|0;h=h|0;i=i|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;if(h>>>0<4){j=0;return j|0}if((a[f+1|0]|0)!=47){j=0;return j|0}if((a[f+2|0]|0)==47){k=0}else{j=0;return j|0}while(1){if(k>>>0>=g>>>0){break}if((aw(d[f+(k^-1)|0]|0)|0)==0){break}else{k=k+1|0}}g=f+(-k|0)|0;if((bv(g,k+h|0)|0)==0){j=0;return j|0}l=i&1;if((at(d[f+3|0]|0)|0)==0){j=0;return j|0}i=h-4|0;L2889:do{if(i>>>0>1){m=1;n=0;while(1){o=f+(m+3)|0;p=a[o]|0;do{if(p<<24>>24==46){q=n+1|0}else{if((at(p&255|0)|0)!=0){q=n;break}if((a[o]|0)==45){q=n}else{r=m;s=n;break L2889}}}while(0);o=m+1|0;if(o>>>0<i>>>0){m=o;n=q}else{r=o;s=q;break}}}else{r=1;s=0}}while(0);if((l|0)==0){t=(s|0)!=0?r:0}else{t=r}if((t|0)==0){j=0;return j|0}r=t+3|0;while(1){if(r>>>0>=h>>>0){break}if((ay(d[f+r|0]|0)|0)==0){r=r+1|0}else{break}}h=bw(f,r)|0;if((h|0)==0){j=0;return j|0}r=h+k|0;if((e|0)==0){aB(1144,157,2296,1656);return 0}f=c[e+12>>2]|0;if((f|0)==0){aB(1144,157,2296,1656);return 0}t=e+4|0;s=c[t>>2]|0;l=s+r|0;q=e+8|0;i=c[q>>2]|0;do{if(l>>>0>i>>>0){if(l>>>0>16777216){break}n=i+f|0;if(n>>>0<l>>>0){m=n;while(1){o=m+f|0;if(o>>>0<l>>>0){m=o}else{u=o;break}}}else{u=n}m=e|0;o=b4(c[m>>2]|0,u)|0;if((o|0)==0){break}c[m>>2]=o;c[q>>2]=u;v=c[t>>2]|0;w=o;x=2124}else{v=s;w=c[e>>2]|0;x=2124}}while(0);if((x|0)==2124){x=w+v|0;ca(x|0,g|0,r)|0;c[t>>2]=(c[t>>2]|0)+r}c[b>>2]=k;j=h;return j|0}function bC(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0;b=i;i=i+136|0;d=b|0;e=b+112|0;f=b1(16)|0;g=f;h=(f|0)==0;if(h){j=f+4|0;k=f}else{l=f;c[l>>2]=0;c[f+8>>2]=0;m=f+4|0;c[m>>2]=0;c[f+12>>2]=1024;j=m;k=l}l=e;cb(l|0,0,20);c[e+12>>2]=192;e=d;ca(e|0,8,108)|0;e=a6(927,16,d,l)|0;a7(g,a,ce(a|0)|0,e);a9(e);e=b3((c[j>>2]|0)+1|0,1)|0;a=c[k>>2]|0;g=c[j>>2]|0;ca(e|0,a|0,g)|0;if(h){i=b;return e|0}b2(c[k>>2]|0);b2(f);i=b;return e|0}function bD(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0;if((b|0)==0){aB(1144,157,2296,1656);return 0}e=b+12|0;f=c[e>>2]|0;if((f|0)==0){aB(1144,157,2296,1656);return 0}g=b+4|0;h=c[g>>2]|0;i=h+6|0;j=b+8|0;k=c[j>>2]|0;do{if(i>>>0>k>>>0){if(i>>>0>16777216){break}l=k+f|0;if(l>>>0<i>>>0){m=l;while(1){n=m+f|0;if(n>>>0<i>>>0){m=n}else{o=n;break}}}else{o=l}m=b|0;n=b4(c[m>>2]|0,o)|0;if((n|0)==0){break}c[m>>2]=n;c[j>>2]=o;p=c[g>>2]|0;q=n;r=2155}else{p=h;q=c[b>>2]|0;r=2155}}while(0);if((r|0)==2155){r=q+p|0;a[r]=a[768]|0;a[r+1|0]=a[769|0]|0;a[r+2|0]=a[770|0]|0;a[r+3|0]=a[771|0]|0;a[r+4|0]=a[772|0]|0;a[r+5|0]=a[773|0]|0;c[g>>2]=(c[g>>2]|0)+6}if((d|0)!=0){b$(b,c[d>>2]|0,c[d+4>>2]|0,0)}d=c[e>>2]|0;if((d|0)==0){aB(1144,157,2296,1656);return 0}e=c[g>>2]|0;r=e+7|0;p=c[j>>2]|0;do{if(r>>>0>p>>>0){if(r>>>0>16777216){return 1}q=p+d|0;if(q>>>0<r>>>0){h=q;while(1){o=h+d|0;if(o>>>0<r>>>0){h=o}else{s=o;break}}}else{s=q}h=b|0;l=b4(c[h>>2]|0,s)|0;if((l|0)==0){return 1}else{c[h>>2]=l;c[j>>2]=s;t=c[g>>2]|0;u=l;break}}else{t=e;u=c[b>>2]|0}}while(0);b=u+t|0;a[b]=a[760]|0;a[b+1|0]=a[761|0]|0;a[b+2|0]=a[762|0]|0;a[b+3|0]=a[763|0]|0;a[b+4|0]=a[764|0]|0;a[b+5|0]=a[765|0]|0;a[b+6|0]=a[766|0]|0;c[g>>2]=(c[g>>2]|0)+7;return 1}function bE(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;if((d|0)==0){f=0;return f|0}e=d+4|0;if((c[e>>2]|0)==0){f=0;return f|0}if((b|0)==0){aB(1144,157,2296,1656);return 0}g=b+12|0;h=c[g>>2]|0;if((h|0)==0){aB(1144,157,2296,1656);return 0}i=b+4|0;j=c[i>>2]|0;k=j+8|0;l=b+8|0;m=c[l>>2]|0;do{if(k>>>0>m>>>0){if(k>>>0>16777216){break}n=m+h|0;if(n>>>0<k>>>0){o=n;while(1){p=o+h|0;if(p>>>0<k>>>0){o=p}else{q=p;break}}}else{q=n}o=b|0;p=b4(c[o>>2]|0,q)|0;if((p|0)==0){break}c[o>>2]=p;c[l>>2]=q;r=c[i>>2]|0;s=p;u=2186}else{r=j;s=c[b>>2]|0;u=2186}}while(0);if((u|0)==2186){j=s+r|0;r=j|0;t=1920234300;a[r]=t&255;t=t>>8;a[r+1|0]=t&255;t=t>>8;a[r+2|0]=t&255;t=t>>8;a[r+3|0]=t&255;r=j+4|0;t=1046965871;a[r]=t&255;t=t>>8;a[r+1|0]=t&255;t=t>>8;a[r+2|0]=t&255;t=t>>8;a[r+3|0]=t&255;c[i>>2]=(c[i>>2]|0)+8}r=c[d>>2]|0;d=c[e>>2]|0;e=c[g>>2]|0;if((e|0)==0){aB(1144,157,2296,1656);return 0}j=c[i>>2]|0;s=j+d|0;q=c[l>>2]|0;do{if(s>>>0>q>>>0){if(s>>>0>16777216){break}k=q+e|0;if(k>>>0<s>>>0){h=k;while(1){m=h+e|0;if(m>>>0<s>>>0){h=m}else{v=m;break}}}else{v=k}h=b|0;n=b4(c[h>>2]|0,v)|0;if((n|0)==0){break}c[h>>2]=n;c[l>>2]=v;w=c[i>>2]|0;x=n;u=2196}else{w=j;x=c[b>>2]|0;u=2196}}while(0);if((u|0)==2196){u=x+w|0;ca(u|0,r|0,d)|0;c[i>>2]=(c[i>>2]|0)+d}d=c[g>>2]|0;if((d|0)==0){aB(1144,157,2296,1656);return 0}g=c[i>>2]|0;r=g+9|0;u=c[l>>2]|0;do{if(r>>>0>u>>>0){if(r>>>0>16777216){f=1;return f|0}w=u+d|0;if(w>>>0<r>>>0){x=w;while(1){j=x+d|0;if(j>>>0<r>>>0){x=j}else{y=j;break}}}else{y=w}x=b|0;k=b4(c[x>>2]|0,y)|0;if((k|0)==0){f=1;return f|0}else{c[x>>2]=k;c[l>>2]=y;z=c[i>>2]|0;A=k;break}}else{z=g;A=c[b>>2]|0}}while(0);b=A+z|0;ca(b|0,784,9)|0;c[i>>2]=(c[i>>2]|0)+9;f=1;return f|0}function bF(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;if((d|0)==0){f=0;return f|0}e=d+4|0;if((c[e>>2]|0)==0){f=0;return f|0}if((b|0)==0){aB(1144,157,2296,1656);return 0}g=b+12|0;h=c[g>>2]|0;if((h|0)==0){aB(1144,157,2296,1656);return 0}i=b+4|0;j=c[i>>2]|0;k=j+4|0;l=b+8|0;m=c[l>>2]|0;do{if(k>>>0>m>>>0){if(k>>>0>16777216){break}n=m+h|0;if(n>>>0<k>>>0){o=n;while(1){p=o+h|0;if(p>>>0<k>>>0){o=p}else{q=p;break}}}else{q=n}o=b|0;p=b4(c[o>>2]|0,q)|0;if((p|0)==0){break}c[o>>2]=p;c[l>>2]=q;r=c[i>>2]|0;s=p;u=2227}else{r=j;s=c[b>>2]|0;u=2227}}while(0);if((u|0)==2227){j=s+r|0;t=1047356732;a[j]=t&255;t=t>>8;a[j+1|0]=t&255;t=t>>8;a[j+2|0]=t&255;t=t>>8;a[j+3|0]=t&255;c[i>>2]=(c[i>>2]|0)+4}j=c[d>>2]|0;d=c[e>>2]|0;e=c[g>>2]|0;if((e|0)==0){aB(1144,157,2296,1656);return 0}r=c[i>>2]|0;s=r+d|0;q=c[l>>2]|0;do{if(s>>>0>q>>>0){if(s>>>0>16777216){break}k=q+e|0;if(k>>>0<s>>>0){h=k;while(1){m=h+e|0;if(m>>>0<s>>>0){h=m}else{v=m;break}}}else{v=k}h=b|0;n=b4(c[h>>2]|0,v)|0;if((n|0)==0){break}c[h>>2]=n;c[l>>2]=v;w=c[i>>2]|0;x=n;u=2237}else{w=r;x=c[b>>2]|0;u=2237}}while(0);if((u|0)==2237){u=x+w|0;ca(u|0,j|0,d)|0;c[i>>2]=(c[i>>2]|0)+d}d=c[g>>2]|0;if((d|0)==0){aB(1144,157,2296,1656);return 0}g=c[i>>2]|0;j=g+5|0;u=c[l>>2]|0;do{if(j>>>0>u>>>0){if(j>>>0>16777216){f=1;return f|0}w=u+d|0;if(w>>>0<j>>>0){x=w;while(1){r=x+d|0;if(r>>>0<j>>>0){x=r}else{y=r;break}}}else{y=w}x=b|0;k=b4(c[x>>2]|0,y)|0;if((k|0)==0){f=1;return f|0}else{c[x>>2]=k;c[l>>2]=y;z=c[i>>2]|0;A=k;break}}else{z=g;A=c[b>>2]|0}}while(0);b=A+z|0;a[b]=a[808]|0;a[b+1|0]=a[809|0]|0;a[b+2|0]=a[810|0]|0;a[b+3|0]=a[811|0]|0;a[b+4|0]=a[812|0]|0;c[i>>2]=(c[i>>2]|0)+5;f=1;return f|0}function bG(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0;if((b|0)==0){e=0;return e|0}d=b+4|0;if((c[d>>2]|0)==0){e=0;return e|0}if((a|0)==0){aB(1144,157,2296,1656);return 0}f=a+12|0;g=c[f>>2]|0;if((g|0)==0){aB(1144,157,2296,1656);return 0}h=a+4|0;i=c[h>>2]|0;j=i+12|0;k=a+8|0;l=c[k>>2]|0;do{if(j>>>0>l>>>0){if(j>>>0>16777216){break}m=l+g|0;if(m>>>0<j>>>0){n=m;while(1){o=n+g|0;if(o>>>0<j>>>0){n=o}else{p=o;break}}}else{p=m}n=a|0;o=b4(c[n>>2]|0,p)|0;if((o|0)==0){break}c[n>>2]=o;c[k>>2]=p;q=c[h>>2]|0;r=o;s=2268}else{q=i;r=c[a>>2]|0;s=2268}}while(0);if((s|0)==2268){i=r+q|0;ca(i|0,840,12)|0;c[h>>2]=(c[h>>2]|0)+12}i=c[b>>2]|0;b=c[d>>2]|0;d=c[f>>2]|0;if((d|0)==0){aB(1144,157,2296,1656);return 0}q=c[h>>2]|0;r=q+b|0;p=c[k>>2]|0;do{if(r>>>0>p>>>0){if(r>>>0>16777216){break}j=p+d|0;if(j>>>0<r>>>0){g=j;while(1){l=g+d|0;if(l>>>0<r>>>0){g=l}else{t=l;break}}}else{t=j}g=a|0;m=b4(c[g>>2]|0,t)|0;if((m|0)==0){break}c[g>>2]=m;c[k>>2]=t;u=c[h>>2]|0;v=m;s=2278}else{u=q;v=c[a>>2]|0;s=2278}}while(0);if((s|0)==2278){s=v+u|0;ca(s|0,i|0,b)|0;c[h>>2]=(c[h>>2]|0)+b}b=c[f>>2]|0;if((b|0)==0){aB(1144,157,2296,1656);return 0}f=c[h>>2]|0;i=f+14|0;s=c[k>>2]|0;do{if(i>>>0>s>>>0){if(i>>>0>16777216){e=1;return e|0}u=s+b|0;if(u>>>0<i>>>0){v=u;while(1){q=v+b|0;if(q>>>0<i>>>0){v=q}else{w=q;break}}}else{w=u}v=a|0;j=b4(c[v>>2]|0,w)|0;if((j|0)==0){e=1;return e|0}else{c[v>>2]=j;c[k>>2]=w;x=c[h>>2]|0;y=j;break}}else{x=f;y=c[a>>2]|0}}while(0);a=y+x|0;ca(a|0,816,14)|0;c[h>>2]=(c[h>>2]|0)+14;e=1;return e|0}function bH(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;if((d|0)==0){f=0;return f|0}e=d+4|0;if((c[e>>2]|0)==0){f=0;return f|0}if((b|0)==0){aB(1144,157,2296,1656);return 0}g=b+12|0;h=c[g>>2]|0;if((h|0)==0){aB(1144,157,2296,1656);return 0}i=b+4|0;j=c[i>>2]|0;k=j+5|0;l=b+8|0;m=c[l>>2]|0;do{if(k>>>0>m>>>0){if(k>>>0>16777216){break}n=m+h|0;if(n>>>0<k>>>0){o=n;while(1){p=o+h|0;if(p>>>0<k>>>0){o=p}else{q=p;break}}}else{q=n}o=b|0;p=b4(c[o>>2]|0,q)|0;if((p|0)==0){break}c[o>>2]=p;c[l>>2]=q;r=c[i>>2]|0;s=p;t=2309}else{r=j;s=c[b>>2]|0;t=2309}}while(0);if((t|0)==2309){j=s+r|0;a[j]=a[872]|0;a[j+1|0]=a[873|0]|0;a[j+2|0]=a[874|0]|0;a[j+3|0]=a[875|0]|0;a[j+4|0]=a[876|0]|0;c[i>>2]=(c[i>>2]|0)+5}j=c[d>>2]|0;d=c[e>>2]|0;e=c[g>>2]|0;if((e|0)==0){aB(1144,157,2296,1656);return 0}r=c[i>>2]|0;s=r+d|0;q=c[l>>2]|0;do{if(s>>>0>q>>>0){if(s>>>0>16777216){break}k=q+e|0;if(k>>>0<s>>>0){h=k;while(1){m=h+e|0;if(m>>>0<s>>>0){h=m}else{u=m;break}}}else{u=k}h=b|0;n=b4(c[h>>2]|0,u)|0;if((n|0)==0){break}c[h>>2]=n;c[l>>2]=u;v=c[i>>2]|0;w=n;t=2319}else{v=r;w=c[b>>2]|0;t=2319}}while(0);if((t|0)==2319){t=w+v|0;ca(t|0,j|0,d)|0;c[i>>2]=(c[i>>2]|0)+d}d=c[g>>2]|0;if((d|0)==0){aB(1144,157,2296,1656);return 0}g=c[i>>2]|0;j=g+6|0;t=c[l>>2]|0;do{if(j>>>0>t>>>0){if(j>>>0>16777216){f=1;return f|0}v=t+d|0;if(v>>>0<j>>>0){w=v;while(1){r=w+d|0;if(r>>>0<j>>>0){w=r}else{x=r;break}}}else{x=v}w=b|0;k=b4(c[w>>2]|0,x)|0;if((k|0)==0){f=1;return f|0}else{c[w>>2]=k;c[l>>2]=x;y=c[i>>2]|0;z=k;break}}else{y=g;z=c[b>>2]|0}}while(0);b=z+y|0;a[b]=a[856]|0;a[b+1|0]=a[857|0]|0;a[b+2|0]=a[858|0]|0;a[b+3|0]=a[859|0]|0;a[b+4|0]=a[860|0]|0;a[b+5|0]=a[861|0]|0;c[i>>2]=(c[i>>2]|0)+6;f=1;return f|0}function bI(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;if((d|0)==0){f=0;return f|0}e=d+4|0;if((c[e>>2]|0)==0){f=0;return f|0}if((b|0)==0){aB(1144,157,2296,1656);return 0}g=b+12|0;h=c[g>>2]|0;if((h|0)==0){aB(1144,157,2296,1656);return 0}i=b+4|0;j=c[i>>2]|0;k=j+5|0;l=b+8|0;m=c[l>>2]|0;do{if(k>>>0>m>>>0){if(k>>>0>16777216){break}n=m+h|0;if(n>>>0<k>>>0){o=n;while(1){p=o+h|0;if(p>>>0<k>>>0){o=p}else{q=p;break}}}else{q=n}o=b|0;p=b4(c[o>>2]|0,q)|0;if((p|0)==0){break}c[o>>2]=p;c[l>>2]=q;r=c[i>>2]|0;s=p;t=2350}else{r=j;s=c[b>>2]|0;t=2350}}while(0);if((t|0)==2350){j=s+r|0;a[j]=a[888]|0;a[j+1|0]=a[889|0]|0;a[j+2|0]=a[890|0]|0;a[j+3|0]=a[891|0]|0;a[j+4|0]=a[892|0]|0;c[i>>2]=(c[i>>2]|0)+5}j=c[d>>2]|0;d=c[e>>2]|0;e=c[g>>2]|0;if((e|0)==0){aB(1144,157,2296,1656);return 0}r=c[i>>2]|0;s=r+d|0;q=c[l>>2]|0;do{if(s>>>0>q>>>0){if(s>>>0>16777216){break}k=q+e|0;if(k>>>0<s>>>0){h=k;while(1){m=h+e|0;if(m>>>0<s>>>0){h=m}else{u=m;break}}}else{u=k}h=b|0;n=b4(c[h>>2]|0,u)|0;if((n|0)==0){break}c[h>>2]=n;c[l>>2]=u;v=c[i>>2]|0;w=n;t=2360}else{v=r;w=c[b>>2]|0;t=2360}}while(0);if((t|0)==2360){t=w+v|0;ca(t|0,j|0,d)|0;c[i>>2]=(c[i>>2]|0)+d}d=c[g>>2]|0;if((d|0)==0){aB(1144,157,2296,1656);return 0}g=c[i>>2]|0;j=g+6|0;t=c[l>>2]|0;do{if(j>>>0>t>>>0){if(j>>>0>16777216){f=1;return f|0}v=t+d|0;if(v>>>0<j>>>0){w=v;while(1){r=w+d|0;if(r>>>0<j>>>0){w=r}else{x=r;break}}}else{x=v}w=b|0;k=b4(c[w>>2]|0,x)|0;if((k|0)==0){f=1;return f|0}else{c[w>>2]=k;c[l>>2]=x;y=c[i>>2]|0;z=k;break}}else{y=g;z=c[b>>2]|0}}while(0);b=z+y|0;a[b]=a[880]|0;a[b+1|0]=a[881|0]|0;a[b+2|0]=a[882|0]|0;a[b+3|0]=a[883|0]|0;a[b+4|0]=a[884|0]|0;a[b+5|0]=a[885|0]|0;c[i>>2]=(c[i>>2]|0)+6;f=1;return f|0}function bJ(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0;if((d|0)==0){f=0;return f|0}e=d+4|0;if((c[e>>2]|0)==0){f=0;return f|0}if((b|0)==0){aB(1144,157,2296,1656);return 0}g=b+12|0;h=c[g>>2]|0;if((h|0)==0){aB(1144,157,2296,1656);return 0}i=b+4|0;j=c[i>>2]|0;k=j+5|0;l=b+8|0;m=c[l>>2]|0;do{if(k>>>0>m>>>0){if(k>>>0>16777216){break}n=m+h|0;if(n>>>0<k>>>0){o=n;while(1){p=o+h|0;if(p>>>0<k>>>0){o=p}else{q=p;break}}}else{q=n}o=b|0;p=b4(c[o>>2]|0,q)|0;if((p|0)==0){break}c[o>>2]=p;c[l>>2]=q;r=c[i>>2]|0;s=p;t=2391}else{r=j;s=c[b>>2]|0;t=2391}}while(0);if((t|0)==2391){j=s+r|0;a[j]=a[920]|0;a[j+1|0]=a[921|0]|0;a[j+2|0]=a[922|0]|0;a[j+3|0]=a[923|0]|0;a[j+4|0]=a[924|0]|0;c[i>>2]=(c[i>>2]|0)+5}j=c[d>>2]|0;d=c[e>>2]|0;e=c[g>>2]|0;if((e|0)==0){aB(1144,157,2296,1656);return 0}r=c[i>>2]|0;s=r+d|0;q=c[l>>2]|0;do{if(s>>>0>q>>>0){if(s>>>0>16777216){break}k=q+e|0;if(k>>>0<s>>>0){h=k;while(1){m=h+e|0;if(m>>>0<s>>>0){h=m}else{u=m;break}}}else{u=k}h=b|0;n=b4(c[h>>2]|0,u)|0;if((n|0)==0){break}c[h>>2]=n;c[l>>2]=u;v=c[i>>2]|0;w=n;t=2401}else{v=r;w=c[b>>2]|0;t=2401}}while(0);if((t|0)==2401){t=w+v|0;ca(t|0,j|0,d)|0;c[i>>2]=(c[i>>2]|0)+d}d=c[g>>2]|0;if((d|0)==0){aB(1144,157,2296,1656);return 0}g=c[i>>2]|0;j=g+6|0;t=c[l>>2]|0;do{if(j>>>0>t>>>0){if(j>>>0>16777216){f=1;return f|0}v=t+d|0;if(v>>>0<j>>>0){w=v;while(1){r=w+d|0;if(r>>>0<j>>>0){w=r}else{x=r;break}}}else{x=v}w=b|0;k=b4(c[w>>2]|0,x)|0;if((k|0)==0){f=1;return f|0}else{c[w>>2]=k;c[l>>2]=x;y=c[i>>2]|0;z=k;break}}else{y=g;z=c[b>>2]|0}}while(0);b=z+y|0;a[b]=a[912]|0;a[b+1|0]=a[913|0]|0;a[b+2|0]=a[914|0]|0;a[b+3|0]=a[915|0]|0;a[b+4|0]=a[916|0]|0;a[b+5|0]=a[917|0]|0;c[i>>2]=(c[i>>2]|0)+6;f=1;return f|0}function bK(b,e,f,g){b=b|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0;g=b+4|0;h=c[g>>2]|0;do{if((h|0)!=0){i=c[b+12>>2]|0;if((i|0)==0){aB(1144,178,2288,1656)}j=h+1|0;k=b+8|0;l=c[k>>2]|0;if(j>>>0>l>>>0){if(j>>>0>16777216){break}m=l+i|0;if(m>>>0<j>>>0){l=m;while(1){n=l+i|0;if(n>>>0<j>>>0){l=n}else{o=n;break}}}else{o=m}l=b|0;j=b4(c[l>>2]|0,o)|0;if((j|0)==0){break}c[l>>2]=j;c[k>>2]=o;p=c[g>>2]|0;q=j}else{p=h;q=c[b>>2]|0}a[q+p|0]=10;c[g>>2]=(c[g>>2]|0)+1}}while(0);do{if((f|0)==0){r=2478}else{p=f+4|0;if((c[p>>2]|0)==0){r=2478;break}if((b|0)==0){aB(1144,157,2296,1656)}q=b+12|0;h=c[q>>2]|0;if((h|0)==0){aB(1144,157,2296,1656)}o=c[g>>2]|0;j=o+18|0;l=b+8|0;i=c[l>>2]|0;do{if(j>>>0>i>>>0){if(j>>>0>16777216){break}n=i+h|0;if(n>>>0<j>>>0){s=n;while(1){u=s+h|0;if(u>>>0<j>>>0){s=u}else{v=u;break}}}else{v=n}s=b|0;u=b4(c[s>>2]|0,v)|0;if((u|0)==0){break}c[s>>2]=u;c[l>>2]=v;w=c[g>>2]|0;x=u;r=2443}else{w=o;x=c[b>>2]|0;r=2443}}while(0);if((r|0)==2443){o=x+w|0;ca(o|0,976,18)|0;c[g>>2]=(c[g>>2]|0)+18}o=c[p>>2]|0;L3365:do{if((o|0)!=0){j=f|0;h=b|0;i=0;k=0;m=o;L3367:while(1){u=i;s=m;while(1){if(u>>>0>=s>>>0){y=s;break}if((ay(d[(c[j>>2]|0)+u|0]|0)|0)==0){r=2450;break}u=u+1|0;s=c[p>>2]|0}if((r|0)==2450){r=0;y=c[p>>2]|0}if(u>>>0<y>>>0){s=u;z=y;while(1){if(s>>>0>=z>>>0){break}if((ay(d[(c[j>>2]|0)+s|0]|0)|0)!=0){break}s=s+1|0;z=c[p>>2]|0}z=((a[(c[j>>2]|0)+u|0]|0)==46&1)+u|0;do{if((k|0)!=0){A=c[q>>2]|0;if((A|0)==0){break L3367}B=c[g>>2]|0;C=B+1|0;D=c[l>>2]|0;if(C>>>0>D>>>0){if(C>>>0>16777216){break}E=D+A|0;if(E>>>0<C>>>0){D=E;while(1){F=D+A|0;if(F>>>0<C>>>0){D=F}else{G=F;break}}}else{G=E}D=b4(c[h>>2]|0,G)|0;if((D|0)==0){break}c[h>>2]=D;c[l>>2]=G;H=c[g>>2]|0;I=D}else{H=B;I=c[h>>2]|0}a[I+H|0]=32;c[g>>2]=(c[g>>2]|0)+1}}while(0);b$(b,(c[j>>2]|0)+z|0,s-z|0,0);J=s;K=c[p>>2]|0}else{J=u;K=y}D=J+1|0;if(D>>>0<K>>>0){i=D;k=k+1|0;m=K}else{break L3365}}aB(1144,178,2288,1656)}}while(0);p=c[q>>2]|0;if((p|0)==0){aB(1144,157,2296,1656)}o=c[g>>2]|0;m=o+2|0;k=c[l>>2]|0;if(m>>>0>k>>>0){if(m>>>0>16777216){break}i=k+p|0;if(i>>>0<m>>>0){k=i;while(1){j=k+p|0;if(j>>>0<m>>>0){k=j}else{L=j;break}}}else{L=i}k=b|0;m=b4(c[k>>2]|0,L)|0;if((m|0)==0){break}c[k>>2]=m;c[l>>2]=L;M=c[g>>2]|0;N=m}else{M=o;N=c[b>>2]|0}m=N+M|0;t=15906;a[m]=t&255;t=t>>8;a[m+1|0]=t&255;c[g>>2]=(c[g>>2]|0)+2}}while(0);do{if((r|0)==2478){if((b|0)==0){aB(1144,157,2296,1656)}M=c[b+12>>2]|0;if((M|0)==0){aB(1144,157,2296,1656)}N=c[g>>2]|0;L=N+11|0;K=b+8|0;J=c[K>>2]|0;if(L>>>0>J>>>0){if(L>>>0>16777216){break}y=J+M|0;if(y>>>0<L>>>0){J=y;while(1){H=J+M|0;if(H>>>0<L>>>0){J=H}else{O=H;break}}}else{O=y}J=b|0;L=b4(c[J>>2]|0,O)|0;if((L|0)==0){break}c[J>>2]=L;c[K>>2]=O;P=c[g>>2]|0;Q=L}else{P=N;Q=c[b>>2]|0}L=Q+P|0;ca(L|0,952,11)|0;c[g>>2]=(c[g>>2]|0)+11}}while(0);if((e|0)!=0){b$(b,c[e>>2]|0,c[e+4>>2]|0,0)}if((b|0)==0){aB(1144,157,2296,1656)}e=c[b+12>>2]|0;if((e|0)==0){aB(1144,157,2296,1656)}P=c[g>>2]|0;Q=P+14|0;O=b+8|0;r=c[O>>2]|0;do{if(Q>>>0>r>>>0){if(Q>>>0>16777216){return}L=r+e|0;if(L>>>0<Q>>>0){J=L;while(1){M=J+e|0;if(M>>>0<Q>>>0){J=M}else{R=M;break}}}else{R=L}J=b|0;N=b4(c[J>>2]|0,R)|0;if((N|0)==0){return}else{c[J>>2]=N;c[O>>2]=R;S=c[g>>2]|0;T=N;break}}else{S=P;T=c[b>>2]|0}}while(0);b=T+S|0;ca(b|0,928,14)|0;c[g>>2]=(c[g>>2]|0)+14;return}function bL(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;e=b+4|0;f=c[e>>2]|0;g=b+12|0;do{if((f|0)!=0){h=c[g>>2]|0;if((h|0)==0){aB(1144,178,2288,1656)}i=f+1|0;j=b+8|0;k=c[j>>2]|0;do{if(i>>>0>k>>>0){if(i>>>0>16777216){break}l=k+h|0;if(l>>>0<i>>>0){m=l;while(1){n=m+h|0;if(n>>>0<i>>>0){m=n}else{o=n;break}}}else{o=l}m=b|0;n=b4(c[m>>2]|0,o)|0;if((n|0)==0){break}c[m>>2]=n;c[j>>2]=o;p=c[e>>2]|0;q=n;r=2522}else{p=f;q=c[b>>2]|0;r=2522}}while(0);if((r|0)==2522){a[q+p|0]=10;c[e>>2]=(c[e>>2]|0)+1}if((b|0)!=0){break}aB(1144,157,2296,1656)}}while(0);p=c[g>>2]|0;if((p|0)==0){aB(1144,157,2296,1656)}q=c[e>>2]|0;f=q+13|0;o=b+8|0;j=c[o>>2]|0;do{if(f>>>0>j>>>0){if(f>>>0>16777216){break}i=j+p|0;if(i>>>0<f>>>0){h=i;while(1){k=h+p|0;if(k>>>0<f>>>0){h=k}else{s=k;break}}}else{s=i}h=b|0;k=b4(c[h>>2]|0,s)|0;if((k|0)==0){break}c[h>>2]=k;c[o>>2]=s;t=c[e>>2]|0;u=k;r=2533}else{t=q;u=c[b>>2]|0;r=2533}}while(0);if((r|0)==2533){r=u+t|0;ca(r|0,1016,13)|0;c[e>>2]=(c[e>>2]|0)+13}do{if((d|0)!=0){r=c[d>>2]|0;t=c[d+4>>2]|0;u=c[g>>2]|0;if((u|0)==0){aB(1144,157,2296,1656)}q=c[e>>2]|0;s=q+t|0;f=c[o>>2]|0;if(s>>>0>f>>>0){if(s>>>0>16777216){break}p=f+u|0;if(p>>>0<s>>>0){f=p;while(1){j=f+u|0;if(j>>>0<s>>>0){f=j}else{v=j;break}}}else{v=p}f=b|0;s=b4(c[f>>2]|0,v)|0;if((s|0)==0){break}c[f>>2]=s;c[o>>2]=v;w=c[e>>2]|0;x=s}else{w=q;x=c[b>>2]|0}s=x+w|0;ca(s|0,r|0,t)|0;c[e>>2]=(c[e>>2]|0)+t}}while(0);w=c[g>>2]|0;if((w|0)==0){aB(1144,157,2296,1656)}g=c[e>>2]|0;x=g+14|0;v=c[o>>2]|0;do{if(x>>>0>v>>>0){if(x>>>0>16777216){return}d=v+w|0;if(d>>>0<x>>>0){s=d;while(1){f=s+w|0;if(f>>>0<x>>>0){s=f}else{y=f;break}}}else{y=d}s=b|0;t=b4(c[s>>2]|0,y)|0;if((t|0)==0){return}else{c[s>>2]=t;c[o>>2]=y;z=c[e>>2]|0;A=t;break}}else{z=g;A=c[b>>2]|0}}while(0);b=A+z|0;ca(b|0,1e3,14)|0;c[e>>2]=(c[e>>2]|0)+14;return}function bM(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;if((d|0)==0){return}e=d|0;f=c[d+4>>2]|0;while(1){if((f|0)==0){g=0;break}d=f-1|0;if((a[(c[e>>2]|0)+d|0]|0)==10){f=d}else{g=f;break}}f=0;while(1){if(f>>>0>=g>>>0){h=2605;break}if((a[(c[e>>2]|0)+f|0]|0)==10){f=f+1|0}else{break}}if((h|0)==2605){return}d=b+4|0;i=c[d>>2]|0;do{if((i|0)!=0){if((b|0)==0){aB(1144,178,2288,1656)}j=c[b+12>>2]|0;if((j|0)==0){aB(1144,178,2288,1656)}k=i+1|0;l=b+8|0;m=c[l>>2]|0;if(k>>>0>m>>>0){if(k>>>0>16777216){break}n=m+j|0;if(n>>>0<k>>>0){m=n;while(1){o=m+j|0;if(o>>>0<k>>>0){m=o}else{p=o;break}}}else{p=n}m=b|0;k=b4(c[m>>2]|0,p)|0;if((k|0)==0){break}c[m>>2]=k;c[l>>2]=p;q=c[d>>2]|0;r=k}else{q=i;r=c[b>>2]|0}a[r+q|0]=10;c[d>>2]=(c[d>>2]|0)+1}}while(0);q=(c[e>>2]|0)+f|0;e=g-f|0;if((b|0)==0){aB(1144,157,2296,1656)}f=b+12|0;g=c[f>>2]|0;if((g|0)==0){aB(1144,157,2296,1656)}r=c[d>>2]|0;i=r+e|0;p=b+8|0;k=c[p>>2]|0;do{if(i>>>0>k>>>0){if(i>>>0>16777216){break}m=k+g|0;if(m>>>0<i>>>0){j=m;while(1){o=j+g|0;if(o>>>0<i>>>0){j=o}else{s=o;break}}}else{s=m}j=b|0;l=b4(c[j>>2]|0,s)|0;if((l|0)==0){break}c[j>>2]=l;c[p>>2]=s;t=c[d>>2]|0;u=l;h=2590}else{t=r;u=c[b>>2]|0;h=2590}}while(0);if((h|0)==2590){h=u+t|0;ca(h|0,q|0,e)|0;c[d>>2]=(c[d>>2]|0)+e}e=c[f>>2]|0;if((e|0)==0){aB(1144,178,2288,1656)}f=c[d>>2]|0;q=f+1|0;h=c[p>>2]|0;do{if(q>>>0>h>>>0){if(q>>>0>16777216){return}t=h+e|0;if(t>>>0<q>>>0){u=t;while(1){r=u+e|0;if(r>>>0<q>>>0){u=r}else{v=r;break}}}else{v=t}u=b|0;m=b4(c[u>>2]|0,v)|0;if((m|0)==0){return}else{c[u>>2]=m;c[p>>2]=v;w=c[d>>2]|0;x=m;break}}else{w=f;x=c[b>>2]|0}}while(0);a[x+w|0]=10;c[d>>2]=(c[d>>2]|0)+1;return}function bN(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,t=0,u=0,v=0,w=0;g=i;h=b+4|0;j=c[h>>2]|0;do{if((j|0)!=0){k=c[b+12>>2]|0;if((k|0)==0){aB(1144,178,2288,1656)}l=j+1|0;m=b+8|0;n=c[m>>2]|0;if(l>>>0>n>>>0){if(l>>>0>16777216){break}o=n+k|0;if(o>>>0<l>>>0){n=o;while(1){p=n+k|0;if(p>>>0<l>>>0){n=p}else{q=p;break}}}else{q=o}n=b|0;l=b4(c[n>>2]|0,q)|0;if((l|0)==0){break}c[n>>2]=l;c[m>>2]=q;r=c[h>>2]|0;t=l}else{r=j;t=c[b>>2]|0}a[t+r|0]=10;c[h>>2]=(c[h>>2]|0)+1}}while(0);if((c[f+12>>2]&64|0)==0){bx(b,1040,(s=i,i=i+8|0,c[s>>2]=e,s)|0)}else{r=f;f=c[r>>2]|0;c[r>>2]=f+1;bx(b,1064,(s=i,i=i+16|0,c[s>>2]=e,c[s+8>>2]=f,s)|0)}if((d|0)==0){bx(b,1032,(s=i,i=i+8|0,c[s>>2]=e,s)|0);i=g;return}f=c[d>>2]|0;r=c[d+4>>2]|0;if((b|0)==0){aB(1144,157,2296,1656)}d=c[b+12>>2]|0;if((d|0)==0){aB(1144,157,2296,1656)}t=c[h>>2]|0;j=t+r|0;q=b+8|0;l=c[q>>2]|0;do{if(j>>>0>l>>>0){if(j>>>0>16777216){bx(b,1032,(s=i,i=i+8|0,c[s>>2]=e,s)|0);i=g;return}n=l+d|0;if(n>>>0<j>>>0){k=n;while(1){p=k+d|0;if(p>>>0<j>>>0){k=p}else{u=p;break}}}else{u=n}k=b|0;m=b4(c[k>>2]|0,u)|0;if((m|0)==0){bx(b,1032,(s=i,i=i+8|0,c[s>>2]=e,s)|0);i=g;return}else{c[k>>2]=m;c[q>>2]=u;v=c[h>>2]|0;w=m;break}}else{v=t;w=c[b>>2]|0}}while(0);t=w+v|0;ca(t|0,f|0,r)|0;c[h>>2]=(c[h>>2]|0)+r;bx(b,1032,(s=i,i=i+8|0,c[s>>2]=e,s)|0);i=g;return}function bO(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;e=b+4|0;f=c[e>>2]|0;do{if((f|0)!=0){g=c[b+12>>2]|0;if((g|0)==0){aB(1144,178,2288,1656)}h=f+1|0;i=b+8|0;j=c[i>>2]|0;if(h>>>0>j>>>0){if(h>>>0>16777216){break}k=j+g|0;if(k>>>0<h>>>0){j=k;while(1){l=j+g|0;if(l>>>0<h>>>0){j=l}else{m=l;break}}}else{m=k}j=b|0;h=b4(c[j>>2]|0,m)|0;if((h|0)==0){break}c[j>>2]=h;c[i>>2]=m;n=c[e>>2]|0;o=h}else{n=f;o=c[b>>2]|0}a[o+n|0]=10;c[e>>2]=(c[e>>2]|0)+1}}while(0);by(b,(c[d+12>>2]&256|0)!=0?1104:1088);return}function bP(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;f=b+4|0;g=c[f>>2]|0;do{if((g|0)==0){h=(e&1|0)!=0;i=h;j=h?1160:1128;k=b+12|0}else{h=b+12|0;l=c[h>>2]|0;if((l|0)==0){aB(1144,178,2288,1656)}m=g+1|0;n=b+8|0;o=c[n>>2]|0;do{if(m>>>0>o>>>0){if(m>>>0>16777216){break}p=o+l|0;if(p>>>0<m>>>0){q=p;while(1){r=q+l|0;if(r>>>0<m>>>0){q=r}else{s=r;break}}}else{s=p}q=b|0;r=b4(c[q>>2]|0,s)|0;if((r|0)==0){break}c[q>>2]=r;c[n>>2]=s;t=c[f>>2]|0;u=r;v=2667}else{t=g;u=c[b>>2]|0;v=2667}}while(0);if((v|0)==2667){a[u+t|0]=10;c[f>>2]=(c[f>>2]|0)+1}n=(e&1|0)!=0;if((b|0)==0){aB(1144,157,2296,1656)}else{i=n;j=n?1160:1128;k=h;break}}}while(0);e=c[k>>2]|0;if((e|0)==0){aB(1144,157,2296,1656)}t=c[f>>2]|0;u=t+5|0;g=b+8|0;s=c[g>>2]|0;do{if(u>>>0>s>>>0){if(u>>>0>16777216){break}n=s+e|0;if(n>>>0<u>>>0){m=n;while(1){l=m+e|0;if(l>>>0<u>>>0){m=l}else{w=l;break}}}else{w=n}m=b|0;h=b4(c[m>>2]|0,w)|0;if((h|0)==0){break}c[m>>2]=h;c[g>>2]=w;x=c[f>>2]|0;y=h;v=2679}else{x=t;y=c[b>>2]|0;v=2679}}while(0);if((v|0)==2679){v=y+x|0;a[v]=a[j]|0;a[v+1|0]=a[j+1|0]|0;a[v+2|0]=a[j+2|0]|0;a[v+3|0]=a[j+3|0]|0;a[v+4|0]=a[j+4|0]|0;c[f>>2]=(c[f>>2]|0)+5}do{if((d|0)!=0){j=c[d>>2]|0;v=c[d+4>>2]|0;x=c[k>>2]|0;if((x|0)==0){aB(1144,157,2296,1656)}y=c[f>>2]|0;t=y+v|0;w=c[g>>2]|0;if(t>>>0>w>>>0){if(t>>>0>16777216){break}u=w+x|0;if(u>>>0<t>>>0){w=u;while(1){e=w+x|0;if(e>>>0<t>>>0){w=e}else{z=e;break}}}else{z=u}w=b|0;t=b4(c[w>>2]|0,z)|0;if((t|0)==0){break}c[w>>2]=t;c[g>>2]=z;A=c[f>>2]|0;B=t}else{A=y;B=c[b>>2]|0}t=B+A|0;ca(t|0,j|0,v)|0;c[f>>2]=(c[f>>2]|0)+v}}while(0);A=i?1120:1112;i=c[k>>2]|0;if((i|0)==0){aB(1144,157,2296,1656)}k=c[f>>2]|0;B=k+6|0;z=c[g>>2]|0;do{if(B>>>0>z>>>0){if(B>>>0>16777216){return}d=z+i|0;if(d>>>0<B>>>0){t=d;while(1){w=t+i|0;if(w>>>0<B>>>0){t=w}else{C=w;break}}}else{C=d}t=b|0;v=b4(c[t>>2]|0,C)|0;if((v|0)==0){return}else{c[t>>2]=v;c[g>>2]=C;D=c[f>>2]|0;E=v;break}}else{D=k;E=c[b>>2]|0}}while(0);b=E+D|0;a[b]=a[A]|0;a[b+1|0]=a[A+1|0]|0;a[b+2|0]=a[A+2|0]|0;a[b+3|0]=a[A+3|0]|0;a[b+4|0]=a[A+4|0]|0;a[b+5|0]=a[A+5|0]|0;c[f>>2]=(c[f>>2]|0)+6;return}function bQ(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;if((b|0)==0){aB(1144,157,2296,1656)}f=b+12|0;e=c[f>>2]|0;if((e|0)==0){aB(1144,157,2296,1656)}g=b+4|0;h=c[g>>2]|0;i=h+4|0;j=b+8|0;k=c[j>>2]|0;do{if(i>>>0>k>>>0){if(i>>>0>16777216){break}l=k+e|0;if(l>>>0<i>>>0){m=l;while(1){n=m+e|0;if(n>>>0<i>>>0){m=n}else{o=n;break}}}else{o=l}m=b|0;n=b4(c[m>>2]|0,o)|0;if((n|0)==0){break}c[m>>2]=n;c[j>>2]=o;p=c[g>>2]|0;q=n;r=2717}else{p=h;q=c[b>>2]|0;r=2717}}while(0);if((r|0)==2717){h=q+p|0;t=1047096380;a[h]=t&255;t=t>>8;a[h+1|0]=t&255;t=t>>8;a[h+2|0]=t&255;t=t>>8;a[h+3|0]=t&255;c[g>>2]=(c[g>>2]|0)+4}do{if((d|0)!=0){h=d|0;p=c[d+4>>2]|0;while(1){if((p|0)==0){r=2721;break}q=p-1|0;o=c[h>>2]|0;if((a[o+q|0]|0)==10){p=q}else{s=p;u=o;break}}if((r|0)==2721){s=0;u=c[h>>2]|0}p=c[f>>2]|0;if((p|0)==0){aB(1144,157,2296,1656)}l=c[g>>2]|0;o=l+s|0;q=c[j>>2]|0;if(o>>>0>q>>>0){if(o>>>0>16777216){break}i=q+p|0;if(i>>>0<o>>>0){q=i;while(1){e=q+p|0;if(e>>>0<o>>>0){q=e}else{v=e;break}}}else{v=i}q=b|0;o=b4(c[q>>2]|0,v)|0;if((o|0)==0){break}c[q>>2]=o;c[j>>2]=v;w=c[g>>2]|0;x=o}else{w=l;x=c[b>>2]|0}o=x+w|0;ca(o|0,u|0,s)|0;c[g>>2]=(c[g>>2]|0)+s}}while(0);s=c[f>>2]|0;if((s|0)==0){aB(1144,157,2296,1656)}f=c[g>>2]|0;u=f+6|0;w=c[j>>2]|0;do{if(u>>>0>w>>>0){if(u>>>0>16777216){return}x=w+s|0;if(x>>>0<u>>>0){v=x;while(1){r=v+s|0;if(r>>>0<u>>>0){v=r}else{y=r;break}}}else{y=x}v=b|0;l=b4(c[v>>2]|0,y)|0;if((l|0)==0){return}else{c[v>>2]=l;c[j>>2]=y;z=c[g>>2]|0;A=l;break}}else{z=f;A=c[b>>2]|0}}while(0);b=A+z|0;a[b]=a[1200]|0;a[b+1|0]=a[1201|0]|0;a[b+2|0]=a[1202|0]|0;a[b+3|0]=a[1203|0]|0;a[b+4|0]=a[1204|0]|0;a[b+5|0]=a[1205|0]|0;c[g>>2]=(c[g>>2]|0)+6;return}function bR(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0;g=b+4|0;h=c[g>>2]|0;do{if((h|0)!=0){i=c[b+12>>2]|0;if((i|0)==0){aB(1144,178,2288,1656)}j=h+1|0;k=b+8|0;l=c[k>>2]|0;if(j>>>0>l>>>0){if(j>>>0>16777216){break}m=l+i|0;if(m>>>0<j>>>0){l=m;while(1){n=l+i|0;if(n>>>0<j>>>0){l=n}else{o=n;break}}}else{o=m}l=b|0;j=b4(c[l>>2]|0,o)|0;if((j|0)==0){break}c[l>>2]=j;c[k>>2]=o;p=c[g>>2]|0;q=j}else{p=h;q=c[b>>2]|0}a[q+p|0]=10;c[g>>2]=(c[g>>2]|0)+1}}while(0);if((e|0)==0){return}p=e+4|0;q=c[p>>2]|0;if((q|0)==0){return}h=e|0;e=0;o=q;while(1){if(e>>>0>=o>>>0){r=o;break}if((ay(d[(c[h>>2]|0)+e|0]|0)|0)==0){s=2766;break}e=e+1|0;o=c[p>>2]|0}if((s|0)==2766){r=c[p>>2]|0}if((e|0)==(r|0)){return}if((b|0)==0){aB(1144,157,2296,1656)}r=b+12|0;o=c[r>>2]|0;if((o|0)==0){aB(1144,157,2296,1656)}q=c[g>>2]|0;j=q+3|0;l=b+8|0;i=c[l>>2]|0;do{if(j>>>0>i>>>0){if(j>>>0>16777216){break}n=i+o|0;if(n>>>0<j>>>0){t=n;while(1){u=t+o|0;if(u>>>0<j>>>0){t=u}else{v=u;break}}}else{v=n}t=b|0;k=b4(c[t>>2]|0,v)|0;if((k|0)==0){break}c[t>>2]=k;c[l>>2]=v;w=c[g>>2]|0;x=k;s=2778}else{w=q;x=c[b>>2]|0;s=2778}}while(0);if((s|0)==2778){s=x+w|0;a[s]=a[1296]|0;a[s+1|0]=a[1297|0]|0;a[s+2|0]=a[1298|0]|0;c[g>>2]=(c[g>>2]|0)+3}s=f+12|0;L3837:do{if((c[s>>2]&128|0)==0){f=(c[h>>2]|0)+e|0;w=(c[p>>2]|0)-e|0;x=c[r>>2]|0;if((x|0)==0){aB(1144,157,2296,1656)}q=c[g>>2]|0;v=q+w|0;j=c[l>>2]|0;if(v>>>0>j>>>0){if(v>>>0>16777216){break}o=j+x|0;if(o>>>0<v>>>0){j=o;while(1){i=j+x|0;if(i>>>0<v>>>0){j=i}else{y=i;break}}}else{y=o}j=b|0;v=b4(c[j>>2]|0,y)|0;if((v|0)==0){break}c[j>>2]=v;c[l>>2]=y;z=c[g>>2]|0;A=v}else{z=q;A=c[b>>2]|0}v=A+z|0;ca(v|0,f|0,w)|0;c[g>>2]=(c[g>>2]|0)+w}else{v=c[p>>2]|0;if(e>>>0>=v>>>0){break}j=b|0;x=e;n=v;L3854:while(1){v=x;while(1){if(v>>>0>=n>>>0){break}if((a[(c[h>>2]|0)+v|0]|0)==10){break}else{v=v+1|0}}do{if(v>>>0>x>>>0){i=(c[h>>2]|0)+x|0;k=v-x|0;t=c[r>>2]|0;if((t|0)==0){break L3854}m=c[g>>2]|0;u=m+k|0;B=c[l>>2]|0;if(u>>>0>B>>>0){if(u>>>0>16777216){break}C=B+t|0;if(C>>>0<u>>>0){B=C;while(1){D=B+t|0;if(D>>>0<u>>>0){B=D}else{E=D;break}}}else{E=C}B=b4(c[j>>2]|0,E)|0;if((B|0)==0){break}c[j>>2]=B;c[l>>2]=E;F=c[g>>2]|0;G=B}else{F=m;G=c[j>>2]|0}B=G+F|0;ca(B|0,i|0,k)|0;c[g>>2]=(c[g>>2]|0)+k}}while(0);if(v>>>0>=((c[p>>2]|0)-1|0)>>>0){break L3837}by(b,(c[s>>2]&256|0)!=0?696:672);x=v+1|0;n=c[p>>2]|0;if(x>>>0>=n>>>0){break L3837}}aB(1144,157,2296,1656)}}while(0);p=c[r>>2]|0;if((p|0)==0){aB(1144,157,2296,1656)}r=c[g>>2]|0;s=r+5|0;F=c[l>>2]|0;do{if(s>>>0>F>>>0){if(s>>>0>16777216){return}G=F+p|0;if(G>>>0<s>>>0){E=G;while(1){h=E+p|0;if(h>>>0<s>>>0){E=h}else{H=h;break}}}else{H=G}E=b|0;h=b4(c[E>>2]|0,H)|0;if((h|0)==0){return}else{c[E>>2]=h;c[l>>2]=H;I=c[g>>2]|0;J=h;break}}else{I=r;J=c[b>>2]|0}}while(0);b=J+I|0;a[b]=a[1248]|0;a[b+1|0]=a[1249|0]|0;a[b+2|0]=a[1250|0]|0;a[b+3|0]=a[1251|0]|0;a[b+4|0]=a[1252|0]|0;c[g>>2]=(c[g>>2]|0)+5;return}function bS(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;f=b+4|0;g=c[f>>2]|0;h=b+12|0;do{if((g|0)!=0){i=c[h>>2]|0;if((i|0)==0){aB(1144,178,2288,1656)}j=g+1|0;k=b+8|0;l=c[k>>2]|0;do{if(j>>>0>l>>>0){if(j>>>0>16777216){break}m=l+i|0;if(m>>>0<j>>>0){n=m;while(1){o=n+i|0;if(o>>>0<j>>>0){n=o}else{p=o;break}}}else{p=m}n=b|0;o=b4(c[n>>2]|0,p)|0;if((o|0)==0){break}c[n>>2]=o;c[k>>2]=p;q=c[f>>2]|0;r=o;s=2837}else{q=g;r=c[b>>2]|0;s=2837}}while(0);if((s|0)==2837){a[r+q|0]=10;c[f>>2]=(c[f>>2]|0)+1}if((b|0)!=0){break}aB(1144,157,2296,1656)}}while(0);q=c[h>>2]|0;if((q|0)==0){aB(1144,157,2296,1656)}r=c[f>>2]|0;g=r+15|0;p=b+8|0;k=c[p>>2]|0;do{if(g>>>0>k>>>0){if(g>>>0>16777216){break}j=k+q|0;if(j>>>0<g>>>0){i=j;while(1){l=i+q|0;if(l>>>0<g>>>0){i=l}else{t=l;break}}}else{t=j}i=b|0;l=b4(c[i>>2]|0,t)|0;if((l|0)==0){break}c[i>>2]=l;c[p>>2]=t;u=c[f>>2]|0;v=l;s=2848}else{u=r;v=c[b>>2]|0;s=2848}}while(0);if((s|0)==2848){r=v+u|0;ca(r|0,1432,15)|0;c[f>>2]=(c[f>>2]|0)+15}do{if((d|0)!=0){r=c[d>>2]|0;u=c[d+4>>2]|0;v=c[h>>2]|0;if((v|0)==0){aB(1144,157,2296,1656)}t=c[f>>2]|0;g=t+u|0;q=c[p>>2]|0;if(g>>>0>q>>>0){if(g>>>0>16777216){break}k=q+v|0;if(k>>>0<g>>>0){q=k;while(1){l=q+v|0;if(l>>>0<g>>>0){q=l}else{w=l;break}}}else{w=k}q=b|0;g=b4(c[q>>2]|0,w)|0;if((g|0)==0){break}c[q>>2]=g;c[p>>2]=w;x=c[f>>2]|0;y=g}else{x=t;y=c[b>>2]|0}g=y+x|0;ca(g|0,r|0,u)|0;c[f>>2]=(c[f>>2]|0)+u}}while(0);x=c[h>>2]|0;if((x|0)==0){aB(1144,157,2296,1656)}y=c[f>>2]|0;w=y+16|0;d=c[p>>2]|0;do{if(w>>>0>d>>>0){if(w>>>0>16777216){break}g=d+x|0;if(g>>>0<w>>>0){q=g;while(1){v=q+x|0;if(v>>>0<w>>>0){q=v}else{z=v;break}}}else{z=g}q=b|0;u=b4(c[q>>2]|0,z)|0;if((u|0)==0){break}c[q>>2]=u;c[p>>2]=z;A=c[f>>2]|0;B=u;s=2869}else{A=y;B=c[b>>2]|0;s=2869}}while(0);if((s|0)==2869){s=B+A|0;ca(s|0,1384,16)|0;c[f>>2]=(c[f>>2]|0)+16}do{if((e|0)!=0){s=c[e>>2]|0;A=c[e+4>>2]|0;B=c[h>>2]|0;if((B|0)==0){aB(1144,157,2296,1656)}y=c[f>>2]|0;z=y+A|0;w=c[p>>2]|0;if(z>>>0>w>>>0){if(z>>>0>16777216){break}x=w+B|0;if(x>>>0<z>>>0){w=x;while(1){d=w+B|0;if(d>>>0<z>>>0){w=d}else{C=d;break}}}else{C=x}w=b|0;z=b4(c[w>>2]|0,C)|0;if((z|0)==0){break}c[w>>2]=z;c[p>>2]=C;D=c[f>>2]|0;E=z}else{D=y;E=c[b>>2]|0}z=E+D|0;ca(z|0,s|0,A)|0;c[f>>2]=(c[f>>2]|0)+A}}while(0);D=c[h>>2]|0;if((D|0)==0){aB(1144,157,2296,1656)}h=c[f>>2]|0;E=h+17|0;C=c[p>>2]|0;do{if(E>>>0>C>>>0){if(E>>>0>16777216){return}e=C+D|0;if(e>>>0<E>>>0){z=e;while(1){w=z+D|0;if(w>>>0<E>>>0){z=w}else{F=w;break}}}else{F=e}z=b|0;A=b4(c[z>>2]|0,F)|0;if((A|0)==0){return}else{c[z>>2]=A;c[p>>2]=F;G=c[f>>2]|0;H=A;break}}else{G=h;H=c[b>>2]|0}}while(0);b=H+G|0;ca(b|0,1344,17)|0;c[f>>2]=(c[f>>2]|0)+17;return}function bT(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;if((b|0)==0){aB(1144,157,2296,1656)}e=b+12|0;f=c[e>>2]|0;if((f|0)==0){aB(1144,157,2296,1656)}g=b+4|0;h=c[g>>2]|0;i=h+5|0;j=b+8|0;k=c[j>>2]|0;do{if(i>>>0>k>>>0){if(i>>>0>16777216){break}l=k+f|0;if(l>>>0<i>>>0){m=l;while(1){n=m+f|0;if(n>>>0<i>>>0){m=n}else{o=n;break}}}else{o=l}m=b|0;n=b4(c[m>>2]|0,o)|0;if((n|0)==0){break}c[m>>2]=n;c[j>>2]=o;p=c[g>>2]|0;q=n;r=2907}else{p=h;q=c[b>>2]|0;r=2907}}while(0);if((r|0)==2907){r=q+p|0;a[r]=a[1472]|0;a[r+1|0]=a[1473|0]|0;a[r+2|0]=a[1474|0]|0;a[r+3|0]=a[1475|0]|0;a[r+4|0]=a[1476|0]|0;c[g>>2]=(c[g>>2]|0)+5}do{if((d|0)!=0){r=c[d>>2]|0;p=c[d+4>>2]|0;q=c[e>>2]|0;if((q|0)==0){aB(1144,157,2296,1656)}h=c[g>>2]|0;o=h+p|0;i=c[j>>2]|0;if(o>>>0>i>>>0){if(o>>>0>16777216){break}f=i+q|0;if(f>>>0<o>>>0){i=f;while(1){k=i+q|0;if(k>>>0<o>>>0){i=k}else{s=k;break}}}else{s=f}i=b|0;o=b4(c[i>>2]|0,s)|0;if((o|0)==0){break}c[i>>2]=o;c[j>>2]=s;t=c[g>>2]|0;u=o}else{t=h;u=c[b>>2]|0}o=u+t|0;ca(o|0,r|0,p)|0;c[g>>2]=(c[g>>2]|0)+p}}while(0);t=c[e>>2]|0;if((t|0)==0){aB(1144,157,2296,1656)}e=c[g>>2]|0;u=e+6|0;s=c[j>>2]|0;do{if(u>>>0>s>>>0){if(u>>>0>16777216){return}d=s+t|0;if(d>>>0<u>>>0){o=d;while(1){i=o+t|0;if(i>>>0<u>>>0){o=i}else{v=i;break}}}else{v=d}o=b|0;p=b4(c[o>>2]|0,v)|0;if((p|0)==0){return}else{c[o>>2]=p;c[j>>2]=v;w=c[g>>2]|0;x=p;break}}else{w=e;x=c[b>>2]|0}}while(0);b=x+w|0;a[b]=a[1456]|0;a[b+1|0]=a[1457|0]|0;a[b+2|0]=a[1458|0]|0;a[b+3|0]=a[1459|0]|0;a[b+4|0]=a[1460|0]|0;a[b+5|0]=a[1461|0]|0;c[g>>2]=(c[g>>2]|0)+6;return}function bU(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0;f=(e&4|0)!=0;g=(b|0)==0;do{if(f){if(g){aB(1144,157,2296,1656)}h=c[b+12>>2]|0;if((h|0)==0){aB(1144,157,2296,1656)}i=b+4|0;j=c[i>>2]|0;k=j+3|0;l=b+8|0;m=c[l>>2]|0;if(k>>>0>m>>>0){if(k>>>0>16777216){break}n=m+h|0;if(n>>>0<k>>>0){m=n;while(1){o=m+h|0;if(o>>>0<k>>>0){m=o}else{p=o;break}}}else{p=n}m=b|0;k=b4(c[m>>2]|0,p)|0;if((k|0)==0){break}c[m>>2]=k;c[l>>2]=p;q=c[i>>2]|0;r=k}else{q=j;r=c[b>>2]|0}k=r+q|0;a[k]=a[1648]|0;a[k+1|0]=a[1649|0]|0;a[k+2|0]=a[1650|0]|0;c[i>>2]=(c[i>>2]|0)+3}else{if(g){aB(1144,157,2296,1656)}k=c[b+12>>2]|0;if((k|0)==0){aB(1144,157,2296,1656)}m=b+4|0;h=c[m>>2]|0;o=h+3|0;s=b+8|0;t=c[s>>2]|0;if(o>>>0>t>>>0){if(o>>>0>16777216){break}u=t+k|0;if(u>>>0<o>>>0){t=u;while(1){v=t+k|0;if(v>>>0<o>>>0){t=v}else{w=v;break}}}else{w=u}t=b|0;o=b4(c[t>>2]|0,w)|0;if((o|0)==0){break}c[t>>2]=o;c[s>>2]=w;x=c[m>>2]|0;y=o}else{x=h;y=c[b>>2]|0}o=y+x|0;a[o]=a[1624]|0;a[o+1|0]=a[1625|0]|0;a[o+2|0]=a[1626|0]|0;c[m>>2]=(c[m>>2]|0)+3}}while(0);x=e&3;do{if((x|0)==1){if(g){aB(1144,157,2296,1656)}e=c[b+12>>2]|0;if((e|0)==0){aB(1144,157,2296,1656)}y=b+4|0;w=c[y>>2]|0;q=w+14|0;r=b+8|0;p=c[r>>2]|0;if(q>>>0>p>>>0){if(q>>>0>16777216){break}o=p+e|0;if(o>>>0<q>>>0){p=o;while(1){t=p+e|0;if(t>>>0<q>>>0){p=t}else{z=t;break}}}else{z=o}p=b|0;q=b4(c[p>>2]|0,z)|0;if((q|0)==0){break}c[p>>2]=q;c[r>>2]=z;A=c[y>>2]|0;B=q}else{A=w;B=c[b>>2]|0}q=B+A|0;ca(q|0,1576,14)|0;c[y>>2]=(c[y>>2]|0)+14}else if((x|0)==3){if(g){aB(1144,157,2296,1656)}q=c[b+12>>2]|0;if((q|0)==0){aB(1144,157,2296,1656)}p=b+4|0;e=c[p>>2]|0;m=e+16|0;h=b+8|0;s=c[h>>2]|0;if(m>>>0>s>>>0){if(m>>>0>16777216){break}u=s+q|0;if(u>>>0<m>>>0){s=u;while(1){t=s+q|0;if(t>>>0<m>>>0){s=t}else{C=t;break}}}else{C=u}s=b|0;m=b4(c[s>>2]|0,C)|0;if((m|0)==0){break}c[s>>2]=m;c[h>>2]=C;D=c[p>>2]|0;E=m}else{D=e;E=c[b>>2]|0}m=E+D|0;ca(m|0,1600,16)|0;c[p>>2]=(c[p>>2]|0)+16}else if((x|0)==2){if(g){aB(1144,157,2296,1656)}m=c[b+12>>2]|0;if((m|0)==0){aB(1144,157,2296,1656)}s=b+4|0;q=c[s>>2]|0;y=q+15|0;w=b+8|0;r=c[w>>2]|0;if(y>>>0>r>>>0){if(y>>>0>16777216){break}o=r+m|0;if(o>>>0<y>>>0){r=o;while(1){t=r+m|0;if(t>>>0<y>>>0){r=t}else{F=t;break}}}else{F=o}r=b|0;y=b4(c[r>>2]|0,F)|0;if((y|0)==0){break}c[r>>2]=y;c[w>>2]=F;G=c[s>>2]|0;H=y}else{G=q;H=c[b>>2]|0}y=H+G|0;ca(y|0,1544,15)|0;c[s>>2]=(c[s>>2]|0)+15}else{if(g){aB(1144,157,2296,1656)}y=c[b+12>>2]|0;if((y|0)==0){aB(1144,157,2296,1656)}r=b+4|0;m=c[r>>2]|0;p=m+1|0;e=b+8|0;h=c[e>>2]|0;if(p>>>0>h>>>0){if(p>>>0>16777216){break}u=h+y|0;if(u>>>0<p>>>0){h=u;while(1){t=h+y|0;if(t>>>0<p>>>0){h=t}else{I=t;break}}}else{I=u}h=b|0;p=b4(c[h>>2]|0,I)|0;if((p|0)==0){break}c[h>>2]=p;c[e>>2]=I;J=c[r>>2]|0;K=p}else{J=m;K=c[b>>2]|0}a[K+J|0]=62;c[r>>2]=(c[r>>2]|0)+1}}while(0);do{if((d|0)!=0){J=c[d>>2]|0;K=c[d+4>>2]|0;if(g){aB(1144,157,2296,1656)}I=c[b+12>>2]|0;if((I|0)==0){aB(1144,157,2296,1656)}G=b+4|0;H=c[G>>2]|0;F=H+K|0;x=b+8|0;D=c[x>>2]|0;if(F>>>0>D>>>0){if(F>>>0>16777216){break}E=D+I|0;if(E>>>0<F>>>0){D=E;while(1){C=D+I|0;if(C>>>0<F>>>0){D=C}else{L=C;break}}}else{L=E}D=b|0;F=b4(c[D>>2]|0,L)|0;if((F|0)==0){break}c[D>>2]=F;c[x>>2]=L;M=c[G>>2]|0;N=F}else{M=H;N=c[b>>2]|0}F=N+M|0;ca(F|0,J|0,K)|0;c[G>>2]=(c[G>>2]|0)+K}}while(0);if(f){if(g){aB(1144,157,2296,1656)}f=c[b+12>>2]|0;if((f|0)==0){aB(1144,157,2296,1656)}M=b+4|0;N=c[M>>2]|0;L=N+6|0;d=b+8|0;F=c[d>>2]|0;do{if(L>>>0>F>>>0){if(L>>>0>16777216){return}D=F+f|0;if(D>>>0<L>>>0){I=D;while(1){r=I+f|0;if(r>>>0<L>>>0){I=r}else{O=r;break}}}else{O=D}I=b|0;K=b4(c[I>>2]|0,O)|0;if((K|0)==0){return}else{c[I>>2]=K;c[d>>2]=O;P=c[M>>2]|0;Q=K;break}}else{P=N;Q=c[b>>2]|0}}while(0);N=Q+P|0;a[N]=a[1512]|0;a[N+1|0]=a[1513|0]|0;a[N+2|0]=a[1514|0]|0;a[N+3|0]=a[1515|0]|0;a[N+4|0]=a[1516|0]|0;a[N+5|0]=a[1517|0]|0;c[M>>2]=(c[M>>2]|0)+6;return}else{if(g){aB(1144,157,2296,1656)}g=c[b+12>>2]|0;if((g|0)==0){aB(1144,157,2296,1656)}M=b+4|0;N=c[M>>2]|0;P=N+6|0;Q=b+8|0;O=c[Q>>2]|0;do{if(P>>>0>O>>>0){if(P>>>0>16777216){return}d=O+g|0;if(d>>>0<P>>>0){L=d;while(1){f=L+g|0;if(f>>>0<P>>>0){L=f}else{R=f;break}}}else{R=d}L=b|0;D=b4(c[L>>2]|0,R)|0;if((D|0)==0){return}else{c[L>>2]=D;c[Q>>2]=R;S=c[M>>2]|0;T=D;break}}else{S=N;T=c[b>>2]|0}}while(0);b=T+S|0;a[b]=a[1488]|0;a[b+1|0]=a[1489|0]|0;a[b+2|0]=a[1490|0]|0;a[b+3|0]=a[1491|0]|0;a[b+4|0]=a[1492|0]|0;a[b+5|0]=a[1493|0]|0;c[M>>2]=(c[M>>2]|0)+6;return}}function bV(a,b){a=a|0;b=b|0;by(a,(c[b+12>>2]&256|0)!=0?696:672);return 1}function bW(b,e,f,g){b=b|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0;if((e|0)==0){h=0;return h|0}i=e+4|0;j=c[i>>2]|0;if((j|0)==0){h=0;return h|0}do{if((c[g+12>>2]&32|0)!=0){if((bv(c[e>>2]|0,j)|0)!=0|(f|0)==2){break}else{h=0}return h|0}}while(0);if((b|0)==0){aB(1144,157,2296,1656);return 0}j=b+12|0;k=c[j>>2]|0;if((k|0)==0){aB(1144,157,2296,1656);return 0}l=b+4|0;m=c[l>>2]|0;n=m+9|0;o=b+8|0;p=c[o>>2]|0;do{if(n>>>0>p>>>0){if(n>>>0>16777216){break}q=p+k|0;if(q>>>0<n>>>0){r=q;while(1){s=r+k|0;if(s>>>0<n>>>0){r=s}else{u=s;break}}}else{u=q}r=b|0;s=b4(c[r>>2]|0,u)|0;if((s|0)==0){break}c[r>>2]=s;c[o>>2]=u;v=c[l>>2]|0;w=s;x=3078}else{v=m;w=c[b>>2]|0;x=3078}}while(0);if((x|0)==3078){m=w+v|0;ca(m|0,1048,9)|0;c[l>>2]=(c[l>>2]|0)+9}do{if((f|0)==2){m=c[j>>2]|0;if((m|0)==0){aB(1144,157,2296,1656);return 0}v=c[l>>2]|0;w=v+7|0;u=c[o>>2]|0;if(w>>>0>u>>>0){if(w>>>0>16777216){break}n=u+m|0;if(n>>>0<w>>>0){u=n;while(1){k=u+m|0;if(k>>>0<w>>>0){u=k}else{y=k;break}}}else{y=n}u=b|0;w=b4(c[u>>2]|0,y)|0;if((w|0)==0){break}c[u>>2]=w;c[o>>2]=y;z=c[l>>2]|0;A=w}else{z=v;A=c[b>>2]|0}w=A+z|0;a[w]=a[1688]|0;a[w+1|0]=a[1689|0]|0;a[w+2|0]=a[1690|0]|0;a[w+3|0]=a[1691|0]|0;a[w+4|0]=a[1692|0]|0;a[w+5|0]=a[1693|0]|0;a[w+6|0]=a[1694|0]|0;c[l>>2]=(c[l>>2]|0)+7}}while(0);z=e|0;b0(b,c[z>>2]|0,c[i>>2]|0);A=g+16|0;y=c[j>>2]|0;f=(y|0)==0;do{if((c[A>>2]|0)==0){if(f){aB(1144,157,2296,1656);return 0}w=c[l>>2]|0;u=w+2|0;m=c[o>>2]|0;if(u>>>0>m>>>0){if(u>>>0>16777216){break}q=m+y|0;if(q>>>0<u>>>0){m=q;while(1){k=m+y|0;if(k>>>0<u>>>0){m=k}else{B=k;break}}}else{B=q}m=b|0;u=b4(c[m>>2]|0,B)|0;if((u|0)==0){break}c[m>>2]=u;c[o>>2]=B;C=c[l>>2]|0;D=u}else{C=w;D=c[b>>2]|0}u=D+C|0;t=15906;a[u]=t&255;t=t>>8;a[u+1|0]=t&255;c[l>>2]=(c[l>>2]|0)+2}else{if(f){aB(1144,178,2288,1656);return 0}u=c[l>>2]|0;m=u+1|0;v=c[o>>2]|0;do{if(m>>>0>v>>>0){if(m>>>0>16777216){break}n=v+y|0;if(n>>>0<m>>>0){k=n;while(1){p=k+y|0;if(p>>>0<m>>>0){k=p}else{E=p;break}}}else{E=n}k=b|0;p=b4(c[k>>2]|0,E)|0;if((p|0)==0){break}c[k>>2]=p;c[o>>2]=E;F=c[l>>2]|0;G=p;x=3100}else{F=u;G=c[b>>2]|0;x=3100}}while(0);if((x|0)==3100){a[G+F|0]=34;c[l>>2]=(c[l>>2]|0)+1}aN[c[A>>2]&15](b,e,g);u=c[j>>2]|0;if((u|0)==0){aB(1144,178,2288,1656);return 0}m=c[l>>2]|0;v=m+1|0;w=c[o>>2]|0;if(v>>>0>w>>>0){if(v>>>0>16777216){break}q=w+u|0;if(q>>>0<v>>>0){w=q;while(1){p=w+u|0;if(p>>>0<v>>>0){w=p}else{H=p;break}}}else{H=q}w=b|0;v=b4(c[w>>2]|0,H)|0;if((v|0)==0){break}c[w>>2]=v;c[o>>2]=H;I=c[l>>2]|0;J=v}else{I=m;J=c[b>>2]|0}a[J+I|0]=62;c[l>>2]=(c[l>>2]|0)+1}}while(0);if((c[e+12>>2]|0)==0){aB(1144,38,2320,1656);return 0}e=c[i>>2]|0;i=0;while(1){if(i>>>0>=e>>>0|(i|0)==7){x=3126;break}K=c[z>>2]|0;if((d[K+i|0]|0)==(a[1688+i|0]|0)){i=i+1|0}else{x=3127;break}}if((x|0)==3127){b$(b,K,e,0)}else if((x|0)==3126){b$(b,(c[z>>2]|0)+7|0,e-7|0,0)}e=c[j>>2]|0;if((e|0)==0){aB(1144,157,2296,1656);return 0}j=c[l>>2]|0;z=j+4|0;x=c[o>>2]|0;do{if(z>>>0>x>>>0){if(z>>>0>16777216){h=1;return h|0}K=x+e|0;if(K>>>0<z>>>0){i=K;while(1){I=i+e|0;if(I>>>0<z>>>0){i=I}else{L=I;break}}}else{L=K}i=b|0;m=b4(c[i>>2]|0,L)|0;if((m|0)==0){h=1;return h|0}else{c[i>>2]=m;c[o>>2]=L;M=c[l>>2]|0;N=m;break}}else{M=j;N=c[b>>2]|0}}while(0);b=N+M|0;t=1046556476;a[b]=t&255;t=t>>8;a[b+1|0]=t&255;t=t>>8;a[b+2|0]=t&255;t=t>>8;a[b+3|0]=t&255;c[l>>2]=(c[l>>2]|0)+4;h=1;return h|0}function bX(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;if((d|0)==0){h=0;return h|0}i=d+4|0;if((c[i>>2]|0)==0){h=0;return h|0}if((b|0)==0){aB(1144,157,2296,1656);return 0}j=b+12|0;k=c[j>>2]|0;if((k|0)==0){aB(1144,157,2296,1656);return 0}l=b+4|0;m=c[l>>2]|0;n=m+10|0;o=b+8|0;p=c[o>>2]|0;do{if(n>>>0>p>>>0){if(n>>>0>16777216){break}q=p+k|0;if(q>>>0<n>>>0){r=q;while(1){s=r+k|0;if(s>>>0<n>>>0){r=s}else{t=s;break}}}else{t=q}r=b|0;s=b4(c[r>>2]|0,t)|0;if((s|0)==0){break}c[r>>2]=s;c[o>>2]=t;u=c[l>>2]|0;v=s;w=3159}else{u=m;v=c[b>>2]|0;w=3159}}while(0);if((w|0)==3159){m=v+u|0;ca(m|0,640,10)|0;c[l>>2]=(c[l>>2]|0)+10}b0(b,c[d>>2]|0,c[i>>2]|0);i=c[j>>2]|0;if((i|0)==0){aB(1144,157,2296,1656);return 0}d=c[l>>2]|0;m=d+7|0;u=c[o>>2]|0;do{if(m>>>0>u>>>0){if(m>>>0>16777216){break}v=u+i|0;if(v>>>0<m>>>0){t=v;while(1){n=t+i|0;if(n>>>0<m>>>0){t=n}else{x=n;break}}}else{x=v}t=b|0;q=b4(c[t>>2]|0,x)|0;if((q|0)==0){break}c[t>>2]=q;c[o>>2]=x;y=c[l>>2]|0;z=q;w=3169}else{y=d;z=c[b>>2]|0;w=3169}}while(0);if((w|0)==3169){d=z+y|0;a[d]=a[1752]|0;a[d+1|0]=a[1753|0]|0;a[d+2|0]=a[1754|0]|0;a[d+3|0]=a[1755|0]|0;a[d+4|0]=a[1756|0]|0;a[d+5|0]=a[1757|0]|0;a[d+6|0]=a[1758|0]|0;c[l>>2]=(c[l>>2]|0)+7}do{if((f|0)!=0){d=c[f+4>>2]|0;if((d|0)==0){break}b$(b,c[f>>2]|0,d,0)}}while(0);do{if((e|0)!=0){f=e+4|0;if((c[f>>2]|0)==0){break}d=c[j>>2]|0;if((d|0)==0){aB(1144,157,2296,1656);return 0}y=c[l>>2]|0;z=y+9|0;x=c[o>>2]|0;do{if(z>>>0>x>>>0){if(z>>>0>16777216){break}m=x+d|0;if(m>>>0<z>>>0){i=m;while(1){u=i+d|0;if(u>>>0<z>>>0){i=u}else{A=u;break}}}else{A=m}i=b|0;u=b4(c[i>>2]|0,A)|0;if((u|0)==0){break}c[i>>2]=u;c[o>>2]=A;B=c[l>>2]|0;C=u;w=3184}else{B=y;C=c[b>>2]|0;w=3184}}while(0);if((w|0)==3184){y=C+B|0;ca(y|0,896,9)|0;c[l>>2]=(c[l>>2]|0)+9}b$(b,c[e>>2]|0,c[f>>2]|0,0)}}while(0);by(b,(c[g+12>>2]&256|0)!=0?1720:776);h=1;return h|0}function bY(a,b,d){a=a|0;b=b|0;d=d|0;if((b|0)==0){return}b$(a,c[b>>2]|0,c[b+4>>2]|0,0);return}function bZ(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0;do{if((d|0)==0){if((b|0)==0){aB(1144,157,2296,1656);return 0}h=c[b+12>>2]|0;if((h|0)==0){aB(1144,157,2296,1656);return 0}i=b+4|0;j=c[i>>2]|0;k=j+9|0;l=b+8|0;m=c[l>>2]|0;if(k>>>0>m>>>0){if(k>>>0>16777216){break}n=m+h|0;if(n>>>0<k>>>0){m=n;while(1){o=m+h|0;if(o>>>0<k>>>0){m=o}else{p=o;break}}}else{p=n}m=b|0;k=b4(c[m>>2]|0,p)|0;if((k|0)==0){break}c[m>>2]=k;c[l>>2]=p;q=c[i>>2]|0;r=k}else{q=j;r=c[b>>2]|0}k=r+q|0;ca(k|0,1048,9)|0;c[i>>2]=(c[i>>2]|0)+9}else{do{if((c[g+12>>2]&32|0)!=0){if((bv(c[d>>2]|0,c[d+4>>2]|0)|0)==0){s=0}else{break}return s|0}}while(0);if((b|0)==0){aB(1144,157,2296,1656);return 0}i=c[b+12>>2]|0;if((i|0)==0){aB(1144,157,2296,1656);return 0}j=b+4|0;l=c[j>>2]|0;n=l+9|0;k=b+8|0;m=c[k>>2]|0;do{if(n>>>0>m>>>0){if(n>>>0>16777216){break}h=m+i|0;if(h>>>0<n>>>0){o=h;while(1){u=o+i|0;if(u>>>0<n>>>0){o=u}else{v=u;break}}}else{v=h}o=b|0;u=b4(c[o>>2]|0,v)|0;if((u|0)==0){break}c[o>>2]=u;c[k>>2]=v;w=c[j>>2]|0;x=u;y=3211}else{w=l;x=c[b>>2]|0;y=3211}}while(0);if((y|0)==3211){l=x+w|0;ca(l|0,1048,9)|0;c[j>>2]=(c[j>>2]|0)+9}l=c[d+4>>2]|0;if((l|0)==0){break}b0(b,c[d>>2]|0,l)}}while(0);do{if((e|0)!=0){w=e+4|0;if((c[w>>2]|0)==0){break}if((b|0)==0){aB(1144,157,2296,1656);return 0}x=c[b+12>>2]|0;if((x|0)==0){aB(1144,157,2296,1656);return 0}v=b+4|0;q=c[v>>2]|0;r=q+9|0;p=b+8|0;l=c[p>>2]|0;do{if(r>>>0>l>>>0){if(r>>>0>16777216){break}k=l+x|0;if(k>>>0<r>>>0){n=k;while(1){i=n+x|0;if(i>>>0<r>>>0){n=i}else{z=i;break}}}else{z=k}n=b|0;h=b4(c[n>>2]|0,z)|0;if((h|0)==0){break}c[n>>2]=h;c[p>>2]=z;A=c[v>>2]|0;B=h;y=3237}else{A=q;B=c[b>>2]|0;y=3237}}while(0);if((y|0)==3237){q=B+A|0;ca(q|0,896,9)|0;c[v>>2]=(c[v>>2]|0)+9}b$(b,c[e>>2]|0,c[w>>2]|0,0)}}while(0);e=g+16|0;A=(b|0)==0;do{if((c[e>>2]|0)==0){if(A){aB(1144,157,2296,1656);return 0}B=c[b+12>>2]|0;if((B|0)==0){aB(1144,157,2296,1656);return 0}z=b+4|0;q=c[z>>2]|0;p=q+2|0;r=b+8|0;x=c[r>>2]|0;if(p>>>0>x>>>0){if(p>>>0>16777216){break}l=x+B|0;if(l>>>0<p>>>0){x=l;while(1){j=x+B|0;if(j>>>0<p>>>0){x=j}else{C=j;break}}}else{C=l}x=b|0;p=b4(c[x>>2]|0,C)|0;if((p|0)==0){break}c[x>>2]=p;c[r>>2]=C;D=c[z>>2]|0;E=p}else{D=q;E=c[b>>2]|0}p=E+D|0;t=15906;a[p]=t&255;t=t>>8;a[p+1|0]=t&255;c[z>>2]=(c[z>>2]|0)+2}else{if(A){aB(1144,178,2288,1656);return 0}p=b+12|0;x=c[p>>2]|0;if((x|0)==0){aB(1144,178,2288,1656);return 0}B=b+4|0;w=c[B>>2]|0;v=w+1|0;j=b+8|0;h=c[j>>2]|0;do{if(v>>>0>h>>>0){if(v>>>0>16777216){break}n=h+x|0;if(n>>>0<v>>>0){i=n;while(1){m=i+x|0;if(m>>>0<v>>>0){i=m}else{F=m;break}}}else{F=n}i=b|0;k=b4(c[i>>2]|0,F)|0;if((k|0)==0){break}c[i>>2]=k;c[j>>2]=F;G=c[B>>2]|0;H=k;y=3250}else{G=w;H=c[b>>2]|0;y=3250}}while(0);if((y|0)==3250){a[H+G|0]=34;c[B>>2]=(c[B>>2]|0)+1}aN[c[e>>2]&15](b,d,g);w=c[p>>2]|0;if((w|0)==0){aB(1144,178,2288,1656);return 0}v=c[B>>2]|0;x=v+1|0;h=c[j>>2]|0;if(x>>>0>h>>>0){if(x>>>0>16777216){break}z=h+w|0;if(z>>>0<x>>>0){h=z;while(1){q=h+w|0;if(q>>>0<x>>>0){h=q}else{I=q;break}}}else{I=z}h=b|0;x=b4(c[h>>2]|0,I)|0;if((x|0)==0){break}c[h>>2]=x;c[j>>2]=I;J=c[B>>2]|0;K=x}else{J=v;K=c[b>>2]|0}a[K+J|0]=62;c[B>>2]=(c[B>>2]|0)+1}}while(0);do{if((f|0)!=0){J=c[f+4>>2]|0;if((J|0)==0){break}K=c[f>>2]|0;if(A){aB(1144,157,2296,1656);return 0}I=c[b+12>>2]|0;if((I|0)==0){aB(1144,157,2296,1656);return 0}g=b+4|0;d=c[g>>2]|0;e=d+J|0;G=b+8|0;H=c[G>>2]|0;if(e>>>0>H>>>0){if(e>>>0>16777216){break}y=H+I|0;if(y>>>0<e>>>0){H=y;while(1){F=H+I|0;if(F>>>0<e>>>0){H=F}else{L=F;break}}}else{L=y}H=b|0;e=b4(c[H>>2]|0,L)|0;if((e|0)==0){break}c[H>>2]=e;c[G>>2]=L;M=c[g>>2]|0;N=e}else{M=d;N=c[b>>2]|0}e=N+M|0;ca(e|0,K|0,J)|0;c[g>>2]=(c[g>>2]|0)+J}}while(0);if(A){aB(1144,157,2296,1656);return 0}A=c[b+12>>2]|0;if((A|0)==0){aB(1144,157,2296,1656);return 0}M=b+4|0;N=c[M>>2]|0;L=N+4|0;f=b+8|0;e=c[f>>2]|0;do{if(L>>>0>e>>>0){if(L>>>0>16777216){s=1;return s|0}H=e+A|0;if(H>>>0<L>>>0){I=H;while(1){B=I+A|0;if(B>>>0<L>>>0){I=B}else{O=B;break}}}else{O=H}I=b|0;J=b4(c[I>>2]|0,O)|0;if((J|0)==0){s=1;return s|0}else{c[I>>2]=J;c[f>>2]=O;P=c[M>>2]|0;Q=J;break}}else{P=N;Q=c[b>>2]|0}}while(0);b=Q+P|0;t=1046556476;a[b]=t&255;t=t>>8;a[b+1|0]=t&255;t=t>>8;a[b+2|0]=t&255;t=t>>8;a[b+3|0]=t&255;c[M>>2]=(c[M>>2]|0)+4;s=1;return s|0}function b_(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;g=f+12|0;f=c[g>>2]|0;if((f&512|0)!=0){b$(b,c[e>>2]|0,c[e+4>>2]|0,0);return 1}if((f&1|0)!=0){return 1}L4573:do{if((f&2|0)==0){h=f}else{i=c[e>>2]|0;j=c[e+4>>2]|0;if(j>>>0<3){h=f;break}if((a[i]|0)!=60){h=f;break}k=(a[i+1|0]|0)==47?2:1;L4577:do{if(k>>>0<j>>>0){l=680;m=k;while(1){n=a[l]|0;if(n<<24>>24==0){o=m;break L4577}if((d[i+m|0]|0)!=(n<<24>>24|0)){h=f;break L4573}n=m+1|0;if(n>>>0<j>>>0){l=l+1|0;m=n}else{o=n;break}}}else{o=k}}while(0);if((o|0)==(j|0)){h=f;break}k=i+o|0;if((ay(d[k]|0)|0)!=0){return 1}if((a[k]|0)==62){return 1}else{h=c[g>>2]|0;break}}}while(0);L4591:do{if((h&8|0)==0){p=h}else{o=c[e>>2]|0;f=c[e+4>>2]|0;if(f>>>0<3){p=h;break}if((a[o]|0)!=60){p=h;break}k=(a[o+1|0]|0)==47?2:1;L4595:do{if(k>>>0<f>>>0){m=1592;l=k;while(1){n=a[m]|0;if(n<<24>>24==0){q=l;break L4595}if((d[o+l|0]|0)!=(n<<24>>24|0)){p=h;break L4591}n=l+1|0;if(n>>>0<f>>>0){m=m+1|0;l=n}else{q=n;break}}}else{q=k}}while(0);if((q|0)==(f|0)){p=h;break}k=o+q|0;if((ay(d[k]|0)|0)!=0){return 1}if((a[k]|0)==62){return 1}else{p=c[g>>2]|0;break}}}while(0);g=e|0;L4609:do{if((p&4|0)==0){r=e+4|0}else{q=c[g>>2]|0;h=e+4|0;k=c[h>>2]|0;if(k>>>0<3){r=h;break}if((a[q]|0)!=60){r=h;break}i=(a[q+1|0]|0)==47?2:1;L4614:do{if(i>>>0<k>>>0){j=1336;l=i;while(1){m=a[j]|0;if(m<<24>>24==0){s=l;break L4614}if((d[q+l|0]|0)!=(m<<24>>24|0)){r=h;break L4609}m=l+1|0;if(m>>>0<k>>>0){j=j+1|0;l=m}else{s=m;break}}}else{s=i}}while(0);if((s|0)==(k|0)){r=h;break}i=q+s|0;if((ay(d[i]|0)|0)!=0){return 1}if((a[i]|0)!=62){r=h;break}return 1}}while(0);s=c[g>>2]|0;g=c[r>>2]|0;if((b|0)==0){aB(1144,157,2296,1656);return 0}r=c[b+12>>2]|0;if((r|0)==0){aB(1144,157,2296,1656);return 0}e=b+4|0;p=c[e>>2]|0;i=p+g|0;o=b+8|0;f=c[o>>2]|0;do{if(i>>>0>f>>>0){if(i>>>0>16777216){return 1}l=f+r|0;if(l>>>0<i>>>0){j=l;while(1){m=j+r|0;if(m>>>0<i>>>0){j=m}else{t=m;break}}}else{t=l}j=b|0;h=b4(c[j>>2]|0,t)|0;if((h|0)==0){return 1}else{c[j>>2]=h;c[o>>2]=t;u=c[e>>2]|0;v=h;break}}else{u=p;v=c[b>>2]|0}}while(0);b=v+u|0;ca(b|0,s|0,g)|0;c[e>>2]=(c[e>>2]|0)+g;return 1}function b$(b,e,f,g){b=b|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0;h=f*12&-1;i=(h>>>0)/10>>>0;if((b|0)==0){aB(1144,58,2336,1656)}j=b+12|0;k=c[j>>2]|0;if((k|0)==0){aB(1144,58,2336,1656)}do{if(h>>>0<=167772169){l=b+8|0;m=c[l>>2]|0;if(m>>>0>=i>>>0){break}n=m+k|0;if(n>>>0<i>>>0){m=n;while(1){o=m+k|0;if(o>>>0<i>>>0){m=o}else{p=o;break}}}else{p=n}m=b|0;o=b4(c[m>>2]|0,p)|0;if((o|0)==0){break}c[m>>2]=o;c[l>>2]=p}}while(0);if((f|0)==0){return}p=b+4|0;i=b+8|0;k=b|0;h=(g|0)==0;g=0;o=0;L4666:while(1){m=o;q=g;while(1){if(q>>>0>=f>>>0){r=m;s=0;break}t=a[2344+(d[e+q|0]|0)|0]|0;u=t<<24>>24;if(t<<24>>24==0){m=u;q=q+1|0}else{r=u;s=1;break}}do{if(q>>>0>g>>>0){m=e+g|0;l=q-g|0;n=c[j>>2]|0;if((n|0)==0){v=3392;break L4666}u=c[p>>2]|0;t=u+l|0;w=c[i>>2]|0;if(t>>>0>w>>>0){if(t>>>0>16777216){break}x=w+n|0;if(x>>>0<t>>>0){w=x;while(1){y=w+n|0;if(y>>>0<t>>>0){w=y}else{z=y;break}}}else{z=x}w=b4(c[k>>2]|0,z)|0;if((w|0)==0){break}c[k>>2]=w;c[i>>2]=z;A=c[p>>2]|0;B=w}else{A=u;B=c[k>>2]|0}w=B+A|0;ca(w|0,m|0,l)|0;c[p>>2]=(c[p>>2]|0)+l}}while(0);if(!s){v=3418;break}do{if((a[e+q|0]|0)==47&h){w=c[j>>2]|0;if((w|0)==0){v=3404;break L4666}t=c[p>>2]|0;n=t+1|0;y=c[i>>2]|0;if(n>>>0>y>>>0){if(n>>>0>16777216){break}C=y+w|0;if(C>>>0<n>>>0){y=C;while(1){D=y+w|0;if(D>>>0<n>>>0){y=D}else{E=D;break}}}else{E=C}y=b4(c[k>>2]|0,E)|0;if((y|0)==0){break}c[k>>2]=y;c[i>>2]=E;F=c[p>>2]|0;G=y}else{F=t;G=c[k>>2]|0}a[G+F|0]=47;c[p>>2]=(c[p>>2]|0)+1}else{by(b,c[2600+(r<<2)>>2]|0)}}while(0);y=q+1|0;if(y>>>0<f>>>0){g=y;o=r}else{v=3420;break}}if((v|0)==3418){return}else if((v|0)==3392){aB(1144,157,2296,1656)}else if((v|0)==3420){return}else if((v|0)==3404){aB(1144,178,2288,1656)}}function b0(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0;g=f*12&-1;h=(g>>>0)/10>>>0;if((b|0)==0){aB(1144,58,2336,1656)}i=b+12|0;j=c[i>>2]|0;if((j|0)==0){aB(1144,58,2336,1656)}do{if(g>>>0<=167772169){k=b+8|0;l=c[k>>2]|0;if(l>>>0>=h>>>0){break}m=l+j|0;if(m>>>0<h>>>0){l=m;while(1){n=l+j|0;if(n>>>0<h>>>0){l=n}else{o=n;break}}}else{o=m}l=b|0;n=b4(c[l>>2]|0,o)|0;if((n|0)==0){break}c[l>>2]=n;c[k>>2]=o}}while(0);if((f|0)==0){return}o=b+4|0;h=b+8|0;j=b|0;b=0;L4726:while(1){g=b;while(1){if(g>>>0>=f>>>0){p=0;break}if((a[2632+(d[e+g|0]|0)|0]|0)==0){p=1;break}else{g=g+1|0}}do{if(g>>>0>b>>>0){k=e+b|0;m=g-b|0;n=c[i>>2]|0;if((n|0)==0){q=3437;break L4726}l=c[o>>2]|0;r=l+m|0;s=c[h>>2]|0;if(r>>>0>s>>>0){if(r>>>0>16777216){break}t=s+n|0;if(t>>>0<r>>>0){s=t;while(1){u=s+n|0;if(u>>>0<r>>>0){s=u}else{v=u;break}}}else{v=t}s=b4(c[j>>2]|0,v)|0;if((s|0)==0){break}c[j>>2]=s;c[h>>2]=v;w=c[o>>2]|0;x=s}else{w=l;x=c[j>>2]|0}s=x+w|0;ca(s|0,k|0,m)|0;c[o>>2]=(c[o>>2]|0)+m}}while(0);if(!p){q=3482;break}s=d[e+g|0]|0;do{if((s|0)==39){r=c[i>>2]|0;if((r|0)==0){q=3459;break L4726}n=c[o>>2]|0;u=n+6|0;y=c[h>>2]|0;if(u>>>0>y>>>0){if(u>>>0>16777216){break}z=y+r|0;if(z>>>0<u>>>0){y=z;while(1){A=y+r|0;if(A>>>0<u>>>0){y=A}else{B=A;break}}}else{B=z}y=b4(c[j>>2]|0,B)|0;if((y|0)==0){break}c[j>>2]=y;c[h>>2]=B;C=c[o>>2]|0;D=y}else{C=n;D=c[j>>2]|0}y=D+C|0;a[y]=a[1728]|0;a[y+1|0]=a[1729|0]|0;a[y+2|0]=a[1730|0]|0;a[y+3|0]=a[1731|0]|0;a[y+4|0]=a[1732|0]|0;a[y+5|0]=a[1733|0]|0;c[o>>2]=(c[o>>2]|0)+6}else if((s|0)==38){y=c[i>>2]|0;if((y|0)==0){q=3449;break L4726}u=c[o>>2]|0;r=u+5|0;m=c[h>>2]|0;if(r>>>0>m>>>0){if(r>>>0>16777216){break}k=m+y|0;if(k>>>0<r>>>0){m=k;while(1){l=m+y|0;if(l>>>0<r>>>0){m=l}else{E=l;break}}}else{E=k}m=b4(c[j>>2]|0,E)|0;if((m|0)==0){break}c[j>>2]=m;c[h>>2]=E;F=c[o>>2]|0;G=m}else{F=u;G=c[j>>2]|0}m=G+F|0;a[m]=a[1696]|0;a[m+1|0]=a[1697|0]|0;a[m+2|0]=a[1698|0]|0;a[m+3|0]=a[1699|0]|0;a[m+4|0]=a[1700|0]|0;c[o>>2]=(c[o>>2]|0)+5}else{m=a[200+(s>>>4)|0]|0;r=a[200+(s&15)|0]|0;y=c[i>>2]|0;if((y|0)==0){q=3469;break L4726}n=c[o>>2]|0;z=n+3|0;l=c[h>>2]|0;if(z>>>0>l>>>0){if(z>>>0>16777216){break}t=l+y|0;if(t>>>0<z>>>0){l=t;while(1){A=l+y|0;if(A>>>0<z>>>0){l=A}else{H=A;break}}}else{H=t}l=b4(c[j>>2]|0,H)|0;if((l|0)==0){break}c[j>>2]=l;c[h>>2]=H;I=c[o>>2]|0;J=l}else{I=n;J=c[j>>2]|0}a[J+I|0]=37;a[J+(I+1)|0]=m;a[J+(I+2)|0]=r;c[o>>2]=(c[o>>2]|0)+3}}while(0);s=g+1|0;if(s>>>0<f>>>0){b=s}else{q=3480;break}}if((q|0)==3437){aB(1144,157,2296,1656)}else if((q|0)==3480){return}else if((q|0)==3449){aB(1144,157,2296,1656)}else if((q|0)==3459){aB(1144,157,2296,1656)}else if((q|0)==3469){aB(1144,157,2296,1656)}else if((q|0)==3482){return}}function b1(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,an=0,ao=0,ap=0,ar=0,at=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aE=0,aG=0,aH=0,aI=0,aJ=0,aK=0,aL=0;do{if(a>>>0<245){if(a>>>0<11){b=16}else{b=a+11&-8}d=b>>>3;e=c[444]|0;f=e>>>(d>>>0);if((f&3|0)!=0){g=(f&1^1)+d|0;h=g<<1;i=1816+(h<<2)|0;j=1816+(h+2<<2)|0;h=c[j>>2]|0;k=h+8|0;l=c[k>>2]|0;do{if((i|0)==(l|0)){c[444]=e&(1<<g^-1)}else{if(l>>>0<(c[448]|0)>>>0){aq();return 0;return 0}m=l+12|0;if((c[m>>2]|0)==(h|0)){c[m>>2]=i;c[j>>2]=l;break}else{aq();return 0;return 0}}}while(0);l=g<<3;c[h+4>>2]=l|3;j=h+(l|4)|0;c[j>>2]=c[j>>2]|1;n=k;return n|0}if(b>>>0<=(c[446]|0)>>>0){o=b;break}if((f|0)!=0){j=2<<d;l=f<<d&(j|-j);j=(l&-l)-1|0;l=j>>>12&16;i=j>>>(l>>>0);j=i>>>5&8;m=i>>>(j>>>0);i=m>>>2&4;p=m>>>(i>>>0);m=p>>>1&2;q=p>>>(m>>>0);p=q>>>1&1;r=(j|l|i|m|p)+(q>>>(p>>>0))|0;p=r<<1;q=1816+(p<<2)|0;m=1816+(p+2<<2)|0;p=c[m>>2]|0;i=p+8|0;l=c[i>>2]|0;do{if((q|0)==(l|0)){c[444]=e&(1<<r^-1)}else{if(l>>>0<(c[448]|0)>>>0){aq();return 0;return 0}j=l+12|0;if((c[j>>2]|0)==(p|0)){c[j>>2]=q;c[m>>2]=l;break}else{aq();return 0;return 0}}}while(0);l=r<<3;m=l-b|0;c[p+4>>2]=b|3;q=p;e=q+b|0;c[q+(b|4)>>2]=m|1;c[q+l>>2]=m;l=c[446]|0;if((l|0)!=0){q=c[449]|0;d=l>>>3;l=d<<1;f=1816+(l<<2)|0;k=c[444]|0;h=1<<d;do{if((k&h|0)==0){c[444]=k|h;s=f;t=1816+(l+2<<2)|0}else{d=1816+(l+2<<2)|0;g=c[d>>2]|0;if(g>>>0>=(c[448]|0)>>>0){s=g;t=d;break}aq();return 0;return 0}}while(0);c[t>>2]=q;c[s+12>>2]=q;c[q+8>>2]=s;c[q+12>>2]=f}c[446]=m;c[449]=e;n=i;return n|0}l=c[445]|0;if((l|0)==0){o=b;break}h=(l&-l)-1|0;l=h>>>12&16;k=h>>>(l>>>0);h=k>>>5&8;p=k>>>(h>>>0);k=p>>>2&4;r=p>>>(k>>>0);p=r>>>1&2;d=r>>>(p>>>0);r=d>>>1&1;g=c[2080+((h|l|k|p|r)+(d>>>(r>>>0))<<2)>>2]|0;r=g;d=g;p=(c[g+4>>2]&-8)-b|0;while(1){g=c[r+16>>2]|0;if((g|0)==0){k=c[r+20>>2]|0;if((k|0)==0){break}else{u=k}}else{u=g}g=(c[u+4>>2]&-8)-b|0;k=g>>>0<p>>>0;r=u;d=k?u:d;p=k?g:p}r=d;i=c[448]|0;if(r>>>0<i>>>0){aq();return 0;return 0}e=r+b|0;m=e;if(r>>>0>=e>>>0){aq();return 0;return 0}e=c[d+24>>2]|0;f=c[d+12>>2]|0;do{if((f|0)==(d|0)){q=d+20|0;g=c[q>>2]|0;if((g|0)==0){k=d+16|0;l=c[k>>2]|0;if((l|0)==0){v=0;break}else{w=l;x=k}}else{w=g;x=q}while(1){q=w+20|0;g=c[q>>2]|0;if((g|0)!=0){w=g;x=q;continue}q=w+16|0;g=c[q>>2]|0;if((g|0)==0){break}else{w=g;x=q}}if(x>>>0<i>>>0){aq();return 0;return 0}else{c[x>>2]=0;v=w;break}}else{q=c[d+8>>2]|0;if(q>>>0<i>>>0){aq();return 0;return 0}g=q+12|0;if((c[g>>2]|0)!=(d|0)){aq();return 0;return 0}k=f+8|0;if((c[k>>2]|0)==(d|0)){c[g>>2]=f;c[k>>2]=q;v=f;break}else{aq();return 0;return 0}}}while(0);L4993:do{if((e|0)!=0){f=d+28|0;i=2080+(c[f>>2]<<2)|0;do{if((d|0)==(c[i>>2]|0)){c[i>>2]=v;if((v|0)!=0){break}c[445]=c[445]&(1<<c[f>>2]^-1);break L4993}else{if(e>>>0<(c[448]|0)>>>0){aq();return 0;return 0}q=e+16|0;if((c[q>>2]|0)==(d|0)){c[q>>2]=v}else{c[e+20>>2]=v}if((v|0)==0){break L4993}}}while(0);if(v>>>0<(c[448]|0)>>>0){aq();return 0;return 0}c[v+24>>2]=e;f=c[d+16>>2]|0;do{if((f|0)!=0){if(f>>>0<(c[448]|0)>>>0){aq();return 0;return 0}else{c[v+16>>2]=f;c[f+24>>2]=v;break}}}while(0);f=c[d+20>>2]|0;if((f|0)==0){break}if(f>>>0<(c[448]|0)>>>0){aq();return 0;return 0}else{c[v+20>>2]=f;c[f+24>>2]=v;break}}}while(0);if(p>>>0<16){e=p+b|0;c[d+4>>2]=e|3;f=r+(e+4)|0;c[f>>2]=c[f>>2]|1}else{c[d+4>>2]=b|3;c[r+(b|4)>>2]=p|1;c[r+(p+b)>>2]=p;f=c[446]|0;if((f|0)!=0){e=c[449]|0;i=f>>>3;f=i<<1;q=1816+(f<<2)|0;k=c[444]|0;g=1<<i;do{if((k&g|0)==0){c[444]=k|g;y=q;z=1816+(f+2<<2)|0}else{i=1816+(f+2<<2)|0;l=c[i>>2]|0;if(l>>>0>=(c[448]|0)>>>0){y=l;z=i;break}aq();return 0;return 0}}while(0);c[z>>2]=e;c[y+12>>2]=e;c[e+8>>2]=y;c[e+12>>2]=q}c[446]=p;c[449]=m}f=d+8|0;if((f|0)==0){o=b;break}else{n=f}return n|0}else{if(a>>>0>4294967231){o=-1;break}f=a+11|0;g=f&-8;k=c[445]|0;if((k|0)==0){o=g;break}r=-g|0;i=f>>>8;do{if((i|0)==0){A=0}else{if(g>>>0>16777215){A=31;break}f=(i+1048320|0)>>>16&8;l=i<<f;h=(l+520192|0)>>>16&4;j=l<<h;l=(j+245760|0)>>>16&2;B=14-(h|f|l)+(j<<l>>>15)|0;A=g>>>((B+7|0)>>>0)&1|B<<1}}while(0);i=c[2080+(A<<2)>>2]|0;L4801:do{if((i|0)==0){C=0;D=r;E=0}else{if((A|0)==31){F=0}else{F=25-(A>>>1)|0}d=0;m=r;p=i;q=g<<F;e=0;while(1){B=c[p+4>>2]&-8;l=B-g|0;if(l>>>0<m>>>0){if((B|0)==(g|0)){C=p;D=l;E=p;break L4801}else{G=p;H=l}}else{G=d;H=m}l=c[p+20>>2]|0;B=c[p+16+(q>>>31<<2)>>2]|0;j=(l|0)==0|(l|0)==(B|0)?e:l;if((B|0)==0){C=G;D=H;E=j;break}else{d=G;m=H;p=B;q=q<<1;e=j}}}}while(0);if((E|0)==0&(C|0)==0){i=2<<A;r=k&(i|-i);if((r|0)==0){o=g;break}i=(r&-r)-1|0;r=i>>>12&16;e=i>>>(r>>>0);i=e>>>5&8;q=e>>>(i>>>0);e=q>>>2&4;p=q>>>(e>>>0);q=p>>>1&2;m=p>>>(q>>>0);p=m>>>1&1;I=c[2080+((i|r|e|q|p)+(m>>>(p>>>0))<<2)>>2]|0}else{I=E}if((I|0)==0){J=D;K=C}else{p=I;m=D;q=C;while(1){e=(c[p+4>>2]&-8)-g|0;r=e>>>0<m>>>0;i=r?e:m;e=r?p:q;r=c[p+16>>2]|0;if((r|0)!=0){p=r;m=i;q=e;continue}r=c[p+20>>2]|0;if((r|0)==0){J=i;K=e;break}else{p=r;m=i;q=e}}}if((K|0)==0){o=g;break}if(J>>>0>=((c[446]|0)-g|0)>>>0){o=g;break}q=K;m=c[448]|0;if(q>>>0<m>>>0){aq();return 0;return 0}p=q+g|0;k=p;if(q>>>0>=p>>>0){aq();return 0;return 0}e=c[K+24>>2]|0;i=c[K+12>>2]|0;do{if((i|0)==(K|0)){r=K+20|0;d=c[r>>2]|0;if((d|0)==0){j=K+16|0;B=c[j>>2]|0;if((B|0)==0){L=0;break}else{M=B;N=j}}else{M=d;N=r}while(1){r=M+20|0;d=c[r>>2]|0;if((d|0)!=0){M=d;N=r;continue}r=M+16|0;d=c[r>>2]|0;if((d|0)==0){break}else{M=d;N=r}}if(N>>>0<m>>>0){aq();return 0;return 0}else{c[N>>2]=0;L=M;break}}else{r=c[K+8>>2]|0;if(r>>>0<m>>>0){aq();return 0;return 0}d=r+12|0;if((c[d>>2]|0)!=(K|0)){aq();return 0;return 0}j=i+8|0;if((c[j>>2]|0)==(K|0)){c[d>>2]=i;c[j>>2]=r;L=i;break}else{aq();return 0;return 0}}}while(0);L4851:do{if((e|0)!=0){i=K+28|0;m=2080+(c[i>>2]<<2)|0;do{if((K|0)==(c[m>>2]|0)){c[m>>2]=L;if((L|0)!=0){break}c[445]=c[445]&(1<<c[i>>2]^-1);break L4851}else{if(e>>>0<(c[448]|0)>>>0){aq();return 0;return 0}r=e+16|0;if((c[r>>2]|0)==(K|0)){c[r>>2]=L}else{c[e+20>>2]=L}if((L|0)==0){break L4851}}}while(0);if(L>>>0<(c[448]|0)>>>0){aq();return 0;return 0}c[L+24>>2]=e;i=c[K+16>>2]|0;do{if((i|0)!=0){if(i>>>0<(c[448]|0)>>>0){aq();return 0;return 0}else{c[L+16>>2]=i;c[i+24>>2]=L;break}}}while(0);i=c[K+20>>2]|0;if((i|0)==0){break}if(i>>>0<(c[448]|0)>>>0){aq();return 0;return 0}else{c[L+20>>2]=i;c[i+24>>2]=L;break}}}while(0);do{if(J>>>0<16){e=J+g|0;c[K+4>>2]=e|3;i=q+(e+4)|0;c[i>>2]=c[i>>2]|1}else{c[K+4>>2]=g|3;c[q+(g|4)>>2]=J|1;c[q+(J+g)>>2]=J;i=J>>>3;if(J>>>0<256){e=i<<1;m=1816+(e<<2)|0;r=c[444]|0;j=1<<i;do{if((r&j|0)==0){c[444]=r|j;O=m;P=1816+(e+2<<2)|0}else{i=1816+(e+2<<2)|0;d=c[i>>2]|0;if(d>>>0>=(c[448]|0)>>>0){O=d;P=i;break}aq();return 0;return 0}}while(0);c[P>>2]=k;c[O+12>>2]=k;c[q+(g+8)>>2]=O;c[q+(g+12)>>2]=m;break}e=p;j=J>>>8;do{if((j|0)==0){Q=0}else{if(J>>>0>16777215){Q=31;break}r=(j+1048320|0)>>>16&8;i=j<<r;d=(i+520192|0)>>>16&4;B=i<<d;i=(B+245760|0)>>>16&2;l=14-(d|r|i)+(B<<i>>>15)|0;Q=J>>>((l+7|0)>>>0)&1|l<<1}}while(0);j=2080+(Q<<2)|0;c[q+(g+28)>>2]=Q;c[q+(g+20)>>2]=0;c[q+(g+16)>>2]=0;m=c[445]|0;l=1<<Q;if((m&l|0)==0){c[445]=m|l;c[j>>2]=e;c[q+(g+24)>>2]=j;c[q+(g+12)>>2]=e;c[q+(g+8)>>2]=e;break}if((Q|0)==31){R=0}else{R=25-(Q>>>1)|0}l=J<<R;m=c[j>>2]|0;while(1){if((c[m+4>>2]&-8|0)==(J|0)){break}S=m+16+(l>>>31<<2)|0;j=c[S>>2]|0;if((j|0)==0){T=3635;break}else{l=l<<1;m=j}}if((T|0)==3635){if(S>>>0<(c[448]|0)>>>0){aq();return 0;return 0}else{c[S>>2]=e;c[q+(g+24)>>2]=m;c[q+(g+12)>>2]=e;c[q+(g+8)>>2]=e;break}}l=m+8|0;j=c[l>>2]|0;i=c[448]|0;if(m>>>0<i>>>0){aq();return 0;return 0}if(j>>>0<i>>>0){aq();return 0;return 0}else{c[j+12>>2]=e;c[l>>2]=e;c[q+(g+8)>>2]=j;c[q+(g+12)>>2]=m;c[q+(g+24)>>2]=0;break}}}while(0);q=K+8|0;if((q|0)==0){o=g;break}else{n=q}return n|0}}while(0);K=c[446]|0;if(o>>>0<=K>>>0){S=K-o|0;J=c[449]|0;if(S>>>0>15){R=J;c[449]=R+o;c[446]=S;c[R+(o+4)>>2]=S|1;c[R+K>>2]=S;c[J+4>>2]=o|3}else{c[446]=0;c[449]=0;c[J+4>>2]=K|3;S=J+(K+4)|0;c[S>>2]=c[S>>2]|1}n=J+8|0;return n|0}J=c[447]|0;if(o>>>0<J>>>0){S=J-o|0;c[447]=S;J=c[450]|0;K=J;c[450]=K+o;c[K+(o+4)>>2]=S|1;c[J+4>>2]=o|3;n=J+8|0;return n|0}do{if((c[32]|0)==0){J=as(8)|0;if((J-1&J|0)==0){c[34]=J;c[33]=J;c[35]=-1;c[36]=2097152;c[37]=0;c[555]=0;c[32]=(aF(0)|0)&-16^1431655768;break}else{aq();return 0;return 0}}}while(0);J=o+48|0;S=c[34]|0;K=o+47|0;R=S+K|0;Q=-S|0;S=R&Q;if(S>>>0<=o>>>0){n=0;return n|0}O=c[554]|0;do{if((O|0)!=0){P=c[552]|0;L=P+S|0;if(L>>>0<=P>>>0|L>>>0>O>>>0){n=0}else{break}return n|0}}while(0);L5060:do{if((c[555]&4|0)==0){O=c[450]|0;L5062:do{if((O|0)==0){T=3665}else{L=O;P=2224;while(1){U=P|0;M=c[U>>2]|0;if(M>>>0<=L>>>0){V=P+4|0;if((M+(c[V>>2]|0)|0)>>>0>L>>>0){break}}M=c[P+8>>2]|0;if((M|0)==0){T=3665;break L5062}else{P=M}}if((P|0)==0){T=3665;break}L=R-(c[447]|0)&Q;if(L>>>0>=2147483647){W=0;break}m=aC(L|0)|0;e=(m|0)==((c[U>>2]|0)+(c[V>>2]|0)|0);X=e?m:-1;Y=e?L:0;Z=m;_=L;T=3674}}while(0);do{if((T|0)==3665){O=aC(0)|0;if((O|0)==-1){W=0;break}g=O;L=c[33]|0;m=L-1|0;if((m&g|0)==0){$=S}else{$=S-g+(m+g&-L)|0}L=c[552]|0;g=L+$|0;if(!($>>>0>o>>>0&$>>>0<2147483647)){W=0;break}m=c[554]|0;if((m|0)!=0){if(g>>>0<=L>>>0|g>>>0>m>>>0){W=0;break}}m=aC($|0)|0;g=(m|0)==(O|0);X=g?O:-1;Y=g?$:0;Z=m;_=$;T=3674}}while(0);L5082:do{if((T|0)==3674){m=-_|0;if((X|0)!=-1){aa=Y;ab=X;T=3685;break L5060}do{if((Z|0)!=-1&_>>>0<2147483647&_>>>0<J>>>0){g=c[34]|0;O=K-_+g&-g;if(O>>>0>=2147483647){ac=_;break}if((aC(O|0)|0)==-1){aC(m|0)|0;W=Y;break L5082}else{ac=O+_|0;break}}else{ac=_}}while(0);if((Z|0)==-1){W=Y}else{aa=ac;ab=Z;T=3685;break L5060}}}while(0);c[555]=c[555]|4;ad=W;T=3682}else{ad=0;T=3682}}while(0);do{if((T|0)==3682){if(S>>>0>=2147483647){break}W=aC(S|0)|0;Z=aC(0)|0;if(!((Z|0)!=-1&(W|0)!=-1&W>>>0<Z>>>0)){break}ac=Z-W|0;Z=ac>>>0>(o+40|0)>>>0;Y=Z?W:-1;if((Y|0)!=-1){aa=Z?ac:ad;ab=Y;T=3685}}}while(0);do{if((T|0)==3685){ad=(c[552]|0)+aa|0;c[552]=ad;if(ad>>>0>(c[553]|0)>>>0){c[553]=ad}ad=c[450]|0;L5102:do{if((ad|0)==0){S=c[448]|0;if((S|0)==0|ab>>>0<S>>>0){c[448]=ab}c[556]=ab;c[557]=aa;c[559]=0;c[453]=c[32];c[452]=-1;S=0;do{Y=S<<1;ac=1816+(Y<<2)|0;c[1816+(Y+3<<2)>>2]=ac;c[1816+(Y+2<<2)>>2]=ac;S=S+1|0;}while(S>>>0<32);S=ab+8|0;if((S&7|0)==0){ae=0}else{ae=-S&7}S=aa-40-ae|0;c[450]=ab+ae;c[447]=S;c[ab+(ae+4)>>2]=S|1;c[ab+(aa-36)>>2]=40;c[451]=c[36]}else{S=2224;while(1){af=c[S>>2]|0;ag=S+4|0;ah=c[ag>>2]|0;if((ab|0)==(af+ah|0)){T=3697;break}ac=c[S+8>>2]|0;if((ac|0)==0){break}else{S=ac}}do{if((T|0)==3697){if((c[S+12>>2]&8|0)!=0){break}ac=ad;if(!(ac>>>0>=af>>>0&ac>>>0<ab>>>0)){break}c[ag>>2]=ah+aa;ac=c[450]|0;Y=(c[447]|0)+aa|0;Z=ac;W=ac+8|0;if((W&7|0)==0){ai=0}else{ai=-W&7}W=Y-ai|0;c[450]=Z+ai;c[447]=W;c[Z+(ai+4)>>2]=W|1;c[Z+(Y+4)>>2]=40;c[451]=c[36];break L5102}}while(0);if(ab>>>0<(c[448]|0)>>>0){c[448]=ab}S=ab+aa|0;Y=2224;while(1){aj=Y|0;if((c[aj>>2]|0)==(S|0)){T=3707;break}Z=c[Y+8>>2]|0;if((Z|0)==0){break}else{Y=Z}}do{if((T|0)==3707){if((c[Y+12>>2]&8|0)!=0){break}c[aj>>2]=ab;S=Y+4|0;c[S>>2]=(c[S>>2]|0)+aa;S=ab+8|0;if((S&7|0)==0){ak=0}else{ak=-S&7}S=ab+(aa+8)|0;if((S&7|0)==0){al=0}else{al=-S&7}S=ab+(al+aa)|0;Z=S;W=ak+o|0;ac=ab+W|0;_=ac;K=S-(ab+ak)-o|0;c[ab+(ak+4)>>2]=o|3;do{if((Z|0)==(c[450]|0)){J=(c[447]|0)+K|0;c[447]=J;c[450]=_;c[ab+(W+4)>>2]=J|1}else{if((Z|0)==(c[449]|0)){J=(c[446]|0)+K|0;c[446]=J;c[449]=_;c[ab+(W+4)>>2]=J|1;c[ab+(J+W)>>2]=J;break}J=aa+4|0;X=c[ab+(J+al)>>2]|0;if((X&3|0)==1){$=X&-8;V=X>>>3;L5147:do{if(X>>>0<256){U=c[ab+((al|8)+aa)>>2]|0;Q=c[ab+(aa+12+al)>>2]|0;R=1816+(V<<1<<2)|0;do{if((U|0)!=(R|0)){if(U>>>0<(c[448]|0)>>>0){aq();return 0;return 0}if((c[U+12>>2]|0)==(Z|0)){break}aq();return 0;return 0}}while(0);if((Q|0)==(U|0)){c[444]=c[444]&(1<<V^-1);break}do{if((Q|0)==(R|0)){am=Q+8|0}else{if(Q>>>0<(c[448]|0)>>>0){aq();return 0;return 0}m=Q+8|0;if((c[m>>2]|0)==(Z|0)){am=m;break}aq();return 0;return 0}}while(0);c[U+12>>2]=Q;c[am>>2]=U}else{R=S;m=c[ab+((al|24)+aa)>>2]|0;P=c[ab+(aa+12+al)>>2]|0;do{if((P|0)==(R|0)){O=al|16;g=ab+(J+O)|0;L=c[g>>2]|0;if((L|0)==0){e=ab+(O+aa)|0;O=c[e>>2]|0;if((O|0)==0){an=0;break}else{ao=O;ap=e}}else{ao=L;ap=g}while(1){g=ao+20|0;L=c[g>>2]|0;if((L|0)!=0){ao=L;ap=g;continue}g=ao+16|0;L=c[g>>2]|0;if((L|0)==0){break}else{ao=L;ap=g}}if(ap>>>0<(c[448]|0)>>>0){aq();return 0;return 0}else{c[ap>>2]=0;an=ao;break}}else{g=c[ab+((al|8)+aa)>>2]|0;if(g>>>0<(c[448]|0)>>>0){aq();return 0;return 0}L=g+12|0;if((c[L>>2]|0)!=(R|0)){aq();return 0;return 0}e=P+8|0;if((c[e>>2]|0)==(R|0)){c[L>>2]=P;c[e>>2]=g;an=P;break}else{aq();return 0;return 0}}}while(0);if((m|0)==0){break}P=ab+(aa+28+al)|0;U=2080+(c[P>>2]<<2)|0;do{if((R|0)==(c[U>>2]|0)){c[U>>2]=an;if((an|0)!=0){break}c[445]=c[445]&(1<<c[P>>2]^-1);break L5147}else{if(m>>>0<(c[448]|0)>>>0){aq();return 0;return 0}Q=m+16|0;if((c[Q>>2]|0)==(R|0)){c[Q>>2]=an}else{c[m+20>>2]=an}if((an|0)==0){break L5147}}}while(0);if(an>>>0<(c[448]|0)>>>0){aq();return 0;return 0}c[an+24>>2]=m;R=al|16;P=c[ab+(R+aa)>>2]|0;do{if((P|0)!=0){if(P>>>0<(c[448]|0)>>>0){aq();return 0;return 0}else{c[an+16>>2]=P;c[P+24>>2]=an;break}}}while(0);P=c[ab+(J+R)>>2]|0;if((P|0)==0){break}if(P>>>0<(c[448]|0)>>>0){aq();return 0;return 0}else{c[an+20>>2]=P;c[P+24>>2]=an;break}}}while(0);ar=ab+(($|al)+aa)|0;at=$+K|0}else{ar=Z;at=K}J=ar+4|0;c[J>>2]=c[J>>2]&-2;c[ab+(W+4)>>2]=at|1;c[ab+(at+W)>>2]=at;J=at>>>3;if(at>>>0<256){V=J<<1;X=1816+(V<<2)|0;P=c[444]|0;m=1<<J;do{if((P&m|0)==0){c[444]=P|m;au=X;av=1816+(V+2<<2)|0}else{J=1816+(V+2<<2)|0;U=c[J>>2]|0;if(U>>>0>=(c[448]|0)>>>0){au=U;av=J;break}aq();return 0;return 0}}while(0);c[av>>2]=_;c[au+12>>2]=_;c[ab+(W+8)>>2]=au;c[ab+(W+12)>>2]=X;break}V=ac;m=at>>>8;do{if((m|0)==0){aw=0}else{if(at>>>0>16777215){aw=31;break}P=(m+1048320|0)>>>16&8;$=m<<P;J=($+520192|0)>>>16&4;U=$<<J;$=(U+245760|0)>>>16&2;Q=14-(J|P|$)+(U<<$>>>15)|0;aw=at>>>((Q+7|0)>>>0)&1|Q<<1}}while(0);m=2080+(aw<<2)|0;c[ab+(W+28)>>2]=aw;c[ab+(W+20)>>2]=0;c[ab+(W+16)>>2]=0;X=c[445]|0;Q=1<<aw;if((X&Q|0)==0){c[445]=X|Q;c[m>>2]=V;c[ab+(W+24)>>2]=m;c[ab+(W+12)>>2]=V;c[ab+(W+8)>>2]=V;break}if((aw|0)==31){ax=0}else{ax=25-(aw>>>1)|0}Q=at<<ax;X=c[m>>2]|0;while(1){if((c[X+4>>2]&-8|0)==(at|0)){break}ay=X+16+(Q>>>31<<2)|0;m=c[ay>>2]|0;if((m|0)==0){T=3780;break}else{Q=Q<<1;X=m}}if((T|0)==3780){if(ay>>>0<(c[448]|0)>>>0){aq();return 0;return 0}else{c[ay>>2]=V;c[ab+(W+24)>>2]=X;c[ab+(W+12)>>2]=V;c[ab+(W+8)>>2]=V;break}}Q=X+8|0;m=c[Q>>2]|0;$=c[448]|0;if(X>>>0<$>>>0){aq();return 0;return 0}if(m>>>0<$>>>0){aq();return 0;return 0}else{c[m+12>>2]=V;c[Q>>2]=V;c[ab+(W+8)>>2]=m;c[ab+(W+12)>>2]=X;c[ab+(W+24)>>2]=0;break}}}while(0);n=ab+(ak|8)|0;return n|0}}while(0);Y=ad;W=2224;while(1){az=c[W>>2]|0;if(az>>>0<=Y>>>0){aA=c[W+4>>2]|0;aB=az+aA|0;if(aB>>>0>Y>>>0){break}}W=c[W+8>>2]|0}W=az+(aA-39)|0;if((W&7|0)==0){aE=0}else{aE=-W&7}W=az+(aA-47+aE)|0;ac=W>>>0<(ad+16|0)>>>0?Y:W;W=ac+8|0;_=ab+8|0;if((_&7|0)==0){aG=0}else{aG=-_&7}_=aa-40-aG|0;c[450]=ab+aG;c[447]=_;c[ab+(aG+4)>>2]=_|1;c[ab+(aa-36)>>2]=40;c[451]=c[36];c[ac+4>>2]=27;c[W>>2]=c[556];c[W+4>>2]=c[2228>>2];c[W+8>>2]=c[2232>>2];c[W+12>>2]=c[2236>>2];c[556]=ab;c[557]=aa;c[559]=0;c[558]=W;W=ac+28|0;c[W>>2]=7;if((ac+32|0)>>>0<aB>>>0){_=W;while(1){W=_+4|0;c[W>>2]=7;if((_+8|0)>>>0<aB>>>0){_=W}else{break}}}if((ac|0)==(Y|0)){break}_=ac-ad|0;W=Y+(_+4)|0;c[W>>2]=c[W>>2]&-2;c[ad+4>>2]=_|1;c[Y+_>>2]=_;W=_>>>3;if(_>>>0<256){K=W<<1;Z=1816+(K<<2)|0;S=c[444]|0;m=1<<W;do{if((S&m|0)==0){c[444]=S|m;aH=Z;aI=1816+(K+2<<2)|0}else{W=1816+(K+2<<2)|0;Q=c[W>>2]|0;if(Q>>>0>=(c[448]|0)>>>0){aH=Q;aI=W;break}aq();return 0;return 0}}while(0);c[aI>>2]=ad;c[aH+12>>2]=ad;c[ad+8>>2]=aH;c[ad+12>>2]=Z;break}K=ad;m=_>>>8;do{if((m|0)==0){aJ=0}else{if(_>>>0>16777215){aJ=31;break}S=(m+1048320|0)>>>16&8;Y=m<<S;ac=(Y+520192|0)>>>16&4;W=Y<<ac;Y=(W+245760|0)>>>16&2;Q=14-(ac|S|Y)+(W<<Y>>>15)|0;aJ=_>>>((Q+7|0)>>>0)&1|Q<<1}}while(0);m=2080+(aJ<<2)|0;c[ad+28>>2]=aJ;c[ad+20>>2]=0;c[ad+16>>2]=0;Z=c[445]|0;Q=1<<aJ;if((Z&Q|0)==0){c[445]=Z|Q;c[m>>2]=K;c[ad+24>>2]=m;c[ad+12>>2]=ad;c[ad+8>>2]=ad;break}if((aJ|0)==31){aK=0}else{aK=25-(aJ>>>1)|0}Q=_<<aK;Z=c[m>>2]|0;while(1){if((c[Z+4>>2]&-8|0)==(_|0)){break}aL=Z+16+(Q>>>31<<2)|0;m=c[aL>>2]|0;if((m|0)==0){T=3815;break}else{Q=Q<<1;Z=m}}if((T|0)==3815){if(aL>>>0<(c[448]|0)>>>0){aq();return 0;return 0}else{c[aL>>2]=K;c[ad+24>>2]=Z;c[ad+12>>2]=ad;c[ad+8>>2]=ad;break}}Q=Z+8|0;_=c[Q>>2]|0;m=c[448]|0;if(Z>>>0<m>>>0){aq();return 0;return 0}if(_>>>0<m>>>0){aq();return 0;return 0}else{c[_+12>>2]=K;c[Q>>2]=K;c[ad+8>>2]=_;c[ad+12>>2]=Z;c[ad+24>>2]=0;break}}}while(0);ad=c[447]|0;if(ad>>>0<=o>>>0){break}_=ad-o|0;c[447]=_;ad=c[450]|0;Q=ad;c[450]=Q+o;c[Q+(o+4)>>2]=_|1;c[ad+4>>2]=o|3;n=ad+8|0;return n|0}}while(0);c[(aD()|0)>>2]=12;n=0;return n|0}function b2(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;if((a|0)==0){return}b=a-8|0;d=b;e=c[448]|0;if(b>>>0<e>>>0){aq()}f=c[a-4>>2]|0;g=f&3;if((g|0)==1){aq()}h=f&-8;i=a+(h-8)|0;j=i;L5319:do{if((f&1|0)==0){k=c[b>>2]|0;if((g|0)==0){return}l=-8-k|0;m=a+l|0;n=m;o=k+h|0;if(m>>>0<e>>>0){aq()}if((n|0)==(c[449]|0)){p=a+(h-4)|0;if((c[p>>2]&3|0)!=3){q=n;r=o;break}c[446]=o;c[p>>2]=c[p>>2]&-2;c[a+(l+4)>>2]=o|1;c[i>>2]=o;return}p=k>>>3;if(k>>>0<256){k=c[a+(l+8)>>2]|0;s=c[a+(l+12)>>2]|0;t=1816+(p<<1<<2)|0;do{if((k|0)!=(t|0)){if(k>>>0<e>>>0){aq()}if((c[k+12>>2]|0)==(n|0)){break}aq()}}while(0);if((s|0)==(k|0)){c[444]=c[444]&(1<<p^-1);q=n;r=o;break}do{if((s|0)==(t|0)){u=s+8|0}else{if(s>>>0<e>>>0){aq()}v=s+8|0;if((c[v>>2]|0)==(n|0)){u=v;break}aq()}}while(0);c[k+12>>2]=s;c[u>>2]=k;q=n;r=o;break}t=m;p=c[a+(l+24)>>2]|0;v=c[a+(l+12)>>2]|0;do{if((v|0)==(t|0)){w=a+(l+20)|0;x=c[w>>2]|0;if((x|0)==0){y=a+(l+16)|0;z=c[y>>2]|0;if((z|0)==0){A=0;break}else{B=z;C=y}}else{B=x;C=w}while(1){w=B+20|0;x=c[w>>2]|0;if((x|0)!=0){B=x;C=w;continue}w=B+16|0;x=c[w>>2]|0;if((x|0)==0){break}else{B=x;C=w}}if(C>>>0<e>>>0){aq()}else{c[C>>2]=0;A=B;break}}else{w=c[a+(l+8)>>2]|0;if(w>>>0<e>>>0){aq()}x=w+12|0;if((c[x>>2]|0)!=(t|0)){aq()}y=v+8|0;if((c[y>>2]|0)==(t|0)){c[x>>2]=v;c[y>>2]=w;A=v;break}else{aq()}}}while(0);if((p|0)==0){q=n;r=o;break}v=a+(l+28)|0;m=2080+(c[v>>2]<<2)|0;do{if((t|0)==(c[m>>2]|0)){c[m>>2]=A;if((A|0)!=0){break}c[445]=c[445]&(1<<c[v>>2]^-1);q=n;r=o;break L5319}else{if(p>>>0<(c[448]|0)>>>0){aq()}k=p+16|0;if((c[k>>2]|0)==(t|0)){c[k>>2]=A}else{c[p+20>>2]=A}if((A|0)==0){q=n;r=o;break L5319}}}while(0);if(A>>>0<(c[448]|0)>>>0){aq()}c[A+24>>2]=p;t=c[a+(l+16)>>2]|0;do{if((t|0)!=0){if(t>>>0<(c[448]|0)>>>0){aq()}else{c[A+16>>2]=t;c[t+24>>2]=A;break}}}while(0);t=c[a+(l+20)>>2]|0;if((t|0)==0){q=n;r=o;break}if(t>>>0<(c[448]|0)>>>0){aq()}else{c[A+20>>2]=t;c[t+24>>2]=A;q=n;r=o;break}}else{q=d;r=h}}while(0);d=q;if(d>>>0>=i>>>0){aq()}A=a+(h-4)|0;e=c[A>>2]|0;if((e&1|0)==0){aq()}do{if((e&2|0)==0){if((j|0)==(c[450]|0)){B=(c[447]|0)+r|0;c[447]=B;c[450]=q;c[q+4>>2]=B|1;if((q|0)==(c[449]|0)){c[449]=0;c[446]=0}if(B>>>0<=(c[451]|0)>>>0){return}b5(0)|0;return}if((j|0)==(c[449]|0)){B=(c[446]|0)+r|0;c[446]=B;c[449]=q;c[q+4>>2]=B|1;c[d+B>>2]=B;return}B=(e&-8)+r|0;C=e>>>3;L5425:do{if(e>>>0<256){u=c[a+h>>2]|0;g=c[a+(h|4)>>2]|0;b=1816+(C<<1<<2)|0;do{if((u|0)!=(b|0)){if(u>>>0<(c[448]|0)>>>0){aq()}if((c[u+12>>2]|0)==(j|0)){break}aq()}}while(0);if((g|0)==(u|0)){c[444]=c[444]&(1<<C^-1);break}do{if((g|0)==(b|0)){D=g+8|0}else{if(g>>>0<(c[448]|0)>>>0){aq()}f=g+8|0;if((c[f>>2]|0)==(j|0)){D=f;break}aq()}}while(0);c[u+12>>2]=g;c[D>>2]=u}else{b=i;f=c[a+(h+16)>>2]|0;t=c[a+(h|4)>>2]|0;do{if((t|0)==(b|0)){p=a+(h+12)|0;v=c[p>>2]|0;if((v|0)==0){m=a+(h+8)|0;k=c[m>>2]|0;if((k|0)==0){E=0;break}else{F=k;G=m}}else{F=v;G=p}while(1){p=F+20|0;v=c[p>>2]|0;if((v|0)!=0){F=v;G=p;continue}p=F+16|0;v=c[p>>2]|0;if((v|0)==0){break}else{F=v;G=p}}if(G>>>0<(c[448]|0)>>>0){aq()}else{c[G>>2]=0;E=F;break}}else{p=c[a+h>>2]|0;if(p>>>0<(c[448]|0)>>>0){aq()}v=p+12|0;if((c[v>>2]|0)!=(b|0)){aq()}m=t+8|0;if((c[m>>2]|0)==(b|0)){c[v>>2]=t;c[m>>2]=p;E=t;break}else{aq()}}}while(0);if((f|0)==0){break}t=a+(h+20)|0;u=2080+(c[t>>2]<<2)|0;do{if((b|0)==(c[u>>2]|0)){c[u>>2]=E;if((E|0)!=0){break}c[445]=c[445]&(1<<c[t>>2]^-1);break L5425}else{if(f>>>0<(c[448]|0)>>>0){aq()}g=f+16|0;if((c[g>>2]|0)==(b|0)){c[g>>2]=E}else{c[f+20>>2]=E}if((E|0)==0){break L5425}}}while(0);if(E>>>0<(c[448]|0)>>>0){aq()}c[E+24>>2]=f;b=c[a+(h+8)>>2]|0;do{if((b|0)!=0){if(b>>>0<(c[448]|0)>>>0){aq()}else{c[E+16>>2]=b;c[b+24>>2]=E;break}}}while(0);b=c[a+(h+12)>>2]|0;if((b|0)==0){break}if(b>>>0<(c[448]|0)>>>0){aq()}else{c[E+20>>2]=b;c[b+24>>2]=E;break}}}while(0);c[q+4>>2]=B|1;c[d+B>>2]=B;if((q|0)!=(c[449]|0)){H=B;break}c[446]=B;return}else{c[A>>2]=e&-2;c[q+4>>2]=r|1;c[d+r>>2]=r;H=r}}while(0);r=H>>>3;if(H>>>0<256){d=r<<1;e=1816+(d<<2)|0;A=c[444]|0;E=1<<r;do{if((A&E|0)==0){c[444]=A|E;I=e;J=1816+(d+2<<2)|0}else{r=1816+(d+2<<2)|0;h=c[r>>2]|0;if(h>>>0>=(c[448]|0)>>>0){I=h;J=r;break}aq()}}while(0);c[J>>2]=q;c[I+12>>2]=q;c[q+8>>2]=I;c[q+12>>2]=e;return}e=q;I=H>>>8;do{if((I|0)==0){K=0}else{if(H>>>0>16777215){K=31;break}J=(I+1048320|0)>>>16&8;d=I<<J;E=(d+520192|0)>>>16&4;A=d<<E;d=(A+245760|0)>>>16&2;r=14-(E|J|d)+(A<<d>>>15)|0;K=H>>>((r+7|0)>>>0)&1|r<<1}}while(0);I=2080+(K<<2)|0;c[q+28>>2]=K;c[q+20>>2]=0;c[q+16>>2]=0;r=c[445]|0;d=1<<K;do{if((r&d|0)==0){c[445]=r|d;c[I>>2]=e;c[q+24>>2]=I;c[q+12>>2]=q;c[q+8>>2]=q}else{if((K|0)==31){L=0}else{L=25-(K>>>1)|0}A=H<<L;J=c[I>>2]|0;while(1){if((c[J+4>>2]&-8|0)==(H|0)){break}M=J+16+(A>>>31<<2)|0;E=c[M>>2]|0;if((E|0)==0){N=3994;break}else{A=A<<1;J=E}}if((N|0)==3994){if(M>>>0<(c[448]|0)>>>0){aq()}else{c[M>>2]=e;c[q+24>>2]=J;c[q+12>>2]=q;c[q+8>>2]=q;break}}A=J+8|0;B=c[A>>2]|0;E=c[448]|0;if(J>>>0<E>>>0){aq()}if(B>>>0<E>>>0){aq()}else{c[B+12>>2]=e;c[A>>2]=e;c[q+8>>2]=B;c[q+12>>2]=J;c[q+24>>2]=0;break}}}while(0);q=(c[452]|0)-1|0;c[452]=q;if((q|0)==0){O=2232}else{return}while(1){q=c[O>>2]|0;if((q|0)==0){break}else{O=q+8|0}}c[452]=-1;return}function b3(a,b){a=a|0;b=b|0;var d=0,e=0;do{if((a|0)==0){d=0}else{e=Z(b,a)|0;if((b|a)>>>0<=65535){d=e;break}d=((e>>>0)/(a>>>0)>>>0|0)==(b|0)?e:-1}}while(0);b=b1(d)|0;if((b|0)==0){return b|0}if((c[b-4>>2]&3|0)==0){return b|0}cb(b|0,0,d|0);return b|0}function b4(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;if((a|0)==0){d=b1(b)|0;return d|0}if(b>>>0>4294967231){c[(aD()|0)>>2]=12;d=0;return d|0}if(b>>>0<11){e=16}else{e=b+11&-8}f=b6(a-8|0,e)|0;if((f|0)!=0){d=f+8|0;return d|0}f=b1(b)|0;if((f|0)==0){d=0;return d|0}e=c[a-4>>2]|0;g=(e&-8)-((e&3|0)==0?8:4)|0;e=g>>>0<b>>>0?g:b;ca(f|0,a|0,e)|0;b2(a);d=f;return d|0}function b5(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;do{if((c[32]|0)==0){b=as(8)|0;if((b-1&b|0)==0){c[34]=b;c[33]=b;c[35]=-1;c[36]=2097152;c[37]=0;c[555]=0;c[32]=(aF(0)|0)&-16^1431655768;break}else{aq();return 0;return 0}}}while(0);if(a>>>0>=4294967232){d=0;return d|0}b=c[450]|0;if((b|0)==0){d=0;return d|0}e=c[447]|0;do{if(e>>>0>(a+40|0)>>>0){f=c[34]|0;g=Z((((-40-a-1+e+f|0)>>>0)/(f>>>0)>>>0)-1|0,f)|0;h=b;i=2224;while(1){j=c[i>>2]|0;if(j>>>0<=h>>>0){if((j+(c[i+4>>2]|0)|0)>>>0>h>>>0){k=i;break}}j=c[i+8>>2]|0;if((j|0)==0){k=0;break}else{i=j}}if((c[k+12>>2]&8|0)!=0){break}i=aC(0)|0;h=k+4|0;if((i|0)!=((c[k>>2]|0)+(c[h>>2]|0)|0)){break}j=aC(-(g>>>0>2147483646?-2147483648-f|0:g)|0)|0;l=aC(0)|0;if(!((j|0)!=-1&l>>>0<i>>>0)){break}j=i-l|0;if((i|0)==(l|0)){break}c[h>>2]=(c[h>>2]|0)-j;c[552]=(c[552]|0)-j;h=c[450]|0;m=(c[447]|0)-j|0;j=h;n=h+8|0;if((n&7|0)==0){o=0}else{o=-n&7}n=m-o|0;c[450]=j+o;c[447]=n;c[j+(o+4)>>2]=n|1;c[j+(m+4)>>2]=40;c[451]=c[36];d=(i|0)!=(l|0)&1;return d|0}}while(0);if((c[447]|0)>>>0<=(c[451]|0)>>>0){d=0;return d|0}c[451]=-1;d=0;return d|0}function b6(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;d=a+4|0;e=c[d>>2]|0;f=e&-8;g=a;h=g+f|0;i=h;j=c[448]|0;if(g>>>0<j>>>0){aq();return 0;return 0}k=e&3;if(!((k|0)!=1&g>>>0<h>>>0)){aq();return 0;return 0}l=g+(f|4)|0;m=c[l>>2]|0;if((m&1|0)==0){aq();return 0;return 0}if((k|0)==0){if(b>>>0<256){n=0;return n|0}do{if(f>>>0>=(b+4|0)>>>0){if((f-b|0)>>>0>c[34]<<1>>>0){break}else{n=a}return n|0}}while(0);n=0;return n|0}if(f>>>0>=b>>>0){k=f-b|0;if(k>>>0<=15){n=a;return n|0}c[d>>2]=e&1|b|2;c[g+(b+4)>>2]=k|3;c[l>>2]=c[l>>2]|1;b7(g+b|0,k);n=a;return n|0}if((i|0)==(c[450]|0)){k=(c[447]|0)+f|0;if(k>>>0<=b>>>0){n=0;return n|0}l=k-b|0;c[d>>2]=e&1|b|2;c[g+(b+4)>>2]=l|1;c[450]=g+b;c[447]=l;n=a;return n|0}if((i|0)==(c[449]|0)){l=(c[446]|0)+f|0;if(l>>>0<b>>>0){n=0;return n|0}k=l-b|0;if(k>>>0>15){c[d>>2]=e&1|b|2;c[g+(b+4)>>2]=k|1;c[g+l>>2]=k;o=g+(l+4)|0;c[o>>2]=c[o>>2]&-2;p=g+b|0;q=k}else{c[d>>2]=e&1|l|2;e=g+(l+4)|0;c[e>>2]=c[e>>2]|1;p=0;q=0}c[446]=q;c[449]=p;n=a;return n|0}if((m&2|0)!=0){n=0;return n|0}p=(m&-8)+f|0;if(p>>>0<b>>>0){n=0;return n|0}q=p-b|0;e=m>>>3;L5657:do{if(m>>>0<256){l=c[g+(f+8)>>2]|0;k=c[g+(f+12)>>2]|0;o=1816+(e<<1<<2)|0;do{if((l|0)!=(o|0)){if(l>>>0<j>>>0){aq();return 0;return 0}if((c[l+12>>2]|0)==(i|0)){break}aq();return 0;return 0}}while(0);if((k|0)==(l|0)){c[444]=c[444]&(1<<e^-1);break}do{if((k|0)==(o|0)){r=k+8|0}else{if(k>>>0<j>>>0){aq();return 0;return 0}s=k+8|0;if((c[s>>2]|0)==(i|0)){r=s;break}aq();return 0;return 0}}while(0);c[l+12>>2]=k;c[r>>2]=l}else{o=h;s=c[g+(f+24)>>2]|0;t=c[g+(f+12)>>2]|0;do{if((t|0)==(o|0)){u=g+(f+20)|0;v=c[u>>2]|0;if((v|0)==0){w=g+(f+16)|0;x=c[w>>2]|0;if((x|0)==0){y=0;break}else{z=x;A=w}}else{z=v;A=u}while(1){u=z+20|0;v=c[u>>2]|0;if((v|0)!=0){z=v;A=u;continue}u=z+16|0;v=c[u>>2]|0;if((v|0)==0){break}else{z=v;A=u}}if(A>>>0<j>>>0){aq();return 0;return 0}else{c[A>>2]=0;y=z;break}}else{u=c[g+(f+8)>>2]|0;if(u>>>0<j>>>0){aq();return 0;return 0}v=u+12|0;if((c[v>>2]|0)!=(o|0)){aq();return 0;return 0}w=t+8|0;if((c[w>>2]|0)==(o|0)){c[v>>2]=t;c[w>>2]=u;y=t;break}else{aq();return 0;return 0}}}while(0);if((s|0)==0){break}t=g+(f+28)|0;l=2080+(c[t>>2]<<2)|0;do{if((o|0)==(c[l>>2]|0)){c[l>>2]=y;if((y|0)!=0){break}c[445]=c[445]&(1<<c[t>>2]^-1);break L5657}else{if(s>>>0<(c[448]|0)>>>0){aq();return 0;return 0}k=s+16|0;if((c[k>>2]|0)==(o|0)){c[k>>2]=y}else{c[s+20>>2]=y}if((y|0)==0){break L5657}}}while(0);if(y>>>0<(c[448]|0)>>>0){aq();return 0;return 0}c[y+24>>2]=s;o=c[g+(f+16)>>2]|0;do{if((o|0)!=0){if(o>>>0<(c[448]|0)>>>0){aq();return 0;return 0}else{c[y+16>>2]=o;c[o+24>>2]=y;break}}}while(0);o=c[g+(f+20)>>2]|0;if((o|0)==0){break}if(o>>>0<(c[448]|0)>>>0){aq();return 0;return 0}else{c[y+20>>2]=o;c[o+24>>2]=y;break}}}while(0);if(q>>>0<16){c[d>>2]=p|c[d>>2]&1|2;y=g+(p|4)|0;c[y>>2]=c[y>>2]|1;n=a;return n|0}else{c[d>>2]=c[d>>2]&1|b|2;c[g+(b+4)>>2]=q|3;d=g+(p|4)|0;c[d>>2]=c[d>>2]|1;b7(g+b|0,q);n=a;return n|0}return 0}function b7(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;d=a;e=d+b|0;f=e;g=c[a+4>>2]|0;L5733:do{if((g&1|0)==0){h=c[a>>2]|0;if((g&3|0)==0){return}i=d+(-h|0)|0;j=i;k=h+b|0;l=c[448]|0;if(i>>>0<l>>>0){aq()}if((j|0)==(c[449]|0)){m=d+(b+4)|0;if((c[m>>2]&3|0)!=3){n=j;o=k;break}c[446]=k;c[m>>2]=c[m>>2]&-2;c[d+(4-h)>>2]=k|1;c[e>>2]=k;return}m=h>>>3;if(h>>>0<256){p=c[d+(8-h)>>2]|0;q=c[d+(12-h)>>2]|0;r=1816+(m<<1<<2)|0;do{if((p|0)!=(r|0)){if(p>>>0<l>>>0){aq()}if((c[p+12>>2]|0)==(j|0)){break}aq()}}while(0);if((q|0)==(p|0)){c[444]=c[444]&(1<<m^-1);n=j;o=k;break}do{if((q|0)==(r|0)){s=q+8|0}else{if(q>>>0<l>>>0){aq()}t=q+8|0;if((c[t>>2]|0)==(j|0)){s=t;break}aq()}}while(0);c[p+12>>2]=q;c[s>>2]=p;n=j;o=k;break}r=i;m=c[d+(24-h)>>2]|0;t=c[d+(12-h)>>2]|0;do{if((t|0)==(r|0)){u=16-h|0;v=d+(u+4)|0;w=c[v>>2]|0;if((w|0)==0){x=d+u|0;u=c[x>>2]|0;if((u|0)==0){y=0;break}else{z=u;A=x}}else{z=w;A=v}while(1){v=z+20|0;w=c[v>>2]|0;if((w|0)!=0){z=w;A=v;continue}v=z+16|0;w=c[v>>2]|0;if((w|0)==0){break}else{z=w;A=v}}if(A>>>0<l>>>0){aq()}else{c[A>>2]=0;y=z;break}}else{v=c[d+(8-h)>>2]|0;if(v>>>0<l>>>0){aq()}w=v+12|0;if((c[w>>2]|0)!=(r|0)){aq()}x=t+8|0;if((c[x>>2]|0)==(r|0)){c[w>>2]=t;c[x>>2]=v;y=t;break}else{aq()}}}while(0);if((m|0)==0){n=j;o=k;break}t=d+(28-h)|0;l=2080+(c[t>>2]<<2)|0;do{if((r|0)==(c[l>>2]|0)){c[l>>2]=y;if((y|0)!=0){break}c[445]=c[445]&(1<<c[t>>2]^-1);n=j;o=k;break L5733}else{if(m>>>0<(c[448]|0)>>>0){aq()}i=m+16|0;if((c[i>>2]|0)==(r|0)){c[i>>2]=y}else{c[m+20>>2]=y}if((y|0)==0){n=j;o=k;break L5733}}}while(0);if(y>>>0<(c[448]|0)>>>0){aq()}c[y+24>>2]=m;r=16-h|0;t=c[d+r>>2]|0;do{if((t|0)!=0){if(t>>>0<(c[448]|0)>>>0){aq()}else{c[y+16>>2]=t;c[t+24>>2]=y;break}}}while(0);t=c[d+(r+4)>>2]|0;if((t|0)==0){n=j;o=k;break}if(t>>>0<(c[448]|0)>>>0){aq()}else{c[y+20>>2]=t;c[t+24>>2]=y;n=j;o=k;break}}else{n=a;o=b}}while(0);a=c[448]|0;if(e>>>0<a>>>0){aq()}y=d+(b+4)|0;z=c[y>>2]|0;do{if((z&2|0)==0){if((f|0)==(c[450]|0)){A=(c[447]|0)+o|0;c[447]=A;c[450]=n;c[n+4>>2]=A|1;if((n|0)!=(c[449]|0)){return}c[449]=0;c[446]=0;return}if((f|0)==(c[449]|0)){A=(c[446]|0)+o|0;c[446]=A;c[449]=n;c[n+4>>2]=A|1;c[n+A>>2]=A;return}A=(z&-8)+o|0;s=z>>>3;L5833:do{if(z>>>0<256){g=c[d+(b+8)>>2]|0;t=c[d+(b+12)>>2]|0;h=1816+(s<<1<<2)|0;do{if((g|0)!=(h|0)){if(g>>>0<a>>>0){aq()}if((c[g+12>>2]|0)==(f|0)){break}aq()}}while(0);if((t|0)==(g|0)){c[444]=c[444]&(1<<s^-1);break}do{if((t|0)==(h|0)){B=t+8|0}else{if(t>>>0<a>>>0){aq()}m=t+8|0;if((c[m>>2]|0)==(f|0)){B=m;break}aq()}}while(0);c[g+12>>2]=t;c[B>>2]=g}else{h=e;m=c[d+(b+24)>>2]|0;l=c[d+(b+12)>>2]|0;do{if((l|0)==(h|0)){i=d+(b+20)|0;p=c[i>>2]|0;if((p|0)==0){q=d+(b+16)|0;v=c[q>>2]|0;if((v|0)==0){C=0;break}else{D=v;E=q}}else{D=p;E=i}while(1){i=D+20|0;p=c[i>>2]|0;if((p|0)!=0){D=p;E=i;continue}i=D+16|0;p=c[i>>2]|0;if((p|0)==0){break}else{D=p;E=i}}if(E>>>0<a>>>0){aq()}else{c[E>>2]=0;C=D;break}}else{i=c[d+(b+8)>>2]|0;if(i>>>0<a>>>0){aq()}p=i+12|0;if((c[p>>2]|0)!=(h|0)){aq()}q=l+8|0;if((c[q>>2]|0)==(h|0)){c[p>>2]=l;c[q>>2]=i;C=l;break}else{aq()}}}while(0);if((m|0)==0){break}l=d+(b+28)|0;g=2080+(c[l>>2]<<2)|0;do{if((h|0)==(c[g>>2]|0)){c[g>>2]=C;if((C|0)!=0){break}c[445]=c[445]&(1<<c[l>>2]^-1);break L5833}else{if(m>>>0<(c[448]|0)>>>0){aq()}t=m+16|0;if((c[t>>2]|0)==(h|0)){c[t>>2]=C}else{c[m+20>>2]=C}if((C|0)==0){break L5833}}}while(0);if(C>>>0<(c[448]|0)>>>0){aq()}c[C+24>>2]=m;h=c[d+(b+16)>>2]|0;do{if((h|0)!=0){if(h>>>0<(c[448]|0)>>>0){aq()}else{c[C+16>>2]=h;c[h+24>>2]=C;break}}}while(0);h=c[d+(b+20)>>2]|0;if((h|0)==0){break}if(h>>>0<(c[448]|0)>>>0){aq()}else{c[C+20>>2]=h;c[h+24>>2]=C;break}}}while(0);c[n+4>>2]=A|1;c[n+A>>2]=A;if((n|0)!=(c[449]|0)){F=A;break}c[446]=A;return}else{c[y>>2]=z&-2;c[n+4>>2]=o|1;c[n+o>>2]=o;F=o}}while(0);o=F>>>3;if(F>>>0<256){z=o<<1;y=1816+(z<<2)|0;C=c[444]|0;b=1<<o;do{if((C&b|0)==0){c[444]=C|b;G=y;H=1816+(z+2<<2)|0}else{o=1816+(z+2<<2)|0;d=c[o>>2]|0;if(d>>>0>=(c[448]|0)>>>0){G=d;H=o;break}aq()}}while(0);c[H>>2]=n;c[G+12>>2]=n;c[n+8>>2]=G;c[n+12>>2]=y;return}y=n;G=F>>>8;do{if((G|0)==0){I=0}else{if(F>>>0>16777215){I=31;break}H=(G+1048320|0)>>>16&8;z=G<<H;b=(z+520192|0)>>>16&4;C=z<<b;z=(C+245760|0)>>>16&2;o=14-(b|H|z)+(C<<z>>>15)|0;I=F>>>((o+7|0)>>>0)&1|o<<1}}while(0);G=2080+(I<<2)|0;c[n+28>>2]=I;c[n+20>>2]=0;c[n+16>>2]=0;o=c[445]|0;z=1<<I;if((o&z|0)==0){c[445]=o|z;c[G>>2]=y;c[n+24>>2]=G;c[n+12>>2]=n;c[n+8>>2]=n;return}if((I|0)==31){J=0}else{J=25-(I>>>1)|0}I=F<<J;J=c[G>>2]|0;while(1){if((c[J+4>>2]&-8|0)==(F|0)){break}K=J+16+(I>>>31<<2)|0;G=c[K>>2]|0;if((G|0)==0){L=4310;break}else{I=I<<1;J=G}}if((L|0)==4310){if(K>>>0<(c[448]|0)>>>0){aq()}c[K>>2]=y;c[n+24>>2]=J;c[n+12>>2]=n;c[n+8>>2]=n;return}K=J+8|0;L=c[K>>2]|0;I=c[448]|0;if(J>>>0<I>>>0){aq()}if(L>>>0<I>>>0){aq()}c[L+12>>2]=y;c[K>>2]=y;c[n+8>>2]=L;c[n+12>>2]=J;c[n+24>>2]=0;return}function b8(a){a=a|0;if((a|0)<65)return a|0;if((a|0)>90)return a|0;return a-65+97|0}function b9(b,c,d){b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0;while(e>>>0<d>>>0){f=b8(a[b+e|0]|0)|0;g=b8(a[c+e|0]|0)|0;if((f|0)==(g|0)&(f|0)==0)return 0;if((f|0)==0)return-1;if((g|0)==0)return 1;if((f|0)==(g|0)){e=e+1|0;continue}else{return(f>>>0>g>>>0?1:-1)|0}}return 0}function ca(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;f=b|0;if((b&3)==(d&3)){while(b&3){if((e|0)==0)return f|0;a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}while((e|0)>=4){c[b>>2]=c[d>>2];b=b+4|0;d=d+4|0;e=e-4|0}}while((e|0)>0){a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}return f|0}function cb(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=b+e|0;if((e|0)>=20){d=d&255;e=b&3;g=d|d<<8|d<<16|d<<24;h=f&~3;if(e){e=b+4-e|0;while((b|0)<(e|0)){a[b]=d;b=b+1|0}}while((b|0)<(h|0)){c[b>>2]=g;b=b+4|0}}while((b|0)<(f|0)){a[b]=d;b=b+1|0}}function cc(a,b,c){a=a|0;b=b|0;c=c|0;var e=0,f=0,g=0;while((e|0)<(c|0)){f=d[a+e|0]|0;g=d[b+e|0]|0;if((f|0)!=(g|0))return((f|0)>(g|0)?1:-1)|0;e=e+1|0}return 0}function cd(b,c,d){b=b|0;c=c|0;d=d|0;if((c|0)<(b|0)&(b|0)<(c+d|0)){c=c+d|0;b=b+d|0;while((d|0)>0){b=b-1|0;c=c-1|0;d=d-1|0;a[b]=a[c]|0}}else{ca(b,c,d)|0}}function ce(b){b=b|0;var c=0;c=b;while(a[c]|0){c=c+1|0}return c-b|0}function cf(a,b){a=a|0;b=b|0;return aI[a&1](b|0)|0}function cg(a,b){a=a|0;b=b|0;aJ[a&1](b|0)}function ch(a,b,c){a=a|0;b=b|0;c=c|0;aK[a&3](b|0,c|0)}function ci(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;return aL[a&31](b|0,c|0,d|0,e|0,f|0)|0}function cj(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return aM[a&31](b|0,c|0,d|0)|0}function ck(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;aN[a&15](b|0,c|0,d|0)}function cl(a){a=a|0;aO[a&1]()}function cm(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return aP[a&3](b|0,c|0,d|0,e|0)|0}function cn(a,b,c){a=a|0;b=b|0;c=c|0;return aQ[a&3](b|0,c|0)|0}function co(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;aR[a&15](b|0,c|0,d|0,e|0)}function cp(a){a=a|0;_(0);return 0}function cq(a){a=a|0;_(1)}function cr(a,b){a=a|0;b=b|0;_(2)}function cs(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;_(3);return 0}function ct(a,b,c){a=a|0;b=b|0;c=c|0;_(4);return 0}function cu(a,b,c){a=a|0;b=b|0;c=c|0;_(5)}function cv(){_(6)}function cw(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;_(7);return 0}function cx(a,b){a=a|0;b=b|0;_(8);return 0}function cy(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;_(9)}
// EMSCRIPTEN_END_FUNCS
var aI=[cp,cp];var aJ=[cq,cq];var aK=[cr,cr,bO,cr];var aL=[cs,cs,bm,cs,bi,cs,bj,cs,bk,cs,be,cs,bf,cs,bZ,cs,bn,cs,bl,cs,bo,cs,bX,cs,bq,cs,bh,cs,cs,cs,cs,cs];var aM=[ct,ct,bG,ct,bE,ct,bF,ct,b_,ct,bJ,ct,bI,ct,bH,ct,bD,ct,ct,ct,ct,ct,ct,ct,ct,ct,ct,ct,ct,ct,ct,ct];var aN=[cu,cu,bL,cu,bM,cu,bT,cu,bR,cu,bY,cu,cu,cu,cu,cu];var aO=[cv,cv];var aP=[cw,cw,bW,cw];var aQ=[cx,cx,bV,cx];var aR=[cy,cy,bU,cy,bQ,cy,bP,cy,bK,cy,bS,cy,bN,cy,cy,cy];return{_memcmp:cc,_strncasecmp:b9,_free:b2,_realloc:b4,_memmove:cd,_tolower:b8,_strlen:ce,_memset:cb,_malloc:b1,_memcpy:ca,_emscripten_markdown:bC,_calloc:b3,stackAlloc:aS,stackSave:aT,stackRestore:aU,setThrew:aV,setTempRet0:aY,setTempRet1:aZ,setTempRet2:a_,setTempRet3:a$,setTempRet4:a0,setTempRet5:a1,setTempRet6:a2,setTempRet7:a3,setTempRet8:a4,setTempRet9:a5,dynCall_ii:cf,dynCall_vi:cg,dynCall_vii:ch,dynCall_iiiiii:ci,dynCall_iiii:cj,dynCall_viii:ck,dynCall_v:cl,dynCall_iiiii:cm,dynCall_iii:cn,dynCall_viiii:co}})
// EMSCRIPTEN_END_ASM
({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "invoke_ii": invoke_ii, "invoke_vi": invoke_vi, "invoke_vii": invoke_vii, "invoke_iiiiii": invoke_iiiiii, "invoke_iiii": invoke_iiii, "invoke_viii": invoke_viii, "invoke_v": invoke_v, "invoke_iiiii": invoke_iiiii, "invoke_iii": invoke_iii, "invoke_viiii": invoke_viiii, "_strncmp": _strncmp, "_snprintf": _snprintf, "_vsnprintf": _vsnprintf, "_abort": _abort, "_ispunct": _ispunct, "_sysconf": _sysconf, "_isalnum": _isalnum, "___setErrNo": ___setErrNo, "__reallyNegative": __reallyNegative, "_isalpha": _isalpha, "_llvm_lifetime_end": _llvm_lifetime_end, "_isspace": _isspace, "__formatString": __formatString, "_llvm_va_end": _llvm_va_end, "___assert_func": ___assert_func, "_sbrk": _sbrk, "___errno_location": ___errno_location, "_llvm_lifetime_start": _llvm_lifetime_start, "_time": _time, "_strcmp": _strcmp, "_memchr": _memchr, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "NaN": NaN, "Infinity": Infinity }, buffer);
var _memcmp = Module["_memcmp"] = asm["_memcmp"];
var _strncasecmp = Module["_strncasecmp"] = asm["_strncasecmp"];
var _free = Module["_free"] = asm["_free"];
var _realloc = Module["_realloc"] = asm["_realloc"];
var _memmove = Module["_memmove"] = asm["_memmove"];
var _tolower = Module["_tolower"] = asm["_tolower"];
var _strlen = Module["_strlen"] = asm["_strlen"];
var _memset = Module["_memset"] = asm["_memset"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var _emscripten_markdown = Module["_emscripten_markdown"] = asm["_emscripten_markdown"];
var _calloc = Module["_calloc"] = asm["_calloc"];
var dynCall_ii = Module["dynCall_ii"] = asm["dynCall_ii"];
var dynCall_vi = Module["dynCall_vi"] = asm["dynCall_vi"];
var dynCall_vii = Module["dynCall_vii"] = asm["dynCall_vii"];
var dynCall_iiiiii = Module["dynCall_iiiiii"] = asm["dynCall_iiiiii"];
var dynCall_iiii = Module["dynCall_iiii"] = asm["dynCall_iiii"];
var dynCall_viii = Module["dynCall_viii"] = asm["dynCall_viii"];
var dynCall_v = Module["dynCall_v"] = asm["dynCall_v"];
var dynCall_iiiii = Module["dynCall_iiiii"] = asm["dynCall_iiiii"];
var dynCall_iii = Module["dynCall_iii"] = asm["dynCall_iii"];
var dynCall_viiii = Module["dynCall_viiii"] = asm["dynCall_viiii"];
Runtime.stackAlloc = function(size) { return asm['stackAlloc'](size) };
Runtime.stackSave = function() { return asm['stackSave']() };
Runtime.stackRestore = function(top) { asm['stackRestore'](top) };
// Warning: printing of i64 values may be slightly rounded! No deep i64 math used, so precise i64 code not included
var i64Math = null;
// === Auto-generated postamble setup entry stuff ===
Module['callMain'] = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(!Module['preRun'] || Module['preRun'].length == 0, 'cannot call main when preRun functions remain to be called');
  args = args || [];
  ensureInitRuntime();
  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);
  var ret;
  var initialStackTop = STACKTOP;
  try {
    ret = Module['_main'](argc, argv, 0);
  }
  catch(e) {
    if (e.name == 'ExitStatus') {
      return e.status;
    } else if (e == 'SimulateInfiniteLoop') {
      Module['noExitRuntime'] = true;
    } else {
      throw e;
    }
  } finally {
    STACKTOP = initialStackTop;
  }
  return ret;
}
function run(args) {
  args = args || Module['arguments'];
  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return 0;
  }
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    var toRun = Module['preRun'];
    Module['preRun'] = [];
    for (var i = toRun.length-1; i >= 0; i--) {
      toRun[i]();
    }
    if (runDependencies > 0) {
      // a preRun added a dependency, run will be called later
      return 0;
    }
  }
  function doRun() {
    ensureInitRuntime();
    preMain();
    var ret = 0;
    calledRun = true;
    if (Module['_main'] && shouldRunNow) {
      ret = Module['callMain'](args);
      if (!Module['noExitRuntime']) {
        exitRuntime();
      }
    }
    if (Module['postRun']) {
      if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
      while (Module['postRun'].length > 0) {
        Module['postRun'].pop()();
      }
    }
    return ret;
  }
  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
    return 0;
  } else {
    return doRun();
  }
}
Module['run'] = Module.run = run;
// {{PRE_RUN_ADDITIONS}}
if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}
// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}
run();
// {{POST_RUN_ADDITIONS}}
  // {{MODULE_ADDITIONS}}

var markdown = Module.cwrap('emscripten_markdown', 'number', ['number']);
var malloc = Module.cwrap('malloc', 'number', ['number']);
var free = Module.cwrap('free', 'number', ['number']);
var strlen = Module.cwrap('strlen', 'number', ['number']);

var link_regex = /\[\[(([^|\]]+)\|)?(([^:\]]+):)?([^\]]+)\]\]/g;

var escape_as_html = function(str) {
	return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
};

window.markdown = function(str) {
	str = str.replace(link_regex, function(match, ignore1, display, ignore2, namespace, title) {
		if (!title)
			return match;
		if (!namespace)
			return '<a href="/wiki/read/' + title.replace(/\s+/g, '_') + '">' + escape_as_html(display || title) + '</a>';
		if (namespace == 'problem')
			return '<a class="problem" href="/judge/problem/read/' + title + '">' + escape_as_html(display || title) + '</a>';
		return match;
	});

	var spoiler_open, spoiler_close;
	for (;;)
	{
		spoiler_open = '@@' + Math.random().toString(36).substring(2, 8) + '@@';
		if (str.indexOf(spoiler_open) == -1)
		{
			str = str.replace(/\<spoiler\>/g, spoiler_open);
			break;
		}
	}
	for (;;)
	{
		spoiler_close = '@@' + Math.random().toString(36).substring(2, 8) + '@@';
		if (spoiler_close != spoiler_open && str.indexOf(spoiler_close) == -1)
		{
			str = str.replace(/\<\/spoiler\>/g, spoiler_close);
			break;
		}
	}

	var utf8ed = Utf8.encode(str);
	var src_len = utf8ed.length;
	var src_ptr = malloc(src_len + 1);
	var i = 0;
	while (i < src_len)
	{
		HEAP8[src_ptr + i] = utf8ed.charCodeAt(i);
		i += 1;
	}
	HEAP8[src_ptr + src_len] = 0;

	var result_ptr = markdown(src_ptr);
	free(src_ptr);

	var length = strlen(result_ptr);
	var result = '';
	var MAX_CHUNK = 1024;
	var ptr = result_ptr;
	while (length > 0)
	{
		curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
		result = result ? result + curr : curr;
		ptr += MAX_CHUNK;
		length -= MAX_CHUNK;
	}
	free(result_ptr);

	return Utf8.decode(result).replace(new RegExp(spoiler_open, 'g'), '<div class="spoiler">').replace(new RegExp(spoiler_close, 'g'), '</div>');
};

})();
