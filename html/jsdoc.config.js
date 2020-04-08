module.exports = {
    plugins: [
        "plugins/markdown"
    ],
    recurseDepth: 10,
    source: {
        include: [
            "./scripts/"
        ],
        includePattern: "^.+.js(doc|x)?$"
    },
    sourceType: "module",
    opts: {
        encoding: "utf8",
        recurse: true,
        destination: "./documentation/build/js-doc-output/"
    }
}