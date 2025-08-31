import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';
import 'Screens/login_screen.dart';
import 'Screens/reset_password_screen.dart';
import 'Screens/register_screen.dart';
import 'Screens/home_screen.dart';
import 'Screens/solicitud_receta_screen.dart';
import 'Screens/turnos_screen.dart';
import 'settings_screen.dart';
import 'FAQscreen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Mi App',
      theme: ThemeData.light(),
      debugShowCheckedModeBanner: false,
      initialRoute: '/',
      routes: {
        '/': (context) => LoginScreen(),
        '/home': (context) => HomeScreen(),
        '/solicitud_receta': (context) => SolicitudRecetaScreen(),
        '/solicitud': (context) =>
            SolicitudRecetaScreen(), // <-- Agregada esta línea
        '/turnos': (context) => TurnosScreen(),
        '/settings': (context) => SettingsScreen(),
        '/faq': (context) => FAQScreen(),
        '/register': (context) => RegisterScreen(),
        '/reset_password': (context) => ResetPasswordScreen(),
      },
    );
  }
}
