import { MoreHorizontal, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { invoices } from "@/lib/data";
import Header from "@/components/Header";
import type { Invoice } from "@/types";

const statusVariant: { [key in Invoice['status']]: 'default' | 'secondary' | 'destructive' } = {
    paid: 'default',
    pending: 'secondary',
    overdue: 'destructive'
};

const InvoiceTable = ({ invoices }: { invoices: Invoice[] }) => (
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>
                    <span className="sr-only">Actions</span>
                </TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {invoices.map(invoice => (
                <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.id}</TableCell>
                    <TableCell>{invoice.customerName}</TableCell>
                    <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                    <TableCell>
                        <Badge variant={statusVariant[invoice.status]} className="capitalize">{invoice.status}</Badge>
                    </TableCell>
                    <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Toggle menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
);

export default function InvoicesPage() {
    const paidInvoices = invoices.filter(i => i.status === 'paid');
    const pendingInvoices = invoices.filter(i => i.status === 'pending');
    const overdueInvoices = invoices.filter(i => i.status === 'overdue');

    return (
        <div className="flex flex-col h-full">
            <Header title="Invoices" />
            <main className="flex-1 overflow-auto p-6">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Invoices</CardTitle>
                                <CardDescription>Manage and track all your customer invoices.</CardDescription>
                            </div>
                            <Button size="sm" className="gap-1">
                                <PlusCircle className="h-4 w-4" />
                                Create Invoice
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="all">
                            <TabsList>
                                <TabsTrigger value="all">All</TabsTrigger>
                                <TabsTrigger value="paid">Paid</TabsTrigger>
                                <TabsTrigger value="pending">Pending</TabsTrigger>
                                <TabsTrigger value="overdue">Overdue</TabsTrigger>
                            </TabsList>
                            <TabsContent value="all">
                                <InvoiceTable invoices={invoices} />
                            </TabsContent>
                            <TabsContent value="paid">
                                <InvoiceTable invoices={paidInvoices} />
                            </TabsContent>
                            <TabsContent value="pending">
                                <InvoiceTable invoices={pendingInvoices} />
                            </TabsContent>
                            <TabsContent value="overdue">
                                <InvoiceTable invoices={overdueInvoices} />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
