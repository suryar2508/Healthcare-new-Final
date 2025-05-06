import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { userRoleEnum } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export type User = {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: typeof userRoleEnum.enumValues[number];
  createdAt?: string;
  updatedAt?: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, RegisterData>;
};

type LoginData = {
  username: string;
  password: string;
};

export type RegisterData = {
  username: string;
  password: string;
  email: string;
  fullName: string;
  role: typeof userRoleEnum.enumValues[number];
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      try {
        const res = await apiRequest("POST", "/api/login", credentials);
        // Check if the response is valid JSON before parsing
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return await res.json();
        } else {
          throw new Error('Server returned an invalid response. Please try again later.');
        }
      } catch (error) {
        console.error('Login error:', error);
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('An unexpected error occurred during login');
      }
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Welcome back!",
        description: `Successfully logged in as ${user.username}`,
      });
    },
    onError: (error: Error) => {
      // Clean up error message for better user experience
      let errorMessage = error.message;
      if (errorMessage.includes('<!DOCTYPE') || errorMessage.includes('<html')) {
        errorMessage = 'Server error occurred. Please try again later.';
      }
      
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      try {
        const res = await apiRequest("POST", "/api/register", userData);
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return await res.json();
        } else {
          throw new Error('Server returned an invalid response. Please try again later.');
        }
      } catch (error) {
        console.error('Registration error:', error);
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('An unexpected error occurred during registration');
      }
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Registration successful",
        description: "Your account has been created successfully",
      });
    },
    onError: (error: Error) => {
      // Clean up error message for better user experience
      let errorMessage = error.message;
      if (errorMessage.includes('<!DOCTYPE') || errorMessage.includes('<html')) {
        errorMessage = 'Server error occurred. Please try again later.';
      }
      
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        await apiRequest("POST", "/api/logout");
      } catch (error) {
        console.error('Logout error:', error);
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('An unexpected error occurred during logout');
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    },
    onError: (error: Error) => {
      // Clean up error message for better user experience
      let errorMessage = error.message;
      if (errorMessage.includes('<!DOCTYPE') || errorMessage.includes('<html')) {
        errorMessage = 'Server error occurred. Please try again later.';
      }
      
      toast({
        title: "Logout failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}