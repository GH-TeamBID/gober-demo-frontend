import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface UserSettingsProps {
  isOpen: boolean
  onClose: () => void
}

export function UserSettings({ isOpen, onClose }: UserSettingsProps) {
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([])
  const [selectedCPV, setSelectedCPV] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [budgetRange, setBudgetRange] = useState<[number, number]>([0, 1000000])

  const handleRemoveKeyword = (keyword: string) => {
    setSelectedKeywords(prev => prev.filter(k => k !== keyword))
  }

  const handleRemoveCPV = (cpv: string) => {
    setSelectedCPV(prev => prev.filter(c => c !== cpv))
  }

  const handleRemoveType = (type: string) => {
    setSelectedTypes(prev => prev.filter(t => t !== type))
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>User Settings</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="password" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="criteria">Search Criteria</TabsTrigger>
          </TabsList>
          
          <TabsContent value="password" className="space-y-4">
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
          </TabsContent>
          
          <TabsContent value="users" className="space-y-4">
            <div className="space-y-4">
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
          </TabsContent>
          
          <TabsContent value="criteria" className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>CPV Codes</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedCPV.map((cpv) => (
                    <Badge 
                      key={cpv} 
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {cpv}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => handleRemoveCPV(cpv)}
                      />
                    </Badge>
                  ))}
                </div>
                <Input 
                  placeholder="Add CPV code..." 
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const value = e.currentTarget.value.trim()
                      if (value && !selectedCPV.includes(value)) {
                        setSelectedCPV(prev => [...prev, value])
                        e.currentTarget.value = ''
                      }
                    }
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Keywords</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedKeywords.map((keyword) => (
                    <Badge 
                      key={keyword} 
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {keyword}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => handleRemoveKeyword(keyword)}
                      />
                    </Badge>
                  ))}
                </div>
                <Input 
                  placeholder="Add keyword..." 
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const value = e.currentTarget.value.trim()
                      if (value && !selectedKeywords.includes(value)) {
                        setSelectedKeywords(prev => [...prev, value])
                        e.currentTarget.value = ''
                      }
                    }
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Tender Types</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedTypes.map((type) => (
                    <Badge 
                      key={type} 
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {type}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => handleRemoveType(type)}
                      />
                    </Badge>
                  ))}
                </div>
                <Input 
                  placeholder="Add tender type..." 
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const value = e.currentTarget.value.trim()
                      if (value && !selectedTypes.includes(value)) {
                        setSelectedTypes(prev => [...prev, value])
                        e.currentTarget.value = ''
                      }
                    }
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Budget Range</Label>
                <div className="pt-4">
                  <Slider 
                    defaultValue={[budgetRange[0], budgetRange[1]]} 
                    max={1000000} 
                    step={1000}
                    onValueChange={(value) => setBudgetRange([value[0], value[1]])}
                  />
                  <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                    <span>£{budgetRange[0].toLocaleString()}</span>
                    <span>£{budgetRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <Button className="w-full">Save Search Criteria</Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
