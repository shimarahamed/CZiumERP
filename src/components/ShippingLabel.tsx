
'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Shipment } from '@/types';
import { Printer, Barcode } from '@/components/icons';
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
        <DialogContent className="sm:max-w-md p-0 printable-area-container">
            <DialogHeader className="sr-only">
              <DialogTitle>Shipping Label for {shipment.id}</DialogTitle>
            </DialogHeader>
            <div className="printable-area bg-white text-black p-4 flex flex-col aspect-[4/6] text-sm">
                <header className="grid grid-cols-2 gap-4 pb-2 border-b-2 border-black">
                    <div>
                        <p className="text-xs font-semibold">FROM:</p>
                        <p className="font-bold">{companyName}</p>
                        <p className="text-xs">{companyAddress}</p>
                    </div>
                    <div className="text-right text-xs">
                        <p><span className="font-semibold">SHIP DATE:</span> {new Date(shipment.dispatchDate).toLocaleDateString()}</p>
                        <p><span className="font-semibold">INVOICE:</span> {shipment.invoiceId}</p>
                        <p><span className="font-semibold">ORDER ID:</span> {shipment.customId || 'N/A'}</p>
                    </div>
                </header>
                
                <section className="py-8 flex-grow flex items-center justify-center">
                    <div className="pl-8 w-full">
                        <p className="text-xs font-semibold">SHIP TO:</p>
                        <p className="font-bold text-lg">{shipment.customerName}</p>
                        <p className="text-base">{shipment.shippingAddress}</p>
                    </div>
                </section>
                
                 <footer className="pt-4 border-t-2 border-black text-center">
                    <Barcode className="h-24 w-full" />
                    <p className="font-mono text-lg tracking-[0.2em]">{shipment.trackingNumber || shipment.id}</p>
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

