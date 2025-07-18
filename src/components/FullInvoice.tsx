'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import type { Invoice } from '@/types';
import { Printer, Mail } from '@/components/icons';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Store as StoreIcon } from '@/components/icons';

interface FullInvoiceProps {
    invoice: Invoice;
}

const FullInvoice = ({ invoice }: FullInvoiceProps) => {
    const { currentStore, currencySymbol, customers, companyName, companyAddress } = useAppContext();
    const { toast } = useToast();
    
    const handlePrint = () => {
        window.print();
    };

    const subtotal = invoice.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const discountAmount = subtotal * ((invoice.discount || 0) / 100);
    const taxAmount = (subtotal - discountAmount) * ((invoice.taxRate || 0) / 100);

    const generateTextReceipt = () => {
      let receipt = `INVOICE from ${companyName}\n`;
      receipt += `Invoice ID: ${invoice.id}\n`;
      receipt += `Date: ${new Date(invoice.date).toLocaleDateString()}\n\n`;
      receipt += `Items:\n`;
      invoice.items.forEach(item => {
        receipt += `- ${item.productName} (x${item.quantity}) @ ${currencySymbol} ${item.price.toFixed(2)}\n`;
      });
      receipt += `\nSubtotal: ${currencySymbol} ${subtotal.toFixed(2)}\n`;
      if (invoice.discount) {
        receipt += `Discount (${invoice.discount}%): -${currencySymbol} ${discountAmount.toFixed(2)}\n`;
      }
      if (invoice.taxRate) {
        receipt += `Tax (${invoice.taxRate}%): +${currencySymbol} ${taxAmount.toFixed(2)}\n`;
      }
      receipt += `TOTAL: ${currencySymbol} ${invoice.amount.toFixed(2)}\n\n`;
      receipt += `Thank you for your business!`;
      return receipt;
    }

    const handleEmailReceipt = () => {
      const customer = customers.find(c => c.id === invoice.customerId);
      if (!customer?.email) {
          toast({
              variant: 'destructive',
              title: 'Cannot Email Receipt',
              description: "No email address is associated with this customer.",
          });
          return;
      }

      const subject = `Your Invoice from ${companyName} (#${invoice.id})`;
      const body = generateTextReceipt();

      window.location.href = `mailto:${customer.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }


    return (
        <DialogContent className="sm:max-w-4xl p-0 printable-area-container">
            <DialogHeader className="sr-only">
              <DialogTitle>Full Invoice for {invoice.id}</DialogTitle>
            </DialogHeader>
            <div className="printable-area bg-white text-black p-8">
                <header className="flex justify-between items-start mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <StoreIcon className="h-8 w-8 text-primary" />
                            <h1 className="text-2xl font-bold">{companyName}</h1>
                        </div>
                        <p className="text-muted-foreground">{companyAddress}</p>
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
                        {invoice.customerId && <p className="text-muted-foreground">{customers.find(c=>c.id === invoice.customerId)?.email}</p>}
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
                                    <TableCell className="text-right">{currencySymbol} {item.price.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">{currencySymbol} {(item.price * item.quantity).toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </section>

                <section className="flex justify-end mt-8">
                    <div className="w-full max-w-xs space-y-2">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal:</span>
                            <span className="font-medium">{currencySymbol} {subtotal.toFixed(2)}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">Discount ({invoice.discount || 0}%):</span>
                            <span className="font-medium text-destructive">-{currencySymbol} {discountAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Tax ({invoice.taxRate || 0}%):</span>
                            <span className="font-medium">{currencySymbol} {taxAmount.toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total:</span>
                            <span>{currencySymbol} {invoice.amount.toFixed(2)}</span>
                        </div>
                    </div>
                </section>

                <footer className="mt-16 text-center text-muted-foreground text-sm">
                    <p>Thank you for your business!</p>
                </footer>
            </div>
            <DialogFooter className="non-printable p-4 border-t flex flex-col sm:flex-row gap-2">
                 <Button onClick={handleEmailReceipt} variant="outline" className="w-full">
                    <Mail className="mr-2 h-4 w-4" />
                    Email Invoice
                </Button>
                <Button onClick={handlePrint} variant="outline" className="w-full">
                    <Printer className="mr-2 h-4 w-4" />
                    Print Invoice
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};

export default FullInvoice;
