module.exports = {
    plugins: [
        "plugins/markdown"
    ],
    recurseDepth: 10,
    source: {
        include: [
            "./src/"
        ],
        includePattern: "^.+\\.(js|ts)$"
    },
    sourceType: "module",
    opts: {
        encoding: "utf8",
        recurse: true,
        destination: "./documentation/build/js-doc-output/"
    }
}