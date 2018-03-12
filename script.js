(function(window){
	function App(view, model){
		this.editors = []
		this.activeEditor = null
		this.view = view
		this.model = model
	}

	App.prototype.init = function(){
		this.activeEditor = 0
		this.view.render()
		//this.view.editorref.addEventListener('keypress', this.oneditorinput.bind(this))
		this.view.saveref.addEventListener("click", this.saveCode.bind(this))
		this.view.runref.addEventListener("click", this.runCode.bind(this))
		this.view.createNewTabref.addEventListener("click", this.createNewTab.bind(this))
		this.view.tabnavref.addEventListener("click", this.handletabnavclick.bind(this))
		this.view.clearconsole.addEventListener("click", this.handleClearConsoleButton.bind(this))
		this.view.clearConsole()
	}

	App.prototype.changeSelectedEditor = function(index){
		this.activeEditor = index
		this.view.render()
	}

	App.prototype.createNewTab = function(){
		this.model.createNewTab()
		const data = this.model.getData()
		this.activeEditor = data.editorVal.length - 1
		this.view.render()
	}

	App.prototype.saveCode = function(){
		const code = this.view._editor.getValue()
		this.model.saveCode(code, this.activeEditor)
	}

	App.prototype.runCode = function(){
		const code = this.view._editor.getValue()
		const f = new Function(code)
		try{
			this.catchconsolelog()
			const out = f()
			this.view.addToConsole(out, 'result')
		} catch(e){
			debugger
			console.log(e)
		}
	}

	App.prototype.catchconsolelog = function(){
		const _log = console.log,
			  _warn = console.warn,
			  _error = console.error

		console.log = (text)=>{
			this.view.addToConsole(text, 'console')
			return _log.apply(console, arguments)
		}

		console.warn = (text)=>{
			this.view.addToConsole(text, 'console')
			return _warn.apply(console, arguments)
		}

		console.error = (text)=>{
			this.view.addToConsole(text, 'console')
			return _error.apply(console, arguments)
		}
	}

	App.prototype.handletabnavclick = function(e){
		const selectTab = (tab)=>{
			const index = Array.prototype.map.call(tab.parentNode.children,node => node === tab).indexOf(true)
			this.selectTab(index)

		}
		const closeTab = (tab)=>{
			const index = Array.prototype.map.call(tab.parentNode.children,node => node === tab).indexOf(true)
			this.closeTab(index)
		}

		if(e.target.className === "inditabclose"){
			closeTab(e.target.parentNode)
		} else if(e.target.className === "inditabtext"){
			selectTab(e.target.parentNode)
		} else if(e.target.className === "inditab"){
			selectTab(e.target)
		}
	}

	App.prototype.closeTab = function(i){
		this.model.deleteTab(i)
		this.view.render()
	}

	App.prototype.selectTab = function(i){
		const code = this.view._editor.getValue()
		this.model.saveCode(code)
		this.model.changeSelectedEditor(i)
		this.view.render()
	}

	App.prototype.handleClearConsoleButton = function(){
		this.view.clearConsole()
	}

	function View(model){
		this.model = model
		this.editorref = document.getElementById("editor")
		this.saveref = document.getElementById("save")
		this.runref = document.getElementById("run")
		this.createNewTabref = document.getElementById("createnewref")
		this._editor = ace.edit("editor");
	    this._editor.session.setMode("ace/mode/javascript");
	    this._editor.setReadOnly(false)
	    this.tabnavref = document.querySelector(".tabnav")
	    this.consoleref = document.querySelector(".console-text")
	    this.clearconsole = document.querySelector(".clear-console-btn")
	    this.tabItems = []
	}

	View.prototype.render = function(type, arg){
		const data = this.model.getData()
		const code = data.editorVal[data.activeEditor]
		this._editor.setValue(code)
		this.rendertabnav(data.editorVal.length, data.activeEditor)
	}

	View.prototype.rendertabnav = function(num, active){
		const TabTemplate = "<div class = 'inditab'>"
						+       "<div class = 'inditabtext'>{{tabno}}</div>"
						+       "<div class = 'inditabclose'>*</div>"
						+	"</div>"

		let html = ""
		for(let i = 0; i < num; i++){
			html = html + TabTemplate.replace(/{{tabno}}/g, i+1)
		}

		this.tabnavref.innerHTML = html

		this.tabItems = document.querySelectorAll(".inditab")
	}

	View.prototype.addToConsole = function(msg, type){
		if(type === 'result'){
			msg = '>>  ' + msg
		}
		const t = document.createTextNode(msg)
			  br = document.createElement('br')
		this.consoleref.appendChild(t)
		this.consoleref.appendChild(br)
	}

	View.prototype.clearConsole = function(){
		this.consoleref.innerHTML = "//console logs will appear here"
		const br = document.createElement('br')
		this.consoleref.appendChild(br)
	}

	function Model(){
		this.storage = localStorage
		if(!localStorage.getItem('data')){
			const data = {
				"editorVal": [""],
				"activeEditor": 0
			}
			localStorage.setItem("data", JSON.stringify(data))
		}
	}

	Model.prototype.getData = function(){
		return JSON.parse(this.storage.getItem('data'))
	}

	Model.prototype.saveCode = function(code){
		const data = this.getData(),
			  index = data.activeEditor
		data.editorVal[index] = code
		localStorage.setItem("data", JSON.stringify(data))
	}

	Model.prototype.createNewTab = function(){
		const data = this.getData()
		data.editorVal = data.editorVal.concat("")
		data.activeEditor = data.editorVal.length - 1
		localStorage.setItem("data", JSON.stringify(data))
	}

	Model.prototype.changeSelectedEditor = function(i){
		const data = this.getData()
		data.activeEditor = i
		localStorage.setItem("data", JSON.stringify(data))
	}

	Model.prototype.deleteTab = function(i){
		const data = this.getData()
		if(data.editorVal.length > 1){
			data.editorVal.splice(i, 1)
			if (data.activeEditor === i) {
				data.activeEditor = data.activeEditor - 1>0 ? data.activeEditor - 1 : 0
			}
			localStorage.setItem("data", JSON.stringify(data))
		}
	}

	const model = new Model(),
		  view = new View(model),
		  app = new App(view, model)

	app.init()
})(this)