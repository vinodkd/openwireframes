// owf.js
var owf = {
	widgets: {
		SPAN: {
		    slots: {text: "Lorem Ipsum "},
		    ui: "<span style=\"${css}\">${text}</span>",
		    css: "{width:99%}"
		},
		TITLE: {
		    slots: {text: "Lorem Ipsum "},
		    ui: "<h1 style=\"${css}\">${text}</h1>",
		    css: ""
		},
		'2ROW': {
		    contents: ["r1", "r2"],
		    ui: "<div class=''>${0} ${1}</div>",
		    css: "{width:99%}"
		},
		'3COLUMN': {
		    contents: ["c1", "c2", "c3"],
		    ui: "<div class=''>${0} ${1} ${2}</div>",
		    css: "{width:99%}"
		},
		TEXTAREA: {
		    slots: {text: "Lorem Ipsum "},
		    ui: "<textarea class='lofibox' style=\"${css}\">${text}</textarea>",
		    css: "{width:99%}"
		},
		BUTTON: {
		    slots: {text: "Lorem Ipsum "},
		    ui: "<input class='lofibox' type=button value='${text}' style=\"${css}\"/>",
		    css: "{width:99%}"
		},
		DIV: {
		    slots: {content: "Lorem Ipsum "},
		    ui: "<div class='lofibox' style=\"${css}\">${content}</div>",
		    css: "{width:99%}"
		}
	},
	widget: {
		render: function (ast) {
			var type = ast.is;
			var widget = owf.widgets[type];
			if(!widget || !widget.slots)
				throw 'unknown widget type:' + type;

			ast["slots"] = widget.slots;
			var out = widget.ui;
			for(var slot in ast.slots){
				out = out.replace('${'+slot+'}',ast[slot]);	
			}
			if(widget.css){
				out = out.replace('${css}',widget.css);
			}
			return out;
		}
	},
	container:{
		render: function (ast) {
			if(ast.has){
				// get child content
				for(var c in ast.has){
					var childName = ast.has[c];
					var child = ast[childName];
					child['content'] = owf.container.render(child);
				}
				// add child content as another slot
				ast.has.push("content");
				ast['content'] = content;
				if(!ast.ui) ast.ui = "${content}";
				// render posiitonal pieces of container
				return owf.container.renderSelf(ast);
			}else{
				return owf.widget.render(ast);
			}
		},
		renderSelf: function (ast) {
			var type = ast.is;
			var container = owf.widgets[type];
			if(!container || !container.contents)
				throw 'unknown container type:' + type;

			// subtracting 1 since we added contents to has array.
			if((ast.has.length-1) != container.contents.length)
				throw 'Expecting:' + container.contents.length + ' contents, found:' + (ast.has.length-1);

			ast["contents"] = container.contents;
			var out = container.ui;
			for(var c in ast.has){
				out = out.replace('${'+c+'}',ast[ast.has[c]].content);	
			}
			if(container.css){
				out = out.replace('${css}',container.css);
			}
			return out;
		}
	},
	view: {
		render: function (ast) {
			var baseView = owf.container.render(ast);
			var out = '<html>'
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
				+ baseView
				+ '</body>'
				+ '</html>';
			return out;
		}
	}
}
