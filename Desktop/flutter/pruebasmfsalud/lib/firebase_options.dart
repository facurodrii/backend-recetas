import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show kIsWeb, defaultTargetPlatform, TargetPlatform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      // Puedes agregar iOS, macOS, Windows si los usas
      default:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported for this platform.',
        );
    }
  }

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyDCgRkQOkicvvHwAXpfrjFDNvLS6GS9fmk',
    appId: '1:77729385748:android:a968127cce6d2e18fb8601',
    messagingSenderId: '77729385748',
    projectId: 'cmfsalud-8beda',
    storageBucket: 'cmfsalud-8beda.firebasestorage.app',
  );

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyCHnSmGMrVjAcBpJpV2kJbAEF08BFtzLsA',
    appId: '1:77729385748:web:c58eb56b47d1d369fb8601',
    messagingSenderId: '77729385748',
    projectId: 'cmfsalud-8beda',
    authDomain: 'cmfsalud-8beda.firebaseapp.com',
    storageBucket: 'cmfsalud-8beda.firebasestorage.app',
  );
}
