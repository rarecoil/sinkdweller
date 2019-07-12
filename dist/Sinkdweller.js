"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
const child_process = __importStar(require("child_process"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
class SinkdwellerError extends Error {
}
;
class Sinkdweller {
    /**
     * Create a new Sinkdweller shim around the Radamsa fuzzer.
     *
     * @param opts Options to pass radamsa executable.
     */
    constructor(opts) {
        // Default options.
        this.DEFAULT_OPTIONS = {
            output_file: null,
            meta_output_file: null,
            count: null,
            seed: null,
            mutations: null,
            patterns: null,
            generators: null,
            recursive: null,
            seek: null,
            truncate: null,
            delay: null,
            checksums: null,
            hash: null,
            use_external_radamsa: false
        };
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
    fuzz(input, callback) {
        this.spawnRadamsa(input, (err, result) => {
            if (typeof input === 'string') {
                callback(err, result.toString('utf8'));
            }
            else {
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
    fuzzAsync(input) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.fuzz(input, (err, result) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(result);
                    }
                });
            });
        });
    }
    /**
     * Fuzz input synchronously, waiting for Radamsa.
     *
     * @param input String or buffer to feed Radamsa.
     * @returns fuzzed input in the type originally input.
     */
    fuzzSync(input) {
        let result = this.spawnRadamsaSync(input);
        if (typeof input === 'string') {
            return result.toString('utf8');
        }
        else {
            return result;
        }
    }
    // Setters
    /**
     * Sets flags for radamsa options.
     *
     * @param opts Options object.
     */
    setFlags(opts) {
        this.options = Object.assign(this.options, opts);
    }
    /**
     * Set a seed function or number.
     *
     * @param seed_or_generator number or seed function
     */
    setSeed(seed_or_generator) {
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
    spawnRadamsa(input, callback, options) {
        if (!options) {
            options = this.options;
        }
        let flags = this.generateRadamsaFlags(options);
        let rdx = this.getRadamsaExecutable(options.use_external_radamsa);
        let proc = child_process.spawn(rdx, flags);
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
    spawnRadamsaSync(input, options) {
        if (!options) {
            options = this.options;
        }
        let flags = this.generateRadamsaFlags(options);
        flags.push('-');
        let rdx = this.getRadamsaExecutable(options.use_external_radamsa);
        let proc = child_process.spawnSync(rdx, flags, { input: input });
        return Buffer.from(proc.stdout);
    }
    /**
     * Get the correct platform-specific radamsa executable to use.
     *
     * @param use_external Use a radamsa on $PATH.
     */
    getRadamsaExecutable(use_external = false) {
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
        }
        else {
            let arch = os.arch();
            if (arch !== 'x64') {
                throw new SinkdwellerError(`Sinkdweller does not support architecture ${arch}`);
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
    generateRadamsaFlags(options) {
        const keyFlagMapping = [
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
        let argList = [];
        keyFlagMapping.forEach((flagToKeyMap) => {
            let flag = flagToKeyMap[0];
            let key = flagToKeyMap[1];
            if ((key in options) && options[key] !== null) {
                switch (key) {
                    case 'seed':
                        if (typeof options.seed === 'function') {
                            argList.push(flag, options.seed().toString());
                        }
                        else {
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
module.exports = Sinkdweller;
//# sourceMappingURL=Sinkdweller.js.map