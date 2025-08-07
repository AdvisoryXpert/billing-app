class Client {
  final int id;
  final String name;
  final String email;
  final String? phone;
  final String? company;
  final String? address;
  final DateTime createdAt;
  final DateTime updatedAt;

  Client({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    this.company,
    this.address,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Client.fromJson(Map<String, dynamic> json) {
    return Client(
      id: json['id'],
      name: json['name'],
      email: json['email'],
      phone: json['phone'],
      company: json['company'],
      address: json['address'],
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
    );
  }
}