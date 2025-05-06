import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Calendar, Clock, Filter, Download, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AppointmentsPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">
            Manage and monitor all appointments
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Appointment
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-medium">Today's Appointments</CardTitle>
            <CardDescription>Scheduled for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">18</div>
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-muted-foreground">Across all doctors</div>
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-medium">Confirmed</CardTitle>
            <CardDescription>Ready to proceed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">15</div>
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-muted-foreground">83% of all appointments</div>
              <Badge className="bg-green-100 text-green-800">+2 from yesterday</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-medium">Pending</CardTitle>
            <CardDescription>Awaiting confirmation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">3</div>
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-muted-foreground">17% of all appointments</div>
              <Badge variant="outline">-1 from yesterday</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-medium">Available Slots</CardTitle>
            <CardDescription>Open for scheduling</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-muted-foreground">Across 8 doctors</div>
              <Button variant="outline" size="sm">View Calendar</Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0 mb-4">
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 w-full max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search appointments..."
              className="pl-8"
            />
          </div>
          
          <Select defaultValue="today">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="tomorrow">Tomorrow</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by doctor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Doctors</SelectItem>
              <SelectItem value="dr_johnson">Dr. Johnson</SelectItem>
              <SelectItem value="dr_chen">Dr. Chen</SelectItem>
              <SelectItem value="dr_patel">Dr. Patel</SelectItem>
              <SelectItem value="dr_williams">Dr. Williams</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex space-x-2 items-center">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium">{formattedDate}</div>
          <Button variant="outline" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Appointments</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Time</th>
                      <th className="text-left p-4">Patient</th>
                      <th className="text-left p-4">Doctor</th>
                      <th className="text-left p-4">Purpose</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-left p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>09:00 AM</span>
                        </div>
                      </td>
                      <td className="p-4 font-medium">John Smith</td>
                      <td className="p-4">Dr. Sarah Johnson</td>
                      <td className="p-4">Regular Checkup</td>
                      <td className="p-4">
                        <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="ghost" size="sm">Cancel</Button>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>09:30 AM</span>
                        </div>
                      </td>
                      <td className="p-4 font-medium">Maria Garcia</td>
                      <td className="p-4">Dr. David Williams</td>
                      <td className="p-4">Diabetes Follow-up</td>
                      <td className="p-4">
                        <Badge className="bg-amber-100 text-amber-800">Pending</Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">Confirm</Button>
                          <Button variant="ghost" size="sm">Cancel</Button>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>10:00 AM</span>
                        </div>
                      </td>
                      <td className="p-4 font-medium">Robert Chen</td>
                      <td className="p-4">Dr. Michael Chen</td>
                      <td className="p-4">Cardiology Consultation</td>
                      <td className="p-4">
                        <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="ghost" size="sm">Cancel</Button>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>10:30 AM</span>
                        </div>
                      </td>
                      <td className="p-4 font-medium">Emily Wilson</td>
                      <td className="p-4">Dr. Sarah Johnson</td>
                      <td className="p-4">Annual Physical</td>
                      <td className="p-4">
                        <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="ghost" size="sm">Cancel</Button>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>11:00 AM</span>
                        </div>
                      </td>
                      <td className="p-4 font-medium">James Wilson</td>
                      <td className="p-4">Dr. Priya Patel</td>
                      <td className="p-4">Vaccination</td>
                      <td className="p-4">
                        <Badge className="bg-amber-100 text-amber-800">Pending</Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">Confirm</Button>
                          <Button variant="ghost" size="sm">Cancel</Button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="confirmed">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Time</th>
                      <th className="text-left p-4">Patient</th>
                      <th className="text-left p-4">Doctor</th>
                      <th className="text-left p-4">Purpose</th>
                      <th className="text-left p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>09:00 AM</span>
                        </div>
                      </td>
                      <td className="p-4 font-medium">John Smith</td>
                      <td className="p-4">Dr. Sarah Johnson</td>
                      <td className="p-4">Regular Checkup</td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="ghost" size="sm">Cancel</Button>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>10:00 AM</span>
                        </div>
                      </td>
                      <td className="p-4 font-medium">Robert Chen</td>
                      <td className="p-4">Dr. Michael Chen</td>
                      <td className="p-4">Cardiology Consultation</td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="ghost" size="sm">Cancel</Button>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>10:30 AM</span>
                        </div>
                      </td>
                      <td className="p-4 font-medium">Emily Wilson</td>
                      <td className="p-4">Dr. Sarah Johnson</td>
                      <td className="p-4">Annual Physical</td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="ghost" size="sm">Cancel</Button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pending">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Time</th>
                      <th className="text-left p-4">Patient</th>
                      <th className="text-left p-4">Doctor</th>
                      <th className="text-left p-4">Purpose</th>
                      <th className="text-left p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>09:30 AM</span>
                        </div>
                      </td>
                      <td className="p-4 font-medium">Maria Garcia</td>
                      <td className="p-4">Dr. David Williams</td>
                      <td className="p-4">Diabetes Follow-up</td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">Confirm</Button>
                          <Button variant="ghost" size="sm">Cancel</Button>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>11:00 AM</span>
                        </div>
                      </td>
                      <td className="p-4 font-medium">James Wilson</td>
                      <td className="p-4">Dr. Priya Patel</td>
                      <td className="p-4">Vaccination</td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">Confirm</Button>
                          <Button variant="ghost" size="sm">Cancel</Button>
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
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex flex-col items-center justify-center py-4">
                <div className="mb-4 rounded-full bg-muted p-3">
                  <Calendar className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">No Cancelled Appointments</h3>
                <p className="text-muted-foreground mt-2">There are no cancelled appointments for today.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}