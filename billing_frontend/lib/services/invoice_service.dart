import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/invoice.dart';

class InvoiceService {
  static Future<List<Invoice>> fetchInvoices(String token) async {
    final response = await http.get(
      Uri.parse('http://127.0.0.1:8000/api/invoices'),
      headers: {
        'Authorization': 'Bearer $token',
        'Accept': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      final List<dynamic> jsonData = json.decode(response.body);
      return jsonData.map((data) => Invoice.fromJson(data)).toList();
    } else {
      throw Exception('Failed to load invoices');
    }
  }
}
