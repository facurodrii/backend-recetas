//ESTE ARCHIVO CORRESPONDE A LA CONFIGURACION DE LOS TURNOS MEDICOS

import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class AppointmentScreen extends StatefulWidget {
  @override
  _AppointmentScreenState createState() => _AppointmentScreenState();
}

class _AppointmentScreenState extends State<AppointmentScreen> {
  String? selectedSpecialty;
  String? selectedDoctor;
  DateTime? selectedDate;
  TimeOfDay? selectedTime;

  // Listas de ejemplo para especialidades y médicos
  final List<String> specialties = [
    'Cardiología',
    'Dermatología',
    'Neurología'
  ];
  final Map<String, List<String>> doctorsBySpecialty = {
    'Cardiología': ['Dr. García', 'Dra. Gómez'],
    'Dermatología': ['Dr. Pérez', 'Dra. López'],
    'Neurología': ['Dr. Torres', 'Dra. Flores'],
  };

  // Selección de fecha
  Future<void> selectDate(BuildContext context) async {
    final DateTime? pickedDate = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(Duration(days: 60)),
    );
    if (pickedDate != null && pickedDate != selectedDate)
      setState(() {
        selectedDate = pickedDate;
      });
  }

  // Selección de hora
  Future<void> selectTime(BuildContext context) async {
    final TimeOfDay? pickedTime = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.now(),
    );
    if (pickedTime != null && pickedTime != selectedTime)
      setState(() {
        selectedTime = pickedTime;
      });
  }

  // Confirmación de turno
  void confirmAppointment() {
    if (selectedSpecialty != null &&
        selectedDoctor != null &&
        selectedDate != null &&
        selectedTime != null) {
      // Crear mensaje con los detalles del turno
      String message =
          '¡Hola! Deseo solicitar un turno con $selectedDoctor en $selectedSpecialty el ${selectedDate!.day}/${selectedDate!.month}/${selectedDate!.year} a las ${selectedTime!.format(context)}.';

      // Enviar mensaje por WhatsApp
      sendWhatsAppMessage(message);

      // Mensaje de confirmación en la app
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
              'Turno confirmado con $selectedDoctor el ${selectedDate!.day}/${selectedDate!.month} a las ${selectedTime!.format(context)}.'),
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Por favor, complete todos los campos.'),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Solicitud de Turnos")),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            DropdownButtonFormField<String>(
              value: selectedSpecialty,
              hint: Text("Seleccione Especialidad"),
              onChanged: (value) {
                setState(() {
                  selectedSpecialty = value;
                  selectedDoctor =
                      null; // Resetear doctor cuando cambia especialidad
                });
              },
              items: specialties.map((specialty) {
                return DropdownMenuItem(
                  value: specialty,
                  child: Text(specialty),
                );
              }).toList(),
            ),
            if (selectedSpecialty !=
                null) // Mostrar si hay especialidad seleccionada
              DropdownButtonFormField<String>(
                value: selectedDoctor,
                hint: Text("Seleccione Médico"),
                onChanged: (value) {
                  setState(() {
                    selectedDoctor = value;
                  });
                },
                items: doctorsBySpecialty[selectedSpecialty]!.map((doctor) {
                  return DropdownMenuItem(
                    value: doctor,
                    child: Text(doctor),
                  );
                }).toList(),
              ),
            SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(selectedDate == null
                    ? "Seleccione Fecha"
                    : "${selectedDate!.day}/${selectedDate!.month}/${selectedDate!.year}"),
                ElevatedButton(
                  onPressed: () => selectDate(context),
                  child: Text("Fecha"),
                ),
              ],
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(selectedTime == null
                    ? "Seleccione Hora"
                    : "${selectedTime!.format(context)}"),
                ElevatedButton(
                  onPressed: () => selectTime(context),
                  child: Text("Hora"),
                ),
              ],
            ),
            Spacer(),
            Center(
              child: ElevatedButton(
                onPressed: confirmAppointment,
                child: Text("Confirmar Turno"),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void sendWhatsAppMessage(String message) async {
    final uri = Uri.parse(
        "https://api.whatsapp.com/send?phone=541163717441&text=${Uri.encodeComponent(message)}");
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      print("No se pudo abrir WhatsApp");
    }
  }
}
