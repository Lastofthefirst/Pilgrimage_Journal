function random() {
    const
        fourBytesOn = 0xffffffff, // 4 bytes, all 32 bits on: 4294967295
        c = typeof crypto === "object"
            ? crypto // node or most browsers
            : typeof msCrypto === "object" // stinky non-standard IE
                ? msCrypto // eslint-disable-line no-undef
                : null; // what old or bad environment are we running in?
        return c
            ? c.randomBytes
                ? parseInt(c.randomBytes(4).toString("hex"), 16) / (fourBytesOn + 1) - Number.EPSILON // node
                : c.getRandomValues(new Uint32Array(1))[0] / (fourBytesOn + 1) - Number.EPSILON // browsers
            : Math.random();
}

export default function uuidV4() { // eslint-disable-line complexity
    // if possible, generate a single random value, 128 bits (16 bytes) in length
    // in an environment where that is not possible, generate and make use of 4 32-bit (4-byte) random values
    // use crypto-grade randomness when available, else Math.random()
    const
        c = typeof crypto === "object"
            ? crypto // node or most browsers
            : typeof msCrypto === "object" // stinky non-standard IE
                ? msCrypto // eslint-disable-line no-undef
            : null; // what old or bad environment are we running in?
    let
        byteArray = c
            ? c.randomBytes
                ? c.randomBytes(16) // node
                : c.getRandomValues(new Uint8Array(16)) // browsers
            : null,
        uuid = [ ];

    /* eslint-disable no-bitwise */
    if ( ! byteArray) { // no support for generating 16 random bytes in one shot -- this will be slower
        const
            int = [
                random() * 0xffffffff | 0,
                random() * 0xffffffff | 0,
                random() * 0xffffffff | 0,
                random() * 0xffffffff | 0
            ];
        byteArray = [ ];
        for (let i = 0; i < 256; i++) {
            byteArray[i] = int[i < 4 ? 0 : i < 8 ? 1 : i < 12 ? 2 : 3] >> i % 4 * 8 & 0xff;
        }
    }
    byteArray[6] = byteArray[6] & 0x0f | 0x40; // always 4, per RFC, indicating the version
    byteArray[8] = byteArray[8] & 0x3f | 0x80; // constrained to [89ab], per RFC for version 4
    for (let i = 0; i < 16; ++i) {
        uuid[i] = (byteArray[i] < 16 ? "0" : "") + byteArray[i].toString(16);
    }
    uuid =
        uuid[ 0] + uuid[ 1] + uuid[ 2] + uuid[ 3] + "-" +
        uuid[ 4] + uuid[ 5]                       + "-" +
        uuid[ 6] + uuid[ 7]                       + "-" +
        uuid[ 8] + uuid[ 9]                       + "-" +
        uuid[10] + uuid[11] + uuid[12] + uuid[13] + uuid[14] + uuid[15];
    return uuid;
    /* eslint-enable no-bitwise */
}