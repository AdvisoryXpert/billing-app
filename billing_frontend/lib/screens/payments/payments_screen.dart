import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../../models/payment.dart';
import '../../services/payment_service.dart';

class PaymentsScreen extends StatefulWidget {
  final String accessToken;
  const PaymentsScreen({super.key, required this.accessToken});

  @override
  State<PaymentsScreen> createState() => _PaymentsScreenState();
}

class _PaymentsScreenState extends State<PaymentsScreen> {
  List<Payment> payments = [];
  List<Payment> filteredPayments = [];
  bool isLoading = true;
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    try {
      final fetched = await PaymentService.fetchPayments(widget.accessToken);
      setState(() {
        payments = fetched;
        filteredPayments = fetched;
        isLoading = false;
      });
    } catch (e) {
      setState(() => isLoading = false);
      debugPrint('Error fetching payments: $e');
    }
  }

  void _applyFilter() {
    final search = _searchController.text.toLowerCase();
    setState(() {
      filteredPayments = payments
          .where((payment) => payment.invoice.invoiceNumber.toLowerCase().contains(search))
          .toList();
    });
  }

  void openCreateDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.white,
        title: const Text('Record Payment', 
            style: TextStyle(color: Color(0xFF673AB7), fontWeight: FontWeight.bold)),
        content: const Text('Payment form UI here...'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel', style: TextStyle(color: Colors.red))
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
            onPressed: () {},
            child: const Text('Save')
          ),
        ],
      ),
    );
  }

  void openEditDialog(Payment payment) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.white,
        title: Text('Edit Payment #${payment.id}', 
            style: const TextStyle(color: Colors.orange, fontWeight: FontWeight.bold)),
        content: const Text('Edit payment form UI here...'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel', style: TextStyle(color: Colors.red))
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.blue),
            onPressed: () {},
            child: const Text('Update')
          ),
        ],
      ),
    );
  }

  DataColumn _buildHeaderColumn(String label) {
    return DataColumn(
      label: Text(label, 
          style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1200),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              children: [
                // Header
                Container(
                  padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 24),
                  decoration: BoxDecoration(
                    color: const Color(0xFF673AB7),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Payments', 
                          style: TextStyle(
                            fontSize: 26, 
                            fontWeight: FontWeight.bold, 
                            color: Colors.white
                          )),
                      ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.green,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10)),
                        ),
                        onPressed: openCreateDialog,
                        icon: const Icon(Icons.add),
                        label: const Text('Record Payment'),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 20),

                // Search Bar
                TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Search by invoice #...',
                    prefixIcon: const Icon(Icons.search),
                    fillColor: Colors.white,
                    filled: true,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: BorderSide.none,
                    ),
                  ),
                  onChanged: (_) => _applyFilter(),
                ),

                const SizedBox(height: 20),

                // Table
                isLoading
                    ? const CircularProgressIndicator()
                    : Expanded(
                        child: Container(
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(12),
                            color: Colors.white,
                            boxShadow: [
                              BoxShadow(
                                color: Colors.grey.withOpacity(0.2),
                                blurRadius: 10,
                                offset: const Offset(0, 5),
                              )
                            ],
                          ),
                          child: SingleChildScrollView(
                            scrollDirection: Axis.horizontal,
                            child: DataTable(
                              headingRowColor: MaterialStateProperty.all(const Color(0xFF673AB7)),
                              dataRowColor: MaterialStateProperty.resolveWith(
                                (states) => states.contains(MaterialState.selected) 
                                    ? Colors.purple[50] 
                                    : Colors.white
                              ),
                              columns: [
                                _buildHeaderColumn('Payment #'),
                                _buildHeaderColumn('Invoice'),
                                _buildHeaderColumn('Amount'),
                                _buildHeaderColumn('Method'),
                                _buildHeaderColumn('Date'),
                                _buildHeaderColumn('Status'),
                                _buildHeaderColumn('Actions'),
                              ],
                              rows: filteredPayments.map((payment) {
                                Color statusColor = payment.invoice.status == 'paid'
                                    ? Colors.green
                                    : payment.invoice.status == 'cancelled'
                                        ? Colors.red
                                        : Colors.orange;

                                return DataRow(cells: [
                                  DataCell(Text('PYM-${payment.id}')),
                                  DataCell(Text(payment.invoice.invoiceNumber)),
                                  DataCell(Text(
                                    '₹${payment.amount.toStringAsFixed(2)}',
                                    style: const TextStyle(fontWeight: FontWeight.bold),
                                  )),
                                  DataCell(Text(payment.paymentMethod)),
                                  DataCell(Text(payment.paymentDate)),
                                  DataCell(
                                    Chip(
                                      label: Text(
                                        payment.invoice.status.toUpperCase(),
                                        style: TextStyle(color: statusColor),
                                      ),
                                      backgroundColor: statusColor.withOpacity(0.2),
                                    ),
                                  ),
                                  DataCell(
                                    IconButton(
                                      icon: const Icon(FontAwesomeIcons.pen, color: Colors.orange),
                                      onPressed: () => openEditDialog(payment),
                                    ),
                                  ),
                                ]);
                              }).toList(),
                            ),
                          ),
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