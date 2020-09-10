// eslint-disable-next-line no-undef
expect.extend({
    arrayIsCloseTo (received, array, digits = 2) {

        if (!Array.isArray(received)) {

            return {
                message () {

                    return `expected ${received} to be an array`;

                },
                pass: false
            };

        }

        if (!Array.isArray(array)) {

            return {
                message () {

                    return `expected ${array} to be an array`;

                },
                pass: false
            };

        }

        if (!Number.isInteger(digits)) {

            return {
                message () {

                    return `expected ${digits} to be an integer number`;

                },
                pass: false
            };

        }

        if (received.length !== array.length) {

            return {
                message () {

                    return `expected the length of ${received}`
                    + ` and ${array} to be the same,`
                    + ` however ${received.length}`
                    + ` and ${array.length} are not equal`;

                },
                pass: false
            };

        }

        const allowedDifference = 5 * (0.1 ** (digits + 1));

        for (let i = 0; i < received.length; ++i) {

            const difference = Math.abs(received[i] - array[i]);

            if (difference > allowedDifference) {

                return {
                    message () {

                        return `expected difference at index ${i}: `
                        + `'${difference}' to be smaller than `
                        + `the allowed difference: '${allowedDifference}'`;

                    },
                    pass: false
                };

            }

        }

        return {
            message () {

                return `all elements in ${received} `
                + `and ${array} are within the allowed `
                + `difference: '${allowedDifference}'`;

            },
            pass: true
        };

    }
});
