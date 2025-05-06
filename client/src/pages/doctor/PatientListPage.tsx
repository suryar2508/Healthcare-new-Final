import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function PatientListPage() {
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Patients</h1>
          <p className="text-muted-foreground">Manage your patient list</p>
        </div>
        <div className="flex space-x-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search patients..."
              className="pl-8"
            />
          </div>
          <Button>Add New Patient</Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Patient Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Name</th>
                  <th className="text-left p-4">Age</th>
                  <th className="text-left p-4">Contact</th>
                  <th className="text-left p-4">Last Visit</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-4 font-medium">John Smith</td>
                  <td className="p-4">45</td>
                  <td className="p-4">john.smith@example.com</td>
                  <td className="p-4">May 1, 2025</td>
                  <td className="p-4">
                    <span className="inline-flex items-center rounded-full border border-green-600 px-2.5 py-0.5 text-xs font-semibold text-green-600">
                      Active
                    </span>
                  </td>
                  <td className="p-4">
                    <Button variant="ghost" size="sm">View</Button>
                  </td>
                </tr>
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-4 font-medium">Emily Wilson</td>
                  <td className="p-4">38</td>
                  <td className="p-4">emily.wilson@example.com</td>
                  <td className="p-4">Apr 25, 2025</td>
                  <td className="p-4">
                    <span className="inline-flex items-center rounded-full border border-green-600 px-2.5 py-0.5 text-xs font-semibold text-green-600">
                      Active
                    </span>
                  </td>
                  <td className="p-4">
                    <Button variant="ghost" size="sm">View</Button>
                  </td>
                </tr>
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-4 font-medium">Michael Johnson</td>
                  <td className="p-4">52</td>
                  <td className="p-4">michael.johnson@example.com</td>
                  <td className="p-4">Apr 18, 2025</td>
                  <td className="p-4">
                    <span className="inline-flex items-center rounded-full border border-amber-600 px-2.5 py-0.5 text-xs font-semibold text-amber-600">
                      Follow-up
                    </span>
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
    </div>
  );
}