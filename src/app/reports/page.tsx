'use client'

import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Header from "@/components/Header";
import { Download } from "lucide-react";
import { salesData } from '@/lib/data';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { useAppContext } from '@/context/AppContext';

const SalesReport = React.forwardRef<HTMLDivElement>((props, ref) => {
    const { invoices } = useAppContext();
    const totalRevenue = invoices.reduce((acc, inv) => acc + inv.amount, 0);
    const totalInvoices = invoices.length;
    const uniqueCustomers = new Set(invoices.map(inv => inv.customerId).filter(Boolean)).size;

    return (
        <div ref={ref} className="printable-area bg-white text-black p-4 sm:p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Sales Report</h1>
                <p className="text-gray-600">Generated on: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-4 border rounded-lg">
                    <h3 className="text-gray-500 text-sm font-medium">Total Revenue</h3>
                    <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
                </div>
                <div className="p-4 border rounded-lg">
                    <h3 className="text-gray-500 text-sm font-medium">Total Invoices</h3>
                    <p className="text-2xl font-bold">{totalInvoices}</p>
                </div>
                <div className="p-4 border rounded-lg">
                    <h3 className="text-gray-500 text-sm font-medium">Total Customers</h3>
                    <p className="text-2xl font-bold">{uniqueCustomers}</p>
                </div>
            </div>

            <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">Revenue by Month</h2>
                 <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="revenue" fill="#3F51B5" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div>
                 <h2 className="text-xl font-bold mb-4">Recent Invoices</h2>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Invoice ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoices.slice(0,10).map(invoice => (
                            <TableRow key={invoice.id}>
                                <TableCell>{invoice.id}</TableCell>
                                <TableCell>{invoice.customerName || 'Walk-in Customer'}</TableCell>
                                <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                                <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                 </Table>
            </div>

             <div className="mt-12 text-center text-gray-500 text-sm">
                CZium POS - End of Report
            </div>
        </div>
    )
});
SalesReport.displayName = "SalesReport";


export default function ReportsPage() {
    const reportRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="flex flex-col h-full">
            <Header title="Sales Reports" />
            <main className="flex-1 overflow-auto p-4 md:p-6">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div>
                                <CardTitle>Sales Report</CardTitle>
                                <CardDescription>An overview of your business sales performance.</CardDescription>
                            </div>
                             <Button onClick={handlePrint} size="sm" className="gap-1 w-full md:w-auto">
                                <Download className="h-4 w-4" />
                                Download PDF
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                       <div className="border rounded-lg p-0 sm:p-4 bg-white shadow-sm">
                         <SalesReport ref={reportRef} />
                       </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
