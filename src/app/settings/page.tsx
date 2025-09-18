
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import { useAppContext } from "@/context/AppContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Currency, ThemeSettings } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { hexToHsl, hslToHex } from '@/lib/color-utils';
import Image from 'next/image';

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
        themeSettings, setThemeSettings,
        user, addActivityLog
    } = useAppContext();
    const { toast } = useToast();

    // Local states for form inputs
    const [localCurrency, setLocalCurrency] = useState(currency);
    const [localCompanyName, setLocalCompanyName] = useState(companyName);
    const [localCompanyAddress, setLocalCompanyAddress] = useState(companyAddress);
    const [localFiscalYearStart, setLocalFiscalYearStart] = useState(fiscalYearStartMonth);
    const [localThemeSettings, setLocalThemeSettings] = useState(themeSettings);

    useEffect(() => {
        setLocalCurrency(currency);
        setLocalCompanyName(companyName);
        setLocalCompanyAddress(companyAddress);
        setLocalFiscalYearStart(fiscalYearStartMonth);
        setLocalThemeSettings(themeSettings);
    }, [currency, companyName, companyAddress, fiscalYearStartMonth, themeSettings]);

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
        setThemeSettings(localThemeSettings);

        addActivityLog('Settings Updated', 'Company details and preferences were updated.');
        toast({ title: 'Settings Saved', description: 'Your changes have been saved successfully.' });
    };
    
    const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLocalThemeSettings(prev => ({...prev, logoUrl: reader.result as string}));
            };
            reader.readAsDataURL(file);
        }
    };

    if (!canManage) {
        return (
            <div className="flex flex-col h-full">
                <Header title="Access Denied" />
                <main className="flex-1 p-6"><Card><CardHeader><CardTitle>Permission Required</CardTitle></CardHeader>
                <CardContent><p>You must be an administrator to access this page.</p></CardContent></Card></main>
            </div>
        );
    }

    const ColorPicker = ({ label, value, onChange }: { label: string, value: string, onChange: (value: string) => void }) => (
        <div className="grid w-full items-center gap-2">
            <Label>{label}</Label>
            <div className="flex items-center gap-2">
                <Input type="color" value={hslToHex(value)} onChange={(e) => onChange(hexToHsl(e.target.value))} className="w-12 h-10 p-1" />
                <Input value={value} onChange={(e) => onChange(e.target.value)} />
            </div>
        </div>
    );
    
    return (
        <div className="flex flex-col h-full">
            <Header title="Settings" />
            <main className="flex-1 overflow-auto p-4 md:p-6">
                <Tabs defaultValue="company" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="company">Company Details</TabsTrigger>
                        <TabsTrigger value="branding">Theme & Branding</TabsTrigger>
                        <TabsTrigger value="financial">Financial</TabsTrigger>
                    </TabsList>
                    <TabsContent value="company">
                        <Card>
                            <CardHeader><CardTitle>Company Details</CardTitle><CardDescription>Manage your organization's global information.</CardDescription></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid w-full max-w-sm items-center gap-2">
                                    <Label htmlFor="company-name">Company Name</Label>
                                    <Input id="company-name" value={localCompanyName} onChange={(e) => setLocalCompanyName(e.target.value)} />
                                </div>
                                <div className="grid w-full max-w-md items-center gap-2">
                                    <Label htmlFor="company-address">Company Address</Label>
                                    <Textarea id="company-address" value={localCompanyAddress} onChange={(e) => setLocalCompanyAddress(e.target.value)} />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="branding">
                        <Card>
                            <CardHeader><CardTitle>Theme & Branding</CardTitle><CardDescription>Customize the look and feel of the application.</CardDescription></CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid w-full max-w-md items-center gap-2">
                                    <Label htmlFor="app-name">Application Name</Label>
                                    <Input id="app-name" value={localThemeSettings.appName} onChange={(e) => setLocalThemeSettings(prev => ({...prev, appName: e.target.value}))} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Company Logo</Label>
                                    <div className="flex items-center gap-4">
                                        {localThemeSettings.logoUrl && <Image src={localThemeSettings.logoUrl} alt="Logo preview" width={48} height={48} className="rounded-md object-contain bg-muted p-1" />}
                                        <Input id="logo-url" type="file" accept="image/*" onChange={handleLogoUpload} className="max-w-xs" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <ColorPicker label="Primary Color" value={localThemeSettings.primaryColor} onChange={(value) => setLocalThemeSettings(prev => ({ ...prev, primaryColor: value }))} />
                                    <ColorPicker label="Background Color" value={localThemeSettings.backgroundColor} onChange={(value) => setLocalThemeSettings(prev => ({ ...prev, backgroundColor: value }))} />
                                    <ColorPicker label="Accent Color" value={localThemeSettings.accentColor} onChange={(value) => setLocalThemeSettings(prev => ({ ...prev, accentColor: value }))} />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="financial">
                        <Card>
                            <CardHeader><CardTitle>Financial Settings</CardTitle><CardDescription>Manage currency and fiscal year settings.</CardDescription></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid w-full max-w-sm items-center gap-2">
                                    <Label htmlFor="fiscal-year">Fiscal Year Start</Label>
                                    <Select value={String(localFiscalYearStart)} onValueChange={(val) => setLocalFiscalYearStart(Number(val))}><SelectTrigger id="fiscal-year"><SelectValue /></SelectTrigger>
                                        <SelectContent>{months.map(m => <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="grid w-full max-w-sm items-center gap-2">
                                    <Label htmlFor="currency">Currency</Label>
                                    <Select value={localCurrency} onValueChange={(value) => setLocalCurrency(value as Currency)}><SelectTrigger id="currency"><SelectValue placeholder="Select currency" /></SelectTrigger>
                                        <SelectContent>{Object.keys(currencySymbols).map(key => <SelectItem key={key} value={key}>{key} ({currencySymbols[key as Currency]})</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
                <div className="flex justify-end mt-6">
                    <Button onClick={handleSaveChanges}>Save All Settings</Button>
                </div>
            </main>
        </div>
    );
}

