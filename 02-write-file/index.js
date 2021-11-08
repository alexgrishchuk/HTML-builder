const fs = require('fs');
const path = require('path');
const { exit } = require('process');
const output = fs.createWriteStream(path.join(__dirname, 'text.txt'));
const readline = require('readline');
const { stdin } = process;
const rl = readline.createInterface({
    input: stdin,
    crlfDelay: Infinity
});

console.log("Enter text:");

rl.on('line', (line) => {
    if(line === "exit") {
        exit();
    } else {
        output.write(line + '\n');
    }    
});

process.on('exit', () => {
    console.log("Goodbye!");
});

process.on('SIGINT', exit);