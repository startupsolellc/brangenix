import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

interface SystemSetting {
  id: number;
  key: string;
  value: string | number | boolean;
  updatedAt: string;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const { data: settings, isLoading } = useQuery<SystemSetting[]>({
    queryKey: ["/api/admin/settings"],
    retry: 1,
  });

  const updateSetting = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      if (!res.ok) throw new Error("Failed to update setting");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings updated",
        description: "The system setting has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
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
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/dashboard">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">System Settings</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>
            Manage system-wide settings and parameters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {settings?.map((setting) => (
              <div key={setting.id} className="space-y-2">
                <label className="text-sm font-medium">{setting.key}</label>
                <div className="flex gap-2">
                  <Input
                    type={typeof setting.value === "number" ? "number" : "text"}
                    value={setting.value.toString()}
                    onChange={(e) =>
                      updateSetting.mutate({
                        key: setting.key,
                        value:
                          typeof setting.value === "number"
                            ? Number(e.target.value)
                            : e.target.value,
                      })
                    }
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={updateSetting.isPending}
                  >
                    Save
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Last updated: {new Date(setting.updatedAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
