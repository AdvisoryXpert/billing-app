import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class AuthService {
  static const String baseUrl = 'http://localhost:8000'; // update if needed
  static final storage = FlutterSecureStorage();

 static Future<Map<String, dynamic>?> login(String email, String password) async {
  final url = Uri.parse('$baseUrl/api/login');
  final response = await http.post(
    url,
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({'email': email, 'password': password}),
  );

  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);

    final token = data['access_token']; // ✅ Correct key
    final user = data['user'];

    if (token != null) {
      await storage.write(key: 'token', value: token);
      await storage.write(key: 'user_email', value: user['email']);
      return {'token': token, 'user': user};
    } else {
      print('Token missing in response');
      return null;
    }
  } else {
    print('Login failed: ${response.body}');
    return null;
  }
}

  static Future<String?> getToken() => storage.read(key: 'token');

  static Future<void> logout() async {
    await storage.delete(key: 'token');
    await storage.delete(key: 'user_email');
  }
}
