
// Example.js Compress a large set of values into small compressed output. The array compressor works best compressing long repetitive sequences of data.

	var ArrayCompressor = require("./ArrayCompressor.js");

	console.log("Build random value table...");

// Scenario 1: An array of long blocks of repeated random bytes

	// Build long blocks of repeated bytes. This is where ArrayCompressor shines.
	let numRandoms = 16 + Math.floor(Math.random() * 16);
	let dataToCompress = [];

	for(var i=0; i<numRandoms; i++) {
		var blockRandomLength = 10 + Math.floor(Math.random() * 100000);
		//console.log("blockRandomLength="+blockRandomLength);
		var blockRandomValue = Math.floor(Math.random() * 255);
		for(var j=0; j<blockRandomLength; j++) {
			dataToCompress.push(blockRandomValue);
		}
	}


// Scenario 2: An array of some random pixel data

/*
	let dataToCompress = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 32, 32, 255, 255, 255, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 0, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 32, 255, 255, 255, 255, 32,0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 0, 255, 255, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64,  128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128, 128];
*/


// Scenario 3: An array of short blocks of repeated random bytes

/*
	// Build short blocks of repeated bytes. ArrayCompressor can handle this fairly well, too.
	let numRandoms = 65536 + Math.floor(Math.random() * 65536);

	let dataToCompress = [];

	for(var i=0; i<numRandoms; i++) {
		var blockRandomLength = 4 + Math.floor(Math.random() * 16);
		//console.log("blockRandomLength="+blockRandomLength);
		var blockRandomValue = Math.floor(Math.random() * 255);
		for(var j=0; j<blockRandomLength; j++) {
		dataToCompress.push(blockRandomValue);
		}
	}
*/

	console.log("dataToCompress=[" + dataToCompress + "]");

	console.log("Number of bytes to compress: " + dataToCompress.length);

	let ts = new Date().getTime();

	let compresseddata = ArrayCompressor.compress(dataToCompress, true);

	let compressedSize = compresseddata.length;

	console.log("Array compressed in " + (new Date().getTime() - ts) + "ms.");

	console.log("compresseddata=");
	console.log(compresseddata);

	ts = new Date().getTime();

	let decompresseddata = ArrayCompressor.decompress(compresseddata, true);

	console.log("Array decompressed in " + (new Date().getTime() - ts) + "ms.");

	//console.log("decompresseddata=[" + decompresseddata + "]");

	let match = true;
	for(let j = 0;  j <dataToCompress; j++) {
		if(dataToCompress[j] != decompresseddata[j]) {
		match = false;
		break;
		}
	}
	console.log("Original size: " + dataToCompress.length + " bytes.");
	console.log("Compressed size (including header): " + compressedSize + " bytes.");
	console.log("Decompressed size: " + decompresseddata.length + " bytes.");

	if(match && dataToCompress.length == decompresseddata.length) {
		console.log("Compression ratio: " + (((compresseddata.length / dataToCompress.length)) * 100).toFixed(2) + "% of original size.");
		console.log("SUCCESS\n\n");
	} else {
		console.error("FAILURE");
		alert("FAILURE");
	}

