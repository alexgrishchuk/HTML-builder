const fs = require('fs');
const path = require('path');
const stream = fs.createReadStream(path.join(__dirname, 'text.txt'), 'utf-8');
const { stdout } = process;
// stream.on('data', chunk => console.log(chunk));
stream.on('data', chunk => stdout.write(chunk));