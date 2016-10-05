"use strict";
require("atom");
var loophole_1 = require("loophole");
var path_1 = require("path");
var import_sort_1 = require("import-sort");
var import_sort_config_1 = require("import-sort-config");
// tslint:disable-next-line
var CompositeDisposable = require("atom").CompositeDisposable;
var Plugin = (function () {
    function Plugin() {
        this.config = {
            sortOnSave: {
                title: "Sort on save",
                description: "Automatically sort your Javascript files when you save them.",
                type: "boolean",
                default: false,
            },
        };
    }
    Plugin.prototype.activate = function (state) {
        var _this = this;
        atom.config.observe("atom-import-sort.sortOnSave", function (sortOnSave) {
            if (sortOnSave) {
                _this.observeEditors();
            }
            else {
                _this.unobserveEditors();
            }
        });
        // tslint:disable-next-line
        atom.commands.add('atom-text-editor[data-grammar~="source"][data-grammar~="js"],atom-text-editor[data-grammar~="source"][data-grammar~="ts"]', "import-sort:sort", function () { return _this.sortCurrentEditor(); });
    };
    Plugin.prototype.deactivate = function () {
        this.unobserveEditors();
    };
    Plugin.prototype.observeEditors = function () {
        var _this = this;
        if (!this.editorObserverDisposable) {
            this.bufferWillSaveDisposables = new CompositeDisposable();
            this.editorObserverDisposable = atom.workspace.observeTextEditors(function (editor) {
                _this.bufferWillSaveDisposables.add(editor.getBuffer().onWillSave(function () {
                    _this.sortEditor(editor, true);
                }));
            });
        }
    };
    Plugin.prototype.unobserveEditors = function () {
        if (this.editorObserverDisposable) {
            this.bufferWillSaveDisposables.dispose();
            this.editorObserverDisposable.dispose();
            this.editorObserverDisposable = null;
        }
    };
    Plugin.prototype.sortEditor = function (editor, notifyErrors) {
        if (notifyErrors === void 0) { notifyErrors = false; }
        var scopeDescriptor = editor.getRootScopeDescriptor();
        if (!scopeDescriptor) {
            return;
        }
        var scope = scopeDescriptor.scopes[0];
        var extension;
        var directory;
        var path = editor.getPath();
        if (path) {
            var rawExtension = path_1.extname(path);
            if (rawExtension.indexOf(".") !== -1) {
                extension = rawExtension;
            }
            directory = path_1.dirname(path);
        }
        else {
            // TODO: Refactor the following if statements
            if (scope.split(".").some(function (part) { return part === "js"; })) {
                extension = ".js";
            }
            if (scope.split(".").some(function (part) { return part === "ts"; })) {
                extension = ".ts";
            }
            directory = atom.project.getPaths()[0];
        }
        if (!extension) {
            return;
        }
        try {
            var sortConfig = import_sort_config_1.getConfig(extension, directory);
            if (!sortConfig) {
                if (!notifyErrors) {
                    atom.notifications.addWarning("No configuration found for this file type");
                }
                return;
            }
            var parser_1 = sortConfig.parser, style_1 = sortConfig.style;
            if (!parser_1 || !style_1) {
                if (!parser_1 && !notifyErrors) {
                    atom.notifications.addWarning("Parser '" + sortConfig.config.parser + "' not found");
                }
                if (!style_1 && !notifyErrors) {
                    atom.notifications.addWarning("Style '" + sortConfig.config.style + "' not found");
                }
                return;
            }
            var cursor = editor.getCursorBufferPosition();
            var unsorted_1 = editor.getText();
            var changes_1;
            loophole_1.allowUnsafeNewFunction(function () {
                loophole_1.allowUnsafeEval(function () {
                    changes_1 = import_sort_1.default(unsorted_1, parser_1, style_1).changes;
                });
            });
            editor.transact(function () {
                for (var _i = 0, changes_2 = changes_1; _i < changes_2.length; _i++) {
                    var change = changes_2[_i];
                    var start = editor.buffer.positionForCharacterIndex(change.start);
                    var end = editor.buffer.positionForCharacterIndex(change.end);
                    editor.setTextInBufferRange([start, end], change.code);
                }
            });
            editor.setCursorBufferPosition(cursor);
        }
        catch (e) {
            if (!notifyErrors) {
                atom.notifications.addWarning("Failed to sort imports:\n" + e.toString());
            }
        }
    };
    Plugin.prototype.sortCurrentEditor = function () {
        var editor = atom.workspace.getActiveTextEditor();
        if (editor) {
            this.sortEditor(editor);
        }
    };
    return Plugin;
}());
exports.Plugin = Plugin;
module.exports = new Plugin();
