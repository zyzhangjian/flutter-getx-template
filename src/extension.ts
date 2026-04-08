import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

const NEW_GETX_TEMPLATE_COMMAND = "flutter getx.newGetxTemplate";

type Naming = {
  snakeName: string;
  pascalName: string;
};

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    NEW_GETX_TEMPLATE_COMMAND,
    async (uri: vscode.Uri) => {
      if (!uri || !uri.fsPath) {
        const folderUri = await vscode.window.showOpenDialog({
          canSelectFolders: true,
          canSelectFiles: false,
          openLabel: "Select Folder",
        });

        if (!folderUri || folderUri.length === 0) {
          vscode.window.showErrorMessage("No folder selected.");
          return;
        }

        uri = folderUri[0];
      }

      if (!uri) {
        const workspaceFolders = vscode.workspace.workspaceFolders;

        if (!workspaceFolders || workspaceFolders.length === 0) {
          vscode.window.showErrorMessage(
            "No folder selected and no workspace is open. Please open a workspace or select a folder."
          );
          return;
        }

        uri = workspaceFolders[0].uri;
      }

      if (uri.scheme !== "file") {
        vscode.window.showErrorMessage(
          "Selected resource is not a valid folder. Please try again."
        );
        console.error("Invalid URI scheme:", uri.scheme);
        return;
      }

      const selectedPath = uri.fsPath;
      if (
        !fs.existsSync(selectedPath) ||
        !fs.lstatSync(selectedPath).isDirectory()
      ) {
        vscode.window.showErrorMessage(
          "Selected resource is not a valid folder. Please select a folder."
        );
        return;
      }

      const classNameInput = await vscode.window.showInputBox({
        placeHolder: "Enter the feature or page name",
        prompt: "This will create GetX controller, binding, and page files",
        validateInput: (value) =>
          value.trim() ? undefined : "Name cannot be empty",
      });

      if (!classNameInput) {
        return;
      }

      const createFolderChoice = await vscode.window.showQuickPick(
        ["Yes", "No"],
        {
          placeHolder: "Create a new folder for the generated files?",
        }
      );

      if (!createFolderChoice) {
        return;
      }

      const naming = buildNaming(classNameInput);
      const baseDirectory =
        createFolderChoice === "Yes"
          ? path.join(uri.fsPath, naming.snakeName)
          : uri.fsPath;

      createGetxTemplateFiles(baseDirectory, naming);
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}

function createGetxTemplateFiles(baseDirectory: string, naming: Naming) {
  fs.mkdirSync(baseDirectory, { recursive: true });

  const controllerPath = path.join(
    baseDirectory,
    `${naming.snakeName}_controller.dart`
  );
  const bindingPath = path.join(
    baseDirectory,
    `${naming.snakeName}_binding.dart`
  );
  const pagePath = path.join(baseDirectory, `${naming.snakeName}_page.dart`);

  const existingFiles = [controllerPath, bindingPath, pagePath].filter((file) =>
    fs.existsSync(file)
  );

  if (existingFiles.length > 0) {
    void vscode.window.showErrorMessage(
      `Target files already exist: ${existingFiles
        .map((file) => path.basename(file))
        .join(", ")}`
    );
    return;
  }

  fs.writeFileSync(controllerPath, buildControllerTemplate(naming));
  fs.writeFileSync(bindingPath, buildBindingTemplate(naming));
  fs.writeFileSync(pagePath, buildPageTemplate(naming));

  void vscode.window.showInformationMessage(
    `GetX template ${naming.pascalName} created successfully in ${baseDirectory}.`
  );
}

function buildControllerTemplate(naming: Naming): string {
  return `import 'package:get/get.dart';

class ${naming.pascalName}Controller extends GetxController {
}
`;
}

function buildBindingTemplate(naming: Naming): string {
  return `import 'package:get/get.dart';

import '${naming.snakeName}_controller.dart';

class ${naming.pascalName}Binding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<${naming.pascalName}Controller>(() => ${naming.pascalName}Controller());
  }
}
`;
}

function buildPageTemplate(naming: Naming): string {
  return `import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '${naming.snakeName}_controller.dart';

class ${naming.pascalName}Page extends GetView<${naming.pascalName}Controller> {
  const ${naming.pascalName}Page({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold();
  }
}
`;
}

function buildNaming(input: string): Naming {
  const words = input
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((segment) => segment.toLowerCase());

  const snakeName = words.join("_");
  const pascalName = words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
  return {
    snakeName,
    pascalName,
  };
}
