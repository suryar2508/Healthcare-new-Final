import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pill, Search, Calendar, Clock, AlertCircle, ArrowUpDown, Upload, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MedicationsPage() {
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Medications</h1>
          <p className="text-muted-foreground">
            Track and manage your prescriptions
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Upload Prescription
          </Button>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search medications..."
              className="pl-8"
            />
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="current">
        <TabsList className="mb-4">
          <TabsTrigger value="current">Current Medications</TabsTrigger>
          <TabsTrigger value="history">Medication History</TabsTrigger>
          <TabsTrigger value="schedule">Daily Schedule</TabsTrigger>
        </TabsList>
        
        <TabsContent value="current">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Amlodipine 5mg</CardTitle>
                    <CardDescription>Blood pressure medication</CardDescription>
                  </div>
                  <Pill className="h-8 w-8 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Dosage:</span>
                    <span className="font-medium">1 tablet once daily</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Prescribed by:</span>
                    <span className="font-medium">Dr. Sarah Johnson</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Start Date:</span>
                    <span className="font-medium">Mar 15, 2025</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">End Date:</span>
                    <span className="font-medium">Sep 15, 2025</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Refills Remaining:</span>
                    <span className="font-medium">3</span>
                  </div>
                  <div className="pt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Supply Remaining:</span>
                      <span className="font-medium">23 days</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div className="pt-2">
                    <Button variant="outline" size="sm" className="w-full">
                      Request Refill
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Metformin 500mg</CardTitle>
                    <CardDescription>Diabetes medication</CardDescription>
                  </div>
                  <Pill className="h-8 w-8 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Dosage:</span>
                    <span className="font-medium">1 tablet twice daily</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Prescribed by:</span>
                    <span className="font-medium">Dr. David Williams</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Start Date:</span>
                    <span className="font-medium">Apr 10, 2025</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">End Date:</span>
                    <span className="font-medium">Jul 10, 2025</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Refills Remaining:</span>
                    <span className="font-medium">2</span>
                  </div>
                  <div className="pt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Supply Remaining:</span>
                      <span className="font-medium">15 days</span>
                    </div>
                    <Progress value={48} className="h-2" />
                  </div>
                  <div className="pt-2">
                    <Button variant="outline" size="sm" className="w-full">
                      Request Refill
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Atorvastatin 20mg</CardTitle>
                    <CardDescription>Cholesterol medication</CardDescription>
                  </div>
                  <Pill className="h-8 w-8 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Dosage:</span>
                    <span className="font-medium">1 tablet daily at bedtime</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Prescribed by:</span>
                    <span className="font-medium">Dr. Sarah Johnson</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Start Date:</span>
                    <span className="font-medium">Mar 15, 2025</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">End Date:</span>
                    <span className="font-medium">Sep 15, 2025</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Refills Remaining:</span>
                    <span className="font-medium">3</span>
                  </div>
                  <div className="pt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Supply Remaining:</span>
                      <span className="font-medium">25 days</span>
                    </div>
                    <Progress value={82} className="h-2" />
                  </div>
                  <div className="pt-2">
                    <Button variant="outline" size="sm" className="w-full">
                      Request Refill
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="mr-2 h-5 w-5 text-amber-500" />
                <span>Important Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                <div className="font-medium">Medication Interactions</div>
                <div className="text-sm text-muted-foreground mt-1">
                  No potential interactions detected between your current medications.
                </div>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="font-medium">Medication Adherence</div>
                <div className="text-sm text-muted-foreground mt-1">
                  You've taken 95% of your scheduled medications in the past 30 days. Great job!
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Medication History</CardTitle>
              <CardDescription>View your past prescriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">
                        <div className="flex items-center">
                          Medication
                          <ArrowUpDown className="ml-1 h-3 w-3" />
                        </div>
                      </th>
                      <th className="text-left p-4">
                        <div className="flex items-center">
                          Dosage
                        </div>
                      </th>
                      <th className="text-left p-4">
                        <div className="flex items-center">
                          Date Range
                          <ArrowUpDown className="ml-1 h-3 w-3" />
                        </div>
                      </th>
                      <th className="text-left p-4">
                        <div className="flex items-center">
                          Doctor
                        </div>
                      </th>
                      <th className="text-left p-4">
                        <div className="flex items-center">
                          Status
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-4 font-medium">Amoxicillin 500mg</td>
                      <td className="p-4">1 tablet three times daily</td>
                      <td className="p-4">Feb 1 - Feb 10, 2025</td>
                      <td className="p-4">Dr. Robert Wilson</td>
                      <td className="p-4">
                        <Badge variant="outline">Completed</Badge>
                      </td>
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-4 font-medium">Prednisone 10mg</td>
                      <td className="p-4">Tapering dose</td>
                      <td className="p-4">Jan 15 - Jan 25, 2025</td>
                      <td className="p-4">Dr. Michael Chen</td>
                      <td className="p-4">
                        <Badge variant="outline">Completed</Badge>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="schedule">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Today's Medication Schedule</CardTitle>
              <CardDescription>May 6, 2025</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 rounded-full p-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium">Amlodipine 5mg</div>
                      <div className="text-sm text-muted-foreground">1 tablet with breakfast</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex space-x-2 items-center">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">8:00 AM</span>
                    </div>
                    <Badge className="ml-4 bg-green-100 text-green-800">Taken</Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                  <div className="flex items-center space-x-3">
                    <div className="bg-amber-100 rounded-full p-2">
                      <Clock className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <div className="font-medium">Metformin 500mg</div>
                      <div className="text-sm text-muted-foreground">1 tablet with lunch</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex space-x-2 items-center">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">12:00 PM</span>
                    </div>
                    <Badge className="ml-4 bg-amber-100 text-amber-800">Due soon</Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                  <div className="flex items-center space-x-3">
                    <div className="bg-muted rounded-full p-2">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-medium">Metformin 500mg</div>
                      <div className="text-sm text-muted-foreground">1 tablet with dinner</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex space-x-2 items-center">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">6:00 PM</span>
                    </div>
                    <Badge className="ml-4 variant-outline">Upcoming</Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                  <div className="flex items-center space-x-3">
                    <div className="bg-muted rounded-full p-2">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-medium">Atorvastatin 20mg</div>
                      <div className="text-sm text-muted-foreground">1 tablet at bedtime</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex space-x-2 items-center">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">9:00 PM</span>
                    </div>
                    <Badge className="ml-4 variant-outline">Upcoming</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end mb-4">
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              View Full Calendar
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Medication Adherence</CardTitle>
              <CardDescription>Your medication adherence over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] flex items-center justify-center bg-muted/30 rounded-md">
                <span className="text-muted-foreground">Adherence Chart Visualization</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}