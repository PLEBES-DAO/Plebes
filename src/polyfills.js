// Import polyfills explicitly
import buffer from 'buffer';
import process from 'process/browser';

// Make them globally available
window.Buffer = buffer.Buffer;
window.process = process;

// Add explicit replacements for problematic imports
import * as stream from 'stream-browserify';
import * as crypto from 'crypto-browserify';
import * as util from 'util/';
import * as assert from 'assert/';

// Add these to window to make them globally available
window.stream = stream;
window.crypto = crypto;
window.util = util;
window.assert = assert;