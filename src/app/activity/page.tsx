
'use client'

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Header from "@/components/Header";
import { useAppContext } from "@/context/AppContext";
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from '@/components/icons';

type SortKey = 'timestamp' | 'user' | 'action';

export default function ActivityLogPage() {
    const { activityLogs } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortKey, setSortKey] = useState<SortKey>('timestamp');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };
    
    const filteredLogs = useMemo(() => {
        let logs = [...activityLogs];

        if (searchTerm) {
            const lowercasedFilter = searchTerm.toLowerCase();
            logs = logs.filter(log =>
                log.user.toLowerCase().includes(lowercasedFilter) ||
                log.action.toLowerCase().includes(lowercasedFilter) ||
                log.details.toLowerCase().includes(lowercasedFilter)
            );
        }

        logs.sort((a, b) => {
            const aValue = a[sortKey];
            const bValue = b[sortKey];
            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        return logs;
    }, [activityLogs, searchTerm, sortKey, sortDirection]);

    return (
        <div className="flex flex-col h-full">
            <Header title="Activity Logs" />
            <main className="flex-1 overflow-auto p-4 md:p-6">
                <div className="flex justify-end mb-4">
                    <Input
                        placeholder="Search logs..."
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
                                    <TableHead className="hidden md:table-cell"><Button variant="ghost" onClick={() => handleSort('timestamp')}>Timestamp <ArrowUpDown className="ml-2 h-4 w-4" /></Button></TableHead>
                                    <TableHead><Button variant="ghost" onClick={() => handleSort('user')}>User <ArrowUpDown className="ml-2 h-4 w-4" /></Button></TableHead>
                                    <TableHead><Button variant="ghost" onClick={() => handleSort('action')}>Action <ArrowUpDown className="ml-2 h-4 w-4" /></Button></TableHead>
                                    <TableHead>Details</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredLogs.length > 0 ? (
                                    filteredLogs.map(log => (
                                        <TableRow key={log.id}>
                                            <TableCell className="hidden md:table-cell">
                                                {format(new Date(log.timestamp), "yyyy-MM-dd, HH:mm:ss")}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{log.user}</div>
                                                <div className="text-muted-foreground md:hidden text-xs">
                                                    {format(new Date(log.timestamp), "yyyy-MM-dd, HH:mm:ss")}
                                                </div>
                                            </TableCell>
                                            <TableCell>{log.action}</TableCell>
                                            <TableCell>{log.details}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center">No activity logs found.</TableCell>
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

    

    
