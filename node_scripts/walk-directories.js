const fs = require("fs").promises;
const path = require("path");

const EMPTY_REGEX = /[^]*/;

function addFile(relative, currentDirectory, file, root, test, fileCallback)
{
    return new Promise((resolve, reject) =>
    {
        const filePath = path.join(currentDirectory, file);
        const nextRelative = path.join(relative, file);

        fs.stat(filePath)
            .then((stat) =>
            {
                if (stat && stat.isDirectory())
                {
                    resolve(Walk(root, nextRelative, test, fileCallback));
                    return;
                }

                if (!test.test(file))
                {
                    resolve([]);
                    return;
                }


                if (!fileCallback)
                {
                    return;
                }

                fs.readFile(filePath)
                    .then((data) =>
                    {
                        fileCallback(data, relative, file);
                        resolve([ nextRelative ]);
                    })
                    .catch((error) =>
                    {
                        reject(error);
                    });
            })
            .catch((error) =>
            {
                reject(error);
            });
    });


}

function Walk(root, relative = "", test = EMPTY_REGEX, fileCallback = null)
{
    return new Promise((resolve, reject) =>
    {
        const currentDirectory = path.join(root, relative);

        fs.readdir(currentDirectory)
            .then((files) =>
            {
                let result = files.reduce((accumelator, file) =>
                {
                    return [
                        ...accumelator,
                        addFile(relative, currentDirectory, file, root, test, fileCallback)
                    ];
                }, []);

                return Promise.all(result);
            })
            .then((fileLists) =>
            {
                resolve(
                    fileLists.reduce((accumelator, value) => [ ...accumelator, ...value ], [])
                );
            })
            .catch((error) =>
            {
                reject(error);
            });
    });
}

module.exports = Walk;