/**
 * get unique elements under a specified root.
 * 
 * some elements will occur once per editor;
 * this means multiple can exist in the same document, since multiple editors of the same type can exist.
 * this function will find those elements by only looking under a given root element.
 * 
 * if no elements are found an error will be logged and the return value is set to null.
 * if more than 1 element is found a warning will be logged;
 * in this case the chosen element will be undefined, but valid.
 * 
 * @param root element under which the unique elements will be searched.
 * @param classNames an object containing class names of the elements that should be searched.
 * @returns an object based on the key structure of classnames, each class name in classNames corresponds to an element in the return value.
 */
export default function GetUniqueElements(root, classNames)
{
    let result = {};
    for (name in classNames)
    {
        const foundClasses = result[name] = root.getElementsByClassName(classNames[name]);
        if (foundClasses.length === 0)
        {
            console.error("❗ no classes found called '" + classNames[name] + "' under the element: " + root);
            result[name] = null;
            continue;
        }
        if (foundClasses.length > 1)
        {
            console.warn("⚠ multiple classes found called '" + classNames[name] + "' under the element: " + root + " defaulting to element at index 0");
        }

        result[name] = foundClasses[0];
    }

    return result;
}