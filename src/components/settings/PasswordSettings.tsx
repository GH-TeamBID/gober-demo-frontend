
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PasswordSettings = () => {
  return (
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
  );
};

export default PasswordSettings;
