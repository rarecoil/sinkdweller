# sinkdweller

[![Build Status](https://travis-ci.org/rarecoil/sinkdweller.svg?branch=master)](https://travis-ci.org/rarecoil/sinkdweller) [![Known Vulnerabilities](https://snyk.io/test/github/rarecoil/sinkdweller/badge.svg?targetFile=package.json)](https://snyk.io/test/github/rarecoil/sinkdweller?targetFile=package.json) [![Dependencies](https://david-dm.org/rarecoil/sinkdweller.svg)](https://david-dm.org/)

### A simple Node/TypeScript wrapper for [radamsa](https://www.ee.oulu.fi/roles/ouspg/Radamsa).

The [radamsa](https://gitlab.com/akihe/radamsa) general purpose fuzzer is a common tool in security circles, named after a strange troll that lives under a sink in a Scandinavian children's story. Sinkdweller is a TypeScript class that wraps the Radamsa fuzzer. For convenience, this module contains statically-linked executables of the Radamsa fuzzer in `bin` for Windows, Linux x64, and macOS, although you do not have to use them if you do not trust them. The Cygwin build for Radamsa includes the Cygwin DLL, so Cygwin should no longer be required for radamsa to work on Windows.

Note that this is still a rudimentary wrapper written quickly that relies on spawning radamsa in a child process. This will cause a significant performance impact in some cases with this process overhead. 


### Quickstart

The simplest example:

````javascript
const Sinkdweller = require('sinkdweller');

let fuzzer = new Sinkdweller();
let data   = new Buffer.from('foo');

// who knows what you'll get
let result = fuzzer.fuzzSync(data);
````


A slightly more complex variant:

````javascript
const Sinkdweller = require('sinkdweller');

let fuzzer = new Sinkdweller();
fuzzer.setSeed(() => {
    // set a seed function that returns a value
    return 3;
});

let data   = new Buffer.from('foo');
let result = fuzzer.fuzzSync(data); // "fono"
````

See `examples/` for some more examples, and the code at `src/Sinkdweller.ts` for full comments.

### License
&copy; 2019 MIT.