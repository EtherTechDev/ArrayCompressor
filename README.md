# ArrayCompressor
A JavaScript utility written in ES6, which effectively compresses Arrays with integer data.

Uses a combination of RLE and Huffman Encoding to achieve well-compressed output.

Typical use cases for this library are:
1. Compression of - large arrays of alpha values for images
2.                  large arrays of Graph data
3.                  large arrays of any number of the same values in groups which benefits from RLE (run-length encoding).

TODO:
1. Add checks for errors
2. Add test cases
3. Add example scripts for usage
4. Remove debug printouts
