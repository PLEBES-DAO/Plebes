import { Buffer as BufferPolyfill } from 'buffer';

// Make sure Buffer with all its methods is globally available
window.Buffer = BufferPolyfill;
window.global = window;
global.Buffer = BufferPolyfill;