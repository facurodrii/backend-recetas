// lib/Screens/accessibility_settings.dart

import 'package:flutter/material.dart';

class AccessibilitySettings extends StatefulWidget {
  @override
  _AccessibilitySettingsState createState() => _AccessibilitySettingsState();
}

class _AccessibilitySettingsState extends State<AccessibilitySettings> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Configuración de Accesibilidad"),
      ),
      body: Center(
        child: Text("Ajustes de accesibilidad van aquí"),
      ),
    );
  }
}
