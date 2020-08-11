import { TabContentImplementation } from "../global/tabs_alt";
import { SubDoc } from "../global/subdoc_alt";

const { ipcRenderer } = require("electron");

export class StartMenu implements TabContentImplementation
{
    onInit(root: SubDoc, name: string): void
    {
        root.getElementBySid("start--open-project").addEventListener("click", () =>
        {
            ipcRenderer.send("open-project-from", {});
        });

        ipcRenderer.invoke("request-recents", {})
            .then((recents: string[]) =>
            {
                const recentList = root.getElementBySid("start--recent-list");
                recents.forEach((path) =>
                {
                    const recentProjectElement = document.createElement("li");
                    recentProjectElement.innerText = path;
                    recentProjectElement.addEventListener("click", () =>
                    {
                        ipcRenderer.send("open-project", { path: path });
                    });
                    recentList.appendChild(recentProjectElement);
                });
            });
    }
    onDestroy(root: SubDoc, name: string): void
    {

    }
    onSave(root: SubDoc, name: string): void
    {

    }

}