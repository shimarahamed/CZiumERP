'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import type { Invoice } from '@/types';
import { Printer, Store as StoreIcon } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

interface FullInvoiceProps {
    invoice: Invoice;
}

const FullInvoice = ({ invoice }: FullInvoiceProps) => {
    const { currentStore } = useAppContext();
    const handlePrint = () => {
        window.print();
    };

    const subtotal = invoice.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    // Assuming 0 tax for now as in receipt
    const tax = 0;
    const total = subtotal + tax;

    return (
        <DialogContent className="sm:max-w-4xl p-0">
            <div className="printable-area bg-white text-black p-8">
                <header className="flex justify-between items-start mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <StoreIcon className="h-8 w-8 text-primary" />
                            <h1 className="text-2xl font-bold">{currentStore?.name}</h1>
                        </div>
                        <p className="text-muted-foreground">{currentStore?.address}</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-3xl font-bold text-gray-800">INVOICE</h2>
                        <p className="text-muted-foreground"># {invoice.id}</p>
                    </div>
                </header>
                
                <section className="flex justify-between mb-8">
                    <div>
                        <h3 className="font-semibold mb-1">Bill To:</h3>
                        <p>{invoice.customerName || 'Walk-in Customer'}</p>
                        {invoice.customerId && <p className="text-muted-foreground">{invoice.customerId}</p>}
                    </div>
                    <div className="text-right">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                            <span className="font-semibold">Invoice Date:</span>
                            <span>{new Date(invoice.date).toLocaleDateString()}</span>
                            <span className="font-semibold">Status:</span>
                            <span className="capitalize font-medium">{invoice.status}</span>
                        </div>
                    </div>
                </section>

                <section>
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="w-[100px]">#</TableHead>
                                <TableHead>Item</TableHead>
                                <TableHead className="text-center">Quantity</TableHead>
                                <TableHead className="text-right">Unit Price</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoice.items.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell className="font-medium">{item.productName}</TableCell>
                                    <TableCell className="text-center">{item.quantity}</TableCell>
                                    <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">${(item.price * item.quantity).toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </section>

                <section className="flex justify-end mt-8">
                    <div className="w-full max-w-xs space-y-2">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal:</span>
                            <span className="font-medium">${subtotal.toFixed(2)}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">Tax (0%):</span>
                            <span className="font-medium">${tax.toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total:</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                    </div>
                </section>

                <footer className="mt-16 text-center text-muted-foreground text-sm">
                    <p>Thank you for your business!</p>
                </footer>
            </div>
            <DialogFooter className="non-printable p-4 border-t">
                <Button onClick={handlePrint} variant="outline" className="w-full">
                    <Printer className="mr-2 h-4 w-4" />
                    Print Invoice
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};

export default FullInvoice;
