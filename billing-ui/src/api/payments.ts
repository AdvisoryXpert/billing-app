// src/api/payments.ts
import { api } from './http';

export type Payment = {
  id: number;
  invoice_id: number;
  amount: string;          // e.g. "5000.00"
  payment_date: string;    // YYYY-MM-DD
  payment_method: string;  // e.g., "UPI"
  note?: string | null;
  user_id?: number | null;
  created_at?: string;
  updated_at?: string;
  // expanded invoice (present on GET)
  invoice?: {
    id: number;
    client_id: number;
    user_id: number;
    invoice_number: string;
    invoice_date: string;
    due_date: string;
    total: string;         // "6000.00"
    status: string;        // "sent"
    created_at?: string;
    updated_at?: string;
  } | null;
};

export type PaymentCreate = {
  invoice_id: number;
  amount: string;         // send as string w/ 2 decimals to match backend
  payment_date: string;   // YYYY-MM-DD
  payment_method: string;
  note?: string | null;
};

export type PaymentUpdate = Partial<PaymentCreate>;

export async function listPayments(): Promise<Payment[]> {
  const { data } = await api.get('/payments');
  return data as Payment[];
}

export async function getPayment(id: number): Promise<Payment> {
  const { data } = await api.get(`/invoices/${id}`);
  return data as Payment;
}

export async function createPayment(payload: PaymentCreate): Promise<Payment> {
  const { data } = await api.post('/payments', payload);
  return data as Payment;
}

export async function updatePayment(id: number, payload: PaymentUpdate): Promise<Payment> {
  const { data } = await api.put(`/payments/${id}`, payload);
  return data as Payment;
}

export async function deletePayment(id: number): Promise<void> {
  await api.delete(`/payments/${id}`);
}