const DISTANCE_FOR_DRAG = 18;
const DISTANCE_FOR_DRAG_SQUARED = DISTANCE_FOR_DRAG * DISTANCE_FOR_DRAG;

const TARGET_DROP_SIZE = 15;
const DROP_SIZE_RIGHT_OFFSET = (TARGET_DROP_SIZE - 5) / 2;
const DROP_SIZE_LEFT_OFFSET = DROP_SIZE_RIGHT_OFFSET + 5;

let dragging = null;
let pointer = null;
let farEnough = false;
let initalPosition = [0, 0];
let currentPosition = [0, 0];

function DragUpdate () {

    const tabs = document.getElementById("tabs").children;

    if (!farEnough) {

        const relativeVector = [
            currentPosition[0] - initalPosition[0],
            currentPosition[1] - initalPosition[1]
        ];
        const distanceSquared = (relativeVector[0] * relativeVector[0])
        + (relativeVector[1] * relativeVector[1]);

        if (distanceSquared >= DISTANCE_FOR_DRAG_SQUARED) {

            farEnough = true;
            dragging.classList.add("dragging");
            const element = document.createElement("li");

            element.id = "tab-pointer";
            dragging.insertAdjacentElement("beforebegin", element);
            pointer = element;

        }

    }

    if (farEnough) {

        dragging.style.left
        = `${currentPosition[0] - (dragging.offsetWidth / 2)}px`;
        dragging.style.top
        = `${currentPosition[1] - (dragging.offsetHeight / 2)}px`;

        if (currentPosition[1] <= 100) {

            for (let i = 0; i < tabs.length; ++i) {

                if (tabs[i].id === "tab-pointer") {

                    ++i;
                    continue;

                }
                if (tabs[i] === dragging) {

                    continue;

                }

                const position = tabs[i].getBoundingClientRect();
                const left = position.left - DROP_SIZE_LEFT_OFFSET;
                const right = position.right + DROP_SIZE_RIGHT_OFFSET;

                if (currentPosition[0] >= left && currentPosition[0] <= right) {

                    tabs[i].insertAdjacentElement("beforebegin", pointer);

                    break;

                }

            }

            const position = tabs[tabs.length - 1].getBoundingClientRect();

            if (currentPosition[0] >= position.right - DROP_SIZE_RIGHT_OFFSET) {

                tabs[tabs.length - 1]
                    .insertAdjacentElement("afterend", pointer);

            }

        }

    }

}

function UpdatePosition (event) {

    currentPosition = [event.clientX, event.clientY];
    if (dragging !== null) {

        DragUpdate();

    }

}

function OnDragTabStart (tab) {

    farEnough = false;
    dragging = tab;
    initalPosition = currentPosition;

}

function OnMouseUp () {

    if (farEnough && dragging !== null) {

        pointer.insertAdjacentElement("beforeBegin", dragging);

        dragging.classList.remove("dragging");
        pointer.remove();

    }
    dragging = null;
    pointer = null;

}

function OnSelectTab (content, tab) {

    if (farEnough) {

        return;

    }
    const currentContent = document.getElementById("selected-content");

    if (currentContent !== null) {

        currentContent.id = "";

    }

    content.id = "selected-content";

    const currentTab = document.getElementById("selected-tab");

    if (currentTab !== null) {

        currentTab.id = "";

    }

    tab.id = "selected-tab";

}

// setup events
export function OnScriptLoad (root) {

    const contents = document.getElementById("main").children;
    const contentsMap = {};

    for (let i = 0; i < contents.length; ++i) {

        contentsMap[contents[i].dataset.content] = contents[i];

    }

    const tabs = document.getElementById("tabs").children;

    for (let i = 0; i < tabs.length; ++i) {

        const tab = tabs[i];

        tab.addEventListener("click", ()
        => {

            OnSelectTab(contentsMap[tab.dataset.content], tab);

        });


        tab.addEventListener("mousedown", ()
        => {

            OnDragTabStart(tab);

        });

    }

    document.onmousemove = UpdatePosition;
    document.onmouseup = OnMouseUp;

}
