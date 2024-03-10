import * as vscode from "vscode";

const QUOTE = "> ";
const BULLETS = ["- ", "+ ", "* ", "1. "];

export class EditorLine {
  private readonly fullText: string;
  private readonly indentedText: string;
  private readonly cursorStart: vscode.Position;
  private readonly indentDepth: number;
  constructor(editor: vscode.TextEditor, sel: vscode.Selection) {
    const line = editor.document.lineAt(sel.start);
    this.fullText = line.text;
    this.indentedText = this.fullText.trimStart();
    this.cursorStart = sel.start;
    this.indentDepth = line.firstNonWhitespaceCharacterIndex;
  }

  isIndented(): boolean {
    return 0 < this.indentDepth;
  }

  isCursorInsideIndent(): boolean {
    return this.cursorStart.character <= this.indentDepth;
  }

  getStringBeforeCursor(): string {
    return this.fullText.substring(0, this.cursorStart.character);
  }

  getIndentWhitespace(): string {
    return this.fullText.substring(0, this.fullText.length - this.indentedText.length);
  }

  getSymbol(): string {
    const stack = [];
    let line = this.indentedText;
    while (line.startsWith(QUOTE)) {
      stack.push(QUOTE);
      line = line.substring(QUOTE.length);
    }
    for (let i = 0; i < BULLETS.length; i++) {
      const s = BULLETS[i];
      if (line.startsWith(s)) {
        stack.push(s);
      }
    }
    return stack.join("");
  }

  isQuotation(): boolean {
    return this.getSymbol().startsWith(QUOTE);
  }

  trimSymbol(): string {
    return this.getIndentWhitespace() + this.indentedText.substring(this.getSymbol().length);
  }

  hasText(): boolean {
    const s = this.getSymbol();
    if (0 < s.length) {
      return 0 < this.indentedText.substring(s.length).trim().length;
    }
    return 0 < this.indentedText.trim().length;
  }

  getOutdentedText(indentSize: number): string {
    const s = this.getIndentWhitespace();
    if (s.endsWith("\t")) {
      return s.substring(0, s.length - 1) + this.indentedText;
    }
    if (s.length < indentSize) {
      return this.indentedText;
    }
    return s.substring(0, s.length - indentSize) + this.indentedText;
  }
}
