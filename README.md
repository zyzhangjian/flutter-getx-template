# Flutter GetX Page Generator

`Flutter GetX Page Generator` is a Visual Studio Code extension for quickly creating minimal GetX page scaffolding in Flutter projects.

It helps you generate a clean starting structure with right-click support in the Explorer and a command in the Command Palette.

## Preview

![Usage Demo](./assets/screen_record.gif)

## Features

- Generate minimal GetX files for a feature or page
- Support Explorer right-click menu
- Support Command Palette command
- Optional subfolder creation based on the entered name

## Generated Files

When you enter a name such as `UserProfile`, the extension generates:

- `user_profile_controller.dart`
- `user_profile_binding.dart`
- `user_profile_page.dart`

If you choose to create a new folder, the files will be generated inside:

- `user_profile/`

## Template Example

### `user_profile_controller.dart`

```dart
import 'package:get/get.dart';

class UserProfileController extends GetxController {
}
```

### `user_profile_binding.dart`

```dart
import 'package:get/get.dart';

import 'user_profile_controller.dart';

class UserProfileBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<UserProfileController>(() => UserProfileController());
  }
}
```

### `user_profile_page.dart`

```dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';

import 'user_profile_controller.dart';

class UserProfilePage extends GetView<UserProfileController> {
  const UserProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold();
  }
}
```

## Usage

1. Open your Flutter project in VS Code.
2. Right-click a folder in the Explorer.
3. Select `Flutter GetX: New GetX Template`.
4. Enter a name such as `UserProfile` or `user_profile`.
5. Choose whether to create a new folder.
6. The extension will generate the GetX template files.

You can also open the Command Palette and run:

- `Flutter GetX: New GetX Template`

## Notes

- The generated template assumes your Flutter project already uses the `get` package.
- The extension is designed to generate a minimal starting structure, so it does not add business logic by default.
- Folder and file names are generated in `snake_case`.
- Dart class names are generated in `PascalCase`.
