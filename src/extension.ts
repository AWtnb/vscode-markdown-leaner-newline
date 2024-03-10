import * as vscode from "vscode";

import { EditorLine } from "./EditorLine";
import { CursorSelection } from "./CursorSelection";

const newlineToCursors = (editor: vscode.TextEditor) => {
  const linebreak = editor.document.eol === 1 ? "\n" : "\r\n";
  editor.edit((editBuilder: vscode.TextEditorEdit) => {
    editor.selections.forEach((sel: vscode.Selection) => {
      const el = new EditorLine(editor, sel);
      const cs = new CursorSelection(sel, editBuilder);
      const symbol = el.getSymbol();

      if (!sel.isEmpty) {
        const s = el.isCursorInsideIndent() ? el.getStringBeforeCursor() : el.getIndentWhitespace() + symbol;
        cs.delete();
        cs.insert(linebreak + s);
        return;
      }

      if (el.isCursorInsideIndent()) {
        cs.insert(linebreak + el.getStringBeforeCursor());
        return;
      }

      if (el.hasText()) {
        cs.insert(linebreak + el.getIndentWhitespace() + symbol);
        return;
      }

      if (symbol.length < 1) {
        cs.insert(linebreak + el.getIndentWhitespace());
        return;
      }

      if (el.isQuotation()) {
        cs.insert(linebreak + el.getIndentWhitespace() + symbol);
        return;
      }

      if (el.isIndented()) {
        const o = el.getOutdentedText(Number(editor.options.indentSize));
        cs.replaceLine(editor, o);
        return;
      }

      cs.replaceLine(editor, "");
    });
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

