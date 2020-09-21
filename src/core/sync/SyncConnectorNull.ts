import {SyncConnector} from "./SyncConnector";

/**
 * implementation of {@linkcode syncConnector} which does nothing.
 */
export class SyncConnectorNull implements SyncConnector {

    // eslint-disable-next-line max-len
    // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-empty-function
    send (): void {

    }

    // eslint-disable-next-line max-len
    // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-empty-function
    onRecieve (): void {

    }

}
