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
import { customers, initialInvoices } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import type { Invoice } from "@/types";

export default function PaymentsPage() {
  const [unpaidInvoices, setUnpaidInvoices] = useState<Invoice[]>([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');
  const [amount, setAmount] = useState<number | string>('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    // In a real app, you'd fetch this data.
    setUnpaidInvoices(initialInvoices.filter(inv => inv.status === 'pending' || inv.status === 'overdue'));
  }, []);

  const handleInvoiceChange = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    const invoice = unpaidInvoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      setAmount(invoice.amount.toFixed(2));
      if (invoice.customerId) {
        setSelectedCustomerId(invoice.customerId);
      } else {
        setSelectedCustomerId('');
      }
    } else {
      setAmount('');
      setSelectedCustomerId('');
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

    toast({
        title: "Payment Processed",
        description: `Payment of $${amount} for invoice ${selectedInvoiceId} has been successfully processed.`,
    });

    // Here you would typically update the invoice status and persist the changes.
    // For this prototype, we'll just clear the form.
    setSelectedInvoiceId('');
    setAmount('');
    setSelectedCustomerId('');
  };


  return (
    <div className="flex flex-col h-full">
      <Header title="Process Payment" />
      <main className="flex-1 overflow-auto p-6 flex justify-center items-start">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>New Transaction</CardTitle>
            <CardDescription>Select an invoice and payment method to complete the transaction.</CardDescription>
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
                            <SelectItem key={invoice.id} value={invoice.id}>{invoice.id} - ${invoice.amount.toFixed(2)}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="customer">Customer (Optional)</Label>
                  <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {customers.map(customer => (
                        <SelectItem key={customer.id} value={customer.id}>{customer.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-3">
                  <Label htmlFor="amount">Amount</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input id="amount" type="number" placeholder="0.00" className="pl-8" value={amount} onChange={(e) => setAmount(e.target.value)} />
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
                <Button type="submit" size="lg" className="w-full">
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
