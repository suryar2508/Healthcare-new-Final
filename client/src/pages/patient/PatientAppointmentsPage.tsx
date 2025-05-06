import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ChevronLeft, ChevronRight, Plus, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PatientAppointmentsPage() {
  const { user } = useAuth();
  
  // Get the current date
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Appointments</h1>
          <p className="text-muted-foreground">Schedule and manage your doctor visits</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Book New Appointment
        </Button>
      </div>
      
      <Tabs defaultValue="upcoming">
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          <div className="flex justify-between items-center mb-4">
            <div className="text-xl font-medium">Upcoming Appointments</div>
            
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by doctor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Doctors</SelectItem>
                <SelectItem value="dr_johnson">Dr. Johnson</SelectItem>
                <SelectItem value="dr_chen">Dr. Chen</SelectItem>
                <SelectItem value="dr_patel">Dr. Patel</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <div className="flex items-start p-6 border-b">
                  <div className="bg-blue-100 rounded-full p-3 mr-4">
                    <Calendar className="h-6 w-6 text-blue-700" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">Dr. Sarah Johnson - Cardiologist</h3>
                        <p className="text-muted-foreground">Regular Check-up</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Confirmed</Badge>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-2 h-4 w-4" />
                      May 10, 2025
                      <Clock className="ml-4 mr-2 h-4 w-4" />
                      10:30 AM
                      <span className="ml-4">Duration: 30 min</span>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-muted-foreground">
                      <span>Medical Center, 123 Health St., Floor 3, Room 302</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-muted/30 flex justify-between items-center">
                  <div className="text-sm">
                    <span className="font-medium">Appointment Notes:</span> Please bring your recent test results and medication list
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <X className="mr-2 h-3 w-3" />
                      Cancel
                    </Button>
                    <Button variant="outline" size="sm">
                      <Calendar className="mr-2 h-3 w-3" />
                      Reschedule
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-0">
                <div className="flex items-start p-6 border-b">
                  <div className="bg-indigo-100 rounded-full p-3 mr-4">
                    <Calendar className="h-6 w-6 text-indigo-700" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">Dr. Michael Chen - Dermatologist</h3>
                        <p className="text-muted-foreground">Skin Condition Follow-up</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Confirmed</Badge>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-2 h-4 w-4" />
                      May 15, 2025
                      <Clock className="ml-4 mr-2 h-4 w-4" />
                      2:00 PM
                      <span className="ml-4">Duration: 45 min</span>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-muted-foreground">
                      <span>Dermatology Clinic, 456 Wellness Ave., Suite 205</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-muted/30 flex justify-between items-center">
                  <div className="text-sm">
                    <span className="font-medium">Appointment Notes:</span> Follow-up on treatment progress
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <X className="mr-2 h-3 w-3" />
                      Cancel
                    </Button>
                    <Button variant="outline" size="sm">
                      <Calendar className="mr-2 h-3 w-3" />
                      Reschedule
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="past">
          <div className="flex justify-between items-center mb-4">
            <div className="text-xl font-medium">Past Appointments</div>
            
            <div className="flex space-x-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by doctor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Doctors</SelectItem>
                  <SelectItem value="dr_johnson">Dr. Johnson</SelectItem>
                  <SelectItem value="dr_chen">Dr. Chen</SelectItem>
                  <SelectItem value="dr_patel">Dr. Patel</SelectItem>
                </SelectContent>
              </Select>
              
              <Select defaultValue="3_months">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Time period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1_month">Last Month</SelectItem>
                  <SelectItem value="3_months">Last 3 Months</SelectItem>
                  <SelectItem value="6_months">Last 6 Months</SelectItem>
                  <SelectItem value="12_months">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Date & Time</th>
                      <th className="text-left p-4">Doctor</th>
                      <th className="text-left p-4">Type</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-left p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="font-medium">Apr 10, 2025</div>
                        <div className="text-sm text-muted-foreground">10:00 AM</div>
                      </td>
                      <td className="p-4">Dr. Sarah Johnson</td>
                      <td className="p-4">Regular Check-up</td>
                      <td className="p-4">
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Completed</Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">View Details</Button>
                          <Button variant="ghost" size="sm">Book Follow-up</Button>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="font-medium">Mar 15, 2025</div>
                        <div className="text-sm text-muted-foreground">2:30 PM</div>
                      </td>
                      <td className="p-4">Dr. Michael Chen</td>
                      <td className="p-4">Dermatology Consultation</td>
                      <td className="p-4">
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Completed</Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">View Details</Button>
                          <Button variant="ghost" size="sm">Book Follow-up</Button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="cancelled">
          <div className="flex justify-between items-center mb-4">
            <div className="text-xl font-medium">Cancelled Appointments</div>
          </div>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex flex-col items-center justify-center py-4">
                <div className="mb-4 rounded-full bg-muted p-3">
                  <Calendar className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">No Cancelled Appointments</h3>
                <p className="text-muted-foreground mt-2">You don't have any cancelled appointments in your history.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}