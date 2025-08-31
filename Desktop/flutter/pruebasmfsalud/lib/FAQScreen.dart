import 'package:flutter/material.dart';

class FAQScreen extends StatelessWidget {
  final List<Map<String, String>> faqs = [
    {
      "question": "¿CÓMO SOLICITO UN TURNO?",
      "answer":
          "Para solicitar un turno, dirígete a la sección 'SOLICITUD DE TURNOS' y sigue las instrucciones."
    },
    {
      "question": "¿PUEDO CANCELAR UN TURNO?",
      "answer": "Sí, puedes cancelar tu turno desde la sección 'MIS TURNOS'."
    },
    {
      "question": "¿CÓMO MODIFICO MIS DATOS PERSONALES?",
      "answer": "Puedes modificar tus datos en la sección 'CONFIGURACIÓN'."
    },
  ];

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
              children: [
                Text(
                  'PREGUNTAS FRECUENTES',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.5,
                  ),
                ),
                SizedBox(height: 30),
                Expanded(
                  child: ListView.builder(
                    itemCount: faqs.length,
                    itemBuilder: (context, index) {
                      return Card(
                        color: Colors.white.withOpacity(0.9),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        margin: EdgeInsets.symmetric(vertical: 10),
                        child: ExpansionTile(
                          title: Center(
                            child: Text(
                              faqs[index]['question']!,
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: Colors.black,
                              ),
                            ),
                          ),
                          children: [
                            Padding(
                              padding: EdgeInsets.all(16.0),
                              child: Text(
                                faqs[index]['answer']!,
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                    fontSize: 16, color: Colors.black87),
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
