import { SubDoc } from "./subdoc_alt";

export class Tab
{
    tabElement: HTMLLIElement;
    content: SubDoc;
    name: string;
    setActive(value: boolean): void
    {
        [ this.tabElement, this.content.root ].forEach(element => value ? element.classList.add("selected") : element.classList.remove("selected"));
    }

    constructor (tabParent: HTMLUListElement, contentParent: HTMLUListElement, name: string, subdocPath: string)
    {
        this.name = name;

        this.tabElement = document.createElement("li");
        this.tabElement.innerHTML = `<h3>${name}</h3>`;
        tabParent.appendChild(this.tabElement);

        const contentElement = document.createElement("li");
        contentParent.appendChild(contentElement);

        this.content = new SubDoc(subdocPath, contentElement);
    }
}

export class TabCollection
{
    tabs: { [ name: string ]: Tab; };
    tabParent: HTMLUListElement;
    contentParent: HTMLUListElement;

    selectedTab: Tab;

    createTab(name: string, subdocPath: string, autoSelect: boolean = true): Tab
    {
        if (name in this.tabs)
        {
            return null;
        }

        const tab = new Tab(this.tabParent, this.contentParent, name, subdocPath);
        this.tabs[ name ] = tab;

        if (autoSelect)
        {
            this.selectTab(tab);
        }

        return tab;
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
    }
}