class Payment {
  final int id;
  final int invoiceId;
  final double amount;
  final String paymentDate;
  final String paymentMethod;
  final String note;
  final String createdAt;
  final String updatedAt;
  final Invoice invoice;

  Payment({
    required this.id,
    required this.invoiceId,
    required this.amount,
    required this.paymentDate,
    required this.paymentMethod,
    required this.note,
    required this.createdAt,
    required this.updatedAt,
    required this.invoice,
  });

  factory Payment.fromJson(Map<String, dynamic> json) {
    return Payment(
      id: json['id'] as int,
      invoiceId: json['invoice_id'] as int,
      amount: double.parse(json['amount'].toString()),
      paymentDate: json['payment_date'] as String,
      paymentMethod: json['payment_method'] as String,
      note: json['note'] ?? '',
      createdAt: json['created_at'] as String,
      updatedAt: json['updated_at'] as String,
      invoice: Invoice.fromJson(json['invoice']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'invoice_id': invoiceId,
      'amount': amount,
      'payment_date': paymentDate,
      'payment_method': paymentMethod,
      'note': note,
      'created_at': createdAt,
      'updated_at': updatedAt,
      'invoice': invoice.toJson(),
    };
  }
}

class Invoice {
  final int id;
  final int clientId;
  final int userId;
  final String invoiceNumber;
  final String invoiceDate;
  final String dueDate;
  final double total;
  final String status;
  final String createdAt;
  final String updatedAt;

  Invoice({
    required this.id,
    required this.clientId,
    required this.userId,
    required this.invoiceNumber,
    required this.invoiceDate,
    required this.dueDate,
    required this.total,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Invoice.fromJson(Map<String, dynamic> json) {
    return Invoice(
      id: json['id'] as int,
      clientId: json['client_id'] as int,
      userId: json['user_id'] as int,
      invoiceNumber: json['invoice_number'] as String,
      invoiceDate: json['invoice_date'] as String,
      dueDate: json['due_date'] as String,
      total: double.parse(json['total'].toString()),
      status: json['status'] as String,
      createdAt: json['created_at'] as String,
      updatedAt: json['updated_at'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'client_id': clientId,
      'user_id': userId,
      'invoice_number': invoiceNumber,
      'invoice_date': invoiceDate,
      'due_date': dueDate,
      'total': total,
      'status': status,
      'created_at': createdAt,
      'updated_at': updatedAt,
    };
  }
}