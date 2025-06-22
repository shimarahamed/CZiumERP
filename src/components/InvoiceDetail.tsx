'use client'

import React from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
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

const InvoiceDetail = React.forwardRef<HTMLDivElement, InvoiceDetailProps>(({ invoice }, ref) => {
    const handlePrint = () => {
        window.print();
    };

    return (
        <DialogContent className="sm:max-w-3xl printable-area" ref={ref}>
            <div>
                <DialogHeader>
                    <DialogTitle className="flex justify-between items-center">
                        <span>Invoice {invoice.id}</span>
                        <Badge variant={statusVariant[invoice.status]} className="capitalize text-base">{invoice.status}</Badge>
                    </DialogTitle>
                    <DialogDescription>
                        Date: {new Date(invoice.date).toLocaleDateString()}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-6">
                    <div className="mb-6">
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
                            <div className="flex justify-between font-semibold text-lg">
                                <span>Total</span>
                                <span>${invoice.amount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <DialogFooter className="non-printable">
                <Button onClick={handlePrint} variant="outline">
                    <Printer className="mr-2 h-4 w-4" />
                    Print Invoice
                </Button>
            </DialogFooter>
        </DialogContent>
    );
});
InvoiceDetail.displayName = "InvoiceDetail";

export default InvoiceDetail;
