const DISTANCE_FOR_DRAG = 18;
const DISTANCE_FOR_DRAG_SQUARED = DISTANCE_FOR_DRAG * DISTANCE_FOR_DRAG;

let dragging = null;
let pointer = null;
let farEnough = false;
let initalPosition = [0, 0];
let currentPosition = [0, 0];

function DragUpdate()
{
    let tabs = document.getElementById("tabs").children;
    if (!farEnough)
    {
        const relativeVector = [
            currentPosition[0] - initalPosition[0],
            currentPosition[1] - initalPosition[1]
        ];
        const distanceSquared = relativeVector[0] * relativeVector[0] + relativeVector[1] * relativeVector[1];

        if (distanceSquared >= DISTANCE_FOR_DRAG_SQUARED)
        {
            farEnough = true;
            dragging.classList.add("dragging");
            let element = document.createElement("li");
            element.id = "tab-pointer";
            dragging.insertAdjacentElement("beforebegin", element);
            pointer = element;
        }
    }

    if (farEnough)
    {
        dragging.style.left = currentPosition[0] - (dragging.offsetWidth / 2) + "px";
        dragging.style.top = currentPosition[1] - (dragging.offsetHeight / 2) + "px";

        for (let i = 0; i < tabs.length; ++i)
        {
            if (tabs[i].id == "tab-pointer")
            {
                ++i;
                continue;
            }
            if (tabs[i] == dragging)
            {
                continue;
            }

            const position = tabs[i].getBoundingClientRect();
            if (currentPosition[0] >= position.left && currentPosition[0] <= position.right)
            {
                tabs[i].insertAdjacentElement("beforebegin", pointer);

                break;
            }

        }
    }
}

function UpdatePosition(event)
{
    currentPosition = [event.clientX, event.clientY];
    if (dragging != null)
    {
        DragUpdate();
    }
}

function OnDragTabStart(tab)
{
    farEnough = false;
    dragging = tab;
    initalPosition = currentPosition;
}

function OnMouseUp()
{
    if (farEnough && dragging != null)
    {
        pointer.insertAdjacentElement("beforeBegin", dragging);

        dragging.classList.remove("dragging");
        let tabs = document.getElementById("tabs").children;
        pointer.remove();
    }
    dragging = null;
    pointer = null;
}

function OnSelectTab(content, tab)
{
    if (farEnough)
    {
        return;
    }
    currentContent = document.getElementById("selected-content");

    if (currentContent != null)
    {
        currentContent.id = "";
    }

    content.id = "selected-content";

    currentTab = document.getElementById("selected-tab");
    if (currentTab != null)
    {
        currentTab.id = "";
    }

    tab.id = "selected-tab";
}

//setup events
{
    const contents = document.getElementById("main").children;
    let contentsMap = {};

    for (let i = 0; i < contents.length; ++i)
    {
        console.log("💻 setting up content:", contents[i].dataset.content);

        contentsMap[contents[i].dataset.content] = contents[i];
    }

    const tabs = document.getElementById("tabs").children;

    for (let i = 0; i < tabs.length; ++i)
    {
        console.log("🚀 setting up tab:", tabs[i].dataset.content);

        tabs[i].addEventListener("click", function ()
        {
            OnSelectTab(contentsMap[tabs[i].dataset.content], tabs[i]);
        });

        const tab = tabs[i];

        tab.addEventListener("mousedown", function ()
        {
            OnDragTabStart(tab);
        });
    }

    document.onmousemove = UpdatePosition;
    document.onmouseup = OnMouseUp;
}