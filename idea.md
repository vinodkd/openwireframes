mockup tool idea
to display a mockup we need:
	- the display of the widget, which consists of:
		- the div structure or html element
		- the css
	- the data to display

in yaml format, therefore, use of the mockup fw could be something like:

	uses: ['base', 'wa']
	ui: [ *h, *b, *f ]

	header: &h
		<< : *2COLROW
		ui: [*title,*forkMeSash]
		title:
			.text: JS-YAML demo. YAML Javascript Parser
		forkMeSash:
			.sash: Fork me on Github
	body: &b
		- sourcePanel
		- resultPanel
	footer: &f

	uses: ['base','wa']
	ui:
		- header:

there are widgets and containers, which can be std or custom. so a definition of an element is:

name: nameUsedAsType
container: yes/no
slots: #values to be used in ui below
ui: # ui representation which can contain:
	htmlelementname - if none provided, assume div
	.cssClass - css class applied to div

