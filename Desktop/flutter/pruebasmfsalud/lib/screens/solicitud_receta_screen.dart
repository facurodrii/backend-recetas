import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class SolicitudRecetaScreen extends StatefulWidget {
  @override
  _SolicitudRecetaScreenState createState() => _SolicitudRecetaScreenState();
}

class _SolicitudRecetaScreenState extends State<SolicitudRecetaScreen> {
  int _currentStep = 0;
  String? _selectedNombreGenerico;
  String? _selectedNombreComercial;
  String? _selectedDosis;
  String? _selectedFormaFarmaceutica;
  int? _requerimientoMensual;
  TextEditingController _searchController = TextEditingController();
  TextEditingController _requerimientoMensualController =
      TextEditingController();

  // Variables para los datos del paciente
  String? nombrePaciente;
  String? apellidoPaciente;
  String? dniPaciente;
  String? emailPaciente;

  List<Medicamento> medicamentos = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchMedicamentos();
  }

  Future<void> _fetchMedicamentos() async {
    final snapshot =
        await FirebaseFirestore.instance.collection('medicamentos').get();
    setState(() {
      medicamentos = snapshot.docs
          .map((doc) => Medicamento.fromFirestore(doc.data()))
          .toList();
      isLoading = false;
    });
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

  List<String> get nombresGenericos {
    List<String> nombres =
        medicamentos.map((med) => med.nombreGenerico).toSet().toList()..sort();
    return nombres;
  }

  List<String> get nombresComerciales {
    if (_selectedNombreGenerico == null) return [];
    List<String> nombres = medicamentos
        .where((med) => med.nombreGenerico == _selectedNombreGenerico)
        .map((med) => med.nombreComercial)
        .toSet()
        .toList()
      ..sort();
    return nombres;
  }

  List<String> get dosis {
    if (_selectedNombreComercial == null) return [];
    return medicamentos
        .where((med) =>
            med.nombreGenerico == _selectedNombreGenerico &&
            med.nombreComercial == _selectedNombreComercial)
        .map((med) => med.dosis)
        .toSet()
        .toList();
  }

  List<String> formasFarmaceuticas = [
    "COMPRIMIDOS",
    "JARABE/TONICO",
    "TABLETAS",
    "SOBRES",
    "CAPSULAS",
    "CREMA",
    "UNGUENTO",
    "SUSPENSION",
    "AMPOLLA",
    "SOLUCION",
    "GOTAS",
    "EMULSION",
    "FRASCO AMPOLLA",
    "LANCETAS",
    // Agrega más si necesitas
  ];

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }
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
          title: Text(
            "SOLICITUD DE RECETA",
            style: TextStyle(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.bold,
              letterSpacing: 1.5,
            ),
          ),
        ),
        body: Column(
          children: [
            Expanded(
              child: Stepper(
                currentStep: _currentStep,
                onStepContinue: () {
                  if (_canContinue()) {
                    if (_currentStep < 4) {
                      setState(() {
                        _currentStep += 1;
                      });
                    }
                  } else {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(
                            "Por favor, selecciona una opción antes de continuar"),
                      ),
                    );
                  }
                },
                onStepCancel: () {
                  if (_currentStep > 0) {
                    setState(() {
                      _currentStep -= 1;
                    });
                  }
                },
                steps: [
                  Step(
                    title: Text(
                      "1: NOMBRE GENÉRICO",
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.5,
                      ),
                    ),
                    content: Column(
                      children: [
                        TextField(
                          controller: _searchController,
                          decoration: InputDecoration(
                            labelText: "BUSCAR NOMBRE GENÉRICO",
                            labelStyle: TextStyle(color: Colors.white),
                            suffixIcon: Icon(Icons.search, color: Colors.white),
                            filled: true,
                            fillColor: Colors.transparent,
                            border: UnderlineInputBorder(
                              borderSide: BorderSide(color: Colors.white),
                            ),
                          ),
                          style: TextStyle(color: Colors.white),
                          onChanged: (value) {
                            setState(() {});
                          },
                        ),
                        SizedBox(height: 10),
                        Container(
                          height: 200,
                          child: ListView(
                            children: nombresGenericos
                                .where((nombre) => nombre
                                    .toLowerCase()
                                    .contains(
                                        _searchController.text.toLowerCase()))
                                .map((nombre) => ListTile(
                                      title: Text(
                                        nombre.toUpperCase(),
                                        style: TextStyle(
                                          color: Colors.white,
                                          fontSize: 16,
                                          letterSpacing: 1.5,
                                        ),
                                      ),
                                      onTap: () {
                                        setState(() {
                                          _selectedNombreGenerico = nombre;
                                          _selectedNombreComercial = null;
                                          _selectedDosis = null;
                                          _selectedFormaFarmaceutica = null;
                                          _requerimientoMensual = null;
                                        });
                                      },
                                      tileColor:
                                          _selectedNombreGenerico == nombre
                                              ? Colors.white30
                                              : null,
                                    ))
                                .toList(),
                          ),
                        ),
                      ],
                    ),
                    isActive: _currentStep >= 0,
                    state: _selectedNombreGenerico != null
                        ? StepState.complete
                        : StepState.indexed,
                  ),
                  Step(
                    title: Text(
                      "2: NOMBRE COMERCIAL",
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.5,
                      ),
                    ),
                    content: Container(
                      height: 200,
                      child: ListView(
                        children: nombresComerciales
                            .map((nombre) => ListTile(
                                  title: Text(
                                    nombre.toUpperCase(),
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 16,
                                      letterSpacing: 1.5,
                                    ),
                                  ),
                                  onTap: () {
                                    setState(() {
                                      _selectedNombreComercial = nombre;
                                      _selectedDosis = null;
                                      _selectedFormaFarmaceutica = null;
                                      _requerimientoMensual = null;
                                    });
                                  },
                                  tileColor: _selectedNombreComercial == nombre
                                      ? Colors.white30
                                      : null,
                                ))
                            .toList(),
                      ),
                    ),
                    isActive: _currentStep >= 1,
                    state: _selectedNombreComercial != null
                        ? StepState.complete
                        : StepState.indexed,
                  ),
                  Step(
                    title: Text(
                      "3: INDIQUE LA DOSIS",
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.5,
                      ),
                    ),
                    content: Container(
                      height: 200,
                      child: ListView(
                        children: dosis
                            .map((dosis) => ListTile(
                                  title: Text(
                                    dosis.toUpperCase(),
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 16,
                                      letterSpacing: 1.5,
                                    ),
                                  ),
                                  onTap: () {
                                    setState(() {
                                      _selectedDosis = dosis;
                                      _selectedFormaFarmaceutica = null;
                                      _requerimientoMensual = null;
                                    });
                                  },
                                  tileColor: _selectedDosis == dosis
                                      ? Colors.white30
                                      : null,
                                ))
                            .toList(),
                      ),
                    ),
                    isActive: _currentStep >= 2,
                    state: _selectedDosis != null
                        ? StepState.complete
                        : StepState.indexed,
                  ),
                  Step(
                    title: Text(
                      "4: FORMA FARMACÉUTICA",
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.5,
                      ),
                    ),
                    content: Container(
                      height: 200,
                      child: ListView(
                        children: formasFarmaceuticas
                            .map((forma) => ListTile(
                                  title: Text(
                                    forma,
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 16,
                                      letterSpacing: 1.5,
                                    ),
                                  ),
                                  onTap: () {
                                    setState(() {
                                      _selectedFormaFarmaceutica = forma;
                                      _requerimientoMensual = null;
                                    });
                                  },
                                  tileColor: _selectedFormaFarmaceutica == forma
                                      ? Colors.white30
                                      : null,
                                ))
                            .toList(),
                      ),
                    ),
                    isActive: _currentStep >= 3,
                    state: _selectedFormaFarmaceutica != null
                        ? StepState.complete
                        : StepState.indexed,
                  ),
                  Step(
                    title: Text(
                      "5: REQUERIMIENTO MENSUAL",
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.5,
                      ),
                    ),
                    content: Column(
                      children: [
                        TextField(
                          controller: _requerimientoMensualController,
                          decoration: InputDecoration(
                            labelText:
                                "Ingrese el requerimiento mensual (unidades)",
                            labelStyle: TextStyle(color: Colors.white),
                            filled: true,
                            fillColor: Colors.transparent,
                            border: UnderlineInputBorder(
                              borderSide: BorderSide(color: Colors.white),
                            ),
                          ),
                          style: TextStyle(color: Colors.white),
                          keyboardType: TextInputType.number,
                          onChanged: (value) {
                            setState(() {
                              _requerimientoMensual = int.tryParse(value);
                            });
                          },
                        ),
                      ],
                    ),
                    isActive: _currentStep >= 4,
                    state: _requerimientoMensual != null
                        ? StepState.complete
                        : StepState.indexed,
                  ),
                ],
              ),
            ),
            if (_currentStep == 4)
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: ElevatedButton(
                  onPressed: () {
                    if (_canSubmit()) {
                      _mostrarResumen();
                    } else {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(
                              "Por favor, completa todos los pasos obligatorios"),
                        ),
                      );
                    }
                  },
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
              ),
          ],
        ),
      ),
    );
  }

  bool _canContinue() {
    switch (_currentStep) {
      case 0:
        return _selectedNombreGenerico != null;
      case 1:
        return _selectedNombreComercial != null;
      case 2:
        return _selectedDosis != null;
      case 3:
        return _selectedFormaFarmaceutica != null;
      case 4:
        return _requerimientoMensual != null;
      default:
        return false;
    }
  }

  bool _canSubmit() {
    return _selectedNombreGenerico != null &&
        _selectedNombreComercial != null &&
        _selectedDosis != null &&
        _selectedFormaFarmaceutica != null &&
        _requerimientoMensual != null;
  }

  void _mostrarResumen() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text("Resumen de la Solicitud"),
          content: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                    "Paciente: ${nombrePaciente ?? ''} ${apellidoPaciente ?? ''}"),
                Text("DNI: ${dniPaciente ?? ''}"),
                Text("Email: ${emailPaciente ?? ''}"),
                Text(
                    "Nombre Genérico: ${_selectedNombreGenerico ?? 'No seleccionado'}"),
                Text(
                    "Nombre Comercial: ${_selectedNombreComercial ?? 'No seleccionado'}"),
                Text("Dosis: ${_selectedDosis ?? 'No seleccionado'}"),
                Text(
                    "Forma Farmacéutica: ${_selectedFormaFarmaceutica ?? 'No seleccionado'}"),
                Text(
                    "Requerimiento Mensual: ${_requerimientoMensual != null ? '$_requerimientoMensual UNIDADES' : 'No seleccionado'}"),
              ],
            ),
          ),
          actions: [
            TextButton(
              child: Text("Cancelar"),
              onPressed: () {
                Navigator.of(context).pop();
              },
            ),
            TextButton(
              child: Text("Enviar"),
              onPressed: () {
                Navigator.of(context).pop();
                _enviarSolicitudPorEmail();
              },
            ),
          ],
        );
      },
    );
  }

  void _enviarSolicitudPorEmail() async {
    final url =
        Uri.parse('https://backend-recetas-38uj.onrender.com/enviar-receta');
    final body = {
      'nombrePaciente': nombrePaciente ?? '',
      'apellidoPaciente': apellidoPaciente ?? '',
      'dniPaciente': dniPaciente ?? '',
      'emailPaciente': emailPaciente ?? '',
      'nombreGenerico': _selectedNombreGenerico ?? '',
      'nombreComercial': _selectedNombreComercial ?? '',
      'dosis': _selectedDosis ?? '',
      'formaFarmaceutica': _selectedFormaFarmaceutica ?? '',
      'requerimientoMensual': _requerimientoMensual?.toString() ?? '',
    };

    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: json.encode(body),
      );
      if (response.statusCode == 200) {
        _mostrarConfirmacionEnvio();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text('Error al enviar la solicitud: ${response.body}')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error de conexión: $e')),
      );
    }
  }

  void _mostrarConfirmacionEnvio() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text("Confirmación"),
          content: Text(
            "Su solicitud de receta se ha enviado correctamente. Será informado por mail cuando esté lista para retirar.",
          ),
          actions: [
            TextButton(
              child: Text("Aceptar"),
              onPressed: () {
                Navigator.of(context).pop();
                setState(() {
                  _currentStep = 0;
                  _selectedNombreGenerico = null;
                  _selectedNombreComercial = null;
                  _selectedDosis = null;
                  _selectedFormaFarmaceutica = null;
                  _requerimientoMensual = null;
                  _requerimientoMensualController.clear();
                });
              },
            ),
          ],
        );
      },
    );
  }
}

// Clase Medicamento para Firestore
class Medicamento {
  final String nombreGenerico;
  final String nombreComercial;
  final String dosis;
  final int? contenido;

  Medicamento({
    required this.nombreGenerico,
    required this.nombreComercial,
    required this.dosis,
    this.contenido,
  });

  factory Medicamento.fromFirestore(Map<String, dynamic> data) {
    return Medicamento(
      nombreGenerico: data['nombreGenerico'] ?? '',
      nombreComercial: data['nombreComercial'] ?? '',
      dosis: data['dosis'] ?? '',
      contenido: data['contenido'] is int ? data['contenido'] : null,
    );
  }
}
