import {BrowserWindow, ipcMain} from "electron";
import {DrawObject,
    DrawObjectTreeEditorWrapper,
    SyncOrganizerType} from "../core/core";

import {SyncConnector_Back} from "../SyncConnector_Back";
import {convertSvg} from "../Svg/SvgConverter";

const REGEX_VALIDATE_IMPORT_NAME = /^[a-z][a-z0-9_#]*$/iu;

interface SvgImportData
{
    name: string;
    filePath: string;
    subObjects: string[];
}

type ImportResult =
    {
        success: true;
    }
    |
    {
        success: false;
        message: string;
    };

const NAME_ERROR
= "Name can only contain alphanumerical characters and underscore('_')\n"
+ "Name should always start with an alphabetic character ('a'-'z')";

export class DrawObjectManager {

    drawObjectTree: DrawObjectTreeEditorWrapper;

    resourceDirectory: string;

    onImportSvg (importData: SvgImportData):
        ImportResult | Promise<ImportResult> {

        // validate file name
        if (!REGEX_VALIDATE_IMPORT_NAME.test(importData.name)) {

            return {
                success: false,
                message: NAME_ERROR
            };

        }

        if (this.drawObjectTree.HasObject(importData.name)) {

            return {
                success: false,
                message: "Name is already in use"
            };

        }

        return convertSvg({
            sourcePath: importData.filePath,
            name: importData.name,
            subObjects: importData.subObjects
        })
            .then((names) => {

                names.forEach((name) => {

                    // success, add draw object
                    this.drawObjectTree.AddObjectToRoot(new DrawObject(name));

                });

                return <ImportResult>{
                    success: true
                };

            })
            .catch((error: string | Error) => <ImportResult>{
                success: false,
                message: (typeof error === "string")
                    ? error
                    : error.message
            });


    }

    constructor (window: BrowserWindow) {

        this.drawObjectTree = new DrawObjectTreeEditorWrapper(
            SyncOrganizerType.OWNER,
            new SyncConnector_Back("draw-object-tree", window)
        );

        ipcMain.handle(
            "import-svg",
            (_event, importData: SvgImportData) => this.onImportSvg(importData)
        );

        this.resourceDirectory = "./saved/objects";

    }

}
