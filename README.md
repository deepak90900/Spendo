Spendo App

Overview

Spendo is a React Native application designed to help users track their monthly expenses with interactive charts and detailed breakdowns. The app is built using Expo and incorporates various libraries such as react-native-chart-kit, react-native-paper, and react-native-svg for a modern and intuitive user experience.

Features

Dashboard: Visualize total monthly expenses with comparison to previous months.

Monthly Spending Trend: Line chart showcasing month-over-month expense trends.

Top Spending Categories: View the top categories for spending in the current month.

Category Breakdown: Detailed percentage and value breakdown for all spending categories.

Recent Expenses: List of the most recent expenses for quick reference.

Installation

To set up and run this project locally, follow these steps:

Clone the repository:

git clone https://github.com/username/spendo.git
cd spendo

Install dependencies:

npm install

Ensure react-native-svg is installed (necessary for chart rendering):

npx expo install react-native-svg

Start the development server:

expo start

Building for Production

To create a build for production and test on a physical device:

Build the APK:

eas build --platform android --profile production

Make sure EAS CLI is configured by running:

eas build:configure

Download and install the APK on your device for testing.

Troubleshooting Common Issues

1. Missing RNGestureHandlerModule Error

Ensure react-native-gesture-handler is properly installed and imported:

npm install react-native-gesture-handler

Add this import as the first line in your App.js:

import 'react-native-gesture-handler';

2. RNSVGRect Not Found in UIManager

Ensure react-native-svg is installed:

npx expo install react-native-svg

Rebuild the project using EAS:

eas build --platform android

3. toFixed() of undefined

Double-check that all numerical values are defined before calling .toFixed(). Use safe-checks like:

const value = amount ? amount.toFixed(2) : '0.00';

Configuration

app.json

Ensure your app.json file has proper configurations:

{
"expo": {
"name": "Spendo",
"slug": "spendo",
"version": "1.0.0",
"orientation": "portrait",
"icon": "./assets/icon.png",
"splash": {
"image": "./assets/splash.png",
"resizeMode": "contain",
"backgroundColor": "#ffffff"
},
"android": {
"adaptiveIcon": {
"foregroundImage": "./assets/adaptive-icon.png",
"backgroundColor": "#ffffff"
},
"package": "com.rahul101232.spendo"
},
"extra": {
"eas": {
"projectId": "3234e361-dbd3-456f-98f1-ccc59c48b7b5"
}
},
"updates": {
"url": "https://u.expo.dev/3234e361-dbd3-456f-98f1-ccc59c48b7b5"
}
}
}

License

This project is licensed under the MIT License. See the LICENSE file for more details.

Contributing

We welcome contributions! Please fork the repository, create a feature branch, and submit a pull request.

Contact

For questions or feedback, please reach out at deepakbdn19@gmail.com.
