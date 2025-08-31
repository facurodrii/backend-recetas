import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:pruebasmfsalud/screens/register_screen.dart'; // Asegúrate de que la ruta sea correcta

void main() {
  testWidgets('Registro de usuario', (WidgetTester tester) async {
    // Construir el widget y disparar un frame.
    await tester.pumpWidget(MaterialApp(
      home: RegisterScreen(),
    ));

    // Verificar que el campo de email esté presente.
    expect(find.byType(TextField), findsWidgets);
    expect(find.text('Email'), findsOneWidget);

    // Verificar que el botón de registro esté presente.
    expect(find.text('REGISTRARSE'), findsOneWidget);
  });
}
