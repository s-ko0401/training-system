import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function RegisterPage() {
    const [userName, setUserName] = useState('');
    const [userAccount, setUserAccount] = useState('');
    const [userPassword, setUserPassword] = useState('');
    const [userRole, setUserRole] = useState('USER');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8080/api/auth/register', {
                userName,
                userAccount,
                userPassword,
                userRole,
            });
            navigate('/login');
        } catch (err: any) {
            setError(err.response?.data || 'Registration failed');
            console.error(err);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-[400px]">
                <CardHeader>
                    <CardTitle>Register</CardTitle>
                    <CardDescription>Create a new account.</CardDescription>
                </CardHeader>
                <form onSubmit={handleRegister}>
                    <CardContent>
                        <div className="grid w-full items-center gap-4">
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    placeholder="Your name"
                                    value={userName}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="account">Account</Label>
                                <Input
                                    id="account"
                                    placeholder="Choose an account"
                                    value={userAccount}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserAccount(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Choose a password"
                                    value={userPassword}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="role">Role</Label>
                                <Select onValueChange={setUserRole} defaultValue={userRole}>
                                    <SelectTrigger id="role">
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="USER">User</SelectItem>
                                        <SelectItem value="ADMIN">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                        <Button type="submit" className="w-full">Register</Button>
                        <p className="text-sm text-gray-500 text-center">
                            Already have an account? <Link to="/login" className="text-blue-500 hover:underline">Login</Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
