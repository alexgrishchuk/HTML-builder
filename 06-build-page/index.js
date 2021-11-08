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

async function readDataFromFile(from) {
    return new Promise((resolve, reject) => {
        let data = '';
        const stream = fs.createReadStream(from, 'utf-8');
        stream.on('data', chunk => data += chunk);
        stream.on('error', err => reject(err));
        
        stream.on('end', () => {
            resolve(data);
        });
    })
}

function findTemplateTagPositions(str, startIndex) {
    let start = str.indexOf("{{", startIndex);
    let end = str.indexOf("}}", start + 2);

    if((start !== -1) && ( end !== -1)) {
        end++;
        return {start, end};
    }
}

function findTemplateTags(str) {
    let names = [];
    let pos;
    let startIndex = 0;

    while(pos = findTemplateTagPositions(str, startIndex)) {
        names.push({name: str.slice(pos.start + 2, pos.end - 1), pos});
        startIndex = pos.end + 1;
    }

    return names;
}

async function replaceTemplateTags(templateData, componentsDirPath) {
    let tags = findTemplateTags(templateData);
    let readPromises = tags.map(tag => readDataFromFile(path.join(componentsDirPath, tag.name + '.html')));
    let componentsData = await Promise.all(readPromises);

    let htmlData = '';
    let currentPos = 0;

    for(let i = 0; i < tags.length; i++) {
        htmlData += templateData.slice(currentPos, tags[i].pos.start) + componentsData[i];
        currentPos = tags[i].pos.end + 1;
    }

    htmlData += templateData.slice(currentPos);

    return htmlData;
}

async function createHtmlFromTemplate(templateFilePath, componentsDirPath, outputFilePath) {
    let templateData = await readDataFromFile(templateFilePath);
    let htmlData = await replaceTemplateTags(templateData, componentsDirPath);
    fsPromises.writeFile(outputFilePath, htmlData);
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

function clearDir(dirPath, srcFiles = []) {
    fsPromises.readdir(dirPath, {withFileTypes: true}).then(fileObjects => {
        for (let direntObject of fileObjects) {
            console.log(direntObject.name);
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

async function buildPage() {
    try {
        await createEmptyDir(__dirname, 'project-dist');
        createHtmlFromTemplate(path.join(__dirname, 'template.html'), path.join(__dirname, 'components'), path.join(__dirname, 'project-dist', 'index.html'));
        mergeStyles(path.join(__dirname, 'styles'), path.join(__dirname, 'project-dist', 'style.css'));
        copyDir(path.join(__dirname, 'assets'), path.join(__dirname, 'project-dist', 'assets'));    
    } catch(err) {
          console.log(err);
    }
}

buildPage();