# Auto load more
Loads more items on the list view as the user scrolls

## Dependencies
Mendix 6.

## Demo project
http://autoloadmore.mxapps.io

![1](https://raw.githubusercontent.com/mendixlabs/auto-load-more/1.1.0/assets/demo.gif)

## Usage
- Place the widget in the same page/snippet as the target list view (right below it).
- Add the name of the target list view to the widget (found in the common tab of the list view properties in the modeler)

## Issues, suggestions and feature requests
We are actively maintaining this widget, please report any issues or suggestions for improvement
https://github.com/mendixlabs/auto-load-more/issues

## Development
Prerequisite: Install git, node package manager, webpack CLI, grunt CLI

To contribute, fork and clone.

    > git clone https://github.com/mendixlabs/auto-load-more.git

The code is in typescript. Use a typescript IDE of your choice, like Visual Studio Code or WebStorm.

To set up the development environment, run:

    > npm install

Create a folder named `dist` in the project root.

Create a Mendix test project in the dist folder and rename its root folder to `dist/MxTestProject`. Or get the test project from
https://github.com/mendixlabs/auto-load-more/releases/download/1.1.0/TestAutoLoadMore.mpk Changes to the widget code shall be automatically pushed to this test project.

To automatically compile, bundle and push code changes to the running test project, run:

    > grunt
