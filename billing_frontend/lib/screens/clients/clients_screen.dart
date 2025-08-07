import 'package:flutter/material.dart';
import '../../models/client.dart';
import '../../services/client_service.dart';

class ClientsScreen extends StatefulWidget {
  final String accessToken;

  const ClientsScreen({super.key, required this.accessToken});

  @override
  State<ClientsScreen> createState() => _ClientsScreenState();
}

class _ClientsScreenState extends State<ClientsScreen> {
  List<Client> clients = [];
  List<Client> filteredClients = [];
  bool isLoading = true;
  String searchQuery = '';

  @override
  void initState() {
    super.initState();
    fetchClients();
  }

  Future<void> fetchClients() async {
    try {
      final fetched = await ClientService.fetchClients(widget.accessToken);
      setState(() {
        clients = fetched;
        filteredClients = fetched;
        isLoading = false;
      });
    } catch (e) {
      setState(() => isLoading = false);
      debugPrint('Error fetching clients: $e');
    }
  }

  void filterClients(String query) {
    setState(() {
      searchQuery = query.toLowerCase();
      filteredClients = clients.where((client) {
        return client.name.toLowerCase().contains(searchQuery) ||
               client.email.toLowerCase().contains(searchQuery);
      }).toList();
    });
  }

  void openCreateDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.white,
        title: const Text('Create Client', style: TextStyle(color: Colors.deepPurple, fontWeight: FontWeight.bold)),
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

  void openEditDialog(Client client) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.white,
        title: Text('Edit Client: ${client.name}', style: const TextStyle(color: Colors.orange, fontWeight: FontWeight.bold)),
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

  DataColumn colorfulColumn(String label) => DataColumn(
    label: Text(label, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
  );

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 24),
              decoration: BoxDecoration(
                color: Colors.deepPurple,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Clients', style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold, color: Colors.white)),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    onPressed: openCreateDialog,
                    icon: const Icon(Icons.add),
                    label: const Text('Add Client'),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            TextField(
              decoration: InputDecoration(
                hintText: 'Search clients...',
                prefixIcon: const Icon(Icons.search),
                fillColor: Colors.white,
                filled: true,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: BorderSide.none,
                ),
              ),
              onChanged: filterClients,
            ),
            const SizedBox(height: 20),
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
                          headingRowColor: MaterialStateProperty.all(Colors.deepPurple),
                          dataRowColor: MaterialStateProperty.resolveWith((states) => states.contains(MaterialState.selected) ? Colors.purple[50] : Colors.white),
                          columns: [
                            colorfulColumn('Name'),
                            colorfulColumn('Email'),
                            colorfulColumn('Phone'),
                            colorfulColumn('Company'),
                            colorfulColumn('Address'),
                            colorfulColumn('Created'),
                            colorfulColumn('Actions'),
                          ],
                          rows: filteredClients.map((client) {
                            return DataRow(cells: [
                              DataCell(Text(client.name)),
                              DataCell(Text(client.email)),
                              DataCell(Text(client.phone ?? '')),
                              DataCell(Text(client.company ?? '')),
                              DataCell(Text(client.address ?? '')),
                              DataCell(Text(client.createdAt.toLocal().toString().split(' ')[0])),
                              DataCell(Row(
                                children: [
                                  IconButton(
                                    icon: const Icon(Icons.edit, color: Colors.orange),
                                    onPressed: () => openEditDialog(client),
                                  ),
                                ],
                              )),
                            ]);
                          }).toList(),
                        ),
                      ),
                    ),
                  ),
          ],
        ),
      ),
    );
  }
}
