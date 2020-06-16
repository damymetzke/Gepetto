import { SubDoc } from "./subdoc_alt.js";

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

    mouseUp: () => void;
    mouseMove: (x: number, y: number) => void;

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
                    this.mouseUp = () =>
                    {
                        this.selectTab(tab);
                        this.mouseUp = null;
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
        this.mouseUp = null;
        this.mouseMove = null;

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
                this.mouseMove(event.pageX, event.pageY);
            }
        });
    }
}