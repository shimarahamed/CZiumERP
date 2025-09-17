'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { Shipment } from '@/types';
import { Printer, Barcode, Package } from '@/components/icons';
import { useAppContext } from '@/context/AppContext';

interface ShippingLabelProps {
    shipment: Shipment;
}

const ShippingLabel = ({ shipment }: ShippingLabelProps) => {
    const { companyName, companyAddress } = useAppContext();
    
    const handlePrint = () => {
        window.print();
    };

    return (
        <DialogContent className="sm:max-w-lg p-0 printable-area-container">
            <DialogHeader className="sr-only">
              <DialogTitle>Shipping Label for {shipment.id}</DialogTitle>
            </DialogHeader>
            <div className="printable-area bg-white text-black p-4 flex flex-col aspect-[4/6] text-xs">
                <header className="grid grid-cols-2 gap-4 pb-2 border-b-2 border-black">
                    <div>
                        <p className="text-xs font-semibold">FROM:</p>
                        <p className="font-bold">{companyName}</p>
                        <p>{companyAddress}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-semibold">SHIP DATE: <span className="font-normal">{new Date(shipment.dispatchDate).toLocaleDateString()}</span></p>
                        <p className="font-semibold">INVOICE: <span className="font-normal">{shipment.invoiceId}</span></p>
                        <p className="font-semibold">ORDER ID: <span className="font-normal">{shipment.customId || 'N/A'}</span></p>
                    </div>
                </header>
                
                <section className="py-4 flex-grow">
                    <p className="text-xs font-semibold">SHIP TO:</p>
                    <div className="pl-4">
                        <p className="font-bold text-base">{shipment.customerName}</p>
                        <p className="text-base">{shipment.shippingAddress}</p>
                    </div>
                </section>
                
                <section className="py-2 border-y-2 border-black">
                     <h4 className="font-semibold text-center mb-1">CONTENTS</h4>
                     <div className="text-xs space-y-0.5 max-h-24 overflow-y-auto px-1">
                        {shipment.items.map(item => (
                            <div key={item.productId} className="flex justify-between">
                                <span className="truncate pr-2">{item.productName}</span>
                                <span className="font-bold">x{item.quantity}</span>
                            </div>
                        ))}
                     </div>
                </section>

                <footer className="pt-2 text-center">
                    <Barcode className="h-20 w-full" />
                    <p className="font-mono tracking-widest text-base">{shipment.trackingNumber || shipment.id}</p>
                </footer>
            </div>
            <DialogFooter className="non-printable p-4 border-t flex justify-center">
                <Button onClick={handlePrint} variant="outline" className="w-full sm:w-auto">
                    <Printer className="mr-2 h-4 w-4" />
                    Print Label
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};

export default ShippingLabel;
