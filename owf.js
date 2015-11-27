// owf2.js
var owf = {
	render: function (ast) {
		var name = ast['name'], typeName = ast['type'];
		if(name == null)
			throw 'name cannot be null';
		if(typeName == null)
			throw name + 'needs a type';
		var type = owf.shapes[typeName];
		if(type == null)
			throw name + '\'s type -' + type + '- is unknown';
		var view = owf[type.kind].render(ast);
		if(type.isRoot)
			return view;
		else
			return owf.wrapView(view);
	},
	wrapView : function (view) {
		var wview = '<html>'
			+ '<head>'
			+ '	<title></title>'
			+ '	<style type="text/css">'
			+ '	* {'
			+ '		font-family: "Comic Sans MS";'
			+ '	}'
			+ '	.lofibox {'
			+ '		border-image: url(boxbg.png) 25 25 25 25; border-style: solid;'
			+ '		border-width: 0.5em;'
			+ '	}'
			+ '	</style>'
			+ '<body>'
			+ view
			+ '</body>'
			+ '</html>';
		return wview;
	},
	widget: {
		// renders a widget by returning a string containing its view in html
		// expects the ast.type to map to a known type of shape
		// each shape type should have
		//   * a kind
		//   * slots, which are values into which instances can provide data.
		//     * if none are specified, a single slot called value is used by default.
		//   * a view which can be a string or a function
		//     * if its a string, render uses defaultView to interpolate values in the string using ${} notation.
		//     * if its a function, render expectes it to be of type fn(shape,ast) returns string. [TBD]
		//   * border: true: denotes a widget that needs a border to be drawn.
		//   * root: true/false: denotes that a widget is the root widget and doesnt need to be wrapped.

		// a widget instance should have a name, the type and slot nv pairs

		render: function (ast) {
			var shape = owf.shapes[ast.type];
			if(shape.kind != 'widget')
				throw 'widget.render renders only widgets.' + ast.type + 'has a different kind';
			var view = owf.widget.defaultView(shape,ast);
			return view;
		},
		defaultView: function (shape,ast) {
			if(shape.slots == null)
				shape.slots = {'value': ''};
			var view = shape.view;
			for(var s in shape.slots){
				var val = ast[s];
				if(val == undefined)
					val = shape.slots[s];
				if(val == undefined)
					val = '';
				view = view.replace('${' + s + '}', val);
			}
			// handle style now
			var style = '';
			if(shape.style != undefined){
				style = 'style="'+shape.style+'"'
			}
			style = 'class="'+ (shape.hasBorder? 'lofibox' : '')  +'" ' + style;
			view = view.replace('${style}', style);
			return view;
		}
	},
	container: {
		// renders a container, which is defined by
		// * a kind
		// * a view for the container itself
		// * contents array of views for each slot in its contents.

		render: function (ast) {
			var shape = owf.shapes[ast.type];
			if(shape.kind != 'container')
				throw 'container.render renders only containers.' + ast.type + 'has a different kind';
			if(shape.contents == null)
				throw 'container ' + ast.type + 'doesnt have any contents. needs redefinition'
			if(ast.has == null)
				throw ast.name + ' needs a "has" attribute to use ' + ast.type
			if(ast.has.length != shape.contents.length)
				throw ast.name + ' has ' + ast.has.length + ' contents, needs ' +shape.contents.length+ 'to use ' + ast.type

			var view = owf.container.defaultView(shape,ast);
			return view;
		},
		defaultView: function (shape,ast) {
			var childrenView = '';
			for(var c in shape.contents){
				var child = ast.has[c];
				var childView = owf.render(child);
				childrenView += owf.container.defaultChildView(shape.contents[c], childView);
			}
			var view = shape.view.replace('${content}',childrenView);
			// handle style now
			var style = '';
			if(shape.style != undefined){
				style = 'style="'+shape.style+'"'
			}
			view = view.replace('${style}', style);
			return view;
		},
		defaultChildView: function (childShape,childView) {
			return childShape.replace('${value}', childView);
		}
	},
	state: {
		render: function (ast) {
			
		}
	},
	app: {
		render: function (ast) {
			
		}
	},
	shapes: {
		text: {
			kind: 'widget',
			view: "<span ${style}>${value}</span>",
			slots: {value: 'Lorem Ipsum'},
			style: 'font-weight:bold'
		},
		title: {
			kind: 'widget',
			view: "<h1 ${style}>${value}</h1>",
			slots: {value: 'Lorem Ipsum'},
			style: ''
		},
		textbox: {
			kind: 'widget',
			view: "<input ${style} type=text value='${value}'></input>",
			slots: {value: 'Lorem Ipsum'},
			style: '',
			hasBorder: true
		},
		textarea: {
			kind: 'widget',
			view: "<textarea ${style}>${value}</textarea>",
			slots: {value: 'Lorem Ipsum'},
			style: '',
			hasBorder: true
		},
		button: {
			kind: 'widget',
			view: '<input ${style} type=button value="${value}"/>',
			slots: {value: 'Ok'},
			hasBorder: true
		},
		twocolumns: {
			kind: 'container',
			view: '<div ${style}>${content}</div>',
			contents: ['<div style="float:left">${value}</div>','<div style="float:right">${value}</div>'],
		},
		threecolumns: {
			kind: 'container',
			view: '<div ${style}>${content}</div>',
			contents: ['<div style="float:left;width:33%">${value}</div>','<div style="float:left;width:33%">${value}</div>','<div style="float:right;width:33%">${value}</div>'],
		},
		tworows: {
			kind: 'container',
			view: '<div ${style}>${content}</div>',
			contents: ['<div style="width:100%;height:49%">${value}</div>','<div style="width:100%;height:49%">${value}</div>'],
		},
	}
}
