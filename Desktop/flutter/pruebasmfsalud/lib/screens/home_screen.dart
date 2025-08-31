import 'package:flutter/material.dart';
import '../settings_screen.dart';
import '../FAQscreen.dart';
import 'solicitud_receta_screen.dart';
import 'turnos_screen.dart';

class HomeScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    // Recibe los argumentos del login
    final args =
        ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>?;

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFF043A66), Color(0xFF29E7B9)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                // Logo con menos margen superior
                Padding(
                  padding: const EdgeInsets.only(top: 50.0, bottom: 120.0),
                  child: Image.asset(
                    'assets/images/logo.png',
                    height: 100,
                  ),
                ),
                // Cuadrícula de 2x2
                Expanded(
                  child: GridView.count(
                    crossAxisCount: 2,
                    crossAxisSpacing: 16.0,
                    mainAxisSpacing: 16.0,
                    padding: const EdgeInsets.all(8.0),
                    children: [
                      // Primera fila
                      _buildGridButton(context, 'RECETAS', () {
                        Navigator.pushNamed(
                          context,
                          '/solicitud',
                          arguments: args, // Pasa los datos del usuario
                        );
                      }),
                      _buildGridButton(context, 'TURNOS', () {
                        Navigator.pushNamed(
                          context,
                          '/turnos',
                          arguments: args, // Pasa los datos del usuario
                        );
                      }),
                      // Segunda fila
                      _buildGridButton(context, 'AYUDA', () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (context) => FAQScreen()),
                        );
                      }),
                      _buildGridButton(context, 'CONFIGURACIÓN', () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                              builder: (context) => SettingsScreen()),
                        );
                      }),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildGridButton(
      BuildContext context, String title, VoidCallback onTap) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: onTap,
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.white,
          foregroundColor: Colors.black,
          padding: EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
        child: Text(
          title,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.5,
          ),
        ),
      ),
    );
  }
}
