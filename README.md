# sinkdweller

### A Node/TypeScript wrapper for [radamsa](https://www.ee.oulu.fi/roles/ouspg/Radamsa).

The [radamsa](https://gitlab.com/akihe/radamsa) general purpose fuzzer is a common tool in security circles, named after a strange troll that lives under a sink in a Scandinavian children's story. Sinkdweller is a TypeScript class that wraps the Radamsa fuzzer. For convenience, this module contains statically-linked executables of the Radamsa fuzzer in `bin` for Windows, Linux x64, and macOS, although you do not have to use them if you do not trust them.

Note that this is still a rudimentary wrapper written quickly that relies on spawning radamsa in a child process. This will cause a significant performance impact in some cases with this process overhead.


### Quickstart

The simplest example:

````javascript
import { Sinkdweller } from 'sinkdweller';

let fuzzer = new Sinkdweller();
let data   = new Buffer.from('foo');

// who knows what you'll get
let result = fuzzer.fuzz(data);
````


A slightly more complex variant:

````javascript
import { Sinkdweller } from 'sinkdweller';

let fuzzer = new Sinkdweller();
fuzzer.setSeed(() => {
    // set a seed function that returns a value
    return 3;
});

let data   = new Buffer.from('foo');
let result = fuzzer.fuzz(data); // "fono"
````

See `examples/` for some more examples.

### License
&copy; 2019 MIT.