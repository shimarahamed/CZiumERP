
'use client'

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Header from "@/components/Header";
import { useAppContext } from "@/context/AppContext";
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';

export default function ActivityLogPage() {
    const { activityLogs } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredLogs = useMemo(() => {
        if (!searchTerm) return activityLogs;
        const lowercasedFilter = searchTerm.toLowerCase();
        return activityLogs.filter(log =>
            log.user.toLowerCase().includes(lowercasedFilter) ||
            log.action.toLowerCase().includes(lowercasedFilter) ||
            log.details.toLowerCase().includes(lowercasedFilter)
        );
    }, [activityLogs, searchTerm]);

    return (
        <div className="flex flex-col h-full">
            <Header title="Activity Logs" />
            <main className="flex-1 overflow-auto p-4 md:p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Audit Trail</CardTitle>
                        <CardDescription>A log of all significant actions performed in the system.</CardDescription>
                         <div className="mt-4">
                            <Input
                                placeholder="Search logs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="max-w-full md:max-w-sm"
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="hidden md:table-cell">Timestamp</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Action</TableHead>
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
