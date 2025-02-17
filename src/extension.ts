import * as vscode from "vscode";

async function resizeEditorGroups(centerWidth: number) {
  const sideWidth = (1 - centerWidth) / 2;

  const layout = {
    orientation: 1,
    groups: [
      {
        groups: [
          { size: sideWidth },
          { size: centerWidth },
          { size: sideWidth },
        ],
        orientation: 0,
      },
    ],
  };

  await vscode.commands.executeCommand("vscode.setEditorLayout", layout);
}

export function activate(context: vscode.ExtensionContext) {
  const outputChannel = vscode.window.createOutputChannel("TWM");
  outputChannel.appendLine("TWM is now active");

  let layout: {
    left: vscode.TextDocument | null;
    center: vscode.TextDocument | null;
    right: vscode.TextDocument | null;
  } = {
    left: null,
    center: null,
    right: null,
  };

  let active = true;

  let init = async () => {
    const centerWidth = vscode.workspace
      .getConfiguration("twm")
      .get<number>("centerWidth", 0.7);
    resizeEditorGroups(centerWidth);

    const editors = vscode.window.visibleTextEditors;
    layout.left = editors.find((e) => e.viewColumn === 1)?.document || null;
    layout.center = editors.find((e) => e.viewColumn === 2)?.document || null;
    layout.right = editors.find((e) => e.viewColumn === 3)?.document || null;

    const nonNullEditor = layout.left || layout.center || layout.right;
    if (!layout.left) {
      await vscode.window.showTextDocument(nonNullEditor, { viewColumn: 1 });
      layout.left = nonNullEditor;
    }
    if (!layout.center) {
      await vscode.window.showTextDocument(nonNullEditor, { viewColumn: 2 });
      layout.center = nonNullEditor;
    }
    if (!layout.right) {
      await vscode.window.showTextDocument(nonNullEditor, { viewColumn: 3 });
      layout.right = nonNullEditor;
    }

    await vscode.window.showTextDocument(layout.center, { viewColumn: 2 });
  };

  ////////////////////////////////////////////////////////////////////////////////
  // START
  let disposable = vscode.commands.registerCommand("twm.start", () => {
    init();
    active = true;
  });
  context.subscriptions.push(disposable);

  ////////////////////////////////////////////////////////////////////////////////
  // STOP
  disposable = vscode.commands.registerCommand("twm.stop", () => {
    deactivate(context);
    active = false;
  });
  context.subscriptions.push(disposable);

  ////////////////////////////////////////////////////////////////////////////////
  // SWAPPING
  let isSwapping = false;
  disposable = vscode.window.onDidChangeActiveTextEditor(async (editor) => {
    if (!editor || isSwapping || !active) return;

    const editors = vscode.window.visibleTextEditors;

    isSwapping = true;
    // we focused the left editor, swap center and left
    if (editor.viewColumn === 1) {
      isSwapping = true;
      const centerEditor = editors.find((e) => e.viewColumn === 2)?.document;
      const leftEditor = editors.find((e) => e.viewColumn === 1)?.document;

      if (centerEditor && leftEditor) {
        await vscode.window.showTextDocument(leftEditor, {
          viewColumn: 2,
          preserveFocus: true,
        });
        await vscode.window.showTextDocument(centerEditor, { viewColumn: 1 });
        await vscode.window.showTextDocument(leftEditor, { viewColumn: 2 });
        layout.left = centerEditor;
        layout.center = leftEditor;
      }
    }
    // a new file has been opened, swap center and right, open new file
    else if (editor.viewColumn === 2) {
      const centerEditor = editors.find((e) => e.viewColumn === 2)?.document;
      // only if it's really a new file
      if (centerEditor?.uri.toString() === layout.center?.uri.toString()) {
        isSwapping = false;
        return;
      }
      const leftEditor = editors.find((e) => e.viewColumn === 1)?.document;

      if (centerEditor && leftEditor) {
        await vscode.window.showTextDocument(layout.center!, { viewColumn: 1 });
        await vscode.window.showTextDocument(centerEditor, { viewColumn: 2 });
        layout.left = layout.center;
        layout.center = centerEditor;
      }
    }
    // we focused the right editor, swap center and right
    else if (editor.viewColumn === 3) {
      const centerEditor = editors.find((e) => e.viewColumn === 2)?.document;
      const rightEditor = editors.find((e) => e.viewColumn === 3)?.document;

      if (centerEditor && rightEditor) {
        await vscode.window.showTextDocument(rightEditor, {
          viewColumn: 2,
          preserveFocus: true,
        });
        await vscode.window.showTextDocument(centerEditor, { viewColumn: 3 });
        await vscode.window.showTextDocument(rightEditor, { viewColumn: 2 });
        layout.right = centerEditor;
        layout.center = rightEditor;
      }
    }
    isSwapping = false;

    await init();
  });
}

export function deactivate(context: vscode.ExtensionContext) {
  const outputChannel = vscode.window.createOutputChannel("TWM");
  outputChannel.appendLine("TWM is now inactive");
}