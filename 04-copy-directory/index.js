const path = require('path');
const fs = require('fs');
const fsPromises = fs.promises;

function clearDir(dest, srcFiles = []) {
    fsPromises.readdir(dest, {withFileTypes: true}).then(fileObjects => {
        for (let direntObject of fileObjects) {
            console.log(direntObject.name);
            if(!srcFiles.includes(direntObject.name)) {
                fsPromises.rm(path.join(dest, direntObject.name), {recursive: true});
            }
        }
    }).catch(err => {
        console.log(err);
    })
}

function copyDir(from, to) {
    fsPromises.mkdir(to, {recursive: true}).then(function() {
        fsPromises.readdir(from, {withFileTypes: true}).then(fileObjects => {
            clearDir(to, fileObjects.map(fileObject => fileObject.name));
            for (let direntObject of fileObjects) {
                if (direntObject.isDirectory()) {
                    copyDir(path.join(from, direntObject.name), path.join(to, direntObject.name));
                } else if (direntObject.isFile()) {
                    fsPromises.copyFile(path.join(from, direntObject.name), path.join(to, direntObject.name));
                }
            }
        }).catch(err => {
            console.log(err);
        })   
    }).catch(function() {
        console.log('failed to create directory');
    });
}

copyDir(path.join(__dirname, 'files'), path.join(__dirname, 'files-copy'));