import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../../models/invoice.dart';
import '../../services/invoice_service.dart';

class InvoicesScreen extends StatefulWidget {
  final String accessToken;
  const InvoicesScreen({super.key, required this.accessToken});

  @override
  State<InvoicesScreen> createState() => _InvoicesScreenState();
}

class _InvoicesScreenState extends State<InvoicesScreen> {
  List<Invoice> invoices = [];
  List<Invoice> filteredInvoices = [];
  bool isLoading = true;
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    try {
      final fetched = await InvoiceService.fetchInvoices(widget.accessToken);
      setState(() {
        invoices = fetched;
        filteredInvoices = fetched;
        isLoading = false;
      });
    } catch (e) {
      setState(() => isLoading = false);
      debugPrint('Error fetching invoices: $e');
    }
  }

  void _applyFilter() {
    final search = _searchController.text.toLowerCase();
    setState(() {
      filteredInvoices = invoices
          .where((invoice) => invoice.client.name.toLowerCase().contains(search))
          .toList();
    });
  }

  void openCreateDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.white,
        title: const Text('Create Invoice', 
            style: TextStyle(color: Color(0xFF673AB7), fontWeight: FontWeight.bold)),
        content: const Text('Form UI here...'),
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

  void openEditDialog(Invoice invoice) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.white,
        title: Text('Edit Invoice: ${invoice.invoiceNumber}', 
            style: const TextStyle(color: Colors.orange, fontWeight: FontWeight.bold)),
        content: const Text('Edit form UI here...'),
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
                      const Text('Invoices', 
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
                        label: const Text('Add Invoice'),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 20),

                // Search Bar
                TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Search invoices...',
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
                                _buildHeaderColumn('Invoice #'),
                                _buildHeaderColumn('Client'),
                                _buildHeaderColumn('Amount'),
                                _buildHeaderColumn('Status'),
                                _buildHeaderColumn('Date Issued'),
                                _buildHeaderColumn('Due Date'),
                                _buildHeaderColumn('Actions'),
                              ],
                              rows: filteredInvoices.map((invoice) {
                                return DataRow(cells: [
                                  DataCell(Text(invoice.invoiceNumber)),
                                  DataCell(Text(invoice.client.name)),
                                  DataCell(Text('₹${invoice.total}')),
                                  DataCell(Text(invoice.status)),
                                  DataCell(Text(invoice.invoiceDate)),
                                  DataCell(Text(invoice.dueDate)),
                                  DataCell(
                                    IconButton(
                                      icon: const Icon(FontAwesomeIcons.pen, color: Colors.orange),
                                      onPressed: () => openEditDialog(invoice),
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