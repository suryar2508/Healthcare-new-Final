import React, { useState } from "react";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { userRoleEnum } from "@shared/schema";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

// Registration form schema
const registerSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  fullName: z.string().min(2, { message: "Full name is required" }),
  role: z.enum(userRoleEnum.enumValues, {
    errorMap: () => ({ message: "Please select a role" }),
  }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();

  // Use useEffect for navigation to avoid render-time redirects
  // which cause the "Maximum update depth exceeded" error
  React.useEffect(() => {
    // Redirect if already logged in
    if (user) {
      navigate('/auth-check');
    }
  }, [user, navigate]);
  
  // Helper function to redirect users based on their role
  function getRedirectPathForRole(role: string): string {
    switch (role) {
      case "admin": return "/admin";
      case "doctor": return "/doctor";
      case "patient": return "/patient";
      case "pharmacist": return "/pharmacist";
      default: return "/";
    }
  }

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Registration form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      email: "",
      fullName: "",
      role: "patient",
    },
  });

  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(data);
  };

  const fillLoginWithDefault = (role: string) => {
    let username = "";
    let password = "password123";

    switch (role) {
      case "admin":
        username = "admin";
        break;
      case "doctor":
        username = "dr.johnson";
        break;
      case "patient":
        username = "john.doe";
        break;
      case "pharmacist":
        username = "pharmacy1";
        break;
      default:
        break;
    }

    loginForm.setValue("username", username);
    loginForm.setValue("password", password);
  };

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md p-6">
          <Tabs
            defaultValue="login"
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "login" | "register")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Welcome back</CardTitle>
                  <CardDescription>
                    Login to your account to access the healthcare platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form
                      onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Enter password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Login
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  <p className="text-sm text-muted-foreground mb-2">Demo Accounts:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Button variant="outline" size="sm" onClick={() => fillLoginWithDefault("admin")}>
                      Admin
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => fillLoginWithDefault("doctor")}>
                      Doctor
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => fillLoginWithDefault("patient")}>
                      Patient
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => fillLoginWithDefault("pharmacist")}>
                      Pharmacist
                    </Button>
                  </div>
                  <div className="mt-4 text-xs text-muted-foreground border border-dashed border-muted-foreground/50 p-3 rounded-md">
                    <p className="font-medium mb-1">Default Login Credentials:</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      <div>Admin: <span className="font-mono">admin</span></div>
                      <div>Password: <span className="font-mono">password123</span></div>
                      <div>Doctor: <span className="font-mono">dr.johnson</span></div>
                      <div>Password: <span className="font-mono">password123</span></div>
                      <div>Patient: <span className="font-mono">john.doe</span></div>
                      <div>Password: <span className="font-mono">password123</span></div>
                      <div>Pharmacist: <span className="font-mono">pharmacy1</span></div>
                      <div>Password: <span className="font-mono">password123</span></div>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground/70">Click on any role button above to auto-fill login form</p>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Create an account</CardTitle>
                  <CardDescription>
                    Sign up to join the healthcare platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form
                      onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Choose a username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="Enter your email"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter your full name"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Create a password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your role" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="patient">Patient</SelectItem>
                                <SelectItem value="doctor">Doctor</SelectItem>
                                <SelectItem value="pharmacist">Pharmacist</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Register
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="hidden lg:block flex-1 bg-gradient-to-br from-primary-800 to-primary-600 text-white p-12">
        <div className="h-full flex flex-col justify-center">
          <h1 className="text-4xl font-bold mb-6">Predictive Healthcare</h1>
          <p className="text-xl mb-8">
            A comprehensive healthcare management system with advanced features for doctors, patients, and pharmacists.
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Smart Prescription Management</h3>
                <p className="text-white/80">Automated medicine reminders and interaction alerts</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Easy Appointment Scheduling</h3>
                <p className="text-white/80">Book appointments with specialists in seconds</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Advanced Health Tracking</h3>
                <p className="text-white/80">Monitor vitals and get AI-powered health insights</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}