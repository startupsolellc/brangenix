import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useGenerations } from "@/hooks/use-generations";

const authSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type AuthFormData = z.infer<typeof authSchema>;

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { resetGuestGenerations } = useGenerations();

  const form = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: AuthFormData) => {
    setIsLoading(true);
    try {
      const endpoint = isLogin ? '/api/login' : '/api/register';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Authentication failed');
      }

      // Reset guest generations when successfully logged in
      resetGuestGenerations();

      toast({
        title: isLogin ? "Welcome back!" : "Account created successfully!",
        description: "You can now generate unlimited brand names.",
      });

      // Redirect to home page
      setLocation("/");
    } catch (error) {
      console.error("Auth error:", error);
      toast({
        variant: "destructive",
        title: "Authentication failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 p-4">
        {/* Left side - Auth form */}
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>{isLogin ? "Welcome Back" : "Create Account"}</CardTitle>
            <CardDescription>
              {isLogin
                ? "Sign in to access more features"
                : "Sign up to generate unlimited brand names"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Please wait..." : (isLogin ? "Sign In" : "Create Account")}
                </Button>
              </form>
            </Form>
            <div className="mt-4 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-blue-600 hover:underline"
                disabled={isLoading}
              >
                {isLogin
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Right side - Features */}
        <div className="hidden md:flex flex-col justify-center">
          <h2 className="text-3xl font-bold mb-6">
            Generate Perfect Brand Names
          </h2>
          <ul className="space-y-4">
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Generate unlimited brand names
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Access premium features
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Save your favorite names
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Export in various formats
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}