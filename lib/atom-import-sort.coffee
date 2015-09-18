importSort = require "import-sort";
{CompositeDisposable} = require 'atom'

module.exports =
  bufferWillSaveDisposables: null
  editorObserverDisposable: null

  config:
    sortOnSave:
      title: 'Sort on save'
      description: 'Automatically sort your Javascript files when you save them.'
      type: 'boolean'
      default: true

  activate: ->
    atom.config.observe "atom-import-sort.sortOnSave", (sortOnSave) =>
      if sortOnSave
        @observeEditors()
      else
        @unobserveEditors()

    atom.commands.add 'atom-text-editor[data-grammar~="source"][data-grammar~="js"]',
     "import-sort:sort", => @sortCurrentEditor()

  deactivate: ->
    @unobserveEditors()

  observeEditors: ->
    unless @editorObserverDisposable
      @bufferWillSaveDisposables = new CompositeDisposable

      @editorObserverDisposable = atom.workspace.observeTextEditors (editor) =>
        @bufferWillSaveDisposables.add editor.getBuffer().onWillSave => @sortEditor editor

  unobserveEditors: ->
    if @editorObserverDisposable
      @bufferWillSaveDisposables.dispose()

      @editorObserverDisposable.dispose()
      @editorObserverDisposable = null

  sortEditor: (editor) ->
    scopeDescriptor = editor.getRootScopeDescriptor()

    if scopeDescriptor.scopes[0].split(".").indexOf("js") == -1
      return

    try
      cursor = editor.getCursorBufferPosition()
      unsorted = editor.getText()
      sorted = importSort unsorted

      editor.setText sorted
      editor.setCursorBufferPosition cursor
    catch err
      atom.notifications.addWarning "Failed to sort imports:\n#{err.toString()}"

  sortCurrentEditor: ->
    editor = atom.workspace.getActiveTextEditor();

    if editor
      @sortEditor editor
