import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Clock, CheckCircle2, XCircle, AlertTriangle, Pill, FileText, ArrowDown, Calendar, Printer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function OrdersPage() {
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prescription Orders</h1>
          <p className="text-muted-foreground">
            Process and manage patient prescriptions
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            View Calendar
          </Button>
          <Button>
            <Pill className="mr-2 h-4 w-4" />
            New Order
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-medium">New Orders</CardTitle>
            <CardDescription>Received today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">15</div>
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-muted-foreground">Awaiting processing</div>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-medium">Processing</CardTitle>
            <CardDescription>In preparation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">8</div>
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-muted-foreground">In progress</div>
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-medium">Ready for Pickup</CardTitle>
            <CardDescription>Completed orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">7</div>
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-muted-foreground">Awaiting collection</div>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-medium">Attention Required</CardTitle>
            <CardDescription>Problem orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">3</div>
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-muted-foreground">Issues to resolve</div>
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0 mb-4">
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 w-full max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by patient name, prescription ID..."
              className="pl-8"
            />
          </div>
          
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="ready">Ready for Pickup</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <ArrowDown className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="new">New</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="ready">Ready for Pickup</TabsTrigger>
          <TabsTrigger value="attention">Needs Attention</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Order ID</th>
                      <th className="text-left p-4">Patient</th>
                      <th className="text-left p-4">Doctor</th>
                      <th className="text-left p-4">Medications</th>
                      <th className="text-left p-4">Date</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-left p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-4">#1042</td>
                      <td className="p-4 font-medium">John Smith</td>
                      <td className="p-4">Dr. Johnson</td>
                      <td className="p-4">Amlodipine 5mg, Lisinopril 10mg</td>
                      <td className="p-4">May 6, 2025</td>
                      <td className="p-4">
                        <Badge className="bg-amber-100 text-amber-800">
                          <Clock className="mr-1 h-3 w-3" />
                          Processing
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">Process</Button>
                          <Button variant="ghost" size="sm">View</Button>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-4">#1041</td>
                      <td className="p-4 font-medium">Maria Garcia</td>
                      <td className="p-4">Dr. Chen</td>
                      <td className="p-4">Metformin 500mg</td>
                      <td className="p-4">May 6, 2025</td>
                      <td className="p-4">
                        <Badge className="bg-blue-100 text-blue-800">
                          <Search className="mr-1 h-3 w-3" />
                          Verifying
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">Verify</Button>
                          <Button variant="ghost" size="sm">View</Button>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-4">#1040</td>
                      <td className="p-4 font-medium">James Wilson</td>
                      <td className="p-4">Dr. Patel</td>
                      <td className="p-4">Atorvastatin 20mg</td>
                      <td className="p-4">May 6, 2025</td>
                      <td className="p-4">
                        <Badge className="bg-red-100 text-red-800">
                          <AlertTriangle className="mr-1 h-3 w-3" />
                          Out of Stock
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">Resolve</Button>
                          <Button variant="ghost" size="sm">View</Button>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-4">#1039</td>
                      <td className="p-4 font-medium">Robert Clark</td>
                      <td className="p-4">Dr. Williams</td>
                      <td className="p-4">Lisinopril 20mg, Hydrochlorothiazide 25mg</td>
                      <td className="p-4">May 5, 2025</td>
                      <td className="p-4">
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Ready
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">Mark Delivered</Button>
                          <Button variant="ghost" size="sm">View</Button>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-4">#1038</td>
                      <td className="p-4 font-medium">Emily Taylor</td>
                      <td className="p-4">Dr. Johnson</td>
                      <td className="p-4">Sertraline 50mg</td>
                      <td className="p-4">May 5, 2025</td>
                      <td className="p-4">
                        <Badge variant="outline">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Completed
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Button variant="ghost" size="sm">View</Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="new">
          <Card>
            <CardHeader>
              <CardTitle>New Prescriptions</CardTitle>
              <CardDescription>Awaiting verification and processing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-md hover:bg-muted/30">
                  <div className="flex justify-between">
                    <div>
                      <div className="flex items-center">
                        <div className="font-medium">#1041</div>
                        <Badge className="ml-2 bg-blue-100 text-blue-800">New</Badge>
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">Maria Garcia | Dr. Chen | May 6, 2025</div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">Process</Button>
                      <Button variant="ghost" size="sm">View</Button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="text-sm"><span className="font-medium">Medications:</span> Metformin 500mg</div>
                    <div className="text-sm"><span className="font-medium">Instructions:</span> Take 1 tablet twice daily with meals</div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-md hover:bg-muted/30">
                  <div className="flex justify-between">
                    <div>
                      <div className="flex items-center">
                        <div className="font-medium">#1042</div>
                        <Badge className="ml-2 bg-blue-100 text-blue-800">New</Badge>
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">John Smith | Dr. Johnson | May 6, 2025</div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">Process</Button>
                      <Button variant="ghost" size="sm">View</Button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="text-sm"><span className="font-medium">Medications:</span> Amlodipine 5mg, Lisinopril 10mg</div>
                    <div className="text-sm"><span className="font-medium">Instructions:</span> Take Amlodipine 1 tablet daily in the morning, Take Lisinopril 1 tablet daily</div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-md hover:bg-muted/30">
                  <div className="flex justify-between">
                    <div>
                      <div className="flex items-center">
                        <div className="font-medium">#1043</div>
                        <Badge className="ml-2 bg-blue-100 text-blue-800">New</Badge>
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">Sarah Thompson | Dr. Williams | May 6, 2025</div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">Process</Button>
                      <Button variant="ghost" size="sm">View</Button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="text-sm"><span className="font-medium">Medications:</span> Sertraline 100mg</div>
                    <div className="text-sm"><span className="font-medium">Instructions:</span> Take 1 tablet daily in the morning</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="attention">
          <Card>
            <CardHeader>
              <CardTitle>Prescriptions Needing Attention</CardTitle>
              <CardDescription>Orders with issues that need to be resolved</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border border-red-200 bg-red-50 rounded-md">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-1 mr-3 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <div className="flex items-center">
                            <div className="font-medium">#1040</div>
                            <Badge className="ml-2 bg-red-100 text-red-800">Out of Stock</Badge>
                          </div>
                          <div className="mt-1 text-sm text-muted-foreground">James Wilson | Dr. Patel | May 6, 2025</div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">Resolve</Button>
                          <Button variant="ghost" size="sm">View</Button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="text-sm"><span className="font-medium">Medications:</span> Atorvastatin 20mg</div>
                        <div className="text-sm"><span className="font-medium">Issue:</span> Medication out of stock. Expected restock date: May 10, 2025.</div>
                        <div className="text-sm"><span className="font-medium">Suggested Action:</span> Contact prescriber for alternative or patient for delay</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border border-amber-200 bg-amber-50 rounded-md">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-1 mr-3 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <div className="flex items-center">
                            <div className="font-medium">#1037</div>
                            <Badge className="ml-2 bg-amber-100 text-amber-800">Drug Interaction</Badge>
                          </div>
                          <div className="mt-1 text-sm text-muted-foreground">Robert Chen | Dr. Williams | May 5, 2025</div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">Review</Button>
                          <Button variant="ghost" size="sm">View</Button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="text-sm"><span className="font-medium">Medications:</span> Warfarin 2mg, Aspirin 81mg</div>
                        <div className="text-sm"><span className="font-medium">Issue:</span> Potential interaction between Warfarin and Aspirin (increased bleeding risk)</div>
                        <div className="text-sm"><span className="font-medium">Suggested Action:</span> Contact prescriber for verification</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border border-blue-200 bg-blue-50 rounded-md">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-blue-500 mt-1 mr-3 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <div className="flex items-center">
                            <div className="font-medium">#1035</div>
                            <Badge className="ml-2 bg-blue-100 text-blue-800">Insurance Issue</Badge>
                          </div>
                          <div className="mt-1 text-sm text-muted-foreground">Emily Davis | Dr. Johnson | May 4, 2025</div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">Resolve</Button>
                          <Button variant="ghost" size="sm">View</Button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="text-sm"><span className="font-medium">Medications:</span> Adalimumab 40mg injection</div>
                        <div className="text-sm"><span className="font-medium">Issue:</span> Prior authorization required by insurance</div>
                        <div className="text-sm"><span className="font-medium">Suggested Action:</span> Contact prescriber for prior authorization form</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="processing">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Order ID</th>
                      <th className="text-left p-4">Patient</th>
                      <th className="text-left p-4">Medications</th>
                      <th className="text-left p-4">Processing Stage</th>
                      <th className="text-left p-4">Assigned To</th>
                      <th className="text-left p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-4">#1042</td>
                      <td className="p-4 font-medium">John Smith</td>
                      <td className="p-4">Amlodipine 5mg, Lisinopril 10mg</td>
                      <td className="p-4">
                        <Badge className="bg-amber-100 text-amber-800">
                          <Clock className="mr-1 h-3 w-3" />
                          Filling
                        </Badge>
                      </td>
                      <td className="p-4">Lisa Chen</td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">Complete</Button>
                          <Button variant="ghost" size="sm">View</Button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="ready">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Order ID</th>
                      <th className="text-left p-4">Patient</th>
                      <th className="text-left p-4">Medications</th>
                      <th className="text-left p-4">Ready Since</th>
                      <th className="text-left p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-4">#1039</td>
                      <td className="p-4 font-medium">Robert Clark</td>
                      <td className="p-4">Lisinopril 20mg, Hydrochlorothiazide 25mg</td>
                      <td className="p-4">May 5, 2025 - 3:45 PM</td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">Mark Delivered</Button>
                          <Button variant="ghost" size="sm">Print Label</Button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}