// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as path from "path";
import * as vscode from "vscode";
// 获取Fn名字
function getFnName(fn: string) {
  const fnSplit = fn.split("function");
  const symbolIndex = fnSplit[1].indexOf("(");
  return fnSplit[1].substr(0, symbolIndex).trim();
}
// 获取相关函数并且调用
function getFnAndCall(context: vscode.ExtensionContext, fnName: string) {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    const document = editor.document;
    const selection = editor.selection;
    // const reversed = word.split("").reverse().join("");
    let curMethod: ((value: string) => string) | null = null;
    const value = document.getText(selection);

    eval(`curMethod = ${context.workspaceState.get(fnName)}` || "");
    if (curMethod) {
      editor.edit((editBuilder) => {
        editBuilder.replace(selection, curMethod?.(value) as string);
      });
    }
  }
}
function newFnCondition(context: vscode.ExtensionContext) {
  vscode.window
    .showInputBox({
      prompt:
        "函数必须带名称 - 比如 - function transfer(value)=>{doProcess(value) return value}",
      // "函数必须带名称 - 比如 - function transfer(value){ return value.split("").reverse().join("")  }",
    })
    .then((fnString = "") => {
      const fnName = getFnName(fnString);
      context.workspaceState.update(fnName, fnString);
      getFnAndCall(context, fnName);
    });
}
function getFileScript(context: vscode.ExtensionContext) {
  // 获取磁盘上的资源路径
  const baseSrc = vscode.Uri.file(
    path.join(
      context.extensionPath,
      "node_modules/monaco-editor/min/vs/loader.js"
    )
  ).with({ scheme: "vscode-resource" });
  const minNlsSrc = vscode.Uri.file(
    path.join(
      context.extensionPath,
      "node_modules/monaco-editor/min/vs/editor/editor.main.nls.js"
    )
  ).with({ scheme: "vscode-resource" });
  const minSrc = vscode.Uri.file(
    path.join(
      context.extensionPath,
      "node_modules/monaco-editor/min/vs/editor/editor.main.js"
    )
  ).with({ scheme: "vscode-resource" });

  // 获取在webview中使用的特殊URIm
  return ` <script src="${baseSrc}"></script>
  <script src="${minNlsSrc}"></script>
  <script src="${minSrc}"></script>`;
}
export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "jack-test" is now active!');
  const cssSrc = vscode.Uri.file(
    path.join(
      context.extensionPath,
      "node_modules/monaco-editor/min/vs/editor/editor.main.css"
    )
  ).with({ scheme: "vscode-resource" });
  const baseSrc = vscode.Uri.file(
    path.join(context.extensionPath, "node_modules/monaco-editor/min/vs")
  ).with({ scheme: "vscode-resource" });
  const disposable = vscode.commands.registerCommand(
    "jack-test.reverseWord",
    function () {
      const storedKeys = context.workspaceState.keys();
      vscode.window.createWebviewPanel("t", "test", vscode.ViewColumn.One, {
        enableScripts: true,
      }).webview.html = `
      <link
			rel="stylesheet"
			data-name="vs/editor/editor.main"
			href="${cssSrc}"
		/>
      <body>
        <h2>Monaco Editor Sync Loading Sample</h2>
        <div id="container" style="width: 800px; height: 600px; border: 1px solid grey"></div>
        <script>
        var require = {
            paths: {
                vs: "${baseSrc}"
            }
        };
      
        </script>
        <script>
        console.log(3333,'editor----------3')
        </script>
      <script>
      console.log(3333,'editor----------1')
      var editor = monaco.editor.create(document.getElementById("container"), {
          value: ["function x() {", '\tconsole.log("Hello world!");', "}"].join(
              "\n"
          ),
          language: "javascript",
      });
      console.log(editor,'editor----------')
      </script>
    </body>`;
      vscode.window
        .showInformationMessage(
          "回车使用默认函数",
          ...storedKeys,
          "设置默认函数",
          "配置新函数",
          "获取函数"
        )
        .then((type = "") => {
          if (type === "配置新函数") {
            newFnCondition(context);
            return;
          }
          getFnAndCall(context, type);
        });
    }
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
