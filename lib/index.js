"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("atom");
const path_1 = require("path");
const import_sort_1 = require("import-sort");
const import_sort_config_1 = require("import-sort-config");
const loophole_1 = require("loophole");
// tslint:disable-next-line
const CompositeDisposable = require("atom").CompositeDisposable;
class Plugin {
    constructor() {
        this.config = {
            sortOnSave: {
                title: "Sort on save",
                description: "Automatically sort your Javascript files when you save them.",
                type: "boolean",
                default: false,
            },
        };
    }
    activate(state) {
        atom.config.observe("atom-import-sort.sortOnSave", (sortOnSave) => {
            if (sortOnSave) {
                this.observeEditors();
            }
            else {
                this.unobserveEditors();
            }
        });
        // tslint:disable-next-line
        atom.commands.add('atom-text-editor[data-grammar~="source"][data-grammar~="js"],atom-text-editor[data-grammar~="source"][data-grammar~="ts"]', "import-sort:sort", () => this.sortCurrentEditor());
    }
    deactivate() {
        this.unobserveEditors();
    }
    observeEditors() {
        if (!this.editorObserverDisposable) {
            this.bufferWillSaveDisposables = new CompositeDisposable();
            this.editorObserverDisposable = atom.workspace.observeTextEditors(editor => {
                this.bufferWillSaveDisposables.add(editor.getBuffer().onWillSave(() => {
                    this.sortEditor(editor, true);
                }));
            });
        }
    }
    unobserveEditors() {
        if (this.editorObserverDisposable) {
            this.bufferWillSaveDisposables.dispose();
            this.editorObserverDisposable.dispose();
            this.editorObserverDisposable = null;
        }
    }
    sortEditor(editor, notifyErrors = false) {
        const scopeDescriptor = editor.getRootScopeDescriptor();
        if (!scopeDescriptor) {
            return;
        }
        const scope = scopeDescriptor.scopes[0];
        let extension;
        let directory;
        const path = editor.getPath();
        if (path) {
            const rawExtension = path_1.extname(path);
            if (rawExtension.indexOf(".") !== -1) {
                extension = rawExtension;
            }
            directory = path_1.dirname(path);
        }
        else {
            // TODO: Refactor the following if statements
            if (scope.split(".").some(part => part === "js")) {
                extension = ".js";
            }
            if (scope.split(".").some(part => part === "ts")) {
                extension = ".ts";
            }
            directory = atom.project.getPaths()[0];
        }
        if (!extension) {
            return;
        }
        try {
            const sortConfig = import_sort_config_1.getConfig(extension, directory);
            if (!sortConfig) {
                if (!notifyErrors) {
                    atom.notifications.addWarning(`No configuration found for this file type`);
                }
                return;
            }
            const { parser, style, config: rawConfig } = sortConfig;
            if (!parser || !style) {
                if (!parser && !notifyErrors) {
                    atom.notifications.addWarning(`Parser '${sortConfig.config.parser}' not found`);
                }
                if (!style && !notifyErrors) {
                    atom.notifications.addWarning(`Style '${sortConfig.config.style}' not found`);
                }
                return;
            }
            const cursor = editor.getCursorBufferPosition();
            const unsorted = editor.getText();
            let changes;
            loophole_1.allowUnsafeNewFunction(() => {
                loophole_1.allowUnsafeEval(() => {
                    changes = import_sort_1.default(unsorted, parser, style, path, rawConfig.options).changes;
                });
            });
            editor.transact(() => {
                for (const change of changes) {
                    const start = editor.buffer.positionForCharacterIndex(change.start);
                    const end = editor.buffer.positionForCharacterIndex(change.end);
                    editor.setTextInBufferRange([start, end], change.code);
                }
            });
            editor.setCursorBufferPosition(cursor);
        }
        catch (e) {
            if (!notifyErrors) {
                atom.notifications.addWarning(`Failed to sort imports:\n${e.toString()}`);
            }
        }
    }
    sortCurrentEditor() {
        const editor = atom.workspace.getActiveTextEditor();
        if (editor) {
            this.sortEditor(editor);
        }
    }
}
exports.Plugin = Plugin;
module.exports = new Plugin();
