import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Calendar,
  Heart,
  Pill,
  FileText,
  Plus,
  Activity,
  Upload,
  Bell,
  UserRound
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function PatientDashboardPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">Patient Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome, {user?.fullName || user?.username} | {formattedDate}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
          <Link href="/patient/book-appointment">
            <Button size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Book Appointment
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>
              Your scheduled doctor visits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">2</div>
            <div className="flex justify-between items-center mt-4">
              <Link href="/patient/appointments">
                <Button variant="outline" size="sm">View Appointments</Button>
              </Link>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Active Medications</CardTitle>
            <CardDescription>
              Current prescriptions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">3</div>
            <div className="flex justify-between items-center mt-4">
              <Link href="/patient/medications">
                <Button variant="outline" size="sm">View Medications</Button>
              </Link>
              <Pill className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Health Records</CardTitle>
            <CardDescription>
              Your medical documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
            <div className="flex justify-between items-center mt-4">
              <Button variant="outline" size="sm">View Records</Button>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 mt-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Upcoming Appointments</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-3 bg-muted/50 rounded-md">
                  <Calendar className="h-10 w-10 text-primary flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <div className="font-medium text-lg">Dr. Sarah Johnson - Cardiologist</div>
                    <div className="text-muted-foreground">May 10, 2025 at 10:30 AM</div>
                    <div className="text-muted-foreground">Regular checkup</div>
                    <div className="flex space-x-2 mt-2">
                      <Button variant="outline" size="sm">Reschedule</Button>
                      <Button variant="outline" size="sm">Cancel</Button>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 p-3 bg-muted/50 rounded-md">
                  <Calendar className="h-10 w-10 text-primary flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <div className="font-medium text-lg">Dr. Michael Chen - Dermatologist</div>
                    <div className="text-muted-foreground">May 15, 2025 at 2:00 PM</div>
                    <div className="text-muted-foreground">Skin condition follow-up</div>
                    <div className="flex space-x-2 mt-2">
                      <Button variant="outline" size="sm">Reschedule</Button>
                      <Button variant="outline" size="sm">Cancel</Button>
                    </div>
                  </div>
                </div>
                
                <Link href="/patient/book-appointment">
                  <Button variant="link" className="mt-2 w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Book a new appointment
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/patient/upload-prescription">
              <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-md font-medium">Upload Prescription</CardTitle>
                  <Upload className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Use OCR to extract medicine details
                  </p>
                </CardContent>
              </Card>
            </Link>
            
            <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-md font-medium">Track Vitals</CardTitle>
                <Activity className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Record your health metrics
                </p>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-md font-medium">Medical History</CardTitle>
                <FileText className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  View your complete records
                </p>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-md font-medium">Find Doctors</CardTitle>
                <UserRound className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Search specialists near you
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold mb-4">Health Overview</h2>
          <Card>
            <CardHeader>
              <CardTitle>Today's Medication Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                  <div className="flex items-center space-x-3">
                    <Pill className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">Amlodipine 5mg</div>
                      <div className="text-xs text-muted-foreground">Take 1 tablet with breakfast</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-flex items-center justify-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
                        <circle cx="4" cy="4" r="3" />
                      </svg>
                      Taken
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                  <div className="flex items-center space-x-3">
                    <Pill className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">Metformin 500mg</div>
                      <div className="text-xs text-muted-foreground">Take 1 tablet with lunch</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-flex items-center justify-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                      <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-amber-400" fill="currentColor" viewBox="0 0 8 8">
                        <circle cx="4" cy="4" r="3" />
                      </svg>
                      Due at 12:00 PM
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                  <div className="flex items-center space-x-3">
                    <Pill className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">Atorvastatin 20mg</div>
                      <div className="text-xs text-muted-foreground">Take 1 tablet at bedtime</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-flex items-center justify-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                      <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-slate-400" fill="currentColor" viewBox="0 0 8 8">
                        <circle cx="4" cy="4" r="3" />
                      </svg>
                      Due at 9:00 PM
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Recent Health Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <Heart className="h-4 w-4 text-red-500 mr-2" />
                      <span className="font-medium text-sm">Blood Pressure</span>
                    </div>
                    <span className="text-sm font-medium">120/80 mmHg</span>
                  </div>
                  <Progress value={72} className="h-2" />
                  <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                    <span>Last reading: Today</span>
                    <span>Normal</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <Activity className="h-4 w-4 text-yellow-500 mr-2" />
                      <span className="font-medium text-sm">Blood Glucose</span>
                    </div>
                    <span className="text-sm font-medium">110 mg/dL</span>
                  </div>
                  <Progress value={65} className="h-2" />
                  <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                    <span>Last reading: Yesterday</span>
                    <span>Normal</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <Heart className="h-4 w-4 text-blue-500 mr-2" />
                      <span className="font-medium text-sm">Heart Rate</span>
                    </div>
                    <span className="text-sm font-medium">72 BPM</span>
                  </div>
                  <Progress value={60} className="h-2" />
                  <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                    <span>Last reading: Today</span>
                    <span>Normal</span>
                  </div>
                </div>
                
                <Link href="/patient/health-metrics">
                  <Button variant="link" className="w-full">
                    View all health metrics
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}