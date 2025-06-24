'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Invoice } from '@/types';
import { Printer, Store as StoreIcon, Mail } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';

interface InvoiceDetailProps {
    invoice: Invoice;
}

const InvoiceDetail = ({ invoice }: InvoiceDetailProps) => {
    const { currentStore, currencySymbol, customers } = useAppContext();
    const { toast } = useToast();
    
    const handlePrint = () => {
        window.print();
    };

    const subtotal = invoice.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const discountAmount = subtotal * ((invoice.discount || 0) / 100);
    const taxAmount = (subtotal - discountAmount) * ((invoice.taxRate || 0) / 100);

    const generateTextReceipt = () => {
      let receipt = `RECEIPT from ${currentStore?.name}\n`;
      receipt += `Invoice ID: ${invoice.id}\n`;
      receipt += `Date: ${new Date(invoice.date).toLocaleString()}\n\n`;
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

      const subject = `Your Receipt from ${currentStore?.name} (#${invoice.id})`;
      const body = generateTextReceipt();

      window.location.href = `mailto:${customer.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }

    return (
        <DialogContent className="sm:max-w-sm p-0">
            <DialogHeader className="sr-only">
              <DialogTitle>Invoice Receipt for {invoice.id}</DialogTitle>
            </DialogHeader>
            <div className="printable-receipt-area p-4">
                <div className="text-center mb-4">
                    <StoreIcon className="mx-auto h-10 w-10 mb-2" />
                    <h2 className="text-lg font-bold">{currentStore?.name}</h2>
                    <p>{currentStore?.address}</p>
                </div>
                <div className="border-t border-dashed my-2"></div>
                <div className="flex justify-between">
                    <span>Invoice #:</span>
                    <span>{invoice.id}</span>
                </div>
                <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{new Date(invoice.date).toLocaleString()}</span>
                </div>
                 <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="capitalize">{invoice.status}</span>
                </div>
                <div className="flex justify-between mb-2">
                    <span>Customer:</span>
                    <span className="truncate">{invoice.customerName || 'Walk-in Customer'}</span>
                </div>
                <div className="border-t border-dashed my-2"></div>
                
                <div>
                    <div className="flex font-bold">
                        <div className="flex-1">Item</div>
                        <div className="w-8 text-center">Qty</div>
                        <div className="w-16 text-right">Price</div>
                        <div className="w-16 text-right">Total</div>
                    </div>
                    <div className="border-b border-dashed my-1"></div>
                    {invoice.items.map((item, index) => (
                         <div key={index} className="flex my-1">
                            <div className="flex-1 w-0 truncate pr-1">{item.productName}</div>
                            <div className="w-8 shrink-0 text-center">{item.quantity}</div>
                            <div className="w-16 shrink-0 text-right break-words">{currencySymbol} {item.price.toFixed(2)}</div>
                            <div className="w-16 shrink-0 text-right break-words">{currencySymbol} {(item.quantity * item.price).toFixed(2)}</div>
                        </div>
                    ))}
                </div>

                <div className="border-t border-dashed my-2"></div>
                
                <div className="space-y-1">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>{currencySymbol} {subtotal.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between">
                        <span>Discount ({invoice.discount || 0}%)</span>
                        <span>-{currencySymbol} {discountAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Taxes ({invoice.taxRate || 0}%)</span>
                        <span>{currencySymbol} {taxAmount.toFixed(2)}</span>
                    </div>
                </div>

                <div className="border-t-2 border-dashed my-2"></div>

                <div className="flex justify-between font-bold text-base">
                    <span>TOTAL</span>
                    <span>{currencySymbol} {invoice.amount.toFixed(2)}</span>
                </div>

                <div className="text-center mt-6">
                    Thank you for your business!
                </div>
            </div>
            <DialogFooter className="non-printable p-4 border-t flex flex-col sm:flex-row gap-2">
                 <Button onClick={handleEmailReceipt} variant="outline" className="w-full">
                    <Mail className="mr-2 h-4 w-4" />
                    Email Receipt
                </Button>
                <Button onClick={handlePrint} variant="outline" className="w-full">
                    <Printer className="mr-2 h-4 w-4" />
                    Print Receipt
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};

export default InvoiceDetail;
