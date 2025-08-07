import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

import '../screens/dashboard/dashboard_screen.dart';
import '../screens/clients/clients_screen.dart';
import '../screens/invoices/invoices_screen.dart';
import '../screens/payments/payments_screen.dart';
import '../screens/gst/gst_screen.dart';

class Sidebar extends StatefulWidget {
  final Function(Widget) onItemSelected;
  final String accessToken; // ✅ Accept token

  const Sidebar({super.key, required this.onItemSelected, required this.accessToken});

  @override
  State<Sidebar> createState() => _SidebarState();
}

class _SidebarState extends State<Sidebar> {
  int selectedIndex = 0;
  String userEmail = '';
  final FlutterSecureStorage _secureStorage = const FlutterSecureStorage();

  // ✅ Use getter to access widget.accessToken inside dynamic screens
  List<Map<String, dynamic>> get menuItems => [
        {
          'icon': Icons.dashboard,
          'label': 'Dashboard',
          'screen': const DashboardScreen(),
        },
        {
          'icon': Icons.people,
          'label': 'Clients',
          'screen': ClientsScreen(accessToken: widget.accessToken),
        },
        {
          'icon': Icons.receipt_long,
          'label': 'Invoices',
          'screen': InvoicesScreen(accessToken: widget.accessToken),
        },
        {
          'icon': Icons.payment,
          'label': 'Payments',
          'screen': PaymentsScreen(accessToken: widget.accessToken),
        },
        {
          'icon': FontAwesomeIcons.fileInvoiceDollar,
          'label': 'GST Summary',
          'screen': GSTSummaryScreen(accessToken: widget.accessToken),
        },
      ];

  @override
  void initState() {
    super.initState();
    _loadUserEmail();
  }

  Future<void> _loadUserEmail() async {
    final email = await _secureStorage.read(key: 'user_email');
    setState(() {
      userEmail = email ?? 'Unknown';
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 240,
      decoration: BoxDecoration(
        color: Colors.lightBlue[50],
        borderRadius: const BorderRadius.only(
          topRight: Radius.circular(16),
          bottomRight: Radius.circular(16),
        ),
      ),
      child: Column(
        children: [
          const SizedBox(height: 40),
          const Text(
            'Entbysys Billing',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
          const Divider(thickness: 1),
          ...List.generate(menuItems.length, (index) {
            final item = menuItems[index];
            final isSelected = selectedIndex == index;
            return ListTile(
              leading: Icon(item['icon'], color: isSelected ? Colors.blue : Colors.black54),
              title: Text(
                item['label'],
                style: TextStyle(color: isSelected ? Colors.blue : Colors.black87),
              ),
              tileColor: isSelected ? Colors.blue[100] : Colors.transparent,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              onTap: () {
                setState(() {
                  selectedIndex = index;
                });
                widget.onItemSelected(item['screen']);
              },
            );
          }),
          const Spacer(),
          const Divider(thickness: 1),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Logged in as:', style: TextStyle(fontSize: 12, color: Colors.grey[600])),
                Text(userEmail,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                const SizedBox(height: 10),
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.red[300],
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  onPressed: () {
                    // Optional: add secureStorage.deleteAll();
                    Navigator.of(context).pushReplacementNamed('/login');
                  },
                  icon: const Icon(Icons.logout),
                  label: const Text('Logout'),
                )
              ],
            ),
          ),
        ],
      ),
    );
  }
}
