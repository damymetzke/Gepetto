function OnDropdown(target)
{
    target.classList.toggle("dropdown--box--display");
}

//setup events
function OnScriptDropdownLoad(root)
{
    let targets = {};
    const dropdowns = root.getElementsByClassName("dropdown--box");
    for (let i = 0; i < dropdowns.length; ++i)
    {
        const identifier = dropdowns[i].dataset.dropdownIdentifier;

        targets[identifier] = dropdowns[i];
    }

    const icons = root.getElementsByClassName("dropdown--icon");
    for (let i = 0; i < icons.length; ++i)
    {
        const identifier = icons[i].dataset.dropdownIdentifier;

        icons[i].addEventListener("click", function ()
        {
            OnDropdown(targets[identifier]);
        });
    }
}