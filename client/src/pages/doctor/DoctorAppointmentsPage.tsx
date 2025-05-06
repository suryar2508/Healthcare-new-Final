import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function DoctorAppointmentsPage() {
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
          <p className="text-muted-foreground">Manage your schedule and patient visits</p>
        </div>
        <Button>
          <Calendar className="mr-2 h-4 w-4" />
          New Appointment
        </Button>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2 items-center">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-xl font-medium">{formattedDate}</div>
          <Button variant="outline" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex space-x-4">
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Status</SelectLabel>
                <SelectItem value="all">All Appointments</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          
          <Select defaultValue="today">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Date Range</SelectLabel>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="this_week">This Week</SelectItem>
                <SelectItem value="next_week">Next Week</SelectItem>
                <SelectItem value="this_month">This Month</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Time</th>
                  <th className="text-left p-4">Patient</th>
                  <th className="text-left p-4">Type</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Duration</th>
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
                  <td className="p-4">Regular Checkup</td>
                  <td className="p-4">
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Confirmed</Badge>
                  </td>
                  <td className="p-4">30 mins</td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">Start</Button>
                      <Button variant="ghost" size="sm">Reschedule</Button>
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
                  <td className="p-4">Follow-up</td>
                  <td className="p-4">
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Confirmed</Badge>
                  </td>
                  <td className="p-4">45 mins</td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">Start</Button>
                      <Button variant="ghost" size="sm">Reschedule</Button>
                    </div>
                  </td>
                </tr>
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-4">
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>01:15 PM</span>
                    </div>
                  </td>
                  <td className="p-4 font-medium">Michael Johnson</td>
                  <td className="p-4">Test Results Discussion</td>
                  <td className="p-4">
                    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Waiting</Badge>
                  </td>
                  <td className="p-4">30 mins</td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">Start</Button>
                      <Button variant="ghost" size="sm">Reschedule</Button>
                    </div>
                  </td>
                </tr>
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-4">
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>03:00 PM</span>
                    </div>
                  </td>
                  <td className="p-4 font-medium">Sarah Thompson</td>
                  <td className="p-4">New Patient Consultation</td>
                  <td className="p-4">
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Confirmed</Badge>
                  </td>
                  <td className="p-4">60 mins</td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">Start</Button>
                      <Button variant="ghost" size="sm">Reschedule</Button>
                    </div>
                  </td>
                </tr>
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-4">
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>04:30 PM</span>
                    </div>
                  </td>
                  <td className="p-4 font-medium">Robert Chen</td>
                  <td className="p-4">Medication Review</td>
                  <td className="p-4">
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Confirmed</Badge>
                  </td>
                  <td className="p-4">30 mins</td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">Start</Button>
                      <Button variant="ghost" size="sm">Reschedule</Button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <span className="text-muted-foreground">5 appointments today</span>
        </div>
        <Button variant="outline">
          View Calendar
        </Button>
      </div>
    </div>
  );
}