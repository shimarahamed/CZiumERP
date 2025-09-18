
'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Shipment } from '@/types';
import { Printer, Store } from '@/components/icons';
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
        <DialogContent className="sm:max-w-4xl p-0 printable-area-container">
            <DialogHeader className="sr-only">
              <DialogTitle>Packing Slip for {shipment.id}</DialogTitle>
            </DialogHeader>
            <div className="printable-area bg-white text-black p-8 font-sans">
                {/* Shipping Label Section */}
                <div className="border-b-2 border-dashed border-gray-400 pb-8 mb-8">
                    <div className="flex justify-between items-start">
                        <div className="w-3/5">
                            <p className="text-sm font-bold uppercase">Ship To:</p>
                            <p className="text-lg font-bold">{shipment.customerName}</p>
                            <p className="text-base">{shipment.shippingAddress}</p>
                        </div>
                        <div className="w-2/5 text-right text-xs">
                            <p className="font-bold">{companyName}</p>
                            <p>{companyAddress}</p>
                        </div>
                    </div>
                </div>

                {/* Vendor/Company Info & Order Details */}
                <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-4">
                        <Store className="h-16 w-16 text-gray-700" />
                        <div>
                            <p className="font-bold text-xl">{companyName}</p>
                            <p className="text-sm">{companyAddress}</p>
                        </div>
                    </div>
                    <div className="text-right text-sm">
                        <p><span className="font-bold">Order Number:</span> {shipment.id}</p>
                        <p><span className="font-bold">Order Date:</span> {new Date(shipment.dispatchDate).toLocaleDateString()}</p>
                    </div>
                </div>

                {/* Customer Info */}
                <div className="mb-8">
                    <p className="font-bold uppercase text-sm">Billed To:</p>
                    <p>{shipment.customerName}</p>
                    <p>{shipment.shippingAddress}</p>
                </div>
                
                {/* Picking List */}
                <Table id="picking-list">
                    <TableHeader className="bg-gray-800 text-white">
                        <TableRow>
                            <TableHead className="text-white">Product</TableHead>
                            <TableHead className="text-white text-center w-[20%]">Quantity</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {shipment.items.map((item) => (
                            <TableRow key={item.productId}>
                                <TableCell className="font-medium">{item.productName}</TableCell>
                                <TableCell className="text-center">{item.quantity}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <DialogFooter className="non-printable p-4 border-t flex justify-center">
                <Button onClick={handlePrint} variant="outline" className="w-full sm:w-auto">
                    <Printer className="mr-2 h-4 w-4" />
                    Print Packing Slip
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};

export default ShippingLabel;
