'use client'

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import { DollarSign, CreditCard, Smartphone, Landmark } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/context/AppContext";
import type { Invoice } from "@/types";

export default function PaymentsPage() {
  const { invoices, setInvoices, customers, addActivityLog, currentStore, currencySymbol } = useAppContext();
  const [unpaidInvoices, setUnpaidInvoices] = useState<Invoice[]>([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');
  const [amount, setAmount] = useState<number | string>('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    const storeUnpaidInvoices = invoices.filter(inv => 
        inv.storeId === currentStore?.id && (inv.status === 'pending' || inv.status === 'overdue')
    );
    setUnpaidInvoices(storeUnpaidInvoices);
  }, [invoices, currentStore]);

  const handleInvoiceChange = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    const invoice = unpaidInvoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      setAmount(invoice.amount.toFixed(2));
      if (invoice.customerId) {
        setSelectedCustomerId(invoice.customerId);
      } else {
        setSelectedCustomerId('none');
      }
    } else {
      setAmount('');
      setSelectedCustomerId('none');
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedInvoiceId || !amount) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Please select an invoice and ensure amount is filled.",
        });
        return;
    }
    
    addActivityLog('Payment Processed', `Processed payment of ${currencySymbol} ${amount} for invoice ${selectedInvoiceId}.`);

    setInvoices(currentInvoices => 
        currentInvoices.map(inv => 
            inv.id === selectedInvoiceId ? { ...inv, status: 'paid' } : inv
        )
    );

    toast({
        title: "Payment Processed",
        description: `Payment of ${currencySymbol} ${amount} for invoice ${selectedInvoiceId} has been successfully processed.`,
    });

    // Clear the form
    setSelectedInvoiceId('');
    setAmount('');
    setSelectedCustomerId('none');
  };


  return (
    <div className="flex flex-col h-full">
      <Header title="Process Payment" />
      <main className="flex-1 overflow-auto p-4 md:p-6 flex justify-center items-start">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>New Transaction</CardTitle>
            <CardDescription>Select an invoice from {currentStore?.name} to complete the transaction.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-6">
                <div className="grid gap-3">
                    <Label htmlFor="invoice">Invoice Number</Label>
                    <Select value={selectedInvoiceId} onValueChange={handleInvoiceChange}>
                        <SelectTrigger>
                        <SelectValue placeholder="Select an unpaid invoice" />
                        </SelectTrigger>
                        <SelectContent>
                        {unpaidInvoices.map(invoice => (
                            <SelectItem key={invoice.id} value={invoice.id}>{invoice.id} - {currencySymbol} {invoice.amount.toFixed(2)}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="customer">Customer (from invoice)</Label>
                  <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId} disabled>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {customers.map(customer => (
                        <SelectItem key={customer.id} value={customer.id}>{customer.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-3">
                  <Label htmlFor="amount">Amount</Label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground">{currencySymbol}</span>
                    <Input id="amount" type="number" placeholder="0.00" className="pl-8" value={amount} onChange={(e) => setAmount(e.target.value)} readOnly/>
                  </div>
                </div>
                <div className="grid gap-3">
                  <Label>Payment Method</Label>
                  <RadioGroup defaultValue="card" className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <RadioGroupItem value="card" id="card" className="peer sr-only" />
                      <Label
                        htmlFor="card"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <CreditCard className="mb-3 h-6 w-6" />
                        Credit Card
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="cash" id="cash" className="peer sr-only" />
                      <Label
                        htmlFor="cash"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <Landmark className="mb-3 h-6 w-6" />
                        Cash
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="mobile" id="mobile" className="peer sr-only" />
                      <Label
                        htmlFor="mobile"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <Smartphone className="mb-3 h-6 w-6" />
                        Mobile
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                <Button type="submit" size="lg" className="w-full" disabled={!selectedInvoiceId}>
                  Process Payment
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
