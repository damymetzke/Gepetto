const Color = require("./color.js");
const del = require("del");

const CLEAN_DIRECTORIES = [
    "./out/",
    "./documentation/build/"
];

Color.Log(`(head){Cleaning Directories:}
${CLEAN_DIRECTORIES.reduce((accumelator, directory) => `${accumelator}* (file){"${directory}"}\n`, "")}`, [], {
    head: Color.HEADER,
    file: Color.FILE
});

CLEAN_DIRECTORIES.forEach(directory =>
{
    del(directory).catch((error) =>
    {
        Color.Log(`error loading directory: (file){"${directory}"}\n(error){${error}}`, [], {
            file: Color.FILE,
            error: Color.ERROR
        });
    });
});