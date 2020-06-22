import { SubDoc } from "./subdoc_alt.js";
import { Menu as menuType, MenuItem as MenuItemType } from "electron";

const { Menu, MenuItem } = require("electron").remote;

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

export interface TabContentImplementation
{
    onInit: (root: SubDoc, name: string) => void;
    onDestroy: (root: SubDoc, name: string) => void;
    onSave: (root: SubDoc, name: string) => void;
}

export class Tab
{
    owner: TabCollection;
    tabElement: HTMLLIElement;
    content: SubDoc;
    name: string;
    implementation: TabContentImplementation;

    contextMenu: menuType;
    setActive(value: boolean): void
    {
        [ this.tabElement, this.content.root ].forEach(element => value ? element.classList.add("selected") : element.classList.remove("selected"));
    }


    constructor (owner: TabCollection, tabParent: HTMLUListElement, contentParent: HTMLUListElement, name: string, subdocPath: string, implementation: TabContentImplementation, onReady: () => void = () => { })
    {
        this.owner = owner;
        this.name = name;

        this.contextMenu = new Menu();
        this.contextMenu.append(new MenuItem({
            label: "Close",
            click: () =>
            {
                this.implementation.onDestroy(this.content, this.name);
                this.content.destroy(true);
                this.tabElement.parentElement.removeChild(this.tabElement);
                this.owner.destroyTabImplementation(this);
            }
        }));
        this.contextMenu.append(new MenuItem({
            label: "Save",
            click: () =>
            {
                this.implementation.onSave(this.content, this.name);
            }
        }));

        this.implementation = implementation;

        this.tabElement = document.createElement("li");
        this.tabElement.innerHTML = `<h3>${name}</h3>`;

        const tabCross = document.createElement("img");
        tabCross.src = TAB_CROSS_IMG_PATH;
        this.tabElement.appendChild(tabCross);

        tabCross.addEventListener("click", (event: MouseEvent) =>
        {
            if (event.button !== 0)
            {
                return;
            }

            this.implementation.onDestroy(this.content, this.name);
            this.content.destroy(true);
            this.tabElement.parentElement.removeChild(this.tabElement);
            this.owner.destroyTabImplementation(this);
        });

        this.tabElement.addEventListener("contextmenu", (event: MouseEvent) =>
        {
            this.contextMenu.popup();

        });

        tabParent.appendChild(this.tabElement);

        const contentElement = document.createElement("li");
        contentParent.appendChild(contentElement);

        this.content = new SubDoc(subdocPath, contentElement, onReady);

        implementation.onInit(this.content, name);
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

    createTab(name: string, subdocPath: string, implementation: TabContentImplementation, autoSelect: boolean = true): Tab
    {
        if (name in this.tabs)
        {
            return null;
        }

        const tab: Tab = new Tab(this, this.tabParent, this.contentParent, name, subdocPath, implementation, () =>
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

    destroyTabImplementation(tab: Tab)
    {
        if (!(tab.name in this.tabs))
        {
            return;
        }

        const isSelected = (tab === this.selectedTab);

        delete this.tabs[ tab.name ];
        if (isSelected)
        {
            this.selectedTab = null;
            //todo: use a more logical method to select next tab (eg. use tab history)
            for (const name in this.tabs)
            {
                this.selectTab(this.tabs[ name ]);
                break;
            }
        }
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