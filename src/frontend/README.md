# React Native Template

This template is a starting point for React Native apps using Expo. The project includes custom components such as a toast notification button and integrates with libraries like `react-native-gesture-handler` and `react-native-safe-area-context` for a smooth, scalable app architecture. This setup is ideal for developers looking to leverage React Native for both mobile and web platforms.

## Features

-   **Custom Toast Notifications**: Utilizes `@backpackapp-io/react-native-toast` for in-app notifications.
-   **Gesture Handling**: Integrated with `react-native-gesture-handler`.
-   **Safe Area Handling**: Uses `react-native-safe-area-context` to manage screen safe areas across different devices.
-   **Expo Managed Workflow**: Makes use of the Expo managed workflow for easy development and testing across iOS, Android, and web.

## Prerequisites

Before you begin, ensure you have met the following requirements:

-   Node.js 18 LTS or newer
-   Bun version 1.1.0 or newer
-   Optionally, Android Studio to run the project on an emulator/simulator and export the app.

## Setup

Clone this repository to your local machine:

```bash
git clone https://github.com/your-username/react-native-template.git
```

Navigate to the project directory:

```bash
cd react-native-template
```

Install the dependencies:

```bash
bun install
```

## Running the Application

To run the application, you can use the following commands:

```bash
bun start
```

Alternatively, you can run for specific platforms:

```bash
bun ios
bun android
bun web
```

Once the application is running, you can access it via the Expo Go app on your mobile device or the web browser. For more information, refer to the [Expo documentation](https://docs.expo.dev/).
