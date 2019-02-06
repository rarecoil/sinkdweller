import * as child_process from 'child_process';
import * as path from 'path';
import * as os from 'os';

type SeedFunction = () => number;
interface RadamsaOptions {
    [key: string]: any;
    output_file?:string;
    meta_output_file?:string;
    count?:number;
    seed?:number|SeedFunction;
    mutations?:Array<string>;
    patterns?:Array<string>;
    generators?:Array<string>;
    recursive?:boolean;
    seek?:number;
    truncate?:boolean;
    delay?:number;
    checksums?:number;
    hash?:string;
    use_external_radamsa?:boolean;
}

class SinkdwellerError extends Error {};

class Sinkdweller {

    // Default options.
    private DEFAULT_OPTIONS:RadamsaOptions = {
        output_file: null,
        meta_output_file: null,
        count: null,
        seed: null,
        mutations: null,
        patterns: null,
        generators: null,
        recursive: null,
        seek: null,
        truncate : null,
        delay: null,
        checksums: null,
        hash: null,
        use_external_radamsa: false
    };

    private options:RadamsaOptions;


    /**
     * Create a new Sinkdweller shim around the Radamsa fuzzer.
     * 
     * @param opts Options to pass radamsa executable.
     */
    constructor (opts?:RadamsaOptions) {
        this.options = Object.assign({}, this.DEFAULT_OPTIONS);
        if (opts) {
            this.setFlags(opts);
        }
    }

    
    // Fuzzing functions

    /**
     * Fuzz input asynchronously.
     * 
     * @param input String or buffer to feed Radamsa.
     * @param callback callback to fire upon Radamsa completion.
     */
    public fuzz(input:string|Buffer, callback:any) {
        this.spawnRadamsa(input, (err:string, result:string|Buffer) => {
            if (typeof input === 'string') {
                callback(err, result.toString('utf8'));
            } else {
                callback(err, result);
            }
        });
    }


    /**
     * Fuzz input asynchronously with a promisified async function.
     * 
     * @param input String or buffer to feed Radamsa.
     * @returns a promise containing an error or the fuzzed string|Buffer.
     */
    public async fuzzAsync(input:string|Buffer):Promise<NodeJS.ErrnoException|string|Buffer> {
        return new Promise((resolve, reject) => {
            this.fuzz(input, (err:string, result:string|Buffer) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }


    /**
     * Fuzz input synchronously, waiting for Radamsa.
     * 
     * @param input String or buffer to feed Radamsa.
     * @returns fuzzed input in the type originally input.
     */
    public fuzzSync(input:string|Buffer):string|Buffer {
        let result = this.spawnRadamsaSync(input);
        if (typeof input === 'string') {
            return result.toString('utf8');
        } else {
            return result;
        }
    }


    // Setters

    /**
     * Sets flags for radamsa options.
     * 
     * @param opts Options object.
     */
    public setFlags(opts:RadamsaOptions) {
        this.options = Object.assign(this.options, opts);
    }

    /**
     * Set a seed function or number.
     * 
     * @param seed_or_generator number or seed function
     */
    public setSeed(seed_or_generator:number|SeedFunction) {
        this.options.seed = seed_or_generator;
    }



    // Protected (internal methods)

    /**
     * Asychronously spawn Radamsa.
     * 
     * @param input String or buffer to push to Radamsa STDIN.
     * @param callback Callback to send data to.
     * @param options Radamsa option flags.
     */
    protected spawnRadamsa(input:string|Buffer, callback:any, options?:RadamsaOptions) {
        if (!options) {
            options = this.options;
        }
        let flags = this.generateRadamsaFlags(options);
        let rdx   = this.getRadamsaExecutable(options.use_external_radamsa);
        let proc  = child_process.spawn(rdx, flags);
        proc.stdin.write(input);
        proc.stdout.on('data', (data) => {
            callback(null, data);
        });
        proc.on('close', (exitCode) => {
            if (exitCode !== 0) {
                callback(`Radamsa returned exit code ${exitCode}`, null);
            }
        });
        proc.on('error', (data) => {
            callback(data, null);
        });
        proc.stdin.end();
    }


    /**
     * Synchronously spawn radamsa.
     * 
     * @param input Input string or buffer to radamsa STDIN
     * @param options Raw radamsa options.
     */
    protected spawnRadamsaSync(input:string|Buffer, options?:RadamsaOptions):Buffer {
        if (!options) {
            options = this.options;
        }
        let flags = this.generateRadamsaFlags(options);
            flags.push('-');
        let rdx   = this.getRadamsaExecutable(options.use_external_radamsa);
        let proc = child_process.spawnSync(rdx, flags, { input: input });
        return Buffer.from(proc.stdout);
    }


    /**
     * Get the correct platform-specific radamsa executable to use.
     * 
     * @param use_external Use a radamsa on $PATH.
     */
    protected getRadamsaExecutable(use_external:boolean=false):string {
        if (use_external === true) {
            let plat = os.platform();
            switch (plat) {
                case 'win32':
                    try {
                        let path = child_process.execSync('where radamsa.exe').toString('utf8').trim();
                        return path;
                    }
                    catch (e) {
                        throw new SinkdwellerError(`Cannot find external radamsa`);
                    }
                case 'linux':
                case 'freebsd':
                case 'openbsd':
                case 'darwin':
                    try {
                        let path = child_process.execSync('which radamsa').toString('utf8').trim();
                        return path;
                    }
                    catch (e) {
                        throw new SinkdwellerError(`Cannot find external radamsa`);
                    }
                default:
                    throw new SinkdwellerError(`Sinkdweller does not support platform ${plat}`);
            }
        } else {
            let arch = os.arch();
            if (arch !== 'x64') {
                throw new SinkdwellerError(`Sinkdweller does not support architecture ${arch}`)
            }
            let plat = os.platform();
            let radamsaPath = path.resolve(__dirname, '..', 'bin');
            switch (plat) {
                case 'win32':
                case 'cygwin':
                    return path.join(radamsaPath, 'radamsa_windows.exe');
                case 'linux':
                case 'freebsd':
                case 'openbsd':
                    // TODO check x86/arm
                    return path.join(radamsaPath, 'radamsa_linux_x64');
                case 'darwin':
                    return path.join(radamsaPath, 'radamsa_macos');
                default:
                    throw new SinkdwellerError(`Sinkdweller does not support platform ${plat}`);
            }
        }
    }


    /**
     * Generate Radamsa command line arguments from the options array.
     * 
     * @param options Radamsa options array.
     */
    protected generateRadamsaFlags(options:RadamsaOptions):Array<string> {
        const keyFlagMapping:Array<Array<string>> = [
            ['-o', 'output_file'],
            ['-n', 'count'],
            ['-s', 'seed'],
            ['-m', 'mutations'],
            ['-p', 'patterns'],
            ['-r', 'recursive'],
            ['-S', 'seek'],
            ['-t', 'truncate'],
            ['-d', 'delay'],
            ['-C', 'checksums'],
            ['-H', 'hash']
        ];

        let argList:Array<string> = [];
        keyFlagMapping.forEach((flagToKeyMap) => {
            let flag:string = flagToKeyMap[0];
            let key:string  = flagToKeyMap[1];
            if ((key in options) && options[key] !== null) {
                switch (key) {
                    case 'seed':
                        if (typeof options.seed === 'function') {
                            argList.push(flag, options.seed().toString());
                        } else {
                            argList.push(flag, options[key].toString());
                        }
                        break;
                    default:
                        argList.push(flag, options[key].toString());
                        break;
                }
            }
        });

        return argList;
    }

}

export = Sinkdweller;