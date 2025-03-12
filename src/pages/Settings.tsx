
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { X, Users } from "lucide-react";
import Layout from "@/components/layout/Layout";

const Settings = () => {
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [selectedCPV, setSelectedCPV] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [budgetRange, setBudgetRange] = useState<[number, number]>([0, 1000000]);

  // Mock user data for display
  const mockUsers = [
    { id: 1, name: "John Doe", email: "john@example.com", role: "Admin" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "Editor" },
    { id: 3, name: "Sam Wilson", email: "sam@example.com", role: "Viewer" },
  ];

  // Mock tender types for dropdown
  const tenderTypes = [
    "Open", "Restricted", "Competitive with negotiation", 
    "Competitive dialogue", "Innovation partnership", "Direct award"
  ];

  const handleRemoveKeyword = (keyword: string) => {
    setSelectedKeywords(prev => prev.filter(k => k !== keyword));
  };

  const handleRemoveCPV = (cpv: string) => {
    setSelectedCPV(prev => prev.filter(c => c !== cpv));
  };

  const handleRemoveType = (type: string) => {
    setSelectedTypes(prev => prev.filter(t => t !== type));
  };

  const handleAddType = (type: string) => {
    if (type && !selectedTypes.includes(type)) {
      setSelectedTypes(prev => [...prev, type]);
    }
  };

  const formatBudgetValue = (value: number) => {
    return `£${value.toLocaleString()}`;
  };

  return (
    <Layout>
      <div className="page-container">
        <h1 className="mb-6">Settings</h1>
        
        <Tabs defaultValue="users" className="w-full max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="criteria">Search Criteria</TabsTrigger>
          </TabsList>
          
          <TabsContent value="password" className="space-y-4 p-4 border rounded-md mt-4">
            <div className="space-y-4 max-w-md mx-auto">
              <div className="space-y-2">
                <Label htmlFor="current">Current Password</Label>
                <Input id="current" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new">New Password</Label>
                <Input id="new" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm New Password</Label>
                <Input id="confirm" type="password" />
              </div>
              <Button className="w-full">Change Password</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="users" className="space-y-4 p-4 border rounded-md mt-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">User Management</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Name</th>
                        <th className="text-left py-3 px-4">Email</th>
                        <th className="text-left py-3 px-4">Role</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockUsers.map(user => (
                        <tr key={user.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">{user.name}</td>
                          <td className="py-3 px-4">{user.email}</td>
                          <td className="py-3 px-4">{user.role}</td>
                          <td className="py-3 px-4">
                            <Button variant="outline" size="sm" className="mr-2">Edit</Button>
                            <Button variant="destructive" size="sm">Remove</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="space-y-4 max-w-md mx-auto border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Add New User</h3>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full">Add User</Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="criteria" className="space-y-6 p-4 border rounded-md mt-4">
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="cpv-input">CPV Codes</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedCPV.map((cpv) => (
                    <Badge 
                      key={cpv} 
                      variant="secondary"
                      className="flex items-center gap-1 py-1 px-3"
                    >
                      {cpv}
                      <X 
                        className="h-3 w-3 cursor-pointer ml-1" 
                        onClick={() => handleRemoveCPV(cpv)}
                      />
                    </Badge>
                  ))}
                </div>
                <Input 
                  id="cpv-input"
                  placeholder="Type a CPV code and press Enter..." 
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const value = e.currentTarget.value.trim();
                      if (value && !selectedCPV.includes(value)) {
                        setSelectedCPV(prev => [...prev, value]);
                        e.currentTarget.value = '';
                      }
                    }
                  }}
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="keyword-input">Keywords</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedKeywords.map((keyword) => (
                    <Badge 
                      key={keyword} 
                      variant="secondary"
                      className="flex items-center gap-1 py-1 px-3"
                    >
                      {keyword}
                      <X 
                        className="h-3 w-3 cursor-pointer ml-1" 
                        onClick={() => handleRemoveKeyword(keyword)}
                      />
                    </Badge>
                  ))}
                </div>
                <Input 
                  id="keyword-input"
                  placeholder="Type a keyword and press Enter..." 
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const value = e.currentTarget.value.trim();
                      if (value && !selectedKeywords.includes(value)) {
                        setSelectedKeywords(prev => [...prev, value]);
                        e.currentTarget.value = '';
                      }
                    }
                  }}
                />
              </div>
              
              <div className="space-y-3">
                <Label>Tender Types</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedTypes.map((type) => (
                    <Badge 
                      key={type} 
                      variant="secondary"
                      className="flex items-center gap-1 py-1 px-3"
                    >
                      {type}
                      <X 
                        className="h-3 w-3 cursor-pointer ml-1" 
                        onClick={() => handleRemoveType(type)}
                      />
                    </Badge>
                  ))}
                </div>
                <Select onValueChange={handleAddType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tender type" />
                  </SelectTrigger>
                  <SelectContent>
                    {tenderTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Label>Budget Range</Label>
                  <span className="text-sm text-muted-foreground">
                    {formatBudgetValue(budgetRange[0])} - {formatBudgetValue(budgetRange[1])}
                  </span>
                </div>
                <div className="pt-2 px-1">
                  <Slider 
                    value={[budgetRange[0], budgetRange[1]]} 
                    max={1000000} 
                    step={10000}
                    onValueChange={(value) => setBudgetRange([value[0], value[1]])}
                    className="my-6"
                  />
                  <div className="flex justify-between mt-2 text-sm">
                    <span>£0</span>
                    <span>£1,000,000</span>
                  </div>
                </div>
              </div>
              
              <Button className="w-full mt-6">Save Search Criteria</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Settings;
