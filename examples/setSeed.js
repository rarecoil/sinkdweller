const Sinkdweller = require('../dist/Sinkdweller');

let fuzzer = new Sinkdweller({ seed: 2 });
console.log(fuzzer.fuzzSync('foo'));