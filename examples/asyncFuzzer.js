const Sinkdweller = require('../dist/Sinkdweller');

let fuzzer = new Sinkdweller();
fuzzer.fuzz(Buffer.from('AAAAAAAAA'), (err, result) => {
    if (err) {
        console.error(err);
    } else {
        console.log(result);
    }
});