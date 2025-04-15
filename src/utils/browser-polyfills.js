// Browser-compatible polyfills for Node.js crypto modules
import { Buffer } from 'buffer/';
import process from 'process/browser';

// Make these available globally
window.Buffer = Buffer;
window.global = window;
window.process = process;

// Create mock implementations for Node.js native modules
class MockTransform {
  constructor() {
    this._transform = () => {};
  }
  
  pipe() {
    return this;
  }
  
  on() {
    return this;
  }
  
  toString() {
    return '';
  }
}

// Mock out stream module
if (typeof window !== 'undefined') {
  window.stream = {
    Transform: MockTransform,
    Readable: MockTransform,
    Writable: MockTransform,
    Duplex: MockTransform
  };
}

// Mock out util module
if (typeof window !== 'undefined') {
  window.util = {
    debuglog: () => () => {},
    inspect: (obj) => JSON.stringify(obj),
    inherits: function(ctor, superCtor) {
      ctor.super_ = superCtor;
      Object.setPrototypeOf(ctor.prototype, superCtor.prototype);
    }
  };
}

export default {
  Buffer,
  process
}; 