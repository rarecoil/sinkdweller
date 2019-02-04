const Sinkdweller = require('../dist/Sinkdweller');

let fuzzer = new Sinkdweller();
console.log(fuzzer.fuzzSync('foo'));