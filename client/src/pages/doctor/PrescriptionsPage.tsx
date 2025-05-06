import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, FileText, Download, Plus, AlertTriangle, Pill } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PrescriptionsPage() {
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prescriptions</h1>
          <p className="text-muted-foreground">
            Manage your patient prescriptions
          </p>
        </div>
        <div className="flex space-x-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Prescription
          </Button>
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2 w-96">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search prescriptions..."
              className="pl-8"
            />
          </div>
          
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Status</SelectLabel>
                <SelectItem value="all">All Prescriptions</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>
      
      <Tabs defaultValue="active">
        <TabsList className="mb-4">
          <TabsTrigger value="active">Active Prescriptions</TabsTrigger>
          <TabsTrigger value="past">Past Prescriptions</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Prescriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">ID</th>
                      <th className="text-left p-4">Patient</th>
                      <th className="text-left p-4">Medications</th>
                      <th className="text-left p-4">Date Issued</th>
                      <th className="text-left p-4">Duration</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-left p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-4">RX-1042</td>
                      <td className="p-4 font-medium">John Smith</td>
                      <td className="p-4">Amlodipine 5mg, Lisinopril 10mg</td>
                      <td className="p-4">May 1, 2025</td>
                      <td className="p-4">30 days</td>
                      <td className="p-4">
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">View</Button>
                          <Button variant="ghost" size="sm">Renew</Button>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-4">RX-1039</td>
                      <td className="p-4 font-medium">Emily Wilson</td>
                      <td className="p-4">Metformin 500mg, Januvia 100mg</td>
                      <td className="p-4">Apr 25, 2025</td>
                      <td className="p-4">90 days</td>
                      <td className="p-4">
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">View</Button>
                          <Button variant="ghost" size="sm">Renew</Button>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-4">RX-1035</td>
                      <td className="p-4 font-medium">Michael Johnson</td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <span>Warfarin 2mg</span>
                          <span className="relative group">
                            <AlertTriangle className="ml-2 h-4 w-4 text-amber-500" />
                            <span className="absolute z-10 px-2 py-1 text-xs bg-black text-white rounded opacity-0 group-hover:opacity-100 bottom-full mb-2 w-48 left-1/2 transform -translate-x-1/2">
                              Potential interaction with aspirin
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="p-4">Apr 20, 2025</td>
                      <td className="p-4">60 days</td>
                      <td className="p-4">
                        <Badge className="bg-amber-100 text-amber-800">Requires Review</Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">View</Button>
                          <Button variant="ghost" size="sm">Modify</Button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
                <span>Potential Interactions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <div className="flex items-center">
                    <Pill className="h-5 w-5 text-amber-500 mr-2" />
                    <div>
                      <div className="font-medium">Warfarin + Aspirin (Michael Johnson)</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Potential increased risk of bleeding when these medications are used together.
                      </div>
                      <Button variant="outline" size="sm" className="mt-2">Review Prescription</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="past">
          <Card>
            <CardHeader>
              <CardTitle>Past Prescriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">ID</th>
                      <th className="text-left p-4">Patient</th>
                      <th className="text-left p-4">Medications</th>
                      <th className="text-left p-4">Date Issued</th>
                      <th className="text-left p-4">End Date</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-left p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-4">RX-985</td>
                      <td className="p-4 font-medium">John Smith</td>
                      <td className="p-4">Amoxicillin 500mg</td>
                      <td className="p-4">Mar 15, 2025</td>
                      <td className="p-4">Mar 25, 2025</td>
                      <td className="p-4">
                        <Badge variant="outline">Completed</Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">View</Button>
                          <Button variant="ghost" size="sm">Renew</Button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Prescription Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Template Name</th>
                      <th className="text-left p-4">Medications</th>
                      <th className="text-left p-4">Common Use</th>
                      <th className="text-left p-4">Last Used</th>
                      <th className="text-left p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-4 font-medium">Basic Hypertension</td>
                      <td className="p-4">Amlodipine 5mg, Lisinopril 10mg</td>
                      <td className="p-4">High blood pressure</td>
                      <td className="p-4">May 1, 2025</td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">Use</Button>
                          <Button variant="ghost" size="sm">Edit</Button>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-4 font-medium">Type 2 Diabetes</td>
                      <td className="p-4">Metformin 500mg, Januvia 100mg</td>
                      <td className="p-4">Diabetes management</td>
                      <td className="p-4">Apr 25, 2025</td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">Use</Button>
                          <Button variant="ghost" size="sm">Edit</Button>
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