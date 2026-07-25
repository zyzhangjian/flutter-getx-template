# Flutter GetX Page Generator (Controller + Binding + View)

⚡ Generate **GetX Controller, Binding, and Page** with **one click**.

Create clean GetX page templates directly from the **VS Code Explorer**.

Stop writing repetitive boilerplate code and start coding faster.

---

## 🎬 Preview

![Usage Demo](./assets/screen_record.gif)

---

## ✨ Features

- 🚀 One-click GetX page generation
- 📁 Optional feature folder creation
- 🧩 Automatically generates GetX Controller, Binding and Page files
- 🖱 Available from the Explorer right-click menu
- ⌨ Available from the Command Palette
- 🐍 Automatically converts file names to `snake_case`
- 🏷 Automatically converts class names to `PascalCase`
- 💙 Lightweight and zero configuration

---

## 📂 Generated Structure

When creating a page named **UserProfile**, the extension generates:

```text
user_profile/
├── user_profile_binding.dart
├── user_profile_controller.dart
└── user_profile_page.dart
```

If **Create Folder = No**, the generated files will be created directly in the selected directory.

---

## 🚀 Usage

### Method 1 (Recommended)

1. Right-click the target folder in the VS Code Explorer.
2. Select **Flutter GetX: New GetX Page**.
3. Enter a page name.
4. Choose whether to create a new folder.
5. Done 🎉

### Method 2

Open the Command Palette (`Ctrl + Shift + P` / `Cmd + Shift + P`)

Run **Flutter GetX: New GetX Page**, then:

1. Select the target folder.
2. Enter a page name.
3. Choose whether to create a new folder.

---

## 💡 Example

Input:

```text
UserProfile
```

Generated classes:

```dart
UserProfileController
UserProfileBinding
UserProfilePage
```

---

## ❤️ Why Flutter GetX Page Generator?

Unlike large Flutter code generators, this extension focuses on one thing:

- ⚡ One-click generation
- 💙 Lightweight
- 🚀 Zero configuration
- 📁 Clean GetX page structure
- 🖱 Right-click and start coding

---

## 📋 Requirements

- Visual Studio Code
- Flutter 3.x+
- Flutter project
- GetX package

---

## 📌 Notes

- This extension assumes your project already uses the **get** package.
- Business logic is intentionally **not** generated.
- File names use **snake_case**.
- Dart class names use **PascalCase**.


---

## ⭐ Support

Found a bug or have a feature request?

Feel free to open an Issue on GitHub.

If this extension saves you time, please consider leaving a ⭐ rating on the Visual Studio Marketplace.
