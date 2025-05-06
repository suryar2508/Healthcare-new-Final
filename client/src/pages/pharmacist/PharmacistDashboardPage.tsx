import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Pill,
  Package,
  ClipboardList,
  Bell,
  TruckIcon,
  SearchIcon,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function PharmacistDashboardPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">Pharmacist Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome, {user?.fullName || user?.username} | {formattedDate}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
          <Button size="sm">
            <SearchIcon className="h-4 w-4 mr-2" />
            Search Medicines
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>New Prescriptions</CardTitle>
            <CardDescription>
              Awaiting processing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">15</div>
            <div className="flex justify-between items-center mt-4">
              <Link href="/pharmacist/orders">
                <Button variant="outline" size="sm">View Queue</Button>
              </Link>
              <ClipboardList className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Inventory Items</CardTitle>
            <CardDescription>
              Current medicines in stock
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">248</div>
            <div className="flex justify-between items-center mt-4">
              <Link href="/pharmacist/inventory">
                <Button variant="outline" size="sm">View Inventory</Button>
              </Link>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Ready for Pickup</CardTitle>
            <CardDescription>
              Orders prepared and waiting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">7</div>
            <div className="flex justify-between items-center mt-4">
              <Link href="/pharmacist/orders">
                <Button variant="outline" size="sm">View Orders</Button>
              </Link>
              <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Out of Stock</CardTitle>
            <CardDescription>
              Medicines requiring reorder
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
            <div className="flex justify-between items-center mt-4">
              <Link href="/pharmacist/inventory">
                <Button variant="outline" size="sm">Order Supplies</Button>
              </Link>
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 mt-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Prescription Queue</h2>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">ID</th>
                      <th className="text-left p-4">Patient</th>
                      <th className="text-left p-4">Doctor</th>
                      <th className="text-left p-4">Date</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-left p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-4">#1042</td>
                      <td className="p-4">John Smith</td>
                      <td className="p-4">Dr. Johnson</td>
                      <td className="p-4">May 6, 2025</td>
                      <td className="p-4">
                        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200">
                          <Clock className="h-3 w-3 mr-1" />
                          Processing
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Button variant="outline" size="sm">Process</Button>
                      </td>
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-4">#1041</td>
                      <td className="p-4">Maria Garcia</td>
                      <td className="p-4">Dr. Chen</td>
                      <td className="p-4">May 6, 2025</td>
                      <td className="p-4">
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">
                          <SearchIcon className="h-3 w-3 mr-1" />
                          Verifying
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Button variant="outline" size="sm">Verify</Button>
                      </td>
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-4">#1039</td>
                      <td className="p-4">Robert Clark</td>
                      <td className="p-4">Dr. Williams</td>
                      <td className="p-4">May 5, 2025</td>
                      <td className="p-4">
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Ready
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Button variant="outline" size="sm">Mark Delivered</Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="p-4 text-center">
                <Link href="/pharmacist/orders">
                  <Button variant="link">View All Prescriptions</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">OCR Uploaded Prescriptions</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-3 bg-muted/50 rounded-md">
                  <div className="bg-blue-100 p-2 rounded-full flex-shrink-0 mt-1">
                    <Pill className="h-5 w-5 text-blue-700" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Patient: Emily Wilson</div>
                    <div className="text-muted-foreground text-sm">Uploaded: Today, 9:42 AM</div>
                    <div className="text-muted-foreground text-sm">4 medicines detected</div>
                    <div className="flex space-x-2 mt-2">
                      <Button variant="outline" size="sm">Review OCR Results</Button>
                    </div>
                  </div>
                  <Badge>New</Badge>
                </div>
                
                <div className="flex items-start space-x-4 p-3 bg-muted/50 rounded-md">
                  <div className="bg-blue-100 p-2 rounded-full flex-shrink-0 mt-1">
                    <Pill className="h-5 w-5 text-blue-700" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Patient: Michael Johnson</div>
                    <div className="text-muted-foreground text-sm">Uploaded: Today, 8:15 AM</div>
                    <div className="text-muted-foreground text-sm">2 medicines detected</div>
                    <div className="flex space-x-2 mt-2">
                      <Button variant="outline" size="sm">Review OCR Results</Button>
                    </div>
                  </div>
                  <Badge>New</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold mb-4">Inventory Alerts</h2>
          <Card>
            <CardHeader>
              <CardTitle>Critical Stock Levels</CardTitle>
              <CardDescription>Items requiring immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex justify-between">
                    <div className="font-medium">Atorvastatin 20mg</div>
                    <Badge variant="destructive">Out of Stock</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Last ordered: 15 days ago</div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-sm font-medium text-red-600">3 pending prescriptions</div>
                    <Button size="sm" variant="destructive">Order Now</Button>
                  </div>
                </div>
                
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <div className="flex justify-between">
                    <div className="font-medium">Metformin 500mg</div>
                    <Badge variant="outline" className="text-amber-600 border-amber-600">Low Stock (5)</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Last ordered: 30 days ago</div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-sm font-medium text-amber-600">8 pending prescriptions</div>
                    <Button size="sm" variant="outline">Order Now</Button>
                  </div>
                </div>
                
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <div className="flex justify-between">
                    <div className="font-medium">Lisinopril 10mg</div>
                    <Badge variant="outline" className="text-amber-600 border-amber-600">Low Stock (8)</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Last ordered: 45 days ago</div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-sm font-medium text-amber-600">5 pending prescriptions</div>
                    <Button size="sm" variant="outline">Order Now</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <h2 className="text-2xl font-semibold mt-6 mb-4">Deliveries</h2>
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Deliveries</CardTitle>
              <CardDescription>Expected inventory arrivals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-muted/50 rounded-md">
                  <div className="flex items-start space-x-3">
                    <TruckIcon className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <div className="font-medium">Order #5423</div>
                      <div className="text-sm text-muted-foreground mt-1">Expected: May 8, 2025</div>
                      <div className="text-sm text-muted-foreground">15 items from MediSupply Inc.</div>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-muted/50 rounded-md">
                  <div className="flex items-start space-x-3">
                    <TruckIcon className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <div className="font-medium">Order #5425</div>
                      <div className="text-sm text-muted-foreground mt-1">Expected: May 10, 2025</div>
                      <div className="text-sm text-muted-foreground">8 items from PharmaDirect</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <Link href="/pharmacist/inventory">
                  <Button variant="link" className="w-full">
                    View All Deliveries
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