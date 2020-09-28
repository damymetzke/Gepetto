function onDropdown (target) {

    target.classList.toggle("dropdown--box--display");

}

/**
 * @deprecated use lowercase instead.
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function OnScriptLoad (root) {

    onScriptLoad(root);

}

// setup events
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function onScriptLoad (root) {

    const targets = {};
    const dropdowns = root.getElementsByClassName("dropdown--box");

    for (let i = 0; i < dropdowns.length; ++i) {

        const identifier = dropdowns[i].dataset.dropdownIdentifier;

        targets[identifier] = dropdowns[i];

    }

    const icons = root.getElementsByClassName("dropdown--icon");

    for (let i = 0; i < icons.length; ++i) {

        const identifier = icons[i].dataset.dropdownIdentifier;

        icons[i].addEventListener("click", ()
        => {

            onDropdown(targets[identifier]);

        });

    }

}
