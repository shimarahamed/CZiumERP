'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegendContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend } from "recharts";
import { salesData } from "@/lib/data";
import Header from "@/components/Header";
import { DollarSign, Users, CreditCard, TrendingUp, PlusCircle, AlertCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";
import { format, differenceInDays, parseISO } from 'date-fns';

export default function DashboardPage() {
  const { invoices, customers, currentStore, currencySymbol, products } = useAppContext();
  
  const storeInvoices = invoices.filter(i => i.storeId === currentStore?.id);
  const paidInvoices = storeInvoices.filter(i => i.status === 'paid');

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(var(--primary))",
    },
  };

  const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  const totalCost = paidInvoices.reduce((total, invoice) => {
    return total + invoice.items.reduce((invoiceTotalCost, item) => {
      return invoiceTotalCost + (item.cost * item.quantity);
    }, 0);
  }, 0);

  const totalProfit = totalRevenue - totalCost;

  const lowStockItems = products.filter(p => 
    typeof p.reorderThreshold !== 'undefined' && p.stock <= p.reorderThreshold
  );

  const expiringItems = products
    .filter(p => {
      if (!p.expiryDate) return false;
      const expiry = parseISO(p.expiryDate);
      const daysUntilExpiry = differenceInDays(expiry, new Date());
      return daysUntilExpiry >= 0 && daysUntilExpiry <= 30;
    })
    .sort((a, b) => new Date(a.expiryDate!).getTime() - new Date(b.expiryDate!).getTime());

  return (
    <div className="flex flex-col h-full">
      <Header title="Dashboard">
        <Button asChild size="sm" className="gap-1">
          <Link href="/invoices">
            <PlusCircle className="h-4 w-4" />
            Generate Sales Invoice
          </Link>
        </Button>
      </Header>
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currencySymbol}{totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">+20.1% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currencySymbol}{totalProfit.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">+18.3% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sales</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{paidInvoices.length}</div>
              <p className="text-xs text-muted-foreground">+19% from last month (this store)</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{customers.length}</div>
              <p className="text-xs text-muted-foreground">Global count</p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 mt-6 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart data={salesData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `${currencySymbol}${value / 1000}k`} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                  <Legend content={<ChartLegendContent />} />
                  <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Inventory Alerts</CardTitle>
              <p className="text-sm text-muted-foreground">Items that require your attention.</p>
            </CardHeader>
            <CardContent>
              {lowStockItems.length === 0 && expiringItems.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-muted-foreground text-center py-8">No alerts at the moment.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[250px] overflow-y-auto">
                  {lowStockItems.length > 0 && (
                      <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2"><AlertCircle className="h-4 w-4 text-destructive"/>Low Stock Items</h4>
                          <div className="space-y-2 text-sm">
                          {lowStockItems.map(item => (
                              <div key={item.id} className="flex justify-between items-center">
                                  <span>{item.name}</span>
                                  <span className="font-medium text-destructive">{item.stock} left</span>
                              </div>
                          ))}
                          </div>
                      </div>
                  )}
                   {expiringItems.length > 0 && (
                      <div className="pt-2">
                          <h4 className="font-semibold mb-2 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-yellow-500"/>Expiring Soon</h4>
                          <div className="space-y-2 text-sm">
                          {expiringItems.map(item => (
                              <div key={item.id} className="flex justify-between items-center">
                                  <span>{item.name}</span>
                                  {item.expiryDate && <span className="font-medium">{format(parseISO(item.expiryDate), 'MMM d, yyyy')}</span>}
                              </div>
                          ))}
                          </div>
                      </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
