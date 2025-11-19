➡️ Upgrading your app
Managed workflow

Here’s how to upgrade your app to Expo SDK 47 from 46:

    Update to the latest version of Expo CLI: npm i -g expo-cli. expo-cli@6.0.0 or greater is recommended.
    Update to the latest version of EAS CLI (if you use it): npm i -g eas-cli.
    Run expo-cli upgrade in your project directory. Run expo-cli doctor afterwards to check for any possibly issues in your project dependencies.
    Refer to the “Deprecations, renamings, and removals” section above for breaking changes that are most likely to impact your app.
    Make sure to check the changelog for all other breaking changes!
    SDK 47 projects require Xcode 14 to compile the native iOS project. If you use npx expo run:ios , have an iOS image set in your eas.json, or use eas build --local, then ensure you are using Xcode 14.0 or greater. Projects without any specified image will default to Xcode 14.0 on EAS Build.
    If you use Expo Go: Update the Expo Go app on your phones from the App Store / Google Play. Expo CLI will automatically update your apps in simulators. You can also download the iOS simulator build or the APK from expo.dev/tools.
    If you use expo-dev-client: Create a new build of your development app after upgrading.
    Use the new CLI: Run your project with npx expo start or yarn expo start.
    If you built a standalone app previously, remember that you’ll need to create a new build in order to update the SDK version. Run eas build -p ios --clear-cache and/or eas build -p android when you are ready to do a new build for submission to stores.
    Questions? We’ll be hosting some office hours focused on upgrading to SDK47. Keep an eye out on Discord for more info / sign-ups.



UPgrading to 48:

➡️ Upgrading your app

Here’s how to upgrade your app to Expo SDK 48 from 47:

    Update to the latest version of EAS CLI (if you use it):
    npm i -g eas-cli.
    Install the new version of the Expo package:
    npm install expo@^48.0.0 or yarn add expo@^48.0.0
    Upgrade all dependencies to match SDK 48:
    npx expo install --fix
    Note: if you have expo-cli installed to your project dependencies, you will need to remove it! As of SDK 46, the CLI is now part of the expo package, and having the old expo-cli package installed may cause issues such as “error: unknown option --fix’” when running npx expo install --fix.
    Check for any possibly issues in your project dependencies:
    npx expo-doctor
    Refer to the “Deprecations, renamings, and removals” section above for breaking changes that are most likely to impact your app.
    Make sure to check the changelog for all other breaking changes!
    Upgrade Xcode if needed: Xcode 14 to compile the native iOS project. If you build in Xcode, use npx expo run:ios, have an iOS image set in your eas.json, or use eas build --local, then ensure you are using Xcode 14.0 or greater. Projects without any specified image will default to Xcode 14.2 on EAS Build.
    If you manage your own native projects (bare workflow):
    — Apply any relevant changes from the React Native Upgrade Helper.
    — Alternatively, you could consider adopting prebuild for easier upgrades in the future.
    — If you have an Android project, upgrade AGP (Android Gradle Plugin) to 7.4.1.
    If you use Expo Go: Update the Expo Go app on your phones from the App Store / Google Play. Expo CLI will automatically update your apps in simulators. You can also download the iOS simulator build or the APK from expo.dev/tools.
    If you use development builds with expo-dev-client: Create a new development build after upgrading.
    Questions? We’ll be hosting some office hours focused on upgrading to SDK48. Keep an eye out on Discord for more information / sign-ups.


    


    Expo 49

    Upgrading your app

Here’s how to upgrade your app to Expo SDK 49 from 48:

    Update to the latest version of EAS CLI (if you use it):
    npm i -g eas-cli.
    Install the new version of the Expo package:
    npm install expo@^49.0.0 or yarn add expo@^49.0.0
    Upgrade all dependencies to match SDK 49:
    npx expo install --fix
    Note: if you have expo-cli installed to your project dependencies, you will need to remove it! As of SDK 46, the CLI is now part of the expo package, and having the old expo-cli package installed may cause issues such as “error: unknown option --fix’” when running npx expo install --fix.
    If you have any resolutions/overrides in your package.json, verify that they are still needed. You should remove metro and metro-resolver overrides to 0.76.0 if you added them for expo-router in SDK 48.
    If you have @babel/plugin-proposal-export-namespace-from in your package.json dependencies, you can remove it. It is now included in babel-preset-expo.
    Check for any possible issues in your project dependencies:
    npx expo-doctor@latest
    Refer to the “Deprecations, renamings, and removals” section above for breaking changes that are most likely to impact your app.
    Make sure to check the changelog for all other breaking changes!
    Upgrade Xcode if needed: Xcode 14 is needed to compile the native iOS project. For EAS Build, projects without any specified image will default to Xcode 14.3.1.
    If you manage your own native projects (bare workflow):
    — Run npx pod-install if you have an ios directory.
    — Apply any relevant changes from the React Native Upgrade Helper.
    — Alternatively, you could consider adopting prebuild for easier upgrades in the future.
    If you maintain any Expo Modules for Android: refer to the Gradle 8 migration guide.
    If you use Expo Go: Update the Expo Go app on your phones from app stores. Expo CLI will automatically update your apps in simulators. You can also download the iOS simulator build or the APK from expo.dev/tools.
    If you use development builds with expo-dev-client: Create a new development build after upgrading.
    Questions? We’ll be hosting some office hours focused on upgrading to SDK 49. Keep an eye out on Discord for more information / sign-ups.


        Updating your Android Expo Modules for Gradle 8: if you’ve had the joy of working with the Expo Modules API to build a native module in Kotlin, you will want to refer to expo.fyi/expo-modules-gradle8-migration for instructions on how to ensure your module is compatible with Gradle 8.
    sentry-expo major version bump: the new major release of sentry-expo@7.0.0 now uses Sentry React Native SDK version 5, which supports New Architecture. Refer to the migration guide for more details on changes that might affect your project.
    Expo CLI now defaults to port 8081 for all projects, rather than 19000. The port 19000 was used only for historical reasons, and it’s no longer needed, so we converged on 8081.
    Remote debugging for JSC is disabled in Expo Go and expo-dev-client. JSC remote debugging never worked particularly well compared to debugging with Hermes, and it has become unreliable over time. For more context, refer to this pull request to React Native, which will be included in their next release.
    Constants.manifest is deprecated; use Constants.expoConfig instead. The manifest in an Expo app specifies the app’s assets (like its JavaScript) and configuration data (often fields from app.json). Previously, Constants.manifest was the way to access an app’s configuration data. With SDK 49, Constants.expoConfig replaces Constants.manifest for this purpose. Refer to expo.fyi/why-constants-expoconfig to learn more about this change.
    AuthSession proxy has been removed: the useProxy option and AuthSession.startAsync method have been removed from expo-auth-session@5, following this recommendation. You can continue to use expo-auth-session@4 if you need a bit more time to migrate off of the auth proxy. If you currently use the auth proxy to work around an authentication provider not redirecting to custom schemes, we recommend switching from Expo Go to development builds and using the native SDK from that provider. For example: Facebook, Google.
    android:usesCleartextTraffic is now based on system defaults. It’s explicitly set to enabled in debug builds, and in other variants it is unspecified, which means that on API 27 and below it will default to true, and on API 28 and above it will default to false. If you depend on network requests to unsecured endpoints in production on Android, you will need to enable this manually through expo-build-properties.
    Reanimated 3 drops support for the legacy Reanimated API. If you depend on libraries that have not yet updated to the faster and more ergonomic new API, you may see errors related to this when you upgrade. Learn more.
    Support for expo-face-detector has been removed from Expo Go. This change was necessary in order to support Apple Silicon natively in Expo Go iOS simulator builds. You can continue using the library outside of Expo Go as you have previously.

    expo 50:

    ➡️ Upgrading your app

Here's how to upgrade your app to Expo SDK 50 from 49:

    Update to the latest version of EAS CLI (if you use it):

npm i -g eas-cli

    Install the new version of the Expo package:

npm install expo@^50.0.0

    Upgrade all dependencies to match SDK 50:

npx expo install --fix

    If you have any resolutions/overrides in your package.json, verify that they are still needed. For example, you should remove metro and metro-resolver overrides if you added them for expo-router in a previous SDK release.
    Check for any possible known issues:

npx expo-doctor@latest

    Refer to the "Deprecations, renamings, and removals" section above for breaking changes that are most likely to impact your app.
    Make sure to check the changelog for all other breaking changes!
    Upgrade Xcode if needed: Xcode 15 is needed to compile the native iOS project. We recommend Xcode 15.2 for SDK 50. For EAS Build, projects without any specified image will default to Xcode 15.2.
    If you use Expo Router: refer to the breaking changes in v3 and update your app accordingly.
    If you don't use Continuous Native Generation:
        Run npx pod-install if you have an ios directory.
        Apply any relevant changes from the Native project upgrade helper.
        Alternatively, you could consider adopting prebuild for easier upgrades in the future.
    If you maintain any Expo Modules:
        For Android: update your library build.gradle to match the changes in this diff. You may also now remove the JVM target version configuration, as explained in this FYI page.
        For iOS: update the platform deployment target field from '13.0' to '13.4', matching the changes in this diff.
    If you maintain any config plugins:
        Note that MainActivity.java and MainApplication.java were migrated to Kotlin. If you use any config plugins that modify these files, they may need to be updated for SDK 50 support (for example, this config plugin).
    If you use Expo Go: Update the Expo Go app on your phones from app stores. Expo CLI will automatically update your apps in simulators. You can also download the iOS simulator build or the APK from expo.dev/tools.
    If you use development builds with expo-dev-client: Create a new development build after upgrading.
    Questions? We'll be hosting an SDK 50 launch live-stream on January 31st, join us on YouTube.

Notable breaking changes

    Android SDK 34, AGP 8, and Java 17. If you build your project locally, you will need to install JDK 17. Learn more.
    Android minimum supported version bumped to Android 6 (API 23).
    iOS minimum deployment target bumped to 13.4.
    Expo CLI and React Native now require Node 18+. We also bumped the default Node version on EAS Build to Node 18 on November 27th.
    Classic updates is no longer supported. As announced in February, 2023, projects using Expo SDK 50 do not support classic updates. We recommend EAS Update instead. Learn more.
    @expo/vector-icons has been updated to use react-native-vector-icons@10.0.0: this adds support for FontAwesome6 and also changes to Ionicons and MaterialIcons. Most notably, the ios- and md- prefixed icon names in Ionicons have now dropped those prefixes. If you use TypeScript, you will be warned about any icon names that have changed when you update. Otherwise, be sure to verify that your icons are correct.
    Most expo-updates JavaScript APIs are no longer available in Expo Go or development builds using expo-dev-client. The majority of the APIs exposed through the expo-updates JavaScript interface (for example, checkForUpdateAsync, fetchUpdateAsync, etc.) are designed to be used in production builds. In development builds, Expo Go and expo-dev-client control how updates are loaded in those environments.
    React Native 0.73 changed from Java to Kotlin for Android Main* classes: MainApplication.java/MainActivity.java are now MainApplication.kt/MainActivity.kt. If you depend on any config plugins that use dangerous modifications to change these files, they may need to be updated for SDK 50 support.
    The ProgressBarAndroid and ProgressViewIOS components from React Native have been removed in 0.73, after a long period of deprecation.
    Refer to the Breaking Changes section of the Expo Router v3 post if you use it in your project.


expo 51: 

➡️ Upgrading your app

Here's how to upgrade your app to Expo SDK 51 from 50:

    Update to the latest version of EAS CLI (if you use it):

npm i -g eas-cli

    Upgrade all dependencies to match SDK 51:

npx expo install expo@^51.0.0 --fix

    If you have any resolutions/overrides in your package.json, verify that they are still needed. For example, you should remove metro and metro-resolver overrides if you added them for expo-router in a previous SDK release.
    Check for any possible known issues:

npx expo-doctor@latest

    Refer to the "Deprecations, renamings, and removals" section above for breaking changes that are most likely to impact your app.
    Make sure to check the changelog for all other breaking changes!
    Upgrade Xcode if needed: Xcode 15 is needed to compile the native iOS project. We recommend Xcode 15.3 for SDK 51. For EAS Build, projects without any specified image will default to Xcode 15.3.
    If you don't use Continuous Native Generation:
        Run npx pod-install if you have an ios directory.
        Apply any relevant changes from the Native project upgrade helper.
        Alternatively, you could consider adopting prebuild for easier upgrades in the future.
    If you maintain any Expo Modules: it is optional, but you may want to modernize your library build.gradle by applying the changes from this diff. Learn more about the changes in expo/expo#28083.
    If you use Expo Go: Update the Expo Go app on your phones from app stores. Expo CLI will automatically update your apps in simulators. You can also download the iOS simulator build or the APK from expo.dev/go.
    If you use development builds with expo-dev-client: Create a new development build after upgrading.
    Questions? Join our weekly office hours on Wednesdays at 12:00PM Pacific. Register for Expo Office Hours.






        expo-camera imports have changed: if you want to continue using the legacy implementation, update your imports from expo-camera to expo-camera/legacy. If you were already using the "next" implementation, then update the imports from expo-camera/next to expo-camera. The legacy implementation will be available until SDK 52.
    expo-sqlite imports have changed: if you want to continue using the legacy implementation, update your imports from expo-sqlite to expo-sqlite/legacy. If you were already using the "next" implementation, then update the imports from expo-sqlite/next to expo-sqlite. The legacy implementation will be available until SDK 52.
    Fingerprint runtime version policy has been renamed: "runtimeVersion": { "policy": "fingerprintExperimental" } → "runtimeVersion": { "policy": "fingerprint" } in your app.json.
    The hooks field has been removed from app.json: this was previously used for the Classic Updates and sentry-expo, which was deprecated in SDK 50 in favor of @sentry/react-native. You should remove the hooks field from your app config.
    sentry-expo is no longer supported, use @sentry/react-native instead. In SDK 50, sentry-expo was deprecated in favor of @sentry/react-native, which we worked closely with the Sentry team on to ensure first-class support for Expo projects. Learn more.
    Expo Go only supports a single SDK version as of SDK 51. Learn more.
    Google Maps is no longer supported in Expo Go for iOS. You can use Apple Maps in Expo Go instead (remove the prop provider={PROVIDER_GOOGLE} from your <MapView /> components) or switch to a development build (recommended). If you have already configured Google Maps for your production releases, no additional configuration will be necessary. Learn how to set up a development build.
    Foreground location service is no longer supported in Expo Go for Android. You can use it in a development build, enable the isAndroidForegroundServiceEnabled option in the config plugin.
    Notifications entitlement is no longer always added to iOS projects during prebuild: No changes are required if you use expo-notifications. If your project uses push notifications but does not use the expo-notifications package, you may need to add the aps-environment entitlement to your app config:



    Expo 52:


    ➡️ Upgrading your app

Here's how to upgrade your app to Expo SDK 52 from 51:

    Update to the latest version of EAS CLI (if you use it):

npm i -g eas-cli

    Upgrade all dependencies to match SDK 52:

npx expo install expo@^52.0.0 --fix

    If you have any resolutions/overrides in your package.json, verify that they are still needed. For example, you should remove metro and metro-resolver overrides if you added them for expo-router in a previous SDK release. Additionally, if you previously configured your metro.config.js to work well in a monorepo, we recommend reading the updated Work with monorepos guide to see if you need to make any changes
    Check for any possible known issues:

npx expo-doctor@latest

    Refer to the "Deprecations, renamings, and removals" section above for breaking changes that are most likely to impact your app.
    Make sure to check the changelog for all other breaking changes!
    Upgrade Xcode if needed: Xcode 16 is needed to compile the native iOS project. We recommend Xcode 16.1 for SDK 52. For EAS Build, projects without any specified image will default to Xcode 16.1.
    If you use Continuous Native Generation:
        Delete the android and ios directories if you generated them for a previous SDK version in your local project directory. They'll be re-generated next time you run a build, either with npx expo run:ios, npx expo prebuild, or with EAS Build.
    If you don't use Continuous Native Generation:
        Run npx pod-install if you have an ios directory.
        Apply any relevant changes from the Native project upgrade helper.
        Alternatively, you could consider adopting prebuild for easier upgrades in the future.
    If you use development builds with expo-dev-client: Create a new development build after upgrading.
    If you use Expo Go: Consider migrating to a development builds. Expo Go is not recommended as a development environment for production apps.
    Having trouble? Refer to the Troubleshooting your SDK upgrade guide.
    Questions? Join our weekly office hours on Wednesdays at 12:00PM Pacific on Discord.

    Push notifications (remote notifications) will no longer be supported in Expo Go in SDK 53. In SDK 52, you will be warned when using push notifications-related features from expo-notifications in Expo Go. The reason for this change is that we (1) want to make transition from Expo Go to development builds smoother, and (2) make push notifications and their setup more transparent. Push notifications are deeply integrated with the native app which they are delivered to. Expo Go made some necessary integration steps in order to support push notifications - but the integration was somewhat opaque and would become invalid once users transitioned from Expo Go to development build. With this change, we instead ask developers to create a development build when they would like to use push notifications and configure them right away. Learn how to set up push notifications: docs, video.
    Google Maps will no longer be supported in Expo Go for Android in SDK 53. In SDK 52, you will be warned when using react-native-maps in Expo Go for Android. On iOS, Expo Go only supports Apple Maps. You can use Google Maps in development builds. Similar to the remote notifications change, this ensures that the setup of Google Maps is transparent and it is clear to developers that they will need to configure it before they are able to use the API in production.
    CRSQLite support in expo-sqlite has been deprecated. This was a fun experiment for us, but CRSQLite library is not currently under active development and so we've decided to remove it for now.
    expo-av Video API is deprecated, use expo-video instead.


