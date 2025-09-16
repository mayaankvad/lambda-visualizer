import { useState } from "react";

import { type NonCancelableCustomEvent } from "@cloudscape-design/components";
import CodeEditor, {
    type CodeEditorProps,
} from "@cloudscape-design/components/code-editor";
import ace from "ace-builds";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-cloud_editor";
import "ace-builds/src-noconflict/theme-cloud_editor_dark";

const i18nStrings: CodeEditorProps.I18nStrings = {
    loadingState: "Loading code editor",
    errorState: "There was an error loading the code editor.",
    editorGroupAriaLabel: "Code editor",
    statusBarGroupAriaLabel: "Editor status bar",
    errorsTab: "Errors",
    warningsTab: "Warnings",
    preferencesButtonAriaLabel: "Preferences",
    paneCloseButtonAriaLabel: "Close",
    preferencesModalWrapLines: "Wrap Lines",
    preferencesModalHeader: "Editor Preferences",
    preferencesModalCancel: "Cancel",
    preferencesModalConfirm: "Apply",
    cursorPosition: (row, column) => `Line ${row}, Column ${column}`,
};

export default function CodeEditorView({
    codeEditorValue,
    setCodeEditorValue,
}: {
    codeEditorValue: string;
    setCodeEditorValue: React.Dispatch<React.SetStateAction<string>>;
}) {
    const [preferences, setPreferences] = useState({});

    const onDelayedChange = (
        event: NonCancelableCustomEvent<CodeEditorProps.ChangeDetail>
    ) => {
        const newValue = event.detail.value;
        setCodeEditorValue(newValue);
    };

    const onPreferencesChange = (
        event: NonCancelableCustomEvent<CodeEditorProps.Preferences>
    ) => {
        setPreferences(event.detail);
    };

    return (
        <CodeEditor
            ace={ace}
            language="json"
            value={codeEditorValue}
            onDelayedChange={onDelayedChange}
            preferences={preferences}
            onPreferencesChange={onPreferencesChange}
            i18nStrings={i18nStrings}
            themes={{ light: ["cloud_editor"], dark: ["cloud_editor_dark"] }}
        />
    );
}
