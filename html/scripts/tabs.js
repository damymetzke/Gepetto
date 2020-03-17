const DISTANCE_FOR_DRAG = 18;
const DISTANCE_FOR_DRAG_SQUARED = DISTANCE_FOR_DRAG * DISTANCE_FOR_DRAG;

let dragging = null;
let pointerIndex = null;
let originalIndex = null;
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
            tabs[pointerIndex].insertAdjacentElement("beforebegin", element);
            ++originalIndex;
        }
    }

    if (farEnough)
    {
        dragging.style.left = currentPosition[0] - (dragging.offsetWidth / 2) + "px";
        dragging.style.top = currentPosition[1] - (dragging.offsetHeight / 2) + "px";

        for (let i = 0; i < tabs.length; ++i)
        {
            if (i == pointerIndex)
            {
                ++i;
                continue;
            }
            if (i == originalIndex)
            {
                continue;
            }

            const position = tabs[i].getBoundingClientRect();
            if (currentPosition[0] >= position.left && currentPosition[0] <= position.right)
            {
                if (pointerIndex < originalIndex && i > originalIndex)
                {
                    --originalIndex;
                }
                else if (pointerIndex > originalIndex && i < originalIndex)
                {
                    ++originalIndex;
                }
                tabs[i].insertAdjacentElement("beforebegin", tabs[pointerIndex]);
                console.log(i, pointerIndex);
                pointerIndex = pointerIndex <= i ? i - 1 : i;
                console.log(i, pointerIndex);

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

function OnDragTabStart(tab, index)
{
    farEnough = false;
    dragging = tab;
    pointerIndex = index;
    originalIndex = index;
    initalPosition = currentPosition;
}

function OnMouseUp()
{
    if (farEnough && dragging != null)
    {
        dragging.classList.remove("dragging");
        let tabs = document.getElementById("tabs").children;
        tabs[pointerIndex].remove();
        dragging = null;
    }
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

        tabs[i].addEventListener("mousedown", function ()
        {
            OnDragTabStart(tabs[i], i);
        });
    }

    document.onmousemove = UpdatePosition;
    document.onmouseup = OnMouseUp;
}