export function EnableCallback(element: HTMLElement | SVGElement, expected: string, callback: () => void)
{
    if (element.dataset.callbackMode === expected)
    {
        callback();
    }
}