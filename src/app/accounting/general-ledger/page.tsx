
'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Header from "@/components/Header";
import { useAppContext } from "@/context/AppContext";
import { format, parseISO } from 'date-fns';
import type { LedgerEntry } from '@/types';
import { Input } from '@/components/ui/input';

export default function GeneralLedgerPage() {
    const { ledgerEntries, currencySymbol } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');

    const processedEntries = useMemo(() => {
        if (!Array.isArray(ledgerEntries)) return [];
        
        let filtered = ledgerEntries;
        if (searchTerm) {
            const lowercasedFilter = searchTerm.toLowerCase();
            filtered = ledgerEntries.filter(entry =>
                entry.account.toLowerCase().includes(lowercasedFilter) ||
                entry.description.toLowerCase().includes(lowercasedFilter)
            );
        }

        let balance = 0;
        // Sort entries by date to calculate running balance correctly
        return filtered
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(entry => {
                balance += entry.debit - entry.credit;
                return { ...entry, balance };
            });
    }, [ledgerEntries, searchTerm]);

    return (
        <div className="flex flex-col h-full">
            <Header title="General Ledger" />
            <main className="flex-1 overflow-auto p-4 md:p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>General Ledger</CardTitle>
                        <CardDescription>A complete record of all financial transactions.</CardDescription>
                         <div className="mt-4">
                            <Input
                                placeholder="Search by account or description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="max-w-full md:max-w-sm bg-secondary"
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Account</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Debit</TableHead>
                                    <TableHead className="text-right">Credit</TableHead>
                                    <TableHead className="text-right">Balance</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {processedEntries.length > 0 ? (
                                    processedEntries.map(entry => (
                                        <TableRow key={entry.id}>
                                            <TableCell>{format(parseISO(entry.date), 'yyyy-MM-dd')}</TableCell>
                                            <TableCell>{entry.account}</TableCell>
                                            <TableCell>{entry.description}</TableCell>
                                            <TableCell className="text-right font-mono">
                                                {entry.debit > 0 ? `${currencySymbol}${entry.debit.toFixed(2)}` : '-'}
                                            </TableCell>
                                            <TableCell className="text-right font-mono">
                                                {entry.credit > 0 ? `${currencySymbol}${entry.credit.toFixed(2)}` : '-'}
                                            </TableCell>
                                            <TableCell className="text-right font-mono">{currencySymbol}{entry.balance.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center">No ledger entries found.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
