These are statically-linked versions of the radamsa fuzzer. They have been built from the official Gitlab repository at commit `342c50524f43518f766fb49d92673952fe59af20`. Sinkdweller trusts these binaries and will attempt to use them unless the executable path is set in the options.

In an effort to increase transparency of these builds:

* `radamsa_linux_64` is built on Arch Linux, with `gcc (GCC) 8.2.1 20181127`, `GNU Make 4.2.1`, and `ldd (GNU libc) 2.28`.
* `radamsa_windows.exe` is built on Windows 10 Enterprise LTSC 1809, with Cygwin x64 using `gcc (GCC) 7.4.0`, `GNU Make 4.2.1`, and `ldd (cygwin) 2.11.2`.
* `radamsa_macos` is built on macOS High Sierra 10.13.2.