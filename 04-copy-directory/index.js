const path = require('path');
const fs = require('fs');
const fsPromises = fs.promises;

function clearDir(dirPath, srcFiles = []) {
    fsPromises.readdir(dirPath, {withFileTypes: true}).then(fileObjects => {
        for (let direntObject of fileObjects) {
            if(!srcFiles.includes(direntObject.name)) {
                fsPromises.rm(path.join(dirPath, direntObject.name), {recursive: true});
            }
        }
    }).catch(err => {
        console.log(err);
    })
}

function copyDir(from, to) {
    fsPromises.mkdir(to, {recursive: true})
    .then(() => fsPromises.readdir(from, {withFileTypes: true}))
    .then(fileObjects => {
        clearDir(to, fileObjects.map(fileObject => fileObject.name));
        for (let direntObject of fileObjects) {
            if (direntObject.isDirectory()) {
                copyDir(path.join(from, direntObject.name), path.join(to, direntObject.name));
            } else if (direntObject.isFile()) {
                fsPromises.copyFile(path.join(from, direntObject.name), path.join(to, direntObject.name));
            }
        }
    })
    .catch(err =>  {
        console.log(err);
    });
}

copyDir(path.join(__dirname, 'files'), path.join(__dirname, 'files-copy'));