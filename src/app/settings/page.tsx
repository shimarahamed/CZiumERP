'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import { useAppContext } from "@/context/AppContext";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { Currency } from "@/types";

export default function SettingsPage() {
    const { currency, setCurrency, currencySymbols } = useAppContext();
    const [newCurrency, setNewCurrency] = useState<Currency | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const handleCurrencyChangeRequest = (value: string) => {
        const selectedCurrency = value as Currency;
        if (selectedCurrency !== currency) {
            setNewCurrency(selectedCurrency);
            setIsConfirmOpen(true);
        }
    };

    const confirmCurrencyChange = () => {
        if (newCurrency) {
            setCurrency(newCurrency);
        }
        setIsConfirmOpen(false);
        setNewCurrency(null);
    }

    return (
        <div className="flex flex-col h-full">
            <Header title="Settings" />
            <main className="flex-1 overflow-auto p-4 md:p-6">
                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Preferences</CardTitle>
                            <CardDescription>Manage your application settings.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form>
                                <div className="grid w-full max-w-sm items-center gap-2">
                                    <Label htmlFor="currency">Currency</Label>
                                    <Select value={currency} onValueChange={handleCurrencyChangeRequest}>
                                        <SelectTrigger id="currency">
                                            <SelectValue placeholder="Select currency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.keys(currencySymbols).map(key => (
                                                <SelectItem key={key} value={key}>
                                                    {key} ({currencySymbols[key as Currency]})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </main>

            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Currency Change</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to change the currency to {newCurrency}? This will affect all monetary values displayed in the application.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setNewCurrency(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmCurrencyChange}>Confirm</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
