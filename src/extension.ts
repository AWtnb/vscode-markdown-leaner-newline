import * as vscode from "vscode";

import { EditorLine } from "./EditorLine";

const newlineToCursors = (editor: vscode.TextEditor) => {
  const linebreak = editor.document.eol === 1 ? "\n" : "\r\n";
  const workspaceEdit = new vscode.WorkspaceEdit();
  const uri = editor.document.uri;

  editor.selections.forEach((sel: vscode.Selection) => {
    const el = new EditorLine(editor, sel);
    const symbol = el.getSymbol();

    if (!sel.isEmpty) {
      const s = el.isCursorInsideIndent() ? el.getStringBeforeCursor() : el.getIndentWhitespace() + symbol;
      workspaceEdit.replace(uri, sel, linebreak + s);
      return;
    }

    if (el.isCursorInsideIndent()) {
      workspaceEdit.insert(uri, sel.start, linebreak + el.getStringBeforeCursor());
      return;
    }

    if (el.hasText()) {
      workspaceEdit.insert(uri, sel.start, linebreak + el.getIndentWhitespace() + symbol);
      return;
    }

    if (symbol.length < 1) {
      workspaceEdit.insert(uri, sel.start, linebreak + el.getIndentWhitespace());
      return;
    }

    if (el.isQuotation()) {
      workspaceEdit.insert(uri, sel.start, linebreak + el.getIndentWhitespace() + symbol);
      return;
    }

    const lineRange = editor.document.lineAt(sel.start).range;
    if (el.isIndented()) {
      const o = el.getOutdentedText(Number(editor.options.indentSize));
      workspaceEdit.replace(uri, lineRange, o);
      return;
    }

    workspaceEdit.replace(uri, lineRange, "");
  });

  vscode.workspace.applyEdit(workspaceEdit).then(() => {
    const newSels = editor.selections.map((sel) => {
      if (sel.isEmpty) {
        return sel;
      }
      const s = new vscode.Selection(sel.end, sel.end);
      return s;
    });
    editor.selections = newSels;
  });
};

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand("markdown-leaner-newline.execute", (editor: vscode.TextEditor) => {
      newlineToCursors(editor);
    })
  );
}

export function deactivate() {}

