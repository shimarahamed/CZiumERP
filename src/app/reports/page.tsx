
'use client'

import React, { useMemo, useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import { Download, DollarSign, FileText, Users, ShoppingBag } from "lucide-react";
import { useAppContext } from '@/context/AppContext';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import type { DateRange } from 'react-day-picker';
import { subDays, isWithinInterval, parseISO } from 'date-fns';
import type { Invoice } from '@/types';

type ProductSale = {
    productId: string;
    productName: string;
    quantitySold: number;
    totalRevenue: number;
}

type UserSale = {
    userId: string;
    userName: string;
    invoicesCreated: number;
    totalRevenue: number;
}


const ReportView = React.forwardRef<HTMLDivElement, { 
    filteredInvoices: Invoice[], 
    productSales: ProductSale[], 
    userSales: UserSale[], 
    dateRange?: DateRange 
}>(({ filteredInvoices, productSales, userSales, dateRange }, ref) => {
    const { currencySymbol, currentStore } = useAppContext();

    const totalRevenue = filteredInvoices.reduce((acc, inv) => acc + inv.amount, 0);
    const totalInvoices = filteredInvoices.length;
    const uniqueCustomers = new Set(filteredInvoices.map(inv => inv.customerId).filter(Boolean)).size;
    const totalItemsSold = filteredInvoices.reduce((sum, inv) => sum + inv.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);

    return (
        <div ref={ref} className="printable-invoice-area bg-white text-black p-4 sm:p-8">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold mb-1">Sales Report for {currentStore?.id === 'all' ? 'All Stores' : currentStore?.name}</h1>
                {dateRange?.from && (
                    <p className="text-gray-600">
                        Period: {dateRange.from.toLocaleDateString()}
                        {dateRange.to ? ` - ${dateRange.to.toLocaleDateString()}` : ''}
                    </p>
                )}
                <p className="text-gray-500 text-sm">Generated on: {new Date().toLocaleDateString()}</p>
            </div>
            
             {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
                <Card className="bg-slate-50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{currencySymbol} {totalRevenue.toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Invoices</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalInvoices}</div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalItemsSold}</div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Customers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{uniqueCustomers}</div>
                    </CardContent>
                </Card>
            </div>


            <Tabs defaultValue="product-sales">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="product-sales">Sales by Product</TabsTrigger>
                    <TabsTrigger value="user-sales">Sales by User</TabsTrigger>
                </TabsList>
                <TabsContent value="product-sales">
                     <h2 className="text-xl font-bold mb-4">Sales by Product</h2>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead className="text-right">Quantity Sold</TableHead>
                                <TableHead className="text-right">Total Revenue</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {productSales.map(sale => (
                                <TableRow key={sale.productId}>
                                    <TableCell>{sale.productName}</TableCell>
                                    <TableCell className="text-right">{sale.quantitySold}</TableCell>
                                    <TableCell className="text-right">{currencySymbol} {sale.totalRevenue.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                     </Table>
                </TabsContent>
                 <TabsContent value="user-sales">
                     <h2 className="text-xl font-bold mb-4">Sales by User</h2>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead className="text-right">Invoices Created</TableHead>
                                <TableHead className="text-right">Total Revenue</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {userSales.map(sale => (
                                <TableRow key={sale.userId}>
                                    <TableCell>{sale.userName || 'Unknown User'}</TableCell>
                                    <TableCell className="text-right">{sale.invoicesCreated}</TableCell>
                                    <TableCell className="text-right">{currencySymbol} {sale.totalRevenue.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                     </Table>
                </TabsContent>
            </Tabs>
        </div>
    );
});
ReportView.displayName = "ReportView";


export default function ReportsPage() {
    const { invoices, currentStore, currencySymbol } = useAppContext();
    const reportRef = useRef<HTMLDivElement>(null);
    const [date, setDate] = useState<DateRange | undefined>({
        from: subDays(new Date(), 29),
        to: new Date(),
    });

    const handlePrint = () => {
        window.print();
    };

    const filteredInvoices = useMemo(() => {
        const baseInvoices = (currentStore?.id === 'all' ? invoices : invoices.filter(inv => inv.storeId === currentStore?.id))
            .filter(inv => inv.status === 'paid');

        if (date?.from) {
            return baseInvoices.filter(inv => 
                isWithinInterval(parseISO(inv.date), { start: date.from!, end: date.to || new Date() })
            );
        }
        return baseInvoices;
    }, [invoices, currentStore, date]);
    
    const productSales = useMemo((): ProductSale[] => {
        const sales: { [key: string]: ProductSale } = {};
        filteredInvoices.forEach(inv => {
            inv.items.forEach(item => {
                if (!sales[item.productId]) {
                    sales[item.productId] = {
                        productId: item.productId,
                        productName: item.productName,
                        quantitySold: 0,
                        totalRevenue: 0
                    };
                }
                sales[item.productId].quantitySold += item.quantity;
                sales[item.productId].totalRevenue += item.quantity * item.price;
            });
        });
        return Object.values(sales).sort((a,b) => b.totalRevenue - a.totalRevenue);
    }, [filteredInvoices]);

    const userSales = useMemo((): UserSale[] => {
        const sales: { [key: string]: UserSale } = {};
         filteredInvoices.forEach(inv => {
            if (inv.userId) {
                if (!sales[inv.userId]) {
                    sales[inv.userId] = {
                        userId: inv.userId,
                        userName: inv.userName || `User ID: ${inv.userId}`,
                        invoicesCreated: 0,
                        totalRevenue: 0,
                    };
                }
                sales[inv.userId].invoicesCreated += 1;
                sales[inv.userId].totalRevenue += inv.amount;
            }
        });
        return Object.values(sales).sort((a,b) => b.totalRevenue - a.totalRevenue);
    }, [filteredInvoices]);

    return (
        <div className="flex flex-col h-full">
            <Header title="Sales Reports" />
            <main className="flex-1 overflow-auto p-4 md:p-6">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div>
                                <CardTitle>Detailed Sales Report</CardTitle>
                                <CardDescription>Filter and view your sales data.</CardDescription>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <DateRangePicker date={date} setDate={setDate} />
                                <Button onClick={handlePrint} size="sm" className="gap-1 w-full sm:w-auto">
                                    <Download className="h-4 w-4" />
                                    Download PDF
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                       <div className="border rounded-lg bg-white shadow-sm">
                         <ReportView 
                            ref={reportRef} 
                            filteredInvoices={filteredInvoices} 
                            productSales={productSales}
                            userSales={userSales}
                            dateRange={date}
                        />
                       </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
