class Invoice {
  final int id;
  final int clientId;
  final int userId;
  final String invoiceNumber;
  final String invoiceDate;
  final String dueDate;
  final String total;
  final String status;
  final Client client;

  Invoice({
    required this.id,
    required this.clientId,
    required this.userId,
    required this.invoiceNumber,
    required this.invoiceDate,
    required this.dueDate,
    required this.total,
    required this.status,
    required this.client,
  });

  factory Invoice.fromJson(Map<String, dynamic> json) {
    return Invoice(
      id: json['id'],
      clientId: json['client_id'],
      userId: json['user_id'],
      invoiceNumber: json['invoice_number'],
      invoiceDate: json['invoice_date'],
      dueDate: json['due_date'],
      total: json['total'],
      status: json['status'],
      client: Client.fromJson(json['client']),
    );
  }
}

class Client {
  final int id;
  final String name;
  final String email;
  final String? phone;
  final String? company;
  final String? address;

  Client({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    this.company,
    this.address,
  });

  factory Client.fromJson(Map<String, dynamic> json) {
    return Client(
      id: json['id'],
      name: json['name'],
      email: json['email'],
      phone: json['phone'],
      company: json['company'],
      address: json['address'],
    );
  }
}
