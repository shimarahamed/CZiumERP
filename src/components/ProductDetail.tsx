
'use client';

import React from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Product } from '@/types';
import { useAppContext } from '@/context/AppContext';
import { format, parseISO } from 'date-fns';

interface ProductDetailProps {
    product: Product;
}

const ProductDetail = ({ product }: ProductDetailProps) => {
    const { currencySymbol, vendors, purchaseOrders } = useAppContext();
    const vendor = vendors.find(v => v.id === product.vendorId);
    const productPurchaseHistory = purchaseOrders.filter(po => 
        po.status === 'received' && po.items.some(item => item.productId === product.id)
    );

    const DetailItem = ({ label, value }: { label: string, value: React.ReactNode }) => (
        <div className="flex flex-col">
            <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
            <dd className="text-sm">{value || 'N/A'}</dd>
        </div>
    );

    return (
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
                <DialogTitle>{product.name}</DialogTitle>
                <DialogDescription>{product.description || 'No description available.'}</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-6 max-h-[70vh] overflow-y-auto px-1">
                <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-6">
                    <DetailItem label="SKU" value={product.sku} />
                    <DetailItem label="Category" value={product.category} />
                    <DetailItem label="Default Vendor" value={vendor?.name} />
                    <DetailItem label="Price" value={`${currencySymbol} ${product.price.toFixed(2)}`} />
                    <DetailItem label="Cost" value={`${currencySymbol} ${product.cost.toFixed(2)}`} />
                    <DetailItem label="Stock Quantity" value={product.stock} />
                    <DetailItem label="Reorder Threshold" value={product.reorderThreshold} />
                    <DetailItem label="Expiry Date" value={product.expiryDate ? format(parseISO(product.expiryDate), 'PPP') : 'N/A'} />
                    <DetailItem label="Warranty Date" value={product.warrantyDate ? format(parseISO(product.warrantyDate), 'PPP') : 'N/A'} />
                </dl>
                
                <Separator />
                
                {productPurchaseHistory.length > 0 && (
                    <div className="space-y-2">
                        <h3 className="text-lg font-medium">Purchase History</h3>
                        <Card>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>PO ID</TableHead>
                                            <TableHead>Vendor</TableHead>
                                            <TableHead>Date Received</TableHead>
                                            <TableHead className="text-right">Qty</TableHead>
                                            <TableHead className="text-right">Cost</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {productPurchaseHistory.map(po => {
                                            const item = po.items.find(i => i.productId === product.id)!;
                                            return (
                                                <TableRow key={po.id}>
                                                    <TableCell>{po.id}</TableCell>
                                                    <TableCell>{po.vendorName}</TableCell>
                                                    <TableCell>{po.receivedDate ? format(parseISO(po.receivedDate), 'PPP') : 'N/A'}</TableCell>
                                                    <TableCell className="text-right">{item.quantity}</TableCell>
                                                    <TableCell className="text-right">{currencySymbol} {item.cost.toFixed(2)}</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </DialogContent>
    );
};

export default ProductDetail;
