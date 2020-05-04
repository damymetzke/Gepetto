let isDragging: boolean = false;

let zoomLevel: number = 10;

function OnDragUpdate(root: SVGSVGElement, event: MouseEvent)
{
    if (isDragging)
    {
        root.viewBox.baseVal.x -= (event.movementX / root.clientWidth) * root.viewBox.baseVal.width;
        root.viewBox.baseVal.y -= (event.movementY / root.clientHeight) * root.viewBox.baseVal.height;
    }
}

function OnDragStart(): void
{
    isDragging = true;
}

function OnDragEnd(): void
{
    isDragging = false;
}

function OnZoom(root: SVGSVGElement, amount: number): void
{
    zoomLevel += amount < 0 ? 1 : -1;
    zoomLevel = Math.max(5, Math.min(20, zoomLevel));
    root.viewBox.baseVal.width = 2000.0 / zoomLevel;
    root.viewBox.baseVal.height = 2000.0 / zoomLevel;
    console.log(zoomLevel);
}

export function Init(root: SVGSVGElement): void
{
    root.addEventListener("mousemove", event =>
    {
        OnDragUpdate(root, event);
    });
    root.addEventListener("mousedown", OnDragStart);

    document.onmouseup = OnDragEnd;

    root.addEventListener("wheel", (event: WheelEvent) =>
    {
        OnZoom(root, event.deltaY);
        event.preventDefault();
    });
}