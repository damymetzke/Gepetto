# Gepetto
Gepetto is a personal project. It's on github primarily to share with peers, however it isn't licenced because it is not the intention to share this with the general public (but feel free to look through it, I don't mind).

This project has build information for Visual Studio Code, but should work with other editors with some extra setup (untested).

## Setup
Prerequisites:

- nodejs + npm: ([download](https://nodejs.org/en/download/))
- an editor, I recommend 'Visual Studio Code(vsc)': ([download](https://code.visualstudio.com/Download))
- (optional) python is used to build the markdown documentation ([download](https://www.python.org/downloads/))

### Step 1: root folder
the root folder for the project is './html/'; open vsc, or your editor of choice, here.

### Step 2: install node packages
when in the root folder open a terminal and run `npm install`. This will automatically install all packages in 'package.json'

## Running
There are 2 ways of running the code:

- npm run:
this is guarenteed to work for all editors. Make sure you run it from the root directory ('./html/').
- debug mode:
on vsc simply press f5, or go to [Run -> Start Debugging]. This has the benefit of allowing breakpoints, stepping and more. For other editors manual setup is probably required; view more information about this [here](https://nodejs.org/en/docs/guides/debugging-getting-started/).

*when debugging in another editor make sure to call the npm script `compile:sass`, using the command `npm run compile:sass`, in order to build the css file.*

## Testing
This project comes with the jest testing framework. Right now only the files under 'scripts/core/' are tested. The test scripts are under 'scripts/test/'. To run the tests simply run `npm test` from the root directory ('./html/').

## Build Documentation
This project comes with 2 types of documentation:
- [jsdoc](https://jsdoc.app/)
- markdown

in order to build the documentation simply run the npm script `build:docs` using `npm run build:docs`. This will put the output in './html/documentation/build/'