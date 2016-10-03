import "atom";
export declare class Plugin {
    bufferWillSaveDisposables?: any;
    editorObserverDisposable?: any;
    config: {
        sortOnSave: {
            title: string;
            description: string;
            type: string;
            default: boolean;
        };
    };
    activate(state: any): void;
    deactivate(): void;
    private observeEditors();
    private unobserveEditors();
    private sortEditor(editor, notifyErrors?);
    private sortCurrentEditor();
}
