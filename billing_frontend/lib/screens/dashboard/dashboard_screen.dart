// lib/screens/dashboard/dashboard_screen.dart
import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Dashboard Overview',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              IconButton(
                icon: const Icon(Icons.refresh),
                onPressed: () {},
              )
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              _buildStatCard('Active Invoices', '\$17,292.00'),
              _buildStatCard('Outstanding Invoices', '\$7,621.00'),
              _buildStatCard('Completed Payments', '\$17,477.00'),
            ],
          ),
          const SizedBox(height: 16),
          Card(
            elevation: 3,
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text("Invoice Trends", style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  SizedBox(
                    height: 250,
                    child: LineChart(
                      LineChartData(
                        titlesData: FlTitlesData(
                          bottomTitles: AxisTitles(
                            sideTitles: SideTitles(showTitles: true, interval: 2),
                          ),
                          leftTitles: AxisTitles(
                            sideTitles: SideTitles(showTitles: true),
                          ),
                          topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                          rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                        ),
                        gridData: FlGridData(show: true),
                        lineBarsData: [
                          LineChartBarData(
                            isCurved: true,
                            color: Colors.blue,
                            barWidth: 2,
                            spots: [
                              FlSpot(0, 0),
                              FlSpot(1, 3000),
                              FlSpot(2, 2700),
                              FlSpot(3, 0),
                              FlSpot(4, 1200),
                              FlSpot(5, 4700),
                              FlSpot(6, 0),
                              FlSpot(7, 0),
                              FlSpot(8, 3000),
                              FlSpot(9, 4000),
                            ],
                          ),
                          LineChartBarData(
                            isCurved: true,
                            color: Colors.green,
                            barWidth: 2,
                            spots: [
                              FlSpot(0, 0),
                              FlSpot(1, 0),
                              FlSpot(2, 0),
                              FlSpot(3, 0),
                              FlSpot(4, 0),
                              FlSpot(5, 2300),
                              FlSpot(6, 0),
                              FlSpot(7, 3000),
                              FlSpot(8, 0),
                              FlSpot(9, 1200),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          const Text("Invoices", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: Card(
                  color: Colors.blue.shade100,
                  child: const ListTile(
                    title: Text("Active"),
                    subtitle: Text("17,292.00"),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Card(
                  child: const ListTile(
                    title: Text("Outstanding"),
                    subtitle: Text("7,621.00"),
                  ),
                ),
              ),
            ],
          )
        ],
      ),
    );
  }

  Widget _buildStatCard(String title, String value) {
    return Expanded(
      child: Card(
        margin: const EdgeInsets.all(8),
        elevation: 2,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Text(value, style: const TextStyle(fontSize: 18)),
              const SizedBox(height: 4),
              const Text("Current Period", style: TextStyle(color: Colors.grey))
            ],
          ),
        ),
      ),
    );
  }
}
