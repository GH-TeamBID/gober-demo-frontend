
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { X, Users, Lock, Search } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { cn } from "@/lib/utils";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("password");
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

  const tabs = [
    { id: "password", label: "Password", icon: <Lock className="h-4 w-4 mr-2" /> },
    { id: "users", label: "Users", icon: <Users className="h-4 w-4 mr-2" /> },
    { id: "criteria", label: "Search Criteria", icon: <Search className="h-4 w-4 mr-2" /> },
  ];

  return (
    <Layout>
      <div className="page-container">
        <h1 className="mb-8">Settings</h1>
        
        <div className="grid grid-cols-12 gap-6 max-w-6xl mx-auto">
          {/* Sidebar with vertical tabs */}
          <div className="col-span-12 md:col-span-3">
            <div className="bg-white dark:bg-gober-primary-800 rounded-lg shadow-sm border border-border">
              <div className="p-4 font-medium border-b">
                Settings Menu
              </div>
              <div className="flex flex-col p-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center px-4 py-3 text-sm rounded-md transition-colors",
                      activeTab === tab.id 
                        ? "bg-gober-accent-500/10 text-gober-accent-500 font-medium" 
                        : "text-gober-primary-800 dark:text-gray-300 hover:bg-gober-bg-100 dark:hover:bg-gober-primary-700"
                    )}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Content area */}
          <div className="col-span-12 md:col-span-9">
            <div className="bg-white dark:bg-gober-primary-800 rounded-lg shadow-sm border border-border p-6">
              {/* Password Tab */}
              {activeTab === "password" && (
                <div className="space-y-6 max-w-md mx-auto">
                  <h2 className="text-xl font-medium mb-4">Change Password</h2>
                  <div className="space-y-4">
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
                </div>
              )}
              
              {/* Users Tab */}
              {activeTab === "users" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-medium mb-4">User Management</h2>
                    <div className="overflow-x-auto bg-gober-bg-100 dark:bg-gober-primary-700/30 rounded-lg border border-border/50">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b border-border/30">
                            <th className="text-left py-3 px-4 font-medium text-gober-primary-800 dark:text-gray-300">Name</th>
                            <th className="text-left py-3 px-4 font-medium text-gober-primary-800 dark:text-gray-300">Email</th>
                            <th className="text-left py-3 px-4 font-medium text-gober-primary-800 dark:text-gray-300">Role</th>
                            <th className="text-left py-3 px-4 font-medium text-gober-primary-800 dark:text-gray-300">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mockUsers.map((user, index) => (
                            <tr 
                              key={user.id} 
                              className={cn(
                                "border-b border-border/30 hover:bg-white/50 dark:hover:bg-gober-primary-700/50 transition-colors",
                                index === mockUsers.length - 1 ? "border-b-0" : ""
                              )}
                            >
                              <td className="py-3 px-4 flex items-center">
                                <div className="w-8 h-8 rounded-full bg-gober-accent-500/20 text-gober-accent-500 flex items-center justify-center mr-3 font-medium">
                                  {user.name.charAt(0)}
                                </div>
                                <span>{user.name}</span>
                              </td>
                              <td className="py-3 px-4 text-gober-primary-800 dark:text-gray-300">{user.email}</td>
                              <td className="py-3 px-4">
                                <Badge variant={user.role === "Admin" ? "default" : user.role === "Editor" ? "secondary" : "outline"}>
                                  {user.role}
                                </Badge>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" className="h-8 text-xs">
                                    Edit
                                  </Button>
                                  <Button variant="destructive" size="sm" className="h-8 text-xs">
                                    Remove
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <div className="space-y-4 max-w-md border-t pt-6">
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
              )}
              
              {/* Search Criteria Tab */}
              {activeTab === "criteria" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-medium mb-4">Search Criteria</h2>

                  <div className="space-y-5">
                    <div className="space-y-3">
                      <Label htmlFor="cpv-input">CPV Codes</Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {selectedCPV.map((cpv) => (
                          <Badge 
                            key={cpv} 
                            variant="secondary"
                            className="flex items-center gap-1 py-1.5 px-3 bg-gober-bg-200 dark:bg-gober-primary-700 text-gober-primary-800 dark:text-gray-300"
                          >
                            {cpv}
                            <X 
                              className="h-3 w-3 cursor-pointer ml-1 text-gober-primary-600" 
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
                            className="flex items-center gap-1 py-1.5 px-3 bg-gober-bg-200 dark:bg-gober-primary-700 text-gober-primary-800 dark:text-gray-300"
                          >
                            {keyword}
                            <X 
                              className="h-3 w-3 cursor-pointer ml-1 text-gober-primary-600" 
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
                            className="flex items-center gap-1 py-1.5 px-3 bg-gober-bg-200 dark:bg-gober-primary-700 text-gober-primary-800 dark:text-gray-300"
                          >
                            {type}
                            <X 
                              className="h-3 w-3 cursor-pointer ml-1 text-gober-primary-600" 
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
                    
                    <div className="space-y-4 bg-gober-bg-100 dark:bg-gober-primary-700/30 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <Label className="text-base">Budget Range</Label>
                        <span className="text-sm font-medium px-3 py-1 rounded-full bg-gober-bg-200 dark:bg-gober-primary-700">
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
                        <div className="flex justify-between mt-2 text-sm text-gober-primary-600 dark:text-gray-400">
                          <span>£0</span>
                          <span>£1,000,000</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button className="w-full mt-6">Save Search Criteria</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
