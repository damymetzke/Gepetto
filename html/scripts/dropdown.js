function OnDropdown(target)
{
    target.classList.toggle("dropdown--box--display");
}

//setup events
{
    let targets = {};
    const dropdowns = document.getElementsByClassName("dropdown--box");
    for (let i = 0; i < dropdowns.length; ++i)
    {
        const identifier = dropdowns[i].dataset.dropdownIdentifier;

        targets[identifier] = dropdowns[i];
    }

    const icons = document.getElementsByClassName("dropdown--icon");
    for (let i = 0; i < icons.length; ++i)
    {
        const identifier = icons[i].dataset.dropdownIdentifier;
        console.log("🔢 connecting dropdown with identifier:", identifier);

        icons[i].addEventListener("click", function ()
        {
            OnDropdown(targets[identifier]);
        });
    }
}