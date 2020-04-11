export function GenerateTransformCommandElement(command)
{
    let fields = "";
    for (let key in command.fields)
    {
        const value = command.fields[key];
        fields += `<p>${key}</p><input class="transform-command-number-input" data-transform-command-key="${key}" type="number" value="${value}">`;
    }

    let result = document.createElement("li");
    result.innerHTML = `<h5>${command.type}</h5>${fields}`;

    return result;
}