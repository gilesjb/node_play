var fs = require('fs');

var input = fs.createReadStream('file_read.js');
input.on('data', function(data) {
    console.