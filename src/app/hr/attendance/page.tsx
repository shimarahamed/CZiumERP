'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Header from "@/components/Header";
import { useAppContext } from "@/context/AppContext";
import { format } from 'date-fns';
import { Clock, LogIn, LogOut } from 'lucide-react';
import type { AttendanceEntry } from '@/types';

export default function AttendancePage() {
  const { user, attendance, setAttendance, addActivityLog } = useAppContext();
  const [latestEntry, setLatestEntry] = useState<AttendanceEntry | null>(null);

  useEffect(() => {
    if (user && attendance) {
      const today = format(new Date(), 'yyyy-MM-dd');
      const userTodaysEntries = attendance
        .filter(a => a.userId === user.id && a.date === today)
        .sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime());
      
      setLatestEntry(userTodaysEntries[0] || null);
    }
  }, [attendance, user]);

  const handleCheckIn = () => {
    if (!user) return;
    const now = new Date();
    const newEntry: AttendanceEntry = {
      id: `att-${Date.now()}`,
      userId: user.id,
      checkIn: now.toISOString(),
      date: format(now, 'yyyy-MM-dd'),
    };
    setAttendance(prev => [newEntry, ...prev]);
    addActivityLog('Checked In', `User ${user.email} checked in.`);
  };

  const handleCheckOut = () => {
    if (!user || !latestEntry) return;
    const now = new Date();
    setAttendance(prev => 
      prev.map(entry => 
        entry.id === latestEntry.id ? { ...entry, checkOut: now.toISOString() } : entry
      )
    );
    addActivityLog('Checked Out', `User ${user.email} checked out.`);
  };

  const isCheckedIn = latestEntry && !latestEntry.checkOut;

  const userAttendanceHistory = (user && attendance)
    ? attendance.filter(a => a.userId === user.id).sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime())
    : [];
  
  return (
    <div className="flex flex-col h-full">
      <Header title="Attendance" />
      <main className="flex-1 overflow-auto p-4 md:p-6 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Clock In/Out</CardTitle>
            <CardDescription>Manage your daily attendance.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center gap-6 p-10">
             <Clock className="w-24 h-24 text-primary" />
             {isCheckedIn ? (
                <div className="text-center">
                    <p className="text-lg">You are currently checked in.</p>
                    <p className="text-sm text-muted-foreground">
                        Checked in at {format(new Date(latestEntry.checkIn), 'p')}
                    </p>
                </div>
             ) : (
                <p className="text-lg text-muted-foreground">You are currently checked out.</p>
             )}
             
            {isCheckedIn ? (
                <Button size="lg" onClick={handleCheckOut} className="w-full max-w-xs">
                    <LogOut className="mr-2 h-4 w-4" /> Check Out
                </Button>
            ) : (
                <Button size="lg" onClick={handleCheckIn} className="w-full max-w-xs">
                    <LogIn className="mr-2 h-4 w-4" /> Check In
                </Button>
            )}
          </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>My Attendance History</CardTitle>
                <CardDescription>Your recent check-in and check-out times.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Check In</TableHead>
                            <TableHead>Check Out</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {userAttendanceHistory.length > 0 ? (
                            userAttendanceHistory.slice(0, 10).map(entry => (
                                <TableRow key={entry.id}>
                                    <TableCell>{format(new Date(entry.date), 'MMM d, yyyy')}</TableCell>
                                    <TableCell>{format(new Date(entry.checkIn), 'p')}</TableCell>
                                    <TableCell>{entry.checkOut ? format(new Date(entry.checkOut), 'p') : 'N/A'}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center">No attendance history found.</TableCell>
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
