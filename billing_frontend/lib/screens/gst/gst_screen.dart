import 'package:flutter/material.dart';
import '../../models/invoice.dart';
import '../../services/invoice_service.dart';

class GSTSummaryScreen extends StatefulWidget {
  final String accessToken;
  const GSTSummaryScreen({super.key, required this.accessToken});

  @override
  State<GSTSummaryScreen> createState() => _GSTSummaryScreenState();
}

class _GSTSummaryScreenState extends State<GSTSummaryScreen> {
  late Future<List<Invoice>> futureInvoices;

  @override
  void initState() {
    super.initState();
    futureInvoices = InvoiceService.fetchInvoices(widget.accessToken);
  }

  double parseAmount(String amount) {
    return double.tryParse(amount.replaceAll(',', '')) ?? 0.0;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('GST Summary')),
      body: FutureBuilder<List<Invoice>>(
        future: futureInvoices,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }

          final invoices = snapshot.data ?? [];

          double totalGST = 0.0;

          final rows = invoices.map((invoice) {
            final total = parseAmount(invoice.total);
            final cgst = total * 0.09;
            final sgst = total * 0.09;
            final igst = 0.0; // Assume intra-state for now
            final gst = cgst + sgst + igst;
            totalGST += gst;

            return DataRow(cells: [
              DataCell(Text(invoice.invoiceNumber)),
              DataCell(Text(invoice.invoiceDate)),
              DataCell(Text('₹${total.toStringAsFixed(2)}')),
              DataCell(Text('₹${cgst.toStringAsFixed(2)}')),
              DataCell(Text('₹${sgst.toStringAsFixed(2)}')),
              DataCell(Text('₹${igst.toStringAsFixed(2)}')),
              DataCell(Text('₹${gst.toStringAsFixed(2)}')),
            ]);
          }).toList();

          return SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: DataTable(
              columns: const [
                DataColumn(label: Text('Invoice #')),
                DataColumn(label: Text('Date')),
                DataColumn(label: Text('Total')),
                DataColumn(label: Text('CGST (9%)')),
                DataColumn(label: Text('SGST (9%)')),
                DataColumn(label: Text('IGST')),
                DataColumn(label: Text('Total GST')),
              ],
              rows: rows,
            ),
          );
        },
      ),
    );
  }
}