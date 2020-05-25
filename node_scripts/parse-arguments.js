const isNamedArgument = /^--?([^]+)/;

function Parse(arguments, knownNames)
{
    if (arguments.length === 0)
    {
        return {
            positional: [],
            named: {},
            unknown: []
        };
    }

    const currentArgument = arguments[0];
    const nextArguments = Parse(arguments.slice(1), knownNames);

    if (isNamedArgument.test(currentArgument))
    {
        const argumentName = currentArgument.replace(isNamedArgument, (match, name) => name);
        if (!(argumentName in knownNames))
        {
            return {
                positional: nextArguments.positional,
                named: nextArguments.named,
                unknown: [argumentName, ...nextArguments.unknown]
            };
        }

        const argumentCount = knownNames[argumentName];

        return {
            positional: nextArguments.positional.slice(argumentCount),
            named: {
                ...nextArguments.named,
                [argumentName]: nextArguments.positional.slice(0, argumentCount)
            },
            unknown: nextArguments.unknown
        };
    }

    return {
        positional: [currentArgument, ...nextArguments.positional],
        named: nextArguments.named,
        unknown: nextArguments.unknown
    };
}

module.exports = {
    Parse
};