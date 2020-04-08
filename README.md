# Gepetto
Gepetto is a personal project. It's on github primarily to share with peers, however it isn't licenced because it is not the intention to share this with the general public (but feel free to look through it, I don't mind).

This project has build information for Visual Studio Code, but should work with other editors with some extra setup (untested).

## Setup
Prerequisites:

- nodejs + npm: ([download](https://nodejs.org/en/download/))
- an editor, I recommend 'Visual Studio Code(vsc)': ([download](https://code.visualstudio.com/Download))
- a sass compiler. This depends on your editor, but I recommend 'Live Sass Compiler' for vsc: ([download](https://marketplace.visualstudio.com/items?itemName=ritwickdey.live-sass), or search 'Live Sass Compiler' in vsc)

### Step 1: root folder
the root folder for the project is './html/'; open vsc, or your editor of choice, here.

### Step 2: install node packages
when in the root folder open a terminal and run `npm install`. This will automatically install all packages in 'package.json'

### Step 3: enable sass compiling
enable your sass compiler. With the recommended copiler there should be a button on the bottom bar called 'Watch Sass'. If you don't have a live compiler you need to recompile everytime you change a scss file. If you don't compile the scss files no styling will be used in the html pages and the result will be very odd.

## Running
There are 2 ways of running the code:

- npm run:
this is guarenteed to work for all editors. Make sure you run it from the root directory ('./html/').
- debug mode:
on vsc simply press f5, or go to [Run -> Start Debugging]. This has the benefit of allowing breakpoints, stepping and more. For other editors manual setup is probably required; view more information about this [here](https://nodejs.org/en/docs/guides/debugging-getting-started/).

## Testing
This project comes with the jest testing framework. Right now only the files under 'scripts/core/' are tested. The test scripts are under 'scripts/test/'. To run the tests simply run `npm test` from the root directory ('./html/').

## jsdoc
This project comes with jsdoc documentation. For more information click [here](https://jsdoc.app/). To generate the documentation simply run `.\node_modules\.bin\jsdoc -c .\jsdoc.config.js` from the root directory ('./html/'). This will output the documentation to 'documentation/js-doc-output/'. open '[index.html](./html/documentation/js-doc-output/index.html)' in that folder *after generation* to view the documentation.