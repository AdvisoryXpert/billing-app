import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/payment.dart';

class PaymentService {
  static Future<List<Payment>> fetchPayments(String accessToken) async {
    final response = await http.get(
      Uri.parse('http://127.0.0.1:8000/api/payments'),
      headers: {'Authorization': 'Bearer $accessToken'},
    );

    if (response.statusCode == 200) {
      final List<dynamic> data = json.decode(response.body);
      return data.map((json) => Payment.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load payments');
    }
  }
}