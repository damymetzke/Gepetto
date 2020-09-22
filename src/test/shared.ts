
import {Transform} from "./core/core";

function drawTransform (source: Transform): string {

    const transformArray = source.matrix.reduce((
        accumelator,
        value
    ) => `${accumelator}${value}\n`, "");


    return `[\n${transformArray}]\n`;

}

expect.extend({
    toEqualTransform (
        recieved: Transform,
        expected: Transform
    ): jest.CustomMatcherResult {

        const differenceMatrix = recieved.matrix.map((
            value,
            index
        ) => expected.matrix[index] - value);

        if (differenceMatrix.every((difference) => Math.abs(difference)
        < 0.05)) {

            const differenceArray = differenceMatrix
                .reduce((
                    accumelator,
                    difference
                ) => `${accumelator}${Math.abs(difference).toString()}\n`, "");


            return {
                pass: true,
                message: () => (
                    "Recieved:\n"
                        + `${drawTransform(recieved)}\n`
                        + "Expected:\n"
                        + `${drawTransform(expected)}\n`
                        + "The difference between each value between the "
                        + "recieved and expected transforms is within "
                        + "exceptable range (0.05)\n"
                        + `[\n${differenceArray}]`
                )
            };

        }

        return {
            pass: false,
            message: () => (
                "Recieved:\n"
                    + `${drawTransform(recieved)}\n`
                    + "Expected:\n"
                    + `${drawTransform(expected)}\n`
                    + "The difference between 1 or more values "
                    + "between the recieved and expected transforms "
                    + "in not within acceptable range (0.05)\n"
                    + `[\n${differenceMatrix.reduce((
                        accumelator,
                        difference
                    ) => `${accumelator}${
                        (Math.abs(difference) < 0.05)
                            // eslint-disable-next-line max-len
                            // todo: wrap in function because jest defines this function.
                            // eslint-disable-next-line new-cap
                            ? this.utils.EXPECTED_COLOR(Math
                                .abs(difference).toString())

                            // eslint-disable-next-line max-len
                            // todo: wrap in function because jest defines this function.
                            // eslint-disable-next-line new-cap
                            : this.utils.RECEIVED_COLOR(Math
                                .abs(difference).toString())
                    }\n`, "")}]`
            )
        };

    },
    toBeTrueForAny (
        recieved: unknown[],
        test: ((recieved: unknown) => boolean)
    ): jest.CustomMatcherResult {

        const success = recieved.some((element) => test(element));

        return {
            pass: success,
            message: success
                ? () => "Recieved:\n"
                        + `[\n${recieved
                            .reduce((element) => `${element}\n`)}]\n`
                        + "At least 1 recieved elements passes the test"
                : () => "Recieved:\n"
                        + `[\n${recieved
                            .reduce((element) => `${element}\n`)}]\n`
                        + "None of the recieved elements pass the test"
        };

    }
});
