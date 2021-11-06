const fs = require('fs');
const path = require('path');

fs.promises.rm(path.join(__dirname, 'project-dist', 'bundle.css'), {force: true}).then(() => {
    fs.promises.readdir(path.join(__dirname, 'styles'), {withFileTypes: true}).then(fileObjects => {
        for (let direntObject of fileObjects) {
            if (direntObject.isFile()) {
                let dotIndex = direntObject.name.lastIndexOf('.');
                if (dotIndex !== -1) {
                    if(path.extname(direntObject.name) === ".css") {
                        let data = '';
                        const stream = fs.createReadStream(path.join(__dirname, 'styles', direntObject.name), 'utf-8');
                        stream.on('data', chunk => data += chunk);
                        stream.on('end', () => {
                            if(data[data.length - 1] !== '\n') {
                                data += '\n';
                            }
                            data += '\n';
    
                            fs.appendFile(path.join(__dirname, 'project-dist', 'bundle.css'), data, (error) => {
                                if (error) return console.error(error.message);
                            });   
                        });
                    }
                }
            }
        }
    }).catch(err => {
        console.log(err);
    })
}).catch(err => {
    console.log(err);
});
