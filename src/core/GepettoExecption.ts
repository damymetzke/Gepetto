export enum GepettoExceptionType
{
    NONE = 0,
    TRANSFORM_COMMAND_TYPE_ERROR
}

export class GepettoException {

    type: GepettoExceptionType = GepettoExceptionType.NONE;

    message = "";

    constructor (type: GepettoExceptionType, message: string) {

        this.type = type;
        this.message = message;

    }

}
