
'use client'

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from '@/context/AppContext';
import type { User, Role } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';

const userSchema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.string().email("Invalid email address."),
  role: z.enum(['admin', 'manager', 'cashier', 'inventory-staff']),
  password: z.string().min(6, "Password must be at least 6 characters.").optional().or(z.literal('')),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  dateOfJoining: z.date().optional().nullable(),
  salary: z.coerce.number().min(0, "Salary must be non-negative").optional(),
});

type UserFormData = z.infer<typeof userSchema>;

export default function UsersPage() {
    const { users, setUsers, addActivityLog, user: currentUser, currencySymbol } = useAppContext();
    const { toast } = useToast();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    const form = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
    });

    useEffect(() => {
      if (!isFormOpen) {
        form.reset({ name: '', email: '', role: 'cashier', password: '', jobTitle: '', department: '', dateOfJoining: null, salary: 0 });
        setUserToEdit(null);
      }
    }, [isFormOpen, form]);
    
    if (currentUser?.role !== 'admin') {
        return (
            <div className="flex flex-col h-full">
                <Header title="Access Denied" />
                <main className="flex-1 overflow-auto p-4 md:p-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Permission Required</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>You do not have permission to view this page. Please contact an administrator.</p>
                        </CardContent>
                    </Card>
                </main>
            </div>
        );
    }

    const handleOpenForm = (user: User | null = null) => {
        setUserToEdit(user);
        if (user) {
            form.reset({
                name: user.name,
                email: user.email,
                role: user.role,
                password: '',
                jobTitle: user.jobTitle,
                department: user.department,
                dateOfJoining: user.dateOfJoining ? new Date(user.dateOfJoining) : null,
                salary: user.salary,
            });
        } else {
            form.reset({ name: '', email: '', role: 'cashier', password: '', jobTitle: '', department: '', dateOfJoining: new Date(), salary: 0 });
        }
        setIsFormOpen(true);
    };

    const onSubmit = (data: UserFormData) => {
        const userData = {
            ...data,
            dateOfJoining: data.dateOfJoining ? data.dateOfJoining.toISOString() : undefined
        };

        if (userToEdit) {
            const updatedUsers = users.map(u => u.id === userToEdit.id ? { 
                ...u, 
                ...userData, 
                password: data.password ? data.password : u.password 
            } : u);
            setUsers(updatedUsers);
            toast({ title: "Employee Updated", description: `${data.name}'s details have been updated.` });
            addActivityLog('Employee Updated', `Updated employee: ${data.name} (ID: ${userToEdit.id})`);
        } else {
            const newUser: User = {
                id: `user-${Date.now()}`,
                avatar: `https://placehold.co/40x40`,
                ...userData,
                password: data.password || 'password'
            };
            setUsers([newUser, ...users]);
            toast({ title: "Employee Added", description: `${data.name} has been added.` });
            addActivityLog('Employee Added', `Added new employee: ${data.name}`);
        }
        setIsFormOpen(false);
    };
    
    const handleDelete = () => {
        if (!userToDelete || userToDelete.id === currentUser.id) {
            toast({ variant: 'destructive', title: "Action Forbidden", description: "You cannot delete your own account." });
            setUserToDelete(null);
            return;
        };

        addActivityLog('Employee Deleted', `Deleted employee: ${userToDelete.name} (ID: ${userToDelete.id})`);
        setUsers(users.filter(u => u.id !== userToDelete.id));
        toast({ title: "Employee Deleted", description: `${userToDelete.name} has been deleted.` });
        setUserToDelete(null);
    };

    return (
        <div className="flex flex-col h-full">
            <Header title="Employee Management" />
            <main className="flex-1 overflow-auto p-4 md:p-6">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div>
                                <CardTitle>Employees</CardTitle>
                                <CardDescription>Manage employee accounts, roles, and information.</CardDescription>
                            </div>
                            <Button size="sm" className="gap-1 w-full md:w-auto" onClick={() => handleOpenForm()}>
                                <PlusCircle className="h-4 w-4" />
                                Add Employee
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Employee</TableHead>
                                    <TableHead className="hidden md:table-cell">Job Title</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map(user => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="person user" />
                                                    <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col min-w-0">
                                                   <span className="truncate">{user.name}</span>
                                                   <span className="text-sm text-muted-foreground truncate">{user.email}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">{user.jobTitle || 'N/A'}</TableCell>
                                        <TableCell><Badge variant="secondary" className="capitalize">{user.role.replace('-', ' ')}</Badge></TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Toggle menu</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleOpenForm(user)}>Edit</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive" onClick={() => setUserToDelete(user)}>Delete</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </main>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>{userToEdit ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
                        <DialogDescription>
                            {userToEdit ? 'Update employee details and permissions.' : 'Fill in the details to add a new employee.'}
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-2">
                             <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="password" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl><Input type="password" {...field} placeholder={userToEdit ? "Leave blank to keep current password" : "Minimum 6 characters"} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="jobTitle" render={({ field }) => (
                                    <FormItem><FormLabel>Job Title</FormLabel><FormControl><Input {...field} placeholder="e.g. Store Manager" /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="department" render={({ field }) => (
                                    <FormItem><FormLabel>Department</FormLabel><FormControl><Input {...field} placeholder="e.g. Sales" /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="role" render={({ field }) => (
                                    <FormItem><FormLabel>Role</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="admin">Admin</SelectItem>
                                                <SelectItem value="manager">Manager</SelectItem>
                                                <SelectItem value="cashier">Cashier</SelectItem>
                                                <SelectItem value="inventory-staff">Inventory Staff</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    <FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="dateOfJoining" render={({ field }) => (
                                    <FormItem className="flex flex-col pt-2"><FormLabel>Date of Joining</FormLabel><FormControl><DatePicker date={field.value ?? undefined} setDate={field.onChange} /></FormControl><FormMessage /></FormItem>
                                )}/>
                            </div>
                             <FormField control={form.control} name="salary" render={({ field }) => (
                                <FormItem><FormLabel>Salary ({currencySymbol})</FormLabel><FormControl><Input type="number" step="100" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            
                            <DialogFooter>
                                <Button type="submit">{userToEdit ? 'Save Changes' : 'Add Employee'}</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone. This will permanently delete the employee's account.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
