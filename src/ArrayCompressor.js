
/*
	Copyright (c) 2026 EtherTech.
	Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
	1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
	2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/*
   ArrayCompressor class

   ArrayCompressor compresses an array of bytes, and result is an array of compressed data which can be decompressed.

   ArrayCompressor use both RLE (first stage) then Huffman (second stage) to compress.

   Best compression ratio is achieved with data containing many repetition, long sequences of same data. This can give a compression ratio of 1% or less.
   ArrayCompressor can also compress pure random data but much less effectively, in the regions of 80-90% compression ratio.

*/

class ArrayCompressor {

	// Compress RLE/Huffman and return the compressed bytes.

	static compress(data, debug = false) {

		let RLECompressedData = new SimpleRLE(debug).compress(data);						// Stage 1: RLE compression

		if(debug) { console.log("Byte/word size of RLE compressed data: " + RLECompressedData.length); }

		let HuffmanCompressedData = new Huffman(debug).compress(RLECompressedData);			// Stage 2: Huffman compression

		if(debug) { console.log("Byte size of Huffman compressed data: " + HuffmanCompressedData.length); }

		HuffmanCompressedData.unshift(2);
		return HuffmanCompressedData;
	}

	static decompressB64(b64str, debug = false) {

		if(debug) {  console.log("Original size of compressed data before decoding b64: " + data.length + " bytes"); }

		let dataArray = this.base64ToArray(b64str);

		return this.decompress(dataArray, debug);

	}

	// Decompress Huffman/RLE (note the reverse order from compression stage!) and return the decompressed bytes.

	static decompress(dataArray, debug = false) {

		if(debug) { console.log("Original size of compressed data: " + dataArray.length + " bytes"); }

		let compressionType = dataArray.splice(0,1)[0];

		if(compressionType == 1) {
			if(debug) { console.log("Decompress RLE data (type 1)"); }
			return new SimpleRLE(debug).decompress(dataArray);					// Stage 2: RLE decompression
		}

		if(compressionType == 2) {
			if(debug) { console.log("Decompress Huffman and RLE data (type 2)"); }
			let HuffmanDecompressedData = new Huffman(debug).decompress(dataArray);		// Stage 1: Huffman decompression
			if(debug) { console.log("Size of decompressed Huffman data: " + HuffmanDecompressedData.length + " bytes."); }

			return new SimpleRLE(debug).decompress(HuffmanDecompressedData);			// Stage 2: RLE decompression
		}

		return undefined;

	}

	static base64ToArray(base64) {
    	let binary_string = window.atob(base64);
    	let len = binary_string.length;
    	let bytes = new Array(len);
    	for (let i = 0; i < len; i++) {
    	    bytes[i] = binary_string.charCodeAt(i);
    	}
	    return bytes;
	}

}

// Huffman compression/decompression class. This is used in the second stage of compression
// to crunch the data to smaller size than RLE alone is capable of.

class Huffman {

	dictionary = {};
	revdictionary = {};

	constructor(debug) {
		this.debug = debug;
	}

	// Compress an Array of bytes/words.

	compress(encArr) {

		if(this.debug) { console.log("Huffman Compressing..."); }

		this.dictionary = {};
		this.revdictionary = {};
		let countNodes = this.prepareNodes(encArr);
		let treeNodes = this.createTree(countNodes);
		for(let j = 0; j < countNodes.length; j++) {
			let binChar = this.findNode(treeNodes[0], countNodes[j].code, "");
			this.dictionary[countNodes[j].code] = { binChar };
			this.dictionary[countNodes[j].code].length = binChar.length;
			this.revdictionary[binChar] = countNodes[j].code;
		}
		if(this.debug) { console.log("Huffman Node information:"); }
		if(this.debug) { console.log(JSON.stringify(countNodes).replace(/},{/g,"},\n{")); }

		let binStr = "";
		let binChar = "";

		for(let j=0; j < encArr.length; j++) {
			binStr += this.dictionary[encArr[j]].binChar;
		}

		binStr = this.getTreeDataBin() + binStr;

		let huffBytes = [];
		let lastByteBitLength = 0;

		for(let j=0; j<binStr.length; j+=8) {
			let bits = binStr.substr(j, 8);
			lastByteBitLength = bits.length;
			while(bits.length<8) {
				bits = bits + "0";
			}
			huffBytes.push(parseInt(bits, 2));
		}
		huffBytes.unshift(lastByteBitLength);
		return huffBytes;
	}

	// Get binary data tree

	getTreeDataBin() {
		let sortable = [];
		for (let d in this.revdictionary) {
		    sortable.push([d,d.length]);
		}
		sortable.sort(function(a, b) {
		    return a[1] - b[1];
		});

		let symcount = {};
		for(let j=0; j<sortable.length; j++) {
			if(symcount[sortable[j][1]] == undefined) {
				symcount[sortable[j][1]] = 1;
			} else {
				symcount[sortable[j][1]]++;
			}
		}

		let numbits = 0;
		for(let d in this.revdictionary) {
			if(d.length>numbits) {
				numbits = d.length;
			}
		}
		let numsymbolbits = 0;
		for(let d in this.revdictionary) {
			let symbol = Number(this.revdictionary[d]).toString(2);
			if(symbol.length > numsymbolbits) {
				numsymbolbits = symbol.length;
			}
		}
		let binstr = "";
		let lastSymbolBits = 0;
		let ptr = 0;

		binstr += String(Number(Object.keys(this.revdictionary).length).toString(2)).padStart(16, "0"); // Number of entrys in tree
		binstr += String(Number(numsymbolbits).toString(2)).padStart(16, "0"); // Number of bits per code

		for(let s in symcount) {

			binstr += String(Number(symcount[s]).toString(2)).padStart(16, "0");		// Number of occurrances of ..
			binstr += String(Number(s).toString(2)).padStart(16, "0");					// number of bits

			for(let n=0; n<symcount[s]; n++) {

				let symbol = sortable[ptr][0];
				let code = String(this.revdictionary[sortable[ptr][0]]);

				if(this.debug) { console.log("symbol [" + symbol + "]=[" + code + "], sym length=" + symbol.length); }

				binstr += symbol;
				binstr += String(Number(code).toString(2)).padStart(numsymbolbits, "0");

				ptr++;
			}
		}
		return binstr;
	}

	// Set header/tree from compressed data.

	setTreeDataBin(data) {

		this.revdictionary = {};

		let numSymbols = parseInt(data.substr(0, 16), 2);
		let numSymbolsBits = parseInt(data.substr(16, 16), 2);
		let ptr = 32;
		let j = 0;

		while(j<numSymbols) {

			let numBitsPerCode = parseInt(data.substr(ptr, 16), 2);
			let numBitsPerSymbol = parseInt(data.substr(ptr+16, 16), 2);

			ptr += 32;

			for(let n=0; n<numBitsPerCode; n++) {

				let symbol = data.substr(ptr, numBitsPerSymbol);
				let code = data.substr(ptr + numBitsPerSymbol, numSymbolsBits);

				this.revdictionary[symbol] = parseInt(code, 2);

				ptr += numBitsPerSymbol;
				ptr += numSymbolsBits;
				j += 1;
			}
		}
	}

	// Get size of header/tree

	getTreeBitSize(data) {

		let numSymbols = parseInt(data.substr(0, 16), 2);
		let numSymbolsBits = parseInt(data.substr(16, 16), 2);
		let ptr = 32;
		let j = 0;

		while(j<numSymbols) {

			let numBitsPerCode = parseInt(data.substr(ptr, 16), 2);
			let numBitsPerSymbol = parseInt(data.substr(ptr+16, 16), 2);

			ptr += 32;

			for(let n=0; n<numBitsPerCode; n++) {
				ptr += numBitsPerSymbol;
				ptr += numSymbolsBits;
				j += 1;
			}
		}

		return ptr;
	}

	// Decompress Huffman data

	decompress(dataArray) {

		let lastByteBitLength = dataArray.splice(0, 1)[0];

		let binStr = "";

		for(let j=0; j<dataArray.length; j++) {
			let bits = dataArray[j].toString(2);
			if(j!=dataArray.length-1) {
				while(bits.length<8) {
					bits = "0" + bits;
				}
			} else {
				while(bits.length<8) {
					bits = "0" + bits;
				}
				bits = bits.substr(0, lastByteBitLength);
			}
			binStr += bits;
		}

		if(this.debug) { console.log("Original Huffman bit size of compressed data: " + binStr.length + " bits."); }

		let treeBitSize = this.getTreeBitSize(binStr);

		this.setTreeDataBin(binStr.substr(0, treeBitSize));

		binStr = binStr.substr(treeBitSize, binStr.length - treeBitSize);

		let decArr = [];
		let bPos = 0;
		let t = new Date().getTime();
		let bitStr = "";

		while(bPos<binStr.length) {
			bitStr = "";
			for(var j=1;j<32;j++) {
				bitStr = binStr.substr(bPos, j);

				if(this.revdictionary[bitStr] != undefined) {
					decArr.push(this.revdictionary[bitStr]);

					bPos += bitStr.length;
					break;
				}
			}
			// We should never get here without finding corresponding bit key.
			if(j == 32) {
				console.error("Huffman Tree data is corrupt.");
				return undefined;
			}

		}

		return decArr;
	}

	// Prepare nodes to be used when compressing

	prepareNodes(encArr) {
		let nodeData = new Object();

		for(let j=0;j<encArr.length;j++) {
			let code = encArr[j];

			if(nodeData[code] == undefined) {
				nodeData[code] = {};
				nodeData[code].count=1;
				nodeData[code].code=code;
				nodeData[code].type=0;
			} else {
				nodeData[code].count++;
			}
		}

		let nodeArray = new Array();

		for(let node in nodeData) {
			nodeArray.push(nodeData[node]);
		}

		return nodeArray;
	}

	// Create a binary tree from a set of data nodes

	createTree(nodes) {
		let sortNodes = nodes.concat();
		let numNodes = sortNodes.length-1;

		while(sortNodes.length>1) {
			sortNodes.sort(function(a, b) {
 				return a.count-b.count
			})

			let newNode = new Object();

			newNode[0] = sortNodes.splice(0, 1)[0];
			newNode[1] = sortNodes.splice(0, 1)[0];

			let nodeCount = newNode[0].count;

			nodeCount += newNode[1].count;
			newNode.count = nodeCount;
			newNode.type = 1;

			sortNodes.push(newNode);
		}

		return sortNodes;
	}

	// Find a node in a tree

	findNode(nodes, val, foundStr)	{

		if(foundStr == "") {
			if(nodes[0].type == 1) {
				foundStr = this.findNode(nodes[0],val,foundStr);

				if(foundStr != "") {
					foundStr = "0" + foundStr;
				}
			} else {
				if(nodes[0].code == val) {
					foundStr = "0";
					return foundStr;
				}
			}
		}

		if(foundStr == "") {
			if(nodes[1].type == 1) {
				foundStr = this.findNode(nodes[1],val,foundStr);

				if(foundStr != "") {
					foundStr = "1"+foundStr;
				}

			} else {
				if(nodes[1].code == val) {
					foundStr = "1";
					return foundStr;
				}
			}
		}

		return foundStr;
	}
}

// Run-Length Encoding class for first stage block compression/decompression.

class SimpleRLE {

	constructor(debug) {
		this.debug = debug;
	}

	// Simple RLE is a very quick and simple compression technique: count the number of occurrences of a certain byte and
	// place the byte and its length in an array.

	compress(data) {
		let BUFFER_SIZE = 65535;
		let dataValue, steps;
		function getBlock(offset, length) {
			dataValue = data[offset];
			steps = 0;
			for(let j = offset; j < offset + length; j++) {
				if(data[j] == dataValue) {
					steps++;
				} else {
					break;
				}
			}
			return [dataValue, steps];
		}

		let compressed = [];
		let offset = 0;

		if(this.debug) { console.log("RLE Compressing..."); }

		while(offset < data.length) {
			let [dataValue, len] = getBlock(offset, BUFFER_SIZE);
			compressed.push(dataValue);
			compressed.push(len);
			offset += len
		}

/*
		// This code is more modern and nice, but also much slower, it runs about two times slower than the above code.
		// For performance reasons, I kept the original, kind of "old-style" solution above.
		// If you prefer the below code regardless of performance, uncomment it and remove the code above, they have same function.
		// Perhaps in future versions of browsers, the more modern approach will catch up speed.

		var temparr = [];
		var sum = 0;

		var info = data.forEach((value, index) => {
			if(index>0) {
				if(data[index-1]==data[index]) {
					sum+=1;
				} else {
					temparr.push(data[index-1]);
					temparr.push(sum);
					sum=1;
				}
			} else {
				sum++;
			}
			if(index==data.length-1) {
				temparr.push(data[index]);
				temparr.push(sum);
			}
		});
*/

		if(this.debug) { console.log("RLE Compression completed!"); }

		return compressed;
	}

	// decompression reads first 8-bit byte and duplicates it second 16-bit word number of times.

	decompress(data) {

		const dataSize = data.reduce((sum, val, i) => sum + (i & 1 ? val : 0), 0);

		if(this.debug) { console.log("RLE data size: " + dataSize + " bytes."); }

		let output = new Array(dataSize);
		let offset = 0;

		for(let j=0; j<data.length; j+=2) {
			let byte = data[j];
			let len = data[j+1];
			if(output.fill) {
				output.fill(byte, offset, offset+len);
			} else {
				for(let i=0; i<len; i++) {
					output[offset + i] = byte;
				}
			}
			offset += len;
		}

		return output;
	}
}

if (typeof window === 'undefined') {
	module.exports = ArrayCompressor;
}