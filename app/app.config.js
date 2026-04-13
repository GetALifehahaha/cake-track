export default {
  expo: {
    name: "CakeTrack Ordering App",
    slug: "caketrack-ordering-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "app",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/icon.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      permissions: [
        "android.permission.RECORD_AUDIO"
      ],
      package: "com.anonymous.app"
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      "@react-native-google-signin/google-signin",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/logo.jpg",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#f7f6f5",
        }
      ],
      [
        "expo-image-picker",
        {
          "photosPermission": "The app accesses your photos to let you share them with your friends."
        }
      ]
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true
    },
    runtimeVersion: "1",
    updates: {
      url: "https://u.expo.dev/ad4fc043-f5d2-4331-b437-14dd8085b128",
      fallbackToCacheTimeout: 0
    },
    extra: {
      router: {},
      eas: {
        projectId: "ad4fc043-f5d2-4331-b437-14dd8085b128"
      },
      // Injected Environment Variables
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      cloudinaryUploadPreset: process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
      cloudinaryCloudName: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME,
      googleClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    }
  }
};