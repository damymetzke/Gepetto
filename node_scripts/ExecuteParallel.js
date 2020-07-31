const ChildProcess = require("child_process");
const Stream = require("stream");
const Color = require("./color");

function ExecuteParallel(executionList)
{
    executionList.forEach(execution =>
    {
        if (!("type" in execution)
            || !("category" in execution))
        {
            return;
        }

        const { type, category } = execution;

        switch (type)
        {
            case "script":
                if (!("file" in execution))
                {
                    return;
                }

                const { file } = execution;

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
                    console.log("hi");
                    Color.Error(`(category){[${category}]} ${data.toString()}`, [], {
                        category: [ Color.EFFECTS.BG_BRIGHT_RED, Color.EFFECTS.FG_BLACK ]
                    });
                };


                const child = ChildProcess.fork(file, [], {
                    stdio: [ null, null, null, "ipc" ]
                });

                child.stdout.pipe(stdOutStream);
                child.stderr.pipe(stdErrStream);
                break;

            default:
                return;
        }
    });
}

module.exports = {
    ExecuteParallel
};