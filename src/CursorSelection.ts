import * as vscode from "vscode";

export class CursorSelection {
  private readonly sel: vscode.Selection;
  private readonly builder: vscode.TextEditorEdit;
  constructor(sel: vscode.Selection, builder: vscode.TextEditorEdit) {
    this.sel = sel;
    this.builder = builder;
  }
  delete() {
    this.builder.delete(this.sel);
  }
  insert(text: string) {
    this.builder.insert(this.sel.start, text);
  }
  replaceLine(editor: vscode.TextEditor, text: string) {
    const r = editor.document.lineAt(this.sel.start.line).range;
    this.builder.replace(r, text);
  }
}
