import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class TurnosScreen extends StatefulWidget {
  @override
  _TurnosScreenState createState() => _TurnosScreenState();
}

class _TurnosScreenState extends State<TurnosScreen> {
  final TextEditingController _searchController = TextEditingController();
  List<String> especialidades = [
    "CLÍNICA MÉDICA",
    "CIRUGÍA GENERAL",
    "CARDIOLOGÍA",
    "DIABETOLOGÍA",
    "DERMATOLOGÍA",
    "ENDOCRINOLOGÍA",
    "GASTROENTEROLOGÍA",
    "GINECOLOGÍA Y OBSTETRICIA",
    "HEPATOLOGÍA",
    "NEFROLOGÍA",
    "NEUROLOGÍA",
    "TRAUMATOLOGÍA",
    "UROLOGÍA",
  ];
  List<String> _filteredEspecialidades = [];
  String? _selectedEspecialidad;

  // Datos del paciente recibidos por argumentos
  String? nombrePaciente;
  String? apellidoPaciente;
  String? dniPaciente;
  String? emailPaciente;

  @override
  void initState() {
    super.initState();
    _filteredEspecialidades = especialidades;
    _searchController.addListener(_filterEspecialidades);
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final args =
        ModalRoute.of(context)?.settings.arguments as Map<String, dynamic>?;
    if (args != null) {
      nombrePaciente = args['nombre'] ?? '';
      apellidoPaciente = args['apellido'] ?? '';
      dniPaciente = args['dni'] ?? '';
      emailPaciente = args['email'] ?? '';
    }
  }

  void _filterEspecialidades() {
    String query = _searchController.text.toUpperCase();
    setState(() {
      _filteredEspecialidades = especialidades
          .where((especialidad) => especialidad.contains(query))
          .toList();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _mostrarResumen() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text("RESUMEN DE LA SOLICITUD"),
          content: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                    "Paciente: ${nombrePaciente ?? ''} ${apellidoPaciente ?? ''}"),
                Text("DNI: ${dniPaciente ?? ''}"),
                Text("Email: ${emailPaciente ?? ''}"),
                Text("Especialidad: ${_selectedEspecialidad ?? ''}"),
              ],
            ),
          ),
          actions: [
            TextButton(
              child: Text("CANCELAR"),
              onPressed: () {
                Navigator.of(context).pop();
              },
            ),
            TextButton(
              child: Text("ENVIAR"),
              onPressed: () async {
                Navigator.of(context).pop();
                await Future.delayed(Duration(milliseconds: 100));
                if (mounted) {
                  _enviarSolicitudTurno();
                }
              },
            ),
          ],
        );
      },
    );
  }

  void _enviarSolicitudTurno() async {
    final url =
        Uri.parse('https://backend-recetas-38uj.onrender.com/enviar-turno');
    final body = {
      'nombrePaciente': nombrePaciente ?? '',
      'apellidoPaciente': apellidoPaciente ?? '',
      'dniPaciente': dniPaciente ?? '',
      'emailPaciente': emailPaciente ?? '',
      'especialidad': _selectedEspecialidad ?? '',
    };

    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: json.encode(body),
      );
      if (!mounted) return;
      if (response.statusCode == 200) {
        _mostrarConfirmacionEnvio();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text('Error al enviar la solicitud: ${response.body}')),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error de conexión: $e')),
      );
    }
  }

  void _mostrarConfirmacionEnvio() {
    if (!mounted) return;
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text("CONFIRMACIÓN DE TURNO"),
          content: Text(
            "EL TURNO SERÁ CONFIRMADO A LA BREVEDAD VÍA CORREO ELECTRÓNICO, ATENDIENDO LOS TURNOS DISPONIBLES Y LA DISPONIBILIDAD HORARIA DEL PROFESIONAL.",
          ),
          actions: [
            TextButton(
              child: Text("ACEPTAR"),
              onPressed: () {
                Navigator.of(context).pop();
                setState(() {
                  _selectedEspecialidad = null;
                });
              },
            ),
          ],
        );
      },
    );
  }

  void _solicitarTurno() {
    if (_selectedEspecialidad == null) {
      showDialog(
        context: context,
        builder: (BuildContext context) {
          return AlertDialog(
            title: Text("ERROR"),
            content: Text(
                "POR FAVOR, SELECCIONA UNA ESPECIALIDAD ANTES DE CONTINUAR."),
            actions: [
              TextButton(
                child: Text("ACEPTAR"),
                onPressed: () {
                  Navigator.of(context).pop();
                },
              ),
            ],
          );
        },
      );
      return;
    }
    _mostrarResumen();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFF043A66), Color(0xFF29E7B9)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Scaffold(
        backgroundColor: Colors.transparent,
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          elevation: 0,
          leading: IconButton(
            icon: Icon(Icons.arrow_back, color: Colors.white),
            onPressed: () => Navigator.of(context).pop(),
          ),
          title: Text(
            "TURNOS",
            style: TextStyle(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.bold,
              letterSpacing: 1.5,
            ),
          ),
        ),
        body: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TextField(
                controller: _searchController,
                decoration: InputDecoration(
                  labelText: "BUSCAR ESPECIALIDAD",
                  labelStyle: TextStyle(color: Colors.white),
                  suffixIcon: Icon(Icons.search, color: Colors.white),
                  filled: true,
                  fillColor: Colors.transparent,
                  border: UnderlineInputBorder(
                    borderSide: BorderSide(color: Colors.white),
                  ),
                ),
                style: TextStyle(color: Colors.white, letterSpacing: 1.5),
              ),
              SizedBox(height: 10),
              Expanded(
                child: ListView.builder(
                  itemCount: _filteredEspecialidades.length,
                  itemBuilder: (context, index) {
                    return ListTile(
                      title: Text(
                        _filteredEspecialidades[index].toUpperCase(),
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          letterSpacing: 1.5,
                        ),
                      ),
                      onTap: () {
                        setState(() {
                          _selectedEspecialidad =
                              _filteredEspecialidades[index];
                        });
                      },
                      tileColor: _selectedEspecialidad ==
                              _filteredEspecialidades[index]
                          ? Colors.white30
                          : null,
                    );
                  },
                ),
              ),
              SizedBox(height: 20),
              ElevatedButton(
                onPressed: _solicitarTurno,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Color(0xFF6200EE),
                  padding: EdgeInsets.symmetric(vertical: 15.0),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8.0),
                  ),
                ),
                child: Text(
                  "CONFIRMAR",
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                    letterSpacing: 1.5,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
