'use client'

import React from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DialogContent, DialogFooter } from "@/components/ui/dialog";
import type { Invoice } from '@/types';
import { Badge } from './ui/badge';
import { Printer } from 'lucide-react';

interface InvoiceDetailProps {
    invoice: Invoice;
}

const statusVariant: { [key in Invoice['status']]: 'default' | 'secondary' | 'destructive' } = {
    paid: 'default',
    pending: 'secondary',
    overdue: 'destructive'
};

const InvoiceDetail = ({ invoice }: InvoiceDetailProps) => {
    const handlePrint = () => {
        window.print();
    };

    return (
        <DialogContent className="sm:max-w-3xl p-0">
            <div className="printable-area p-6">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h2 className="text-2xl font-bold">Invoice</h2>
                        <p className="text-muted-foreground">#{invoice.id}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-muted-foreground">Date: {new Date(invoice.date).toLocaleDateString()}</p>
                        <Badge variant={statusVariant[invoice.status]} className="capitalize text-base mt-1">{invoice.status}</Badge>
                    </div>
                </div>
                
                <div className="mb-8">
                    <h4 className="font-semibold mb-2">Billed To:</h4>
                    <p className="text-muted-foreground">{invoice.customerName || 'Walk-in Customer'}</p>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead className="text-center">Quantity</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoice.items.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell>{item.productName}</TableCell>
                                <TableCell className="text-center">{item.quantity}</TableCell>
                                <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                                <TableCell className="text-right">${(item.quantity * item.price).toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <div className="flex justify-end mt-6">
                    <div className="w-full max-w-xs">
                        <div className="flex justify-between py-2 border-t border-dashed">
                            <span className="font-medium">Subtotal</span>
                            <span>${invoice.amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-lg border-t pt-2">
                            <span>Total</span>
                            <span>${invoice.amount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
            <DialogFooter className="non-printable p-6 border-t">
                <Button onClick={handlePrint} variant="outline">
                    <Printer className="mr-2 h-4 w-4" />
                    Print Invoice
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};

export default InvoiceDetail;
