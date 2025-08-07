import 'package:flutter/material.dart';

class InvoiceForm extends StatefulWidget {
  const InvoiceForm({super.key});

  @override
  State<InvoiceForm> createState() => _InvoiceFormState();
}

class _InvoiceFormState extends State<InvoiceForm> {
  final List<Map<String, dynamic>> items = [];

  void addItem() {
    setState(() {
      items.add({"name": "", "qty": 1, "rate": 0.0});
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("New Invoice")),
      body: Column(
        children: [
          Expanded(
            child: ListView(
              children: [
                const Padding(
                  padding: EdgeInsets.all(8.0),
                  child: Text("Invoice Items", style: TextStyle(fontSize: 18)),
                ),
                ...items.map((item) {
                  int index = items.indexOf(item);
                  return ListTile(
                    title: TextField(
                      decoration: const InputDecoration(hintText: "Item Name"),
                      onChanged: (val) => item['name'] = val,
                    ),
                    subtitle: Row(
                      children: [
                        Expanded(
                          child: TextField(
                            decoration: const InputDecoration(hintText: "Qty"),
                            keyboardType: TextInputType.number,
                            onChanged: (val) => item['qty'] = int.tryParse(val) ?? 1,
                          ),
                        ),
                        Expanded(
                          child: TextField(
                            decoration: const InputDecoration(hintText: "Rate"),
                            keyboardType: TextInputType.number,
                            onChanged: (val) => item['rate'] = double.tryParse(val) ?? 0.0,
                          ),
                        )
                      ],
                    ),
                  );
                }),
                TextButton.icon(
                  onPressed: addItem,
                  icon: const Icon(Icons.add),
                  label: const Text("Add Item"),
                )
              ],
            ),
          ),
          ElevatedButton(
            onPressed: () {
              // TODO: Submit Invoice
            },
            child: const Text("Submit Invoice"),
          )
        ],
      ),
    );
  }
}