'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { DialogContent, DialogFooter } from "@/components/ui/dialog";
import type { Invoice } from '@/types';
import { Printer, Store as StoreIcon } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

interface InvoiceDetailProps {
    invoice: Invoice;
}

const InvoiceDetail = ({ invoice }: InvoiceDetailProps) => {
    const { currentStore } = useAppContext();
    const handlePrint = () => {
        window.print();
    };

    return (
        <DialogContent className="sm:max-w-sm p-0">
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
                            <div className="w-16 shrink-0 text-right">${item.price.toFixed(2)}</div>
                            <div className="w-16 shrink-0 text-right">${(item.quantity * item.price).toFixed(2)}</div>
                        </div>
                    ))}
                </div>

                <div className="border-t border-dashed my-2"></div>
                
                <div className="space-y-1">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>${invoice.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Taxes (0%)</span>
                        <span>$0.00</span>
                    </div>
                </div>

                <div className="border-t-2 border-dashed my-2"></div>

                <div className="flex justify-between font-bold text-base">
                    <span>TOTAL</span>
                    <span>${invoice.amount.toFixed(2)}</span>
                </div>

                <div className="text-center mt-6">
                    Thank you for your business!
                </div>
            </div>
            <DialogFooter className="non-printable p-4 border-t">
                <Button onClick={handlePrint} variant="outline" className="w-full">
                    <Printer className="mr-2 h-4 w-4" />
                    Print Receipt
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};

export default InvoiceDetail;
