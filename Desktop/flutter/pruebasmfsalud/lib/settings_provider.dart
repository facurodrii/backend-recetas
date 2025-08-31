// lib/Settings/settings_provider.dart

import 'package:flutter/material.dart';

class SettingsProvider extends ChangeNotifier {
  bool _isDarkMode = false;
  bool _isHighContrast = false;
  double _fontSizeMultiplier = 1.0;

  bool get isDarkMode => _isDarkMode;
  bool get isHighContrast => _isHighContrast;
  double get fontSizeMultiplier => _fontSizeMultiplier;

  void toggleDarkMode(bool value) {
    _isDarkMode = value;
    notifyListeners();
  }

  void toggleHighContrast(bool value) {
    _isHighContrast = value;
    notifyListeners();
  }

  void setFontSizeMultiplier(double multiplier) {
    _fontSizeMultiplier = multiplier;
    notifyListeners();
  }
}
