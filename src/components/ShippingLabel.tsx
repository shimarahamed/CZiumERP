
'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Shipment } from '@/types';
import { Printer, Store } from '@/components/icons';
import { useAppContext } from '@/context/AppContext';
import jsbarcode from 'jsbarcode';

interface ShippingLabelProps {
    shipment: Shipment;
}

const ShippingLabel = ({ shipment }: ShippingLabelProps) => {
    const { companyName, companyAddress } = useAppContext();
    const barcodeRef = React.useRef<SVGSVGElement>(null);

    React.useEffect(() => {
        if (barcodeRef.current && shipment.trackingNumber) {
            jsbarcode(barcodeRef.current, shipment.trackingNumber, {
                format: 'CODE128',
                displayValue: true,
                fontSize: 14,
                margin: 10,
                height: 50,
            });
        }
    }, [shipment.trackingNumber]);
    
    const handlePrint = () => {
        window.print();
    };

    return (
        <DialogContent className="sm:max-w-xl p-0 printable-area-container">
            <DialogHeader className="sr-only">
              <DialogTitle>Shipping Label for {shipment.id}</DialogTitle>
            </DialogHeader>
            <div className="printable-area bg-white text-black p-6 font-sans" style={{ width: '4in', height: '6in' }}>
                 <div className="flex flex-col h-full">
                    <div className="border-b border-black pb-2">
                        <p className="text-xs font-bold">FROM: {companyName}</p>
                        <p className="text-xs">{companyAddress}</p>
                    </div>

                    <div className="flex-grow py-4 pl-8">
                        <p className="text-sm font-bold">SHIP TO:</p>
                        <p className="text-2xl font-bold">{shipment.customerName}</p>
                        <p className="text-lg">{shipment.shippingAddress}</p>
                    </div>

                    <div className="border-t border-black pt-2 flex flex-col items-center justify-center">
                        <svg ref={barcodeRef} className="w-full"></svg>
                    </div>
                </div>
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
