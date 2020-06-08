
import { Transform } from "./core/core";
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
                        `The difference between each value between the recieved and expected transforms is within exceptable range (0.05)\n`
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
                    `The difference between 1 or more values between the recieved and expected transforms in not within acceptable range (0.05)\n`
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
    }
});