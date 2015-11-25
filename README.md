README.md
=========

Open Wireframes allows creation of UI mockups using a simple text syntax. This is similar to Markdown for document creation: you create a UI mockup by describing the views and OWF mocks them up using HTML and CSS.

See demo at URL TBD

The project is at a very early stage, but it has:

* A library of basic shapes: text, span, textarea, div and some basic containers like 2-row and 3-column.
* Ability to define the layout as a hierarchy of UI elements using a YAML-based syntax
* Support for canned text that can be overridden
* Lo-fi Display similar to other wireframing tools

Next Steps
-----------

* Separate out the editor interface, the core logic and shape library.
* Allow multiple views or screens of UI to be created. Currently, there's only one view displayed.
* Save mockup as file.
* Bundling OWF into a website, desktop app using NW.js or Electron, node package etc.
* Adding support for stencils and themes (Windows vs Android vs Cocoa, for example)
* Since OWF is built using HTML and CSS, it should be relatively easy to use existing frameworks such as JQuery UI and Bootstrap.
* 