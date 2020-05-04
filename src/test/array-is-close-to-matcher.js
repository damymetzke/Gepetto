expect.extend({
    arrayIsCloseTo(received, array, digits = 2)
    {

        if (!Array.isArray(received))
        {
            return {
                message: function ()
                {
                    return `expected ${received} to be an array`;
                },
                pass: false
            };
        }

        if (!Array.isArray(array))
        {
            return {
                message: function ()
                {
                    return `expected ${array} to be an array`;
                },
                pass: false
            };
        }

        if (!Number.isInteger(digits))
        {
            return {
                message: function ()
                {
                    return `expected ${digits} to be an integer number`;
                },
                pass: false
            };
        }

        if (received.length != array.length)
        {
            return {
                message: function ()
                {
                    return `expected the length of ${received} and ${array} to be the same, however ${received.length} and ${array.length} are not equal`;
                },
                pass: false
            };
        }

        const allowedDifference = 5 * Math.pow(0.1, digits + 1);
        for (let i = 0; i < received.length; ++i)
        {
            difference = Math.abs(received[i] - array[i]);
            if (difference > allowedDifference)
            {
                return {
                    message: function ()
                    {
                        return `expected difference at index ${i}: '${difference}' to be smaller than the allowed difference: '${allowedDifference}'`;
                    },
                    pass: false
                };
            }
        }

        return {
            message: function ()
            {
                return `all elements in ${received} and ${array} are within the allowed difference: '${allowedDifference}'`;
            },
            pass: true
        };
    }
});