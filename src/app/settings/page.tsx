'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import { useAppContext } from "@/context/AppContext";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Currency } from "@/types";

export default function SettingsPage() {
    const { currency, setCurrency, currencySymbols } = useAppContext();

    const handleCurrencyChange = (value: string) => {
        setCurrency(value as Currency);
    };

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
                                    <Select value={currency} onValueChange={handleCurrencyChange}>
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
        </div>
    );
}
