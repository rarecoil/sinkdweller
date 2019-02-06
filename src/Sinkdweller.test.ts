import Sinkdweller = require("./Sinkdweller");

it('has a test harness', () => {
    expect('x').toBe('x');
});

it('constructs without arguments', () => {
    let fuzzer = new Sinkdweller();
    expect(fuzzer).toBeInstanceOf(Sinkdweller);
});

it('synchronously fuzzes', () => {
    let fuzzer = new Sinkdweller();
    let result = fuzzer.fuzzSync('foo');
    expect(result).toEqual(expect.any(String));
});

it('synchronously returns Buffer or String depending on what is expected', () => {
    let fuzzer = new Sinkdweller();
    let stringInput = "foo";
    let bufferInput = Buffer.from("foo");

    let stringResult = fuzzer.fuzzSync(stringInput);
    let bufferResult = fuzzer.fuzzSync(bufferInput);
    expect(stringResult).toEqual(expect.any(String));
    expect(bufferResult).toEqual(expect.any(Buffer));
});

it('synchronously returns a string with a fixed seed function', () => {
    let fuzzer = new Sinkdweller();
    fuzzer.setSeed(() => {
        return 3;
    });
    let result = fuzzer.fuzzSync('foo');
    expect(result).toBe('fono');
});

it('allows numeric seeds', () => {
    let fuzzer = new Sinkdweller();
    fuzzer.setSeed(3);
    let result = fuzzer.fuzzSync('foo');
    expect(result).toBe('fono');
});

it('properly uses a seed function', () => {
    let fuzzer = new Sinkdweller();
    let iter = 0;
    let sequence = [3, 4, 5];
    fuzzer.setSeed(() => {
        let ret = sequence[iter];
        iter++;
        return ret;
    });
    let results = [];
    for (let i=0; i<3; i++) {
        results.push(fuzzer.fuzzSync('foo'));
    }
    expect(results).toEqual(['fono', 'ffoo', 'fon']);
});

it('asynchronously works using callbacks', (done) => {
    let fuzzer = new Sinkdweller();
    fuzzer.setSeed(3);
    fuzzer.fuzz('foo', (err:any, result:string|Buffer) => {
        expect(err).toBeFalsy();
        expect(result).toBe('fono');
        done();
    });
});

it ('asynchronously works with promise/async/await', async () => {
    let fuzzer = new Sinkdweller();
    fuzzer.setSeed(3);
    let result = await fuzzer.fuzzAsync('foo');
    expect(result).toBe('fono');
});
