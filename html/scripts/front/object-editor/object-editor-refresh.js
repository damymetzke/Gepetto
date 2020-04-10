import common from "./object-editor-common.js";

// function RefreshObjectTree(objectTree)
// {
//     treeRoot.innerHTML = "";
//     for (let i = 0; i < objectTree.rootObjects.length; ++i)
//     {
//         const name = objectTree.rootObjects[i].name;
//         let newElement = document.createElement("li");
//         newElement.innerText = name;
//         newElement.dataset.drawObjectName = name;
//         newElement.addEventListener("click", function ()
//         {
//             OnSelectObject(name);
//         });
//         treeRoot.appendChild(newElement);
//     }
// }

// function RefreshSelectedObject(object)
// {
//     let treeElements = treeRoot.querySelectorAll("[data-draw-object-name]");
//     for (let i = 0; i < treeElements.length; ++i)
//     {
//         if (treeElements[i].dataset.drawObjectName === object.name)
//         {
//             treeElements[i].classList.add("selected-element");
//         }
//         else
//         {
//             treeElements[i].classList.remove("selected-element");
//         }
//     }

//     elements.propertyName.innerText = object.name;
//     elements.propertyNameInput.value = object.name;

//     elements.propertyTransformCommandList.innerHTML = "";
//     for (let i = 0; i < object.transformCommands.length; ++i)
//     {
//         const index = i;
//         let newElement = document.createElement("li");
//         newElement.innerHTML = TransformCommandTemplate(object.transformCommands[i].type, object.transformCommands[i].x, object.transformCommands[i].y);
//         elements.propertyTransformCommandList.appendChild(newElement);

//         newElement.addEventListener("click", function ()
//         {
//             OnSelectTransformCommand(index);
//         });

//         let inputFields = newElement.getElementsByClassName("transform-command-number-input");
//         for (let j = 0; j < inputFields.length; ++j)
//         {
//             const index = i;
//             const key = inputFields[j].dataset.transformCommandKey;
//             const target = inputFields[j];
//             inputFields[j].addEventListener("keypress", function (keyEvent)
//             {
//                 if (keyEvent.key !== "Enter")
//                 {
//                     return;
//                 }
//                 let newObject = {};
//                 newObject[key] = target.value;
//                 OnChangeTransformCommand(index, newObject);
//             });
//         }
//     }

//     currentTransformCommands = object.transformCommands;
// }

// function RefreshTransformCommandIndex(index)
// {
//     let children = elements.propertyTransformCommandList.children;
//     for (let i = 0; i < children.length; ++i)
//     {
//         if (i == data.transformCommandIndex)
//         {
//             children[i].classList.add("selected-transform-command");
//         }
//         else
//         {
//             children[i].classList.remove("selected-transform-command");
//         }
//     }
// }

// function OnRefreshObjects(_event, data)
// {
//     if ("objectTree" in data)
//     {

//     }

//     if ("selectedObject" in data)
//     {

//     }

//     if ("transformCommandIndex" in data)
//     {

//     }
// }

export function Init()
{
    common.test = 69;
}