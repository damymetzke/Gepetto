export default function GetUniqueElements(root, classNames)
{
    let result = {};
    for (name in classNames)
    {
        const foundClasses = result[name] = root.getElementsByClassName(classNames[name]);
        if (foundClasses.length === 0)
        {
            console.error("❗ no classes found called '" + classNames[name] + "' under the element: " + root);
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