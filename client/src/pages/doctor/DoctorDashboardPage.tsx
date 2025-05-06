import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Users,
  Calendar,
  ClipboardList,
  Activity,
  Clock,
  FileText,
  AlertTriangle,
  Pill,
  Bell,
  Brain
} from "lucide-react";
import SymptomAnalyzer from "@/components/doctor/SymptomAnalyzer";

export default function DoctorDashboardPage() {
  const { user } = useAuth();
  
  // Get the current date
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  const formattedDate = today.toLocaleDateString(undefined, options);
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Doctor Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome, Dr. {user?.fullName || user?.username} | {formattedDate}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
          <Link href="/doctor/appointments">
            <Button size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Appointment
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Today's Appointments</CardTitle>
            <CardDescription>
              Scheduled for {today.toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">8</div>
            <div className="flex justify-between items-center mt-4">
              <Link href="/doctor/appointments">
                <Button variant="outline" size="sm">View Schedule</Button>
              </Link>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>My Patients</CardTitle>
            <CardDescription>
              Active patient records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">42</div>
            <div className="flex justify-between items-center mt-4">
              <Link href="/doctor/patients">
                <Button variant="outline" size="sm">View Patients</Button>
              </Link>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Pending Reports</CardTitle>
            <CardDescription>
              Awaiting your review
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">3</div>
            <div className="flex justify-between items-center mt-4">
              <Button variant="outline" size="sm">View Reports</Button>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <h2 className="text-2xl font-semibold mt-10 mb-4">Upcoming Appointments</h2>
      <div className="grid gap-4 mb-8">
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Time</th>
                    <th className="text-left p-4">Patient Name</th>
                    <th className="text-left p-4">Purpose</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="p-4">9:00 AM</td>
                    <td className="p-4">John Smith</td>
                    <td className="p-4">Regular Checkup</td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        Confirmed
                      </span>
                    </td>
                    <td className="p-4">
                      <Button variant="ghost" size="sm">Start</Button>
                    </td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="p-4">10:30 AM</td>
                    <td className="p-4">Jane Davis</td>
                    <td className="p-4">Follow-up</td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        Confirmed
                      </span>
                    </td>
                    <td className="p-4">
                      <Button variant="ghost" size="sm">Start</Button>
                    </td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="p-4">1:15 PM</td>
                    <td className="p-4">Michael Johnson</td>
                    <td className="p-4">Test Results Discussion</td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                        Waiting
                      </span>
                    </td>
                    <td className="p-4">
                      <Button variant="ghost" size="sm">Start</Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-md font-medium">New Prescription</CardTitle>
                <Pill className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Write a new prescription
                </p>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-md font-medium">Patient Records</CardTitle>
                <ClipboardList className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Access medical histories
                </p>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-md font-medium">Monitor Vitals</CardTitle>
                <Activity className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Check patient vitals
                </p>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-md font-medium">Diagnose Symptoms</CardTitle>
                <Brain className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  AI-powered diagnosis
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold mb-4">Critical Alerts</h2>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-red-600 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Urgent Attention Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="font-medium">Patient: Robert Chen</div>
                  <div className="text-sm text-muted-foreground">Blood pressure reading: 185/110 mmHg (Critical)</div>
                  <Button variant="destructive" size="sm" className="mt-2">Review Immediately</Button>
                </div>
                
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <div className="font-medium">Patient: Emily Wilson</div>
                  <div className="text-sm text-muted-foreground">Drug interaction alert: Warfarin + Aspirin</div>
                  <Button variant="outline" size="sm" className="mt-2">Review Prescription</Button>
                </div>
                
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="font-medium">Lab Results Available</div>
                  <div className="text-sm text-muted-foreground">3 new test results ready for review</div>
                  <Button variant="outline" size="sm" className="mt-2">View Results</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">AI-Powered Diagnostic Tools</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <SymptomAnalyzer />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5 text-primary" />
                Patient Vitals Analysis
              </CardTitle>
              <CardDescription>
                AI analysis of patient vitals over time for health trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Select a patient to analyze their vitals data and identify health trends.</p>
              <Button className="w-full">
                Access Vitals Analysis
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}