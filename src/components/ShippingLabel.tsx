
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
        <DialogContent className="sm:max-w-lg p-0 printable-area-container">
            <DialogHeader className="sr-only">
              <DialogTitle>Shipping Label for {shipment.id}</DialogTitle>
            </DialogHeader>
            <div className="printable-area bg-white text-black p-4 flex flex-col aspect-[4/6] text-black font-sans">
                <header className="grid grid-cols-2 gap-4 pb-2 border-b-4 border-black">
                    <div>
                        <p className="text-xs font-bold">FROM:</p>
                        <p className="font-semibold text-base">{companyName}</p>
                        <p className="text-sm">{companyAddress}</p>
                    </div>
                    <div className="text-right text-xs">
                        <p><span className="font-bold">SHIP DATE:</span> {new Date(shipment.dispatchDate).toLocaleDateString()}</p>
                        <p><span className="font-bold">INVOICE:</span> {shipment.invoiceId}</p>
                        <p><span className="font-bold">ORDER ID:</span> {shipment.customId || 'N/A'}</p>
                    </div>
                </header>
                
                <section className="py-12 flex-grow flex items-center justify-center">
                    <div className="pl-12 w-full">
                        <p className="text-sm font-bold">SHIP TO:</p>
                        <p className="font-bold text-2xl">{shipment.customerName}</p>
                        <p className="text-lg leading-tight">{shipment.shippingAddress}</p>
                    </div>
                </section>
                
                 <footer className="pt-4 border-t-8 border-black text-center">
                    <Barcode className="h-32 w-full" />
                    <p className="font-mono text-xl tracking-[0.3em] mt-1">{shipment.trackingNumber || shipment.id}</p>
                </footer>
            </div>
            <DialogFooter className="non-printable p-4 border-t flex justify-center">
                <Button onClick={handlePrint} variant="outline" className="w-full sm:w-auto">
                    <Printer className="mr-2 h-4 w-4" />
                    Print 4x6 Label
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};

export default ShippingLabel;
