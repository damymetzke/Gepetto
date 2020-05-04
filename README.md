# Gepetto
Gepetto is a personal project. It's on github primarily to share with peers, however it isn't licenced because it is not the intention to share this with the general public (but feel free to look through it, I don't mind).

This project has build information for Visual Studio Code, but should work with other editors with some extra setup (untested).

## Setup
Prerequisites:

- [nodejs](https://nodejs.org/en/download/) + npm
- an editor, I recommend '[Visual Studio Code](https://code.visualstudio.com/Download)' (vsc)
- (optional) [python](https://www.python.org/downloads/) is used to build the markdown documentation

### Step 1: install node packages
when in the root folder open a terminal and run `npm install`. This will automatically install all packages in `package.json`

## Running
There are 2 ways of running the code:

- npm start:
this is guarenteed to work in all environments that support node.
- debug mode:
on vsc simply press f5, or go to [Run -> Start Debugging]. This has the benefit of allowing breakpoints, stepping and more. For other editors manual setup is probably required; view more information about this [here](https://nodejs.org/en/docs/guides/debugging-getting-started/).

*when debugging in another editor make sure to call the npm script `compile:all`, using the command `npm run compile:all`, in order to compile the project.*

## Testing
This project comes with the jest testing framework. Right now only the files under `src/core/` are tested. The test scripts are under `src/test/`. To run the tests simply run `npm test`.

## Build Documentation
This project comes with 2 types of documentation:
- [jsdoc](https://jsdoc.app/)
- markdown

in order to build the documentation simply run the npm script `build:docs` using `npm run build:docs`. This will put the output in './documentation/build/'