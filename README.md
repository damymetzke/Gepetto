https://github.com/damymetzke/Gepetto/workflows/Jest%20automatic%20test/badge.svg

# Gepetto
Gepetto is a personal project.
It's on GitHub primarily to share with peers, however it isn't licenced because it is not the intention to share this with the general public (but feel free to look through it, I don't mind).

This project has build information for Visual Studio Code, but should work with other editors with some extra setup (untested).

## Setup
Prerequisites:

- [nodejs](https://nodejs.org/en/download/) + npm
- an editor, I recommend '[Visual Studio Code](https://code.visualstudio.com/Download)' (VS Code); The project also contains vsc-specific setup files.

### Step 1: install Node packages
When in the root folder open a terminal and run `npm install`.
This will automatically install all packages in `package.json`

## Running
There are 2 ways of running the code:

- `npm start`:
This is guaranteed to work in all environments that support Node.
- debug mode: in VS Code press the F5 function key, or go to [Run -> Start Debugging].
This has the benefit of allowing breakpoints, stepping and more.
For other editors manual setup is probably required; read more information [here](https://nodejs.org/en/docs/guides/debugging-getting-started/).

*When debugging in another editor make sure to call the npm script `compile:all`, using the command `npm run compile:all`, in order to compile the project.*

## Testing
This project comes with the Jest testing framework.
Right now only the files under `src/core/` are tested.
The test scripts are under `src/test/`.
To run the tests simply run `npm test`.

## Build Documentation
This project comes with 2 types of documentation:
- [typedoc](https://typedoc.org/)
- [markdown](https://en.wikipedia.org/wiki/Markdown)

In order to build the documentation simply run the npm script `build:docs` using `npm run build:docs`.
This will put the output in `./documentation/build/`

## Npm Scripts
There are quite a lot of npm scripts.
To understand all of them you must first understand how the names are setup:
Any name before a colon `:` is a category (e.g. `build:*`). right now there are 3 categories:

- `setup` will setup files in such a way compilation can begin.
- `compile` will transform the source files into a working program.
- `build` will do any other tasks that are not required for the core program to work.

Any pound sign `#` signifies a sub-script (e.g. `compile:app#*`).
These should not be called on their own by the user, and are to be called by their owning script (in this example `compile:app`).

There are 2 js files that have special meaning in the context of scripts:

- `run-scripts.js` will run any number of scripts you pass to it as arguments. This is often used to call all sub-scripts. The reserved keyword `then` can be used to ensure some scrips are called after other scripts. If any script failes the executions stops before getting to the scripts after the next `then`.
- `wrap_command.js` will wrap a command and provide support for 'variables'. Currenly the only variable type is known as `build_config`. adding `{build_config:key.key...}` to the wrapped command will search for that value in the `./config/build.config.json` file based on the keys provided.

Currently there are the following commands of interest:

- `clean` clean all non-required directories.
- `start` will create and start the electron app (without editor debugging).
- `test` will create and run the test scripts using jest.
- `build` will compile the core project and build everything else (e.g. documentation).
- `pack` package the project with no installer.
- `dist` package the project with installer for distribution.

## Project Structure
The following folders are used for input:

- `./html/` html files, are plainly copied.
- `./src/` source code files, are compiled into javascript.
- `./style/` sass files, are compiled into css.
- `./documentation/md/` markdown files, compiled into html.

The folowing folders are used for output:

- `./out/` output used by application.
- `./dev_out/` output not used by application (e.g. test scripts).
- `./documentation/build/` output for documentation.
- `./distribution/` output for distribution files.

`./config/` is used for configuration files.

The source code (`./src/`) has the following subfolders:
- `./src/core/` holds scripts shared by other parts. Is copied to other subfolders before they are compiled.
- `./src/front` holds scripts used by the 'front' or render processes of Electron. These are compiled to `./out/src/front`, using ES6 modules.
- `./src/back` holds scripts used by the 'back', or main process of Electron. These are compiled to `./out/src/back`, using CommonJS modules.
- `./src/test/` holds scripts used by jest, the testing framework. These are compiled to `./dev_out/test`, using CommonJS modules.
