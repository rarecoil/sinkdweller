const Sinkdweller = require('../dist/Sinkdweller');

const fuzzer = new Sinkdweller();
const input  = 'foo';
fuzzer.setSeed(() => {
    return Math.ceil(new Date().getTime());
});
for (let i = 0; i < 10; i++) {
    console.log(fuzzer.fuzzSync(input));
}