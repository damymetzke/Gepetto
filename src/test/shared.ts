
import { Transform, DrawObject } from "./core/core";

function DrawTransform(source: Transform): string
{
    return `[\n${source.matrix.reduce((accumelator, value) =>
    {
        return `${accumelator}${value}\n`;
    }, "")}]\n`;
}

expect.extend({
    toEqualTransform(recieved: Transform, expected: Transform): jest.CustomMatcherResult
    {
        const differenceMatrix = recieved.matrix.map((value, index) =>
        {
            return expected.matrix[index] - value;
        });

        if (differenceMatrix.every(difference => Math.abs(difference) < 0.05))
        {
            return {
                pass: true,
                message: () =>
                {
                    return (
                        "Recieved:\n"
                        + `${DrawTransform(recieved)}\n`
                        + "Expected:\n"
                        + `${DrawTransform(expected)}\n`
                        + `The difference between each value between the recieved and expected transforms is within exceptable range (0.05)\n`
                        + `[\n${differenceMatrix.reduce((accumelator, difference) =>
                        {
                            return `${accumelator}${Math.abs(difference).toString()}\n`;
                        }, "")}]`
                    );
                }
            };
        }

        return {
            pass: false,
            message: () =>
            {
                return (
                    "Recieved:\n"
                    + `${DrawTransform(recieved)}\n`
                    + "Expected:\n"
                    + `${DrawTransform(expected)}\n`
                    + `The difference between 1 or more values between the recieved and expected transforms in not within acceptable range (0.05)\n`
                    + `[\n${differenceMatrix.reduce((accumelator, difference) =>
                    {
                        return `${accumelator}${
                            (Math.abs(difference) < 0.05) ?
                                this.utils.EXPECTED_COLOR(Math.abs(difference).toString()) :
                                this.utils.RECEIVED_COLOR(Math.abs(difference).toString())
                            }\n`;
                    }, "")}]`
                );
            }
        };
    },
    toBeTrueForAny(recieved: any[], test: ((recieved: any) => boolean)): jest.CustomMatcherResult
    {
        const success = recieved.some(element => test(element));
        return {
            pass: success,
            message: success ?
                () =>
                {
                    return "Recieved:\n"
                        + `[\n${recieved.reduce(element => `${element}\n`)}]\n`
                        + "At least 1 recieved elements passes the test";
                }
                :
                () =>
                {
                    return "Recieved:\n"
                        + `[\n${recieved.reduce(element => `${element}\n`)}]\n`
                        + "None of the recieved elements pass the test";
                }
        };
    }
});