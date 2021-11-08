const fs = require('fs');
const path = require('path');
const fsPromises = fs.promises;

async function readDataFromFile(filePath) {
    return new Promise((resolve, reject) => {
        let data = '';
        const stream = fs.createReadStream(filePath, 'utf-8');
        stream.on('data', chunk => data += chunk);
        stream.on('error', err => reject(err));
        
        stream.on('end', () => {
            resolve(data);
        });
    })
}

async function mergeStyles(srcStylesDirPath, outputFilePath) {
    try {
        await fs.promises.rm(outputFilePath, {force: true});
        let direntObjects = await fs.promises.readdir(srcStylesDirPath, {withFileTypes: true});
        let fileObjects = direntObjects.filter(direntObject => (direntObject.isFile() && (path.extname(direntObject.name) === ".css")));
        let readPromises = fileObjects.map(fileObject => readDataFromFile(path.join(srcStylesDirPath, fileObject.name)));
        let stylesData = await Promise.all(readPromises);
        let outputStylesData = '';
    
        for(let i = 0; i < stylesData.length; i++) {
            outputStylesData += stylesData[i].trim();
            outputStylesData += (i !== (stylesData.length -1)) ? '\n\n' : '\n';
        }
    
        fsPromises.writeFile(outputFilePath, outputStylesData);    
    } catch(err) {
          console.log(err);
    }
}

mergeStyles(path.join(__dirname, 'styles'), path.join(__dirname, 'project-dist', 'bundle.css'));