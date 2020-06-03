const fs = require("fs");
const path = require("path");

const Color = require("./color");

const EMPTY_REGEX = /[^]*/;

function Walk(root, relative = "", test = EMPTY_REGEX, fileCallback = null)
{
    return new Promise((resolve, reject) =>
    {
        const currentDirectory = path.join(root, relative);
        fs.readdir(currentDirectory, (error, files) =>
        {
            if (error)
            {
                Color.Error(`Could not read directory (file){'${currentDirectory}'}\n${error}`);
                return;
            }

            const result = files.reduce((accumelator, file) =>
            {
                const result = new Promise((resolve, reject) =>
                {
                    const filePath = path.join(currentDirectory, file);
                    fs.stat(filePath, (error, stat) =>
                    {
                        if (error)
                        {
                            Color.Error(`Could not read file stat (file){'${filePath}'}\n${error}`);
                            reject({
                                problem: `Could not read file stat '${filePath}'`,
                                message: error
                            });
                            return;
                        }

                        const nextRelative = path.join(relative, file);
                        if (stat && stat.isDirectory())
                        {
                            const result = Walk(root, nextRelative, test, fileCallback);
                            result.then((fileList) =>
                            {
                                resolve(fileList);
                            });
                        }

                        if (!test.test(file))
                        {
                            resolve([]);
                            return;
                        }

                        resolve([nextRelative]);

                        if (fileCallback)
                        {
                            fs.readFile(filePath, (error, data) =>
                            {
                                if (error)
                                {
                                    Color.Error(`Could not read file (file){'${currentDirectory}'} for file callback\n${error}`);
                                    return;
                                }

                                fileCallback(data, relative, file);
                            });
                        }
                    });
                });
                return [...accumelator, result];
            }, []);

            Promise.all(result).then((fileLists) =>
            {
                const fileList = fileLists.reduce((accumelator, value) =>
                {
                    return [...accumelator, ...value];
                }, []);
                resolve(fileList);
            }).catch((error) =>
            {
                reject(error);
            });
        });
    });
}

module.exports = Walk;