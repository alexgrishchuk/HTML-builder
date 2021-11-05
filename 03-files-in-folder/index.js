const fs = require('fs');
const path = require('path');
const { stdout } = process;

fs.promises.readdir(path.join(__dirname, 'secret-folder'), {withFileTypes: true}).then(fileObjects => {
    for (let direntObject of fileObjects) {
        if (direntObject.isFile()) {
            fs.stat(path.join(__dirname, 'secret-folder', direntObject.name), (err, stats) => {
                let dotIndex = direntObject.name.lastIndexOf('.');
                if (dotIndex !== -1) {
                    stdout.write(direntObject.name.slice(0, dotIndex) + ' - ');
                    stdout.write(path.extname(direntObject.name).slice(1) + ' - ');
                } else {
                    stdout.write(direntObject.name + ' - ');
                }    
                stdout.write(stats.size + 'b' + '\n',);
            });
        }            
    }
}).catch(err => {
    console.log(err);
})
