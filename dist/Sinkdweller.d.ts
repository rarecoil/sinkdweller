/// <reference types="node" />
declare type SeedFunction = () => number;
interface RadamsaOptions {
    [key: string]: any;
    output_file?: string;
    meta_output_file?: string;
    count?: number;
    seed?: number | SeedFunction;
    mutations?: Array<string>;
    patterns?: Array<string>;
    generators?: Array<string>;
    recursive?: boolean;
    seek?: number;
    truncate?: boolean;
    delay?: number;
    checksums?: number;
    hash?: string;
    use_external_radamsa?: boolean;
}
declare class Sinkdweller {
    private DEFAULT_OPTIONS;
    private options;
    /**
     * Create a new Sinkdweller shim around the Radamsa fuzzer.
     *
     * @param opts Options to pass radamsa executable.
     */
    constructor(opts?: RadamsaOptions);
    /**
     * Fuzz input asynchronously.
     *
     * @param input String or buffer to feed Radamsa.
     * @param callback callback to fire upon Radamsa completion.
     */
    fuzz(input: string | Buffer, callback: any): void;
    /**
     * Fuzz input asynchronously with a promisified async function.
     *
     * @param input String or buffer to feed Radamsa.
     * @returns a promise containing an error or the fuzzed string|Buffer.
     */
    fuzzAsync(input: string | Buffer): Promise<NodeJS.ErrnoException | string | Buffer>;
    /**
     * Fuzz input synchronously, waiting for Radamsa.
     *
     * @param input String or buffer to feed Radamsa.
     * @returns fuzzed input in the type originally input.
     */
    fuzzSync(input: string | Buffer): string | Buffer;
    /**
     * Sets flags for radamsa options.
     *
     * @param opts Options object.
     */
    setFlags(opts: RadamsaOptions): void;
    /**
     * Set a seed function or number.
     *
     * @param seed_or_generator number or seed function
     */
    setSeed(seed_or_generator: number | SeedFunction): void;
    /**
     * Asychronously spawn Radamsa.
     *
     * @param input String or buffer to push to Radamsa STDIN.
     * @param callback Callback to send data to.
     * @param options Radamsa option flags.
     */
    protected spawnRadamsa(input: string | Buffer, callback: any, options?: RadamsaOptions): void;
    /**
     * Synchronously spawn radamsa.
     *
     * @param input Input string or buffer to radamsa STDIN
     * @param options Raw radamsa options.
     */
    protected spawnRadamsaSync(input: string | Buffer, options?: RadamsaOptions): Buffer;
    /**
     * Get the correct platform-specific radamsa executable to use.
     *
     * @param use_external Use a radamsa on $PATH.
     */
    protected getRadamsaExecutable(use_external?: boolean): string;
    /**
     * Generate Radamsa command line arguments from the options array.
     *
     * @param options Radamsa options array.
     */
    protected generateRadamsaFlags(options: RadamsaOptions): Array<string>;
}
export = Sinkdweller;
