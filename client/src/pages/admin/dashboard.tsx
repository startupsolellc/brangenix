import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Activity, Settings } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface Statistics {
  totalUsers: number;
  totalGenerations: number;
  activeUsers: number;
}

// Format number with commas as thousand separators
const formatNumber = (num: number) => {
  return num.toLocaleString('tr-TR');
};

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<Statistics>({
    queryKey: ["/api/admin/statistics"],
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
            <CardDescription>All registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatNumber(stats?.totalUsers || 0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Name Generations</CardTitle>
            <CardDescription>Total names generated</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatNumber(stats?.totalGenerations || 0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Users</CardTitle>
            <CardDescription>Users active in last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatNumber(stats?.activeUsers || 0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/users">
          <Button
            variant="outline"
            className="w-full h-24 text-left flex items-center gap-4"
          >
            <Users className="h-6 w-6" />
            <div>
              <div className="font-semibold">User Management</div>
              <div className="text-sm text-muted-foreground">
                Manage users and permissions
              </div>
            </div>
          </Button>
        </Link>

        <Link href="/admin/activity">
          <Button
            variant="outline"
            className="w-full h-24 text-left flex items-center gap-4"
          >
            <Activity className="h-6 w-6" />
            <div>
              <div className="font-semibold">Activity Log</div>
              <div className="text-sm text-muted-foreground">
                View system activity and logs
              </div>
            </div>
          </Button>
        </Link>

        <Link href="/admin/settings">
          <Button
            variant="outline"
            className="w-full h-24 text-left flex items-center gap-4"
          >
            <Settings className="h-6 w-6" />
            <div>
              <div className="font-semibold">System Settings</div>
              <div className="text-sm text-muted-foreground">
                Configure system parameters
              </div>
            </div>
          </Button>
        </Link>
      </div>
    </div>
  );
}