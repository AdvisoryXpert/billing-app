// src/api/invoices.ts
import { api } from './http';

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | string;

export type Invoice = {
  id: number;
  client_id: number;
  user_id?: number | null;
  invoice_number: string;
  invoice_date: string; // 'YYYY-MM-DD'
  due_date: string;     // 'YYYY-MM-DD'
  total: number;        // store in smallest unit or plain number as API expects
  status: InvoiceStatus;
  created_at?: string;
  updated_at?: string;
};

export type InvoiceCreate = {
  client_id: number;
  invoice_date: string;
  due_date: string;
  total: number;
  status?: InvoiceStatus; // default to 'draft'
};

export async function listInvoices(): Promise<Invoice[]> {
  const { data } = await api.get('/invoices');
  return data as Invoice[];
}
export async function getInvoice(id: number): Promise<Invoice> {
  const { data } = await api.get(`/invoices/${id}`);
  return data as Invoice;
}
export async function createInvoice(payload: InvoiceCreate): Promise<Invoice> {
  const { data } = await api.post('/invoices', payload);
  return data as Invoice;
}
export async function updateInvoice(id: number, payload: Partial<InvoiceCreate & { status: InvoiceStatus }>): Promise<Invoice> {
  const { data } = await api.put(`/invoices/${id}`, payload);
  return data as Invoice;
}
export async function deleteInvoice(id: number): Promise<void> {
  await api.delete(`/invoices/${id}`);
}