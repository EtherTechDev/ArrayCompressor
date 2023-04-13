# ArrayCompressor
A JavaScript module written in ES6, which quickly and effectively, with a small footprint (7kb), compress Arrays with integer data.
Return value is either a JavaScript Array with compressed binary data, or a B64 string.

Uses a combination of RLE and Huffman Encoding to achieve well-compressed output.

Typical use cases for this library are:
1. Compression of large arrays of alpha values for images
2. Compression of large arrays of Graph data
3. Compression of large arrays of any number of consecutive values in groups which benefits from RLE (Run-Length Encoding).

Example:
--------
// Let's define an array with some arbitrary data, in this case some pixel alpha values.

let dataToCompress = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 32, 32, 255, 255, 255, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 0, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 32, 255, 255, 255, 255, 32,0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 0, 255, 255, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64,  128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128];

let compressedData = ArrayComperssor.compress(dataToCompress);

> Resulting compressed data bytes:
> [3, 0, 15, 0, 8, 0, 2, 0, 2, 0, 31, 240, 0, 16, 0, 60, 2, 0, 6, 0, 9, 1, 82, 65, 224, 64, 0, 96, 0, 180, 3, 168, 69, 132, 0, 1, 128, 1, 174, 4, 188, 95, 131, 254, 80, 58, 70, 238, 0, 135, 16, 226, 173, 243, 237, 39, 22, 124, 207, 144, 226, 28, 85, 164, 230, 233, 197, 159, 51, 252, 245, 223, 0]

> Compression ratio: 26.37% of original size.

let decompressedData = ArrayComperssor.decompress(compressedData);

// decompressedData is now same as dataToCompress!

The larger the array, and the larger the blocks with consecutive values, the larger the gains of compression.

TODO:
1. Add checks for errors
2. Add test cases
3. Add example scripts for usage
4. Remove debug printouts

No external library dependencies, the RLE and Huffman compressors is written in-house.
