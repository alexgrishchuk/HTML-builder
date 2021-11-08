const path = require('path');
const fs = require('fs');
const fsPromises = fs.promises;

async function createEmptyDir(pathToDir, dirName) {
    try {
        let fileObjects = await fsPromises.readdir(pathToDir, {withFileTypes: true});
        
        let dirNames = fileObjects.filter(item => item.isDirectory()).map(fileObject => fileObject.name);

        if (dirNames.includes(dirName)) {
            await fsPromises.rm(path.join(pathToDir, dirName), {recursive: true});
        }

        await fsPromises.mkdir(path.join(pathToDir, dirName), {recursive: true});
    } catch(err) {
          console.log(err);
    }
}

function copyDir(from, pathToDir, toDirName) {
    let to = path.join(pathToDir, toDirName);
    createEmptyDir(pathToDir, toDirName)
    .then(() => fsPromises.readdir(from, {withFileTypes: true}))
    .then(fileObjects => {
        for (let direntObject of fileObjects) {
            if (direntObject.isDirectory()) {
                copyDir(path.join(from, direntObject.name), to, direntObject.name);
            } else if (direntObject.isFile()) {
                fsPromises.copyFile(path.join(from, direntObject.name), path.join(to, direntObject.name));
            }
        }
    })
    .catch(err =>  {
        console.log(err);
    });
}

copyDir(path.join(__dirname, 'files'), __dirname, 'files-copy');