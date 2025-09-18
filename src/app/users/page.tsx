
'use client'

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MoreHorizontal, PlusCircle, ArrowUpDown } from "@/components/icons";
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

const userSchema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.string().email("Invalid email address."),
  role: z.enum(['admin', 'manager', 'cashier', 'inventory-staff']),
  password: z.string().min(6, "Password must be at least 6 characters.").optional().or(z.literal('')),
});

type UserFormData = z.infer<typeof userSchema>;
type SortKey = 'name' | 'email' | 'role';

export default function UsersPage() {
    const { users, setUsers, addActivityLog, user: currentUser } = useAppContext();
    const { toast } = useToast();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all');
    const [sortKey, setSortKey] = useState<SortKey>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');


    const form = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
    });

    useEffect(() => {
      if (!isFormOpen) {
        form.reset({ name: '', email: '', role: 'cashier', password: '' });
        setUserToEdit(null);
      }
    }, [isFormOpen, form]);
    
    const filteredUsers = useMemo(() => {
        let filtered = users.filter(user =>
            (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (roleFilter === 'all' || user.role === roleFilter)
        );

        filtered.sort((a,b) => {
            const aValue = a[sortKey];
            const bValue = b[sortKey];
            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [users, searchTerm, roleFilter, sortKey, sortDirection]);

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
    
    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

    const handleOpenForm = (user: User | null = null) => {
        setUserToEdit(user);
        if (user) {
            form.reset({
                name: user.name,
                email: user.email,
                role: user.role,
                password: '',
            });
        } else {
            form.reset({ name: '', email: '', role: 'cashier', password: '' });
        }
        setIsFormOpen(true);
    };

    const onSubmit = (data: UserFormData) => {
        if (userToEdit) {
            const updatedUsers = users.map(u => u.id === userToEdit.id ? { 
                ...u, 
                ...data, 
                password: data.password ? data.password : u.password 
            } : u);
            setUsers(updatedUsers);
            toast({ title: "User Updated", description: `${data.name}'s account has been updated.` });
            addActivityLog('User Account Updated', `Updated account: ${data.name} (ID: ${userToEdit.id})`);
        } else {
            const newUser: User = {
                id: `user-${Date.now()}`,
                avatar: `https://placehold.co/40x40`,
                ...data,
                password: data.password || 'password'
            };
            setUsers([newUser, ...users]);
            toast({ title: "User Added", description: `${data.name} has been added.` });
            addActivityLog('User Account Added', `Added new user account: ${data.name}`);
        }
        setIsFormOpen(false);
    };
    
    const handleDelete = () => {
        if (!userToDelete || userToDelete.id === currentUser.id) {
            toast({ variant: 'destructive', title: "Action Forbidden", description: "You cannot delete your own account." });
            setUserToDelete(null);
            return;
        };

        addActivityLog('User Account Deleted', `Deleted account: ${userToDelete.name} (ID: ${userToDelete.id})`);
        setUsers(users.filter(u => u.id !== userToDelete.id));
        toast({ title: "User Deleted", description: `${userToDelete.name}'s account has been deleted.` });
        setUserToDelete(null);
    };

    return (
        <div className="flex flex-col h-full">
            <Header title="User Account Management" />
            <main className="flex-1 overflow-auto p-4 md:p-6">
                 <div className="flex flex-col md:flex-row justify-end md:items-center gap-4 mb-4">
                    <Input
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-auto md:min-w-[250px] bg-secondary"
                    />
                     <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as Role | 'all')}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filter by role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="cashier">Cashier</SelectItem>
                            <SelectItem value="inventory-staff">Inventory Staff</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button size="sm" className="gap-1" onClick={() => handleOpenForm()}>
                        <PlusCircle className="h-4 w-4" />
                        Add User
                    </Button>
                </div>
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead><Button variant="ghost" onClick={() => handleSort('name')}>User <ArrowUpDown className="ml-2 h-4 w-4" /></Button></TableHead>
                                    <TableHead><Button variant="ghost" onClick={() => handleSort('role')}>Role <ArrowUpDown className="ml-2 h-4 w-4" /></Button></TableHead>
                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.map(user => (
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
                        <DialogTitle>{userToEdit ? 'Edit User' : 'Add New User'}</DialogTitle>
                        <DialogDescription>
                            {userToEdit ? "Update the user's details and role." : 'Fill in the details to add a new system user.'}
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
                            
                            <DialogFooter>
                                <Button type="submit">{userToEdit ? 'Save Changes' : 'Add User'}</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone. This will permanently delete the user's account.</AlertDialogDescription>
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

    