import {DrawObjectTreeEditor,
    DrawObjectTreeEditorWrapper} from "../core/core.js";
import {SubDoc} from "../global/subdoc_alt.js";

export function updateTextTree (
    root: SubDoc,
    tree: DrawObjectTreeEditorWrapper,
    under: DrawObjectTreeEditor
): void {

    root.getElementBySid("body").classList.add("hide-property");

    const textTreeList
    = <HTMLOListElement>root.getElementBySid("text-tree--list");

    if (!textTreeList) {

        return;

    }
    textTreeList.innerHTML = "";

    under.rootObjects.forEach((object) => {

        const newChild = document.createElement("li");

        newChild.innerText = object.name;
        if (tree.under.under.selectedObject === object.name) {

            newChild.classList.add("selected-element");
            root.getElementBySid("body").classList.remove("hide-property");

        }

        newChild.addEventListener("click", () => {

            tree.selectObject(object.name);

        });
        textTreeList.appendChild(newChild);

    });

}

export function updateTransformCommands (
    root: SubDoc,
    tree: DrawObjectTreeEditorWrapper,
    under: DrawObjectTreeEditor
): void {

    const transformList = root.getElementBySid("property--transform-list");

    transformList.innerHTML = "";
    under.objects[under.selectedObject].transformCommands
        .forEach((command, index) => {

            const commandElement = document.createElement("li");

            commandElement.innerHTML = `<h5>${command.type}</h5>${
                (() => {

                    let result = "";

                    for (const key in command.fields) {

                        if (!Object.prototype.hasOwnProperty
                            .call(command.fields, key)) {

                            continue;

                        }
                        result += `
                        <p>
                            ${key}
                        </p>
                        <input
                            class="transform-command-number-input"
                            data-transform-command-key="${key}"
                            type="number"
                            value="${command.fields[key]}"
                        >
                        `;

                    }

                    return result;

                })()
            }`;

            Array.from(commandElement
                .getElementsByClassName("transform-command-number-input"))
                .forEach((element: HTMLInputElement) => {

                    element.addEventListener(
                        "keydown",
                        (event: KeyboardEvent) => {

                            if (event.key !== "Enter") {

                                return;

                            }

                            tree.updateTransformCommandField(
                                under.selectedObject,
                                index,
                                element.dataset.transformCommandKey,
                                Number.parseFloat(element.value)
                            );

                        }
                    );

                });

            transformList.appendChild(commandElement);

        });

}
