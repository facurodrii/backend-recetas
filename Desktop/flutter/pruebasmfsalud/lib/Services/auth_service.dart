import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  Future<User?> registerWithEmailAndPassword(
      String email, String password, Map<String, dynamic> userData) async {
    try {
      UserCredential userCredential =
          await _auth.createUserWithEmailAndPassword(
        email: email.trim(),
        password: password.trim(),
      );
      User? user = userCredential.user;

      if (user != null) {
        await user.sendEmailVerification();
        await _firestore.collection('usuarios').doc(user.uid).set(userData);
        return user;
      }
      return null;
    } on FirebaseAuthException catch (e) {
      print('Error de FirebaseAuth: ${e.code} - ${e.message}');
      return null;
    } catch (e) {
      print('Error desconocido: $e');
      return null;
    }
  }

  Future<User?> signInWithEmailAndPassword(
      String email, String password) async {
    try {
      UserCredential userCredential = await _auth.signInWithEmailAndPassword(
        email: email.trim(),
        password: password.trim(),
      );
      User? user = userCredential.user;

      if (user != null) {
        if (!user.emailVerified) {
          await _auth.signOut();
          return null;
        }
        return user;
      }
      return null;
    } on FirebaseAuthException catch (e) {
      print('Error de FirebaseAuth: ${e.code} - ${e.message}');
      return null;
    } catch (e) {
      print('Error desconocido: $e');
      return null;
    }
  }

  Future<void> signOut() async {
    await _auth.signOut();
  }

  User? getCurrentUser() {
    return _auth.currentUser;
  }
}
