import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/share/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/share/ui/card";

export function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser =
      localStorage.getItem("user") ?? sessionStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.userRole !== "ADMIN") {
      navigate("/user/dashboard"); // Redirect unauthorized access
      return;
    }
    setUser(parsedUser);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>
        {/* Add more admin widgets here */}
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-xl font-semibold">
          Welcome back, {user.userName}
        </h2>
        <p>You have full access to manage the system.</p>
      </div>
    </div>
  );
}
