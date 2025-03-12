
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface User {
  id: number;
  name: string;
  email: string;
}

const UsersList = () => {
  // Mock user data without roles
  const mockUsers = [
    { id: 1, name: "John Doe", email: "john@example.com" },
    { id: 2, name: "Jane Smith", email: "jane@example.com" },
    { id: 3, name: "Sam Wilson", email: "sam@example.com" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-medium mb-4">User Management</h2>
        <div className="overflow-x-auto bg-gober-bg-100 dark:bg-gober-primary-700/30 rounded-lg border border-border/50">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left py-3 px-4 font-medium text-gober-primary-800 dark:text-gray-300">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gober-primary-800 dark:text-gray-300">Email</th>
                <th className="text-left py-3 px-4 font-medium text-gober-primary-800 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockUsers.map((user, index) => (
                <tr 
                  key={user.id} 
                  className={`border-b border-border/30 hover:bg-white/50 dark:hover:bg-gober-primary-700/50 transition-colors ${
                    index === mockUsers.length - 1 ? "border-b-0" : ""
                  }`}
                >
                  <td className="py-3 px-4 flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gober-accent-500/20 text-gober-accent-500 flex items-center justify-center mr-3 font-medium">
                      {user.name.charAt(0)}
                    </div>
                    <span>{user.name}</span>
                  </td>
                  <td className="py-3 px-4 text-gober-primary-800 dark:text-gray-300">{user.email}</td>
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
        <Button className="w-full">Add User</Button>
      </div>
    </div>
  );
};

export default UsersList;
