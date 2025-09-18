
'use client';

import React from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { ITAsset } from '@/types';
import { useAppContext } from '@/context/AppContext';
import { format, parseISO } from 'date-fns';

interface ITAssetDetailProps {
    asset: ITAsset;
}

const DetailItem = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div className="flex flex-col">
        <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
        <dd className="text-sm">{value || 'N/A'}</dd>
    </div>
);

const ITAssetDetail = ({ asset }: ITAssetDetailProps) => {
    const { currencySymbol, vendors, employees } = useAppContext();
    const assignedUser = employees.find(e => e.id === asset.assignedTo);
    const vendor = vendors.find(v => v.id === asset.vendorId);

    return (
        <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
                <DialogTitle>{asset.name}</DialogTitle>
                <DialogDescription>
                    {asset.category} - S/N: {asset.serialNumber}
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-6 max-h-[70vh] overflow-y-auto px-1">
                <div>
                    <h3 className="text-lg font-semibold mb-2">Core Information</h3>
                    <Card>
                        <CardContent className="p-4">
                            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-6">
                                <DetailItem label="Manufacturer" value={asset.manufacturer} />
                                <DetailItem label="Model" value={asset.model} />
                                <DetailItem label="Serial Number" value={asset.serialNumber} />
                                <DetailItem label="Description" value={<p className="col-span-full">{asset.description}</p>} />
                            </dl>
                        </CardContent>
                    </Card>
                </div>
                
                 <div>
                    <h3 className="text-lg font-semibold mb-2">Assignment</h3>
                    <Card>
                        <CardContent className="p-4">
                            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-6">
                                <DetailItem label="Assigned To" value={assignedUser?.name} />
                                <DetailItem label="Department" value={asset.department} />
                                <DetailItem label="Location" value={asset.location} />
                            </dl>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-2">Procurement & Financials</h3>
                     <Card>
                        <CardContent className="p-4">
                            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-6">
                                <DetailItem label="Purchase Date" value={format(parseISO(asset.purchaseDate), 'PPP')} />
                                <DetailItem label="Purchase Cost" value={`${currencySymbol} ${asset.purchaseCost.toFixed(2)}`} />
                                <DetailItem label="Vendor" value={vendor?.name} />
                                <DetailItem label="Warranty Expiration" value={asset.warrantyExpiration ? format(parseISO(asset.warrantyExpiration), 'PPP') : 'N/A'} />
                            </dl>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DialogContent>
    );
};

export default ITAssetDetail;
