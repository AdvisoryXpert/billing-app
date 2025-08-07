import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/client.dart';
import '../constants/api_constant.dart';

class ClientService {
  // ✅ Modified to take token as input per session
  static Future<List<Client>> fetchClients(String accessToken) async {
    final url = Uri.parse('$baseUrl/clients');

    final response = await http.get(
      url,
      headers: {
        'Authorization': 'Bearer $accessToken',
        'Accept': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      List<dynamic> data = jsonDecode(response.body);
      return data.map((item) => Client.fromJson(item)).toList();
    } else {
      throw Exception('Failed to load clients. Status: ${response.statusCode}');
    }
  }
}