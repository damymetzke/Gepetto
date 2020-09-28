import {SubDoc} from "../global/subdoc_alt";
import {TabContentImplementation} from "../global/tabs_alt";

const {ipcRenderer} = require("electron");

export class StartMenu implements TabContentImplementation {

    newProjectCallback: () => void;

    enableSave: boolean;

    // default function should be empty
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    constructor (newProjectCallback: () => void = () => { }) {

        this.newProjectCallback = newProjectCallback;
        this.enableSave = false;

    }

    onInit (root: SubDoc): void {

        root.getElementBySid("start--open-project")
            .addEventListener("click", () => {

                ipcRenderer.send("open-project-from", {});

            });

        root.getElementBySid("start--new-project")
            .addEventListener("click", () => {

                this.newProjectCallback();

            });

        ipcRenderer.invoke("request-recents", {})
            .then((recents: string[]) => {

                const recentList = root.getElementBySid("start--recent-list");

                recents.forEach((path) => {

                    const recentProjectElement = document.createElement("li");

                    recentProjectElement.innerText = path;
                    recentProjectElement.addEventListener("click", () => {

                        ipcRenderer.send("open-project", {path});

                    });
                    recentList.appendChild(recentProjectElement);

                });

            });

    }

    // eslint-disable-next-line max-len
    // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-empty-function
    onDestroy (): void {

    }

    // eslint-disable-next-line max-len
    // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-empty-function
    onSave (): void {

    }

}
