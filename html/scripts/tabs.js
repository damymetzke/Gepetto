const DISTANCE_FOR_DRAG = 18;
const DISTANCE_FOR_DRAG_SQUARED = DISTANCE_FOR_DRAG * DISTANCE_FOR_DRAG;

let dragging = null;
let farEnough = false;
let initalPosition = [0, 0];
let currentPosition = [0, 0];

function DragUpdate()
{
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
            console.log(dragging);
            dragging.classList.add("dragging");
        }
    }

    if (farEnough)
    {

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
    console.log(initalPosition);
}

function OnMouseUp()
{
    if (dragging != null)
    {
        console.log("Dragged!");
        dragging.classList.remove("dragging");
        dragging = null;
    }
}

function OnSelectTab(content, tab)
{
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
            OnDragTabStart(tabs[i]);
        });

        tabs[i].addEventListener("mouseup", function ()
        {
            console.log("up");
        });
    }

    document.onmousemove = UpdatePosition;
    document.onmouseup = OnMouseUp;
}