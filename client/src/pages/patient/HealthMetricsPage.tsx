import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Activity, LineChart, Plus, CalendarDays, ArrowDown, ArrowUp, CircleEqual, Scale, Droplet, Salad } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function HealthMetricsPage() {
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Health Metrics</h1>
          <p className="text-muted-foreground">
            Track and monitor your vital signs
          </p>
        </div>
        <div className="flex space-x-2">
          <Select defaultValue="30">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Time Period</SelectLabel>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 3 months</SelectItem>
                <SelectItem value="180">Last 6 months</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New Reading
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-medium flex items-center">
              <Heart className="mr-2 h-4 w-4 text-red-500" />
              Blood Pressure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">120/80 <span className="text-sm font-normal text-muted-foreground">mmHg</span></div>
            <div className="flex items-center mt-1 text-sm text-muted-foreground">
              <div className="flex items-center text-green-600">
                <ArrowDown className="h-3 w-3 mr-1" />
                <span>4%</span>
              </div>
              <span className="mx-1">from</span>
              <span>125/82</span>
            </div>
            <div className="mt-3 flex justify-between text-xs">
              <span>Last reading: Today, 8:30 AM</span>
              <Badge className="text-xs bg-green-100 text-green-800">Normal</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-medium flex items-center">
              <Activity className="mr-2 h-4 w-4 text-amber-500" />
              Blood Glucose
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">110 <span className="text-sm font-normal text-muted-foreground">mg/dL</span></div>
            <div className="flex items-center mt-1 text-sm text-muted-foreground">
              <div className="flex items-center text-amber-600">
                <ArrowUp className="h-3 w-3 mr-1" />
                <span>8%</span>
              </div>
              <span className="mx-1">from</span>
              <span>102</span>
            </div>
            <div className="mt-3 flex justify-between text-xs">
              <span>Last reading: Yesterday, 9:15 PM</span>
              <Badge className="text-xs bg-amber-100 text-amber-800">Elevated</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-medium flex items-center">
              <Heart className="mr-2 h-4 w-4 text-blue-500" />
              Heart Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">72 <span className="text-sm font-normal text-muted-foreground">BPM</span></div>
            <div className="flex items-center mt-1 text-sm text-muted-foreground">
              <div className="flex items-center text-muted-foreground">
                <CircleEqual className="h-3 w-3 mr-1" />
                <span>~</span>
              </div>
              <span className="mx-1">from</span>
              <span>74</span>
            </div>
            <div className="mt-3 flex justify-between text-xs">
              <span>Last reading: Today, 8:30 AM</span>
              <Badge className="text-xs bg-green-100 text-green-800">Normal</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-medium flex items-center">
              <Scale className="mr-2 h-4 w-4 text-indigo-500" />
              Weight
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">168 <span className="text-sm font-normal text-muted-foreground">lbs</span></div>
            <div className="flex items-center mt-1 text-sm text-muted-foreground">
              <div className="flex items-center text-green-600">
                <ArrowDown className="h-3 w-3 mr-1" />
                <span>2%</span>
              </div>
              <span className="mx-1">from</span>
              <span>172</span>
            </div>
            <div className="mt-3 flex justify-between text-xs">
              <span>Last reading: 3 days ago</span>
              <Badge className="text-xs">Trending Down</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="trends">
        <TabsList className="mb-4">
          <TabsTrigger value="trends">Trends & Insights</TabsTrigger>
          <TabsTrigger value="history">Reading History</TabsTrigger>
          <TabsTrigger value="goals">Health Goals</TabsTrigger>
        </TabsList>
        
        <TabsContent value="trends">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Blood Pressure Trend</CardTitle>
                <CardDescription>30-day monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-muted/30 rounded-md">
                  <LineChart className="h-8 w-8 text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Blood Pressure Chart Visualization</span>
                </div>
                <div className="mt-4 space-y-4">
                  <div className="bg-muted/30 p-3 rounded-md">
                    <div className="font-medium">Blood Pressure Insights</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Your blood pressure has been stable over the past 30 days, with a slight downward trend in the systolic reading. Continue your current medication regimen and lifestyle habits.
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-green-50">
                      <ArrowDown className="mr-1 h-3 w-3 text-green-500" />
                      Improved Systolic
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50">
                      <CircleEqual className="mr-1 h-3 w-3 text-blue-500" />
                      Stable Diastolic
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Blood Glucose Trend</CardTitle>
                <CardDescription>30-day monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-muted/30 rounded-md">
                  <LineChart className="h-8 w-8 text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Blood Glucose Chart Visualization</span>
                </div>
                <div className="mt-4 space-y-4">
                  <div className="bg-muted/30 p-3 rounded-md">
                    <div className="font-medium">Blood Glucose Insights</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Your blood glucose readings show a slight upward trend in the past week. Consider reviewing your carbohydrate intake and physical activity levels. Your next appointment with Dr. Williams is in 2 weeks.
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-amber-50">
                      <ArrowUp className="mr-1 h-3 w-3 text-amber-500" />
                      Slight Increase
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50">
                      <Salad className="mr-1 h-3 w-3 text-green-500" />
                      Diet Impact
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Reading History</CardTitle>
              <CardDescription>Recent health measurements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Date & Time</th>
                      <th className="text-left p-4">Metric</th>
                      <th className="text-left p-4">Reading</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-left p-4">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="font-medium">May 6, 2025</div>
                        <div className="text-sm text-muted-foreground">8:30 AM</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <Heart className="mr-2 h-4 w-4 text-red-500" />
                          Blood Pressure
                        </div>
                      </td>
                      <td className="p-4">120/80 mmHg</td>
                      <td className="p-4">
                        <Badge className="bg-green-100 text-green-800">Normal</Badge>
                      </td>
                      <td className="p-4">Morning reading, after medication</td>
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="font-medium">May 6, 2025</div>
                        <div className="text-sm text-muted-foreground">8:30 AM</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <Heart className="mr-2 h-4 w-4 text-blue-500" />
                          Heart Rate
                        </div>
                      </td>
                      <td className="p-4">72 BPM</td>
                      <td className="p-4">
                        <Badge className="bg-green-100 text-green-800">Normal</Badge>
                      </td>
                      <td className="p-4">Resting heart rate</td>
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="font-medium">May 5, 2025</div>
                        <div className="text-sm text-muted-foreground">9:15 PM</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <Activity className="mr-2 h-4 w-4 text-amber-500" />
                          Blood Glucose
                        </div>
                      </td>
                      <td className="p-4">110 mg/dL</td>
                      <td className="p-4">
                        <Badge className="bg-amber-100 text-amber-800">Elevated</Badge>
                      </td>
                      <td className="p-4">2 hours after dinner</td>
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="font-medium">May 3, 2025</div>
                        <div className="text-sm text-muted-foreground">7:00 AM</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <Scale className="mr-2 h-4 w-4 text-indigo-500" />
                          Weight
                        </div>
                      </td>
                      <td className="p-4">168 lbs</td>
                      <td className="p-4">
                        <Badge>Normal</Badge>
                      </td>
                      <td className="p-4">Morning weight</td>
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="font-medium">May 3, 2025</div>
                        <div className="text-sm text-muted-foreground">7:05 AM</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <Droplet className="mr-2 h-4 w-4 text-blue-500" />
                          Oxygen Saturation
                        </div>
                      </td>
                      <td className="p-4">98%</td>
                      <td className="p-4">
                        <Badge className="bg-green-100 text-green-800">Normal</Badge>
                      </td>
                      <td className="p-4">Resting</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="goals">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Health Goals</CardTitle>
                <CardDescription>Your personalized targets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Heart className="h-4 w-4 text-red-500 mr-2" />
                        <span className="font-medium">Blood Pressure Target</span>
                      </div>
                      <span>Below 130/80 mmHg</span>
                    </div>
                    <Progress value={85} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Current: 120/80 mmHg</span>
                      <span className="text-green-600">On Track</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Activity className="h-4 w-4 text-amber-500 mr-2" />
                        <span className="font-medium">Blood Glucose Target</span>
                      </div>
                      <span>80-120 mg/dL</span>
                    </div>
                    <Progress value={70} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Current: 110 mg/dL</span>
                      <span className="text-amber-600">Monitoring</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Scale className="h-4 w-4 text-indigo-500 mr-2" />
                        <span className="font-medium">Weight Target</span>
                      </div>
                      <span>160 lbs</span>
                    </div>
                    <Progress value={75} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Current: 168 lbs</span>
                      <span className="text-green-600">Trending Down</span>
                    </div>
                  </div>
                </div>
                
                <Button className="w-full mt-6">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Goal
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
                <CardDescription>Recommended actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <CalendarDays className="h-4 w-4 text-green-700" />
                      </div>
                      <div className="ml-3">
                        <div className="font-medium">Schedule Follow-up with Dr. Williams</div>
                        <div className="text-sm text-muted-foreground mt-1">To discuss your recent blood glucose readings</div>
                        <Button variant="outline" size="sm" className="mt-2">Schedule Now</Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Salad className="h-4 w-4 text-blue-700" />
                      </div>
                      <div className="ml-3">
                        <div className="font-medium">Dietary Recommendations</div>
                        <div className="text-sm text-muted-foreground mt-1">Consider reducing carbohydrate intake to help manage blood glucose</div>
                        <Button variant="outline" size="sm" className="mt-2">View Plan</Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-muted/30 border border-muted rounded-md">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="ml-3">
                        <div className="font-medium">Increase Physical Activity</div>
                        <div className="text-sm text-muted-foreground mt-1">Aim for 30 minutes of moderate exercise 5 times per week</div>
                        <Button variant="outline" size="sm" className="mt-2">Exercise Suggestions</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}