
'use client'

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DatePicker } from '@/components/ui/date-picker';
import Header from "@/components/Header";
import { useAppContext } from "@/context/AppContext";
import { format } from 'date-fns';
import type { AttendanceEntry, AttendanceStatus } from '@/types';
import { UserCheck, UserX, Plane, Clock, Users } from '@/components/icons';

export default function AttendancePage() {
  const { employees, attendance, setAttendance, addActivityLog, user: currentUser } = useAppContext();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const canManage = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  const attendanceForDate = useMemo(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return attendance.filter(a => a.date === dateStr);
  }, [attendance, selectedDate]);
  
  const summary = useMemo(() => {
    return {
        present: attendanceForDate.filter(a => a.status === 'present').length,
        absent: attendanceForDate.filter(a => a.status === 'absent').length,
        leave: attendanceForDate.filter(a => a.status === 'leave').length,
        'half-day': attendanceForDate.filter(a => a.status === 'half-day').length,
    }
  }, [attendanceForDate]);

  const handleMarkAttendance = (employeeId: string, status: AttendanceStatus) => {
    if (!canManage) return;

    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return;

    setAttendance(prev => {
        const existingEntryIndex = prev.findIndex(
            a => a.employeeId === employeeId && a.date === formattedDate
        );

        if (existingEntryIndex > -1) {
            const updatedAttendance = [...prev];
            updatedAttendance[existingEntryIndex].status = status;
            return updatedAttendance;
        } else {
            const newEntry: AttendanceEntry = {
                id: `att-${Date.now()}`,
                employeeId: employeeId,
                date: formattedDate,
                status: status,
            };
            return [newEntry, ...prev];
        }
    });

    addActivityLog(
        'Attendance Marked', 
        `Marked ${employee.name} as ${status.replace('-', ' ')} for ${format(selectedDate, 'PPP')}`
    );
  };
  
  return (
    <div className="flex flex-col h-full">
      <Header title="Manual Attendance" />
      <main className="flex-1 overflow-auto p-4 md:p-6 grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
            <Card>
                <CardHeader className="flex flex-col md:flex-row justify-between md:items-center">
                    <div>
                        <CardTitle>Mark Employee Attendance</CardTitle>
                        <CardDescription>Select a date and mark the status for each employee.</CardDescription>
                    </div>
                    <DatePicker date={selectedDate} setDate={setSelectedDate} />
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead className="w-[150px]">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {employees.map(employee => {
                                const currentStatus = attendanceForDate.find(a => a.employeeId === employee.id)?.status;
                                return (
                                <TableRow key={employee.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={employee.avatar} alt={employee.name} data-ai-hint="person user" />
                                                <AvatarFallback>{employee.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col min-w-0">
                                               <span className="truncate">{employee.name}</span>
                                               <span className="text-sm text-muted-foreground truncate">{employee.jobTitle}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            value={currentStatus || 'absent'}
                                            onValueChange={(status: AttendanceStatus) => handleMarkAttendance(employee.id, status)}
                                            disabled={!canManage}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="present">Present</SelectItem>
                                                <SelectItem value="absent">Absent</SelectItem>
                                                <SelectItem value="leave">On Leave</SelectItem>
                                                <SelectItem value="half-day">Half-day</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
        <div className="md:col-span-1">
             <Card>
                <CardHeader>
                    <CardTitle>Attendance Summary</CardTitle>
                    <CardDescription>{format(selectedDate, 'PPP')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                           <Users className="w-5 h-5 text-muted-foreground" />
                           <span className="font-medium">Total Employees</span>
                        </div>
                        <span className="font-bold text-lg">{employees.length}</span>
                    </div>
                     <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                        <div className="flex items-center gap-3">
                           <UserCheck className="w-5 h-5 text-green-600" />
                           <span className="font-medium text-green-700">Present</span>
                        </div>
                        <span className="font-bold text-lg text-green-700">{summary.present}</span>
                    </div>
                     <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg">
                        <div className="flex items-center gap-3">
                           <UserX className="w-5 h-5 text-red-600" />
                           <span className="font-medium text-red-700">Absent</span>
                        </div>
                        <span className="font-bold text-lg text-red-700">{summary.absent}</span>
                    </div>
                     <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg">
                        <div className="flex items-center gap-3">
                           <Plane className="w-5 h-5 text-blue-600" />
                           <span className="font-medium text-blue-700">On Leave</span>
                        </div>
                        <span className="font-bold text-lg text-blue-700">{summary.leave}</span>
                    </div>
                     <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg">
                        <div className="flex items-center gap-3">
                           <Clock className="w-5 h-5 text-yellow-600" />
                           <span className="font-medium text-yellow-700">Half-day</span>
                        </div>
                        <span className="font-bold text-lg text-yellow-700">{summary['half-day']}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
