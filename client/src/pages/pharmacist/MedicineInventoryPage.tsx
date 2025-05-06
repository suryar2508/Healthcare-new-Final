import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Package, ArrowUpDown, AlertCircle, Filter, Download, BarChart4 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MedicineInventoryPage() {
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Medicine Inventory</h1>
          <p className="text-muted-foreground">
            Manage your pharmacy stock
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Medication
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-medium">Total Items</CardTitle>
            <CardDescription>Current inventory count</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">248</div>
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-muted-foreground">42 categories</div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-medium">Low Stock Items</CardTitle>
            <CardDescription>Below reorder threshold</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">16</div>
            <div className="flex justify-between items-center mt-4">
              <Button variant="outline" size="sm">View All</Button>
              <AlertCircle className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-medium">Out of Stock</CardTitle>
            <CardDescription>Requires immediate reordering</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
            <div className="flex justify-between items-center mt-4">
              <Button variant="outline" size="sm">Place Orders</Button>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex space-x-2 w-full max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search medicines by name, category, or NDC..."
              className="pl-8"
            />
          </div>
          
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Items</SelectItem>
              <SelectItem value="low_stock">Low Stock</SelectItem>
              <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        
        <Button variant="outline">
          <BarChart4 className="mr-2 h-4 w-4" />
          Inventory Analytics
        </Button>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Medications</TabsTrigger>
          <TabsTrigger value="critical">Critical Stock</TabsTrigger>
          <TabsTrigger value="expiring">Expiring Soon</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">
                        <div className="flex items-center">
                          Medication Name
                          <ArrowUpDown className="ml-1 h-3 w-3" />
                        </div>
                      </th>
                      <th className="text-left p-4">
                        <div className="flex items-center">
                          NDC
                        </div>
                      </th>
                      <th className="text-left p-4">
                        <div className="flex items-center">
                          Category
                        </div>
                      </th>
                      <th className="text-left p-4">
                        <div className="flex items-center">
                          Stock
                          <ArrowUpDown className="ml-1 h-3 w-3" />
                        </div>
                      </th>
                      <th className="text-left p-4">
                        <div className="flex items-center">
                          Reorder Level
                        </div>
                      </th>
                      <th className="text-left p-4">
                        <div className="flex items-center">
                          Expiration
                          <ArrowUpDown className="ml-1 h-3 w-3" />
                        </div>
                      </th>
                      <th className="text-left p-4">
                        <div className="flex items-center">
                          Status
                        </div>
                      </th>
                      <th className="text-left p-4">
                        <div className="flex items-center">
                          Actions
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-4 font-medium">Amlodipine 5mg</td>
                      <td className="p-4">57664-143-88</td>
                      <td className="p-4">Cardiovascular</td>
                      <td className="p-4">42</td>
                      <td className="p-4">20</td>
                      <td className="p-4">Dec 2026</td>
                      <td className="p-4">
                        <Badge className="bg-green-100 text-green-800">In Stock</Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">View</Button>
                          <Button variant="ghost" size="sm">Edit</Button>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-4 font-medium">Atorvastatin 20mg</td>
                      <td className="p-4">68180-830-09</td>
                      <td className="p-4">Lipid Lowering</td>
                      <td className="p-4">0</td>
                      <td className="p-4">15</td>
                      <td className="p-4">N/A</td>
                      <td className="p-4">
                        <Badge variant="destructive">Out of Stock</Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">View</Button>
                          <Button variant="ghost" size="sm">Order</Button>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-4 font-medium">Lisinopril 10mg</td>
                      <td className="p-4">68180-514-01</td>
                      <td className="p-4">Cardiovascular</td>
                      <td className="p-4">8</td>
                      <td className="p-4">15</td>
                      <td className="p-4">Oct 2026</td>
                      <td className="p-4">
                        <Badge className="bg-amber-100 text-amber-800">Low Stock</Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">View</Button>
                          <Button variant="ghost" size="sm">Order</Button>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-4 font-medium">Metformin 500mg</td>
                      <td className="p-4">65162-175-10</td>
                      <td className="p-4">Diabetes</td>
                      <td className="p-4">5</td>
                      <td className="p-4">25</td>
                      <td className="p-4">Nov 2026</td>
                      <td className="p-4">
                        <Badge className="bg-amber-100 text-amber-800">Low Stock</Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">View</Button>
                          <Button variant="ghost" size="sm">Order</Button>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-4 font-medium">Sertraline 50mg</td>
                      <td className="p-4">16729-158-01</td>
                      <td className="p-4">Psychiatric</td>
                      <td className="p-4">36</td>
                      <td className="p-4">15</td>
                      <td className="p-4">Aug 2026</td>
                      <td className="p-4">
                        <Badge className="bg-green-100 text-green-800">In Stock</Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">View</Button>
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
        
        <TabsContent value="critical">
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
                  <div className="text-sm text-muted-foreground mt-1">NDC: 68180-830-09</div>
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
                  <div className="text-sm text-muted-foreground mt-1">NDC: 65162-175-10 | Last ordered: 30 days ago</div>
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
                  <div className="text-sm text-muted-foreground mt-1">NDC: 68180-514-01 | Last ordered: 45 days ago</div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-sm font-medium text-amber-600">5 pending prescriptions</div>
                    <Button size="sm" variant="outline">Order Now</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="expiring">
          <Card>
            <CardHeader>
              <CardTitle>Expiring Soon</CardTitle>
              <CardDescription>Medications expiring in the next 90 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Medication Name</th>
                      <th className="text-left p-4">NDC</th>
                      <th className="text-left p-4">Batch Number</th>
                      <th className="text-left p-4">Quantity</th>
                      <th className="text-left p-4">Expiration Date</th>
                      <th className="text-left p-4">Days Left</th>
                      <th className="text-left p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-4 font-medium">Amoxicillin 500mg</td>
                      <td className="p-4">68180-802-01</td>
                      <td className="p-4">AMX5002023</td>
                      <td className="p-4">28</td>
                      <td className="p-4">Aug 5, 2025</td>
                      <td className="p-4">
                        <Badge className="bg-red-100 text-red-800">30 days</Badge>
                      </td>
                      <td className="p-4">
                        <Button variant="outline" size="sm">Mark for Disposal</Button>
                      </td>
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-4 font-medium">Ciprofloxacin 500mg</td>
                      <td className="p-4">65862-537-50</td>
                      <td className="p-4">CIP5002023</td>
                      <td className="p-4">14</td>
                      <td className="p-4">Jul 15, 2025</td>
                      <td className="p-4">
                        <Badge className="bg-red-100 text-red-800">9 days</Badge>
                      </td>
                      <td className="p-4">
                        <Button variant="outline" size="sm">Mark for Disposal</Button>
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