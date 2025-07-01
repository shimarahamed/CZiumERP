'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import { useAppContext } from "@/context/AppContext";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Currency } from "@/types";

const months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' },
    { value: 3, label: 'March' }, { value: 4, label: 'April' },
    { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' },
    { value: 9, label: 'September' }, { value: 10, label: 'October' },
    { value: 11, label: 'November' }, { value: 12, label: 'December' }
];

export default function SettingsPage() {
    const { 
        currency, setCurrency, currencySymbols,
        companyName, setCompanyName,
        companyAddress, setCompanyAddress,
        fiscalYearStartMonth, setFiscalYearStartMonth,
        user, addActivityLog
    } = useAppContext();
    const { toast } = useToast();

    const [localCurrency, setLocalCurrency] = useState(currency);
    const [localCompanyName, setLocalCompanyName] = useState(companyName);
    const [localCompanyAddress, setLocalCompanyAddress] = useState(companyAddress);
    const [localFiscalYearStart, setLocalFiscalYearStart] = useState(fiscalYearStartMonth);

    useEffect(() => {
        setLocalCurrency(currency);
        setLocalCompanyName(companyName);
        setLocalCompanyAddress(companyAddress);
        setLocalFiscalYearStart(fiscalYearStartMonth);
    }, [currency, companyName, companyAddress, fiscalYearStartMonth]);

    const canManage = user?.role === 'admin';

    const handleSaveChanges = () => {
        if (!canManage) {
            toast({ variant: 'destructive', title: 'Permission Denied' });
            return;
        }
        setCompanyName(localCompanyName);
        setCompanyAddress(localCompanyAddress);
        setFiscalYearStartMonth(localFiscalYearStart);
        setCurrency(localCurrency);

        addActivityLog('Settings Updated', 'Company details and preferences were updated.');
        toast({ title: 'Settings Saved', description: 'Your changes have been saved successfully.' });
    };

    if (!canManage) {
        return (
            <div className="flex flex-col h-full">
                <Header title="Access Denied" />
                <main className="flex-1 overflow-auto p-4 md:p-6">
                    <Card>
                        <CardHeader><CardTitle>Permission Required</CardTitle></CardHeader>
                        <CardContent><p>You must be an administrator to access this page.</p></CardContent>
                    </Card>
                </main>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <Header title="Settings" />
            <main className="flex-1 overflow-auto p-4 md:p-6">
                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Company Details</CardTitle>
                            <CardDescription>Manage your organization's global information.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid w-full max-w-sm items-center gap-2">
                                <Label htmlFor="company-name">Company Name</Label>
                                <Input
                                    id="company-name"
                                    value={localCompanyName}
                                    onChange={(e) => setLocalCompanyName(e.target.value)}
                                />
                            </div>
                            <div className="grid w-full max-w-md items-center gap-2">
                                <Label htmlFor="company-address">Company Address</Label>
                                <Textarea
                                    id="company-address"
                                    value={localCompanyAddress}
                                    onChange={(e) => setLocalCompanyAddress(e.target.value)}
                                />
                            </div>
                            <div className="grid w-full max-w-sm items-center gap-2">
                                <Label htmlFor="fiscal-year">Fiscal Year Start</Label>
                                <Select value={String(localFiscalYearStart)} onValueChange={(val) => setLocalFiscalYearStart(Number(val))}>
                                    <SelectTrigger id="fiscal-year">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {months.map(m => (
                                            <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Preferences</CardTitle>
                            <CardDescription>Manage your application settings.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid w-full max-w-sm items-center gap-2">
                                <Label htmlFor="currency">Currency</Label>
                                <Select value={localCurrency} onValueChange={(value) => setLocalCurrency(value as Currency)}>
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
                        </CardContent>
                    </Card>
                    <div className="flex justify-end">
                        <Button onClick={handleSaveChanges}>Save Changes</Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
