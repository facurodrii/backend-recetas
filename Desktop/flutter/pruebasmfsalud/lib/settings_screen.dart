import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'screens/login_screen.dart'; // Asegúrate de que este archivo exista y la ruta sea correcta

class SettingsScreen extends StatefulWidget {
  @override
  _SettingsScreenState createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  String nombre = '';
  String apellido = '';
  String fechaNacimiento = '';
  String dni = '';
  String obraSocial = '';
  String numeroAfiliado = '';
  String telefono = '';
  String email = '';
  bool isDarkMode = false;
  bool isHighContrast = false;
  User? user;

  @override
  void initState() {
    super.initState();
    user = FirebaseAuth.instance.currentUser;
    _loadUserData();
    _loadAccessibilityPreferences();
  }

  Future<void> _loadUserData() async {
    if (user != null) {
      try {
        DocumentSnapshot userData = await FirebaseFirestore.instance
            .collection('users')
            .doc(user!.uid)
            .get();

        if (userData.exists) {
          setState(() {
            nombre = userData['nombre'] ?? '';
            apellido = userData['apellido'] ?? '';
            fechaNacimiento = userData['fecha_nacimiento'] ?? '';
            dni = userData['dni'] ?? '';
            obraSocial = userData['obra_social'] ?? '';
            numeroAfiliado = userData['numero_afiliado'] ?? '';
            telefono = userData['telefono'] ?? '';
            email = userData['email'] ?? '';
          });
        }
      } catch (e) {
        print("Error al cargar los datos: $e");
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('🚨 Error al cargar los datos: $e')),
        );
      }
    }
  }

  Future<void> _loadAccessibilityPreferences() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    setState(() {
      isDarkMode = prefs.getBool('isDarkMode') ?? false;
      isHighContrast = prefs.getBool('isHighContrast') ?? false;
    });
  }

  Future<void> _saveAccessibilityPreference(String key, bool value) async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    prefs.setBool(key, value);
  }

  Future<void> updatePersonalInfo(String field, String newValue) async {
    if (user != null) {
      try {
        await FirebaseFirestore.instance
            .collection('users')
            .doc(user!.uid)
            .update({
          field: newValue,
        });

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Datos actualizados correctamente')),
        );
        // Recargar los datos después de actualizar
        await _loadUserData();
      } catch (e) {
        print("Error actualizando datos: $e");
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('🚨 Error al actualizar los datos: $e')),
        );
      }
    }
  }

  Future<void> _signOut() async {
    await FirebaseAuth.instance.signOut();
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(
          builder: (context) =>
              LoginScreen()), // Usamos el widget LoginScreen correctamente
    );
  }

  @override
  Widget build(BuildContext context) {
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
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'CONFIGURACIÓN',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 2.0,
                  ),
                ),
                const SizedBox(height: 20),
                Expanded(
                  child: ListView(
                    children: [
                      _buildSectionTitle('DATOS PERSONALES'),
                      _buildPersonalInfoSection(),
                      const SizedBox(height: 20),
                      _buildSectionTitle('ACCESIBILIDAD'),
                      _buildAccessibilitySection(),
                      const SizedBox(height: 20),
                      _buildSectionTitle('SEGURIDAD'),
                      _buildSecuritySection(),
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

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Text(
        title,
        style: TextStyle(
          color: Colors.white,
          fontSize: 18,
          fontWeight: FontWeight.bold,
          letterSpacing: 1.5,
        ),
      ),
    );
  }

  Widget _buildPersonalInfoSection() {
    return Column(
      children: [
        _buildListTile('Nombre', nombre, 'nombre'),
        _buildListTile('Apellido', apellido, 'apellido'),
        _buildListTile(
            'Fecha de Nacimiento', fechaNacimiento, 'fecha_nacimiento'),
        _buildListTile('DNI', dni, 'dni'),
        _buildListTile('Obra Social', obraSocial, 'obra_social'),
        _buildListTile('Nº de Afiliado', numeroAfiliado, 'numero_afiliado'),
        _buildListTile('Número de Teléfono', telefono, 'telefono'),
        _buildListTile('Correo Electrónico', email, 'email', isEditable: false),
      ],
    );
  }

  Widget _buildListTile(String title, String value, String field,
      {bool isEditable = true}) {
    return ListTile(
      title: Text(
        title.toUpperCase(),
        style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
      ),
      subtitle: Text(
        value.isEmpty ? 'No especificado' : value,
        style: TextStyle(color: Colors.white70),
      ),
      trailing: isEditable ? Icon(Icons.edit, color: Colors.white) : null,
      onTap: isEditable
          ? () {
              _showEditDialog(title, value, (newValue) {
                setState(() {
                  if (field == 'nombre') nombre = newValue;
                  if (field == 'apellido') apellido = newValue;
                  if (field == 'fecha_nacimiento') fechaNacimiento = newValue;
                  if (field == 'dni') dni = newValue;
                  if (field == 'obra_social') obraSocial = newValue;
                  if (field == 'numero_afiliado') numeroAfiliado = newValue;
                  if (field == 'telefono') telefono = newValue;
                });
                updatePersonalInfo(field, newValue);
              });
            }
          : null,
    );
  }

  Widget _buildAccessibilitySection() {
    return Column(
      children: [
        SwitchListTile(
          title: Text(
            'Modo Oscuro'.toUpperCase(),
            style: TextStyle(color: Colors.white),
          ),
          value: isDarkMode,
          onChanged: (value) {
            setState(() {
              isDarkMode = value;
              _saveAccessibilityPreference('isDarkMode', value);
            });
          },
        ),
        SwitchListTile(
          title: Text(
            'Alto Contraste'.toUpperCase(),
            style: TextStyle(color: Colors.white),
          ),
          value: isHighContrast,
          onChanged: (value) {
            setState(() {
              isHighContrast = value;
              _saveAccessibilityPreference('isHighContrast', value);
            });
          },
        ),
      ],
    );
  }

  Widget _buildSecuritySection() {
    return Column(
      children: [
        ListTile(
          title: Text(
            'Cerrar Sesión'.toUpperCase(),
            style: TextStyle(color: Colors.white),
          ),
          onTap: _signOut,
        ),
      ],
    );
  }

  void _showEditDialog(
      String field, String currentValue, Function(String) onSave) {
    TextEditingController controller =
        TextEditingController(text: currentValue);
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text('Editar $field'),
          content: TextField(controller: controller),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cancelar'),
            ),
            TextButton(
              onPressed: () {
                if (controller.text.isEmpty) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('🚨 El campo no puede estar vacío')),
                  );
                  return;
                }
                onSave(controller.text);
                Navigator.of(context).pop();
              },
              child: const Text('Guardar'),
            ),
          ],
        );
      },
    );
  }
}
