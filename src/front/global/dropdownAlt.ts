function onDropdown (target: HTMLElement) {

    target.classList.toggle("dropdown--box--display");

}

// setup events
export function setupDropdowns (root: HTMLElement): void {

    const targets = {};
    const dropdowns = <HTMLCollectionOf<HTMLElement>>root
        .getElementsByClassName("dropdown--box");

    for (let i = 0; i < dropdowns.length; ++i) {

        const identifier = dropdowns[i].dataset.dropdownIdentifier;

        targets[identifier] = dropdowns[i];

    }

    const icons = <HTMLCollectionOf<HTMLElement>>root
        .getElementsByClassName("dropdown--icon");

    for (let i = 0; i < icons.length; ++i) {

        const identifier = icons[i].dataset.dropdownIdentifier;

        icons[i].addEventListener("click", () => {

            onDropdown(targets[identifier]);

        });

    }

}
