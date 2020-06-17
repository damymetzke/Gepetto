import { SubDoc } from "./subdoc_alt.js";

const DISTANCE_FOR_DRAG = 18;
const DISTANCE_FOR_DRAG_SQUARED = DISTANCE_FOR_DRAG * DISTANCE_FOR_DRAG;

const TAB_CROSS_IMG_PATH = "./images/cross.svg";

function moveTab(tabParent: HTMLUListElement, position: { x: number; y: number; }, pointer: HTMLLIElement): void
{
    let result: HTMLLIElement;
    if (!Array.from(tabParent.children).some((element: HTMLLIElement) =>
    {
        if (element.classList.contains("dragging"))
        {
            return false;
        }

        const bounds = element.getBoundingClientRect();
        if (position.x < bounds.left + (bounds.width / 2))
        {
            result = element;
            return true;
        }

        return false;
    }))
    {
        tabParent.appendChild(pointer);
    }

    tabParent.insertBefore(pointer, result);
}
export class Tab
{
    tabElement: HTMLLIElement;
    content: SubDoc;
    name: string;
    setActive(value: boolean): void
    {
        [ this.tabElement, this.content.root ].forEach(element => value ? element.classList.add("selected") : element.classList.remove("selected"));
    }

    constructor (tabParent: HTMLUListElement, contentParent: HTMLUListElement, name: string, subdocPath: string, onReady: () => void = () => { })
    {
        this.name = name;

        this.tabElement = document.createElement("li");
        this.tabElement.innerHTML = `<h3>${name}</h3>`;

        const tabCross = document.createElement("img");
        tabCross.src = TAB_CROSS_IMG_PATH;
        this.tabElement.appendChild(tabCross);

        tabParent.appendChild(this.tabElement);

        const contentElement = document.createElement("li");
        contentParent.appendChild(contentElement);

        this.content = new SubDoc(subdocPath, contentElement, onReady);
    }
}

export class TabCollection
{
    tabs: { [ name: string ]: Tab; };
    tabParent: HTMLUListElement;
    contentParent: HTMLUListElement;

    selectedTab: Tab;
    dragging: Tab;

    pointer: HTMLLIElement;

    mouseUp: () => void;
    mouseMove: () => void;

    dragStart: {
        x: number;
        y: number;
    };
    dragCurrent: {
        x: number;
        y: number;
    };

    createTab(name: string, subdocPath: string, autoSelect: boolean = true): Tab
    {
        if (name in this.tabs)
        {
            return null;
        }

        const tab: Tab = new Tab(this.tabParent, this.contentParent, name, subdocPath, () =>
        {
            this.tabs[ name ] = tab;
            tab.tabElement.addEventListener("mousedown", (event: MouseEvent) =>
            {
                if (event.button === 0)
                {
                    this.dragStart = { x: event.clientX, y: event.clientY };
                    this.mouseUp = () =>
                    {
                        this.selectTab(tab);
                        this.mouseUp = null;
                        this.mouseMove = null;
                    };

                    this.mouseMove = () =>
                    {
                        const dragRelative = { x: this.dragCurrent.x - this.dragStart.x, y: this.dragCurrent.y - this.dragStart.y };
                        const distanceSquared = dragRelative.x * dragRelative.x + dragRelative.y * dragRelative.y;

                        if (distanceSquared >= DISTANCE_FOR_DRAG_SQUARED)
                        {
                            tab.tabElement.classList.add("dragging");

                            moveTab(this.tabParent, this.dragCurrent, this.pointer);

                            this.mouseUp = () =>
                            {
                                this.mouseUp = null;
                                this.mouseMove = null;

                                this.tabParent.removeChild(this.pointer);
                                moveTab(this.tabParent, this.dragCurrent, tab.tabElement);

                                tab.tabElement.classList.remove("dragging");
                            };

                            this.mouseMove = () =>
                            {
                                tab.tabElement.style.left = this.dragCurrent.x - (tab.tabElement.offsetWidth / 2) + "px";
                                tab.tabElement.style.top = this.dragCurrent.y - (tab.tabElement.offsetHeight / 2) + "px";

                                this.tabParent.removeChild(this.pointer);

                                moveTab(this.tabParent, this.dragCurrent, this.pointer);
                            };
                        }
                    };
                }
            });

            if (autoSelect)
            {
                this.selectTab(tab);
            }

            return tab;
        });
    }

    selectTab(tab: Tab | string)
    {
        const targetTab: Tab = (typeof tab === "object") ? tab : ((tab in this.tabs) ? this.tabs[ tab ] : null);

        if (targetTab === null)
        {
            return;
        }

        if (this.selectedTab === targetTab)
        {
            return;
        }

        if (this.selectedTab !== null)
        {
            this.selectedTab.setActive(false);
        }
        targetTab.setActive(true);

        this.selectedTab = targetTab;
    }

    constructor (tabParent: HTMLUListElement, contentParent: HTMLUListElement)
    {
        this.tabs = {};
        this.tabParent = tabParent;
        this.contentParent = contentParent;
        this.selectedTab = null;
        this.dragging = null;
        this.pointer = document.createElement("li");
        this.mouseUp = null;
        this.mouseMove = null;
        this.dragStart = { x: 0, y: 0 };
        this.dragCurrent = { x: 0, y: 0 };

        this.pointer.id = "tab-pointer";

        document.addEventListener("mouseup", (event: MouseEvent) =>
        {
            if (event.button === 0 && this.mouseUp !== null)
            {
                this.mouseUp();
            }
        });

        document.addEventListener("mousemove", (event: MouseEvent) =>
        {
            if (this.mouseMove !== null)
            {
                this.dragCurrent = { x: event.clientX, y: event.clientY };
                this.mouseMove();
            }
        });
    }
}