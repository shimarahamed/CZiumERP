
'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
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
            <div className="printable-area bg-white text-black p-4 aspect-[4/6] flex flex-col">
                <header className="flex justify-between items-start pb-4 border-b-2 border-black">
                    <div>
                        <p className="font-semibold">FROM:</p>
                        <p className="font-bold text-lg">{companyName}</p>
                        <p className="text-sm">{companyAddress}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-semibold">SHIP DATE:</p>
                        <p className="text-sm">{new Date(shipment.dispatchDate).toLocaleDateString()}</p>
                    </div>
                </header>
                
                <section className="py-8 border-b-2 border-black flex-grow">
                    <p className="font-semibold">SHIP TO:</p>
                    <div className="pl-4">
                        <p className="font-bold text-xl">{shipment.customerName}</p>
                        <p className="text-lg">{shipment.shippingAddress}</p>
                    </div>
                </section>

                <footer className="pt-4 text-center">
                    <Barcode className="h-24 w-full" />
                    <p className="font-mono tracking-widest text-lg">{shipment.trackingNumber || shipment.id}</p>
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
