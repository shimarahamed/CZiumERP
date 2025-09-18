
'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Header from "@/components/Header";
import { useAppContext } from "@/context/AppContext";
import { format, parseISO } from 'date-fns';
import type { LedgerEntry } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from '@/components/icons';

type SortKey = 'date' | 'account' | 'debit' | 'credit';

export default function GeneralLedgerPage() {
    const { ledgerEntries, currencySymbol } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortKey, setSortKey] = useState<SortKey>('date');
    const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

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
            .sort((a, b) => {
                const aValue = a[sortKey];
                const bValue = b[sortKey];

                if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
                
                // Secondary sort by original date to maintain chronological balance
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            })
            .map(entry => {
                balance += entry.debit - entry.credit;
                return { ...entry, balance };
            });
    }, [ledgerEntries, searchTerm, sortKey, sortDirection]);

    return (
        <div className="flex flex-col h-full">
            <Header title="General Ledger" />
            <main className="flex-1 overflow-auto p-4 md:p-6">
                <div className="flex justify-end mb-4">
                     <Input
                        placeholder="Search by account or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-full md:max-w-sm bg-secondary"
                    />
                </div>
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead><Button variant="ghost" onClick={() => handleSort('date')}>Date <ArrowUpDown className="ml-2 h-4 w-4" /></Button></TableHead>
                                    <TableHead><Button variant="ghost" onClick={() => handleSort('account')}>Account <ArrowUpDown className="ml-2 h-4 w-4" /></Button></TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right"><Button variant="ghost" onClick={() => handleSort('debit')}>Debit <ArrowUpDown className="ml-2 h-4 w-4" /></Button></TableHead>
                                    <TableHead className="text-right"><Button variant="ghost" onClick={() => handleSort('credit')}>Credit <ArrowUpDown className="ml-2 h-4 w-4" /></Button></TableHead>
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
                                                {entry.debit > 0 ? `${currencySymbol} ${entry.debit.toFixed(2)}` : '-'}
                                            </TableCell>
                                            <TableCell className="text-right font-mono">
                                                {entry.credit > 0 ? `${currencySymbol} ${entry.credit.toFixed(2)}` : '-'}
                                            </TableCell>
                                            <TableCell className="text-right font-mono">{currencySymbol} {entry.balance.toFixed(2)}</TableCell>
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

    

    

    