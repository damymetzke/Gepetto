import { SubDoc } from "../global/subdoc_alt.js";
import { DrawObjectTreeEditor, DrawObjectTreeEditorWrapper } from "../core/core.js";

export function updateTextTree(root: SubDoc, tree: DrawObjectTreeEditorWrapper, under: DrawObjectTreeEditor)
{
    root.getElementBySid("body").classList.add("hide-property");

    const textTreeList = <HTMLOListElement>root.getElementBySid("text-tree--list");
    if (!textTreeList)
    {
        return;
    }
    textTreeList.innerHTML = "";

    under.rootObjects.forEach((object) =>
    {
        let newChild = document.createElement("li");
        newChild.innerText = object.name;
        if (tree.under.under.selectedObject === object.name)
        {
            newChild.classList.add("selected-element");
            root.getElementBySid("body").classList.remove("hide-property");
        }

        newChild.addEventListener("click", () =>
        {
            tree.selectObject(object.name);
        });
        textTreeList.appendChild(newChild);
    });
}

export function updateTransformCommands(root: SubDoc, tree: DrawObjectTreeEditorWrapper, under: DrawObjectTreeEditor)
{
    const transformList = root.getElementBySid("property--transform-list");
    transformList.innerHTML = "";
    under.objects[ under.selectedObject ].transformCommands.forEach((command, index) =>
    {
        let commandElement = document.createElement("li");
        commandElement.innerHTML = `<h5>${command.type}</h5>${
            (() =>
            {
                let result: string = "";

                for (let key in command.fields)
                {
                    result += `<p>${key}</p><input class="transform-command-number-input" data-transform-command-key="${key}" type="number" value="${command.fields[ key ]}">`;
                }

                return result;
            })()
            }`;

        Array.from(commandElement.getElementsByClassName("transform-command-number-input")).forEach((element: HTMLInputElement) =>
        {
            element.addEventListener("keydown", (event: KeyboardEvent) =>
            {
                if (event.key !== "Enter")
                {
                    return;
                }

                tree.updateTransformCommandField(under.selectedObject, index, element.dataset.transformCommandKey, Number.parseFloat(element.value));
            });
        });

        transformList.appendChild(commandElement);
    });
}