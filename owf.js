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
		// see below for rules

		// a widget instance should have a name, the type and slot nv pairs

		render: function (ast) {
			var shape = owf.shapes[ast.type];
			if(shape.kind != 'widget')
				throw 'widget.render renders only widgets.' + ast.type + 'has a different kind';
			var view;
			if(typeof(shape.view) == 'string') 
				view = owf.widget.defaultView(shape,ast);
			else if(typeof(shape.view) == 'function')
				view = shape.view(shape,ast);
			return view;
		},
		defaultView: function (shape,ast) {
			if(shape.slots == null)
				shape.slots = {'value': ''};
			var view = shape.view;
			for(var s in shape.slots){
				if(s == 'width' || s == 'height')
					continue;
				var val = ast[s];
				if(val == undefined)
					val = shape.slots[s];
				if(val == undefined)
					val = '';
				view = view.replace('${' + s + '}', val);
			}
			// handle style now
			var style = 'style="' + ((shape.style != undefined && shape.style != '') ? shape.style + ';' : '');
			var width = ast['width'];
			if(width && (width != undefined || width != ''))
				width = '100%';
			var height = ast['height'];
			if(height && (height != undefined || height != ''))
				height = '100%';

			style += 'width:'+width+';height:'+height+';';
			style += '"'
			style = 'class="'+ (shape.hasBorder? 'lofibox' : '')  +'" ' + style;
			view = view.replace('${style}', style);
			return view;
		}
	},
	container: {
		// renders a container, which is defined by rules in shape library
		render: function (ast) {
			var shape = owf.shapes[ast.type];
			if(shape.kind != 'container')
				throw 'container.render renders only containers.' + ast.type + 'has a different kind';
			if(shape.contents == null)
				throw 'container ' + ast.type + 'doesnt have any contents. needs redefinition'
			if(ast.has == null)
				throw ast.name + ' needs a "has" attribute to use ' + ast.type
			var view;
			if(typeof(shape.view) == 'string')
				view = owf.container.defaultView(shape,ast);
			else if(typeof(shape.view) == 'function')
				view = shape.view(shape,ast);
			return view;
		},
		defaultView: function (shape,ast) {
			if(ast.has.length != shape.contents.length)
				throw ast.name + ' has ' + ast.has.length + ' contents, needs ' +shape.contents.length+ 'to use ' + ast.type
			var childrenView = '';
			for(var c in shape.contents){
				var child = ast.has[c];
				var childView = owf.render(child);
				var childShape = shape.contents[c];

				if(typeof(childShape) == 'string')
					childrenView += owf.container.defaultChildView(childShape, childView);
				else if(typeof(childShape.view) == 'function')
					childrenView += childShape(childView);
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
	// rules for shapes:
	// kind: required. One of widget, container, state or app
	// slots: optional.array of name-value pairs. Names are used to map from the instance. Values are default values
	// 		Default: if there's only one value, skip defining it and owf will use a single slot called 'value'
	// view: required.string or function.
	// 		If string, should have ${} delimited names from slots for replacement.
	//			In addition, the string should have a '${shape}' string in the appropriate place 
	// 			that stands for *both* the class attribute and the style attribute of the generated element.
	// 			owf replaces this string with: `class = "..." style = "..."`
	// 		if function, should have signature str=fn(shape,ast) where
	//			str = returned string containing html view in a div
	//			shape = shape definition passed in by owf
	//			ast = part of the instance's ast parsed by owf and passed into the function.
	// style: optional. css styles appled to the instance's view. Default: empty string.
	// width and height: optional. dimensions supplied separately from slots in the shape definition, 
	// 					but supplied along with other slot values in the instance. owf will take these values
	// 					and add them to the style attribute. html width and height attributes are not used.
	// 		Default: 100% or 99% for all elements.
	// border: optional. true denotes a widget that needs a border to be drawn. owf will then draw a lo-fi border
	//		Default: false
	// root: optional. true denotes that a widget is the root widget and doesnt need to be wrapped in std markup
	// 		only shapes of kind 'app' are expected to have this field and their view function is expected to handle:
	// 			- overall html markup
	// 			- setting up the global css styles for boxes and fonts
	//		Default: false
	//
	// Rules for container
	// kind: required. Same as above
	// view: required. string or function as above. 
	// 		if string, must use the strings `${content}` and `${shape}` somewhere. The former marks the place where
	// 			the children are placed and the latter is as above.
	// 		if function, should handle rendering of entire shape. May use the contents field or not, but if it *is*
	// 			used, then must follow rules below.
	// contents: required. Can be and array or a single value.
	// 	 	if array, the array can be made of strings or functions. The number of `has` items in the instance must
	// 			match this array size. If strings are supplied, the default logic is used, which delegates to  the 
	//			default widget logic. If functions are supplied, they are run.
	// 		if single value, it can be a single string or a single function. The string or function is applied to
	// 			every value in the instance's `has` element.
	// 		Default: array of strings.

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
