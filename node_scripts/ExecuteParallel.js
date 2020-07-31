const ChildProcess = require("child_process");
const Stream = require("stream");
const Color = require("./color");

const path = require("path");

/// Specific Types///
function runScript(execution)
{
    return new Promise((resolve, reject) =>
    {
        if (!("file" in execution))
        {
            reject(`script execution (category='${category}') does not have 'file' defined`);
            return;
        }
        const { category, file } = execution;

        const stdOutStream = new Stream.Writable();
        stdOutStream._write = function (data)
        {
            Color.Log(`(category){[${category}]} ${data.toString()}`, [], {
                category: [ Color.EFFECTS.UNDERLINE, Color.EFFECTS.BG_BRIGHT_YELLOW, Color.EFFECTS.FG_BLACK ]
            });
        };

        const stdErrStream = new Stream.Writable();
        stdErrStream._write = function (data)
        {
            Color.Error(`(category){[${category}]} ${data.toString()}`, [], {
                category: [ Color.EFFECTS.BG_BRIGHT_RED, Color.EFFECTS.FG_BLACK ]
            });
        };


        const child = ChildProcess.fork(file, [], {
            stdio: [ null, null, null, "ipc" ]
        });

        child.stdout.pipe(stdOutStream);
        child.stderr.pipe(stdErrStream);

        child.on("close", (code, signal) =>
        {
            if (code === null)
            {
                reject(`process closed with no exit code (signal='${signal}')`);
                return;
            }

            if (code !== 0)
            {
                reject(`process (category='${category}') closed with non-zero error code (${code})`);
                return;
            }

            resolve(undefined);
        });
    });
}

const TYPE_MAP = {
    script: runScript
};

function ExecuteParallel(executionList)
{
    const promises = executionList.map((execution, index) =>
    {
        return new Promise((resolve, reject) =>
        {
            if (!("type" in execution)
                || !("category" in execution))
            {
                reject(`type or category missing from execution object (index=${index})`);
                return;
            }

            const { type } = execution;

            if (!(type in TYPE_MAP))
            {
                reject(`type '${type}' is not recoginized`);
                return;
            }

            TYPE_MAP[ type ](execution)
                .then(() =>
                {
                    resolve(undefined);
                })
                .catch((error) =>
                {
                    reject(error);
                });
        });
    });

    return Promise.all(promises);
}

module.exports = {
    ExecuteParallel
};

if (module === require.main)
{
    ExecuteParallel([
        {
            type: "script",
            category: "clean",
            file: path.join(__dirname, "./clean.js")
        },
        {
            type: "script",
            category: "move",
            file: path.join(__dirname, "./move-files.js")
        }
    ])
        .then((result) =>
        {
            Color.Log(`finished running ${result.length} executions successfull`);
        })
        .catch((error) =>
        {
            Color.Error(`one or more executions failed.\n[EXECUTE_ERROR] ${error}`);
        });
}