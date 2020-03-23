import * as Dropdown from "./dropdown.js";
import * as Tabs from "./tabs.js";
import * as ContentLoader from "./content-loader.js";

import * as ObjectEditorMain from "./object-editor-main.js";

export function Run(root)
{
    Dropdown.OnScriptLoad(root);
    Tabs.OnScriptLoad(root);

    const target = document.getElementById("main").children[0];
    ContentLoader.LoadContent(new ContentLoader.Content(ObjectEditorMain.Run, "./object-editor.html"), target);
}