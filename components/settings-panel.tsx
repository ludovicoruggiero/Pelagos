'use client'

import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Settings, User, Lock, Mail, Bell, Palette, Plug, Database, Shield, X, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

type Section = 'general' | 'notifications' | 'personalization' | 'connectors' | 'data-controls' | 'security' | 'account' | 'manage-accounts'

interface SettingsPanelProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  isAdmin: boolean
}

export default function SettingsPanel({ isOpen, onOpenChange, isAdmin }: SettingsPanelProps) {
  const [activeSection, setActiveSection] = useState<Section>('account')

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'general':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">General Settings</h3>
            <p className="text-sm text-muted-foreground">Manage general application settings.</p>
            {/* Add general settings here */}
          </div>
        )
      case 'notifications':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Notification Settings</h3>
            <p className="text-sm text-muted-foreground">Configure your notification preferences.</p>
            {/* Add notification settings here */}
          </div>
        )
      case 'personalization':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Personalization</h3>
            <p className="text-sm text-muted-foreground">Customize your app experience.</p>
            {/* Add personalization settings here */}
          </div>
        )
      case 'connectors':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Connectors</h3>
            <p className="text-sm text-muted-foreground">Manage integrations with external services.</p>
            {/* Add connectors settings here */}
          </div>
        )
      case 'data-controls':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Data Controls</h3>
            <p className="text-sm text-muted-foreground">Manage your data privacy and access.</p>
            {/* Add data controls settings here */}
          </div>
        )
      case 'security':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Security</h3>
            <p className="text-sm text-muted-foreground">Review and enhance your account security.</p>
            {/* Add security settings here */}
          </div>
        )
      case 'account':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Account Settings</h3>
            <p className="text-sm text-muted-foreground">Manage your profile information, email, and password.</p>

            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="your.email@example.com" className="mt-1" />
                <Button variant="outline" size="sm" className="mt-2">
                  <Mail className="h-4 w-4 mr-2" /> Update Email
                </Button>
              </div>
              <Separator />
              <div>
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" placeholder="Enter current password" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" placeholder="Enter new password" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" placeholder="Confirm new password" className="mt-1" />
                <Button variant="outline" size="sm" className="mt-2">
                  <Lock className="h-4 w-4 mr-2" /> Change Password
                </Button>
              </div>
            </div>
          </div>
        )
      case 'manage-accounts':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Manage Accounts</h3>
            <p className="text-sm text-muted-foreground">Manage user accounts and roles within the application.</p>
            
            <div className="rounded-md border">
              <div className="p-4 border-b bg-muted/50">
                <h4 className="font-medium">User Management</h4>
              </div>
              <div className="p-4">
                <p className="text-sm mb-4">You can manage user accounts, permissions, and roles from this panel.</p>
                <Button className="w-full" variant="secondary">
                  <Users className="h-4 w-4 mr-2" />
                  View All Users
                </Button>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl flex flex-col p-0">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" /> Settings
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-1 overflow-hidden">
          {/* Left Navigation */}
          <div className="w-56 border-r p-4 space-y-1 overflow-y-auto">
            <Button
              variant={activeSection === 'general' ? 'secondary' : 'ghost'}
              className={cn("w-full justify-start", activeSection === 'general' && 'bg-muted')}
              onClick={() => setActiveSection('general')}
            >
              <Settings className="h-4 w-4 mr-2" /> General
            </Button>
            <Button
              variant={activeSection === 'notifications' ? 'secondary' : 'ghost'}
              className={cn("w-full justify-start", activeSection === 'notifications' && 'bg-muted')}
              onClick={() => setActiveSection('notifications')}
            >
              <Bell className="h-4 w-4 mr-2" /> Notifications
            </Button>
            <Button
              variant={activeSection === 'personalization' ? 'secondary' : 'ghost'}
              className={cn("w-full justify-start", activeSection === 'personalization' && 'bg-muted')}
              onClick={() => setActiveSection('personalization')}
            >
              <Palette className="h-4 w-4 mr-2" /> Personalization
            </Button>
            <Button
              variant={activeSection === 'connectors' ? 'secondary' : 'ghost'}
              className={cn("w-full justify-start", activeSection === 'connectors' && 'bg-muted')}
              onClick={() => setActiveSection('connectors')}
            >
              <Plug className="h-4 w-4 mr-2" /> Connectors
            </Button>
            <Button
              variant={activeSection === 'data-controls' ? 'secondary' : 'ghost'}
              className={cn("w-full justify-start", activeSection === 'data-controls' && 'bg-muted')}
              onClick={() => setActiveSection('data-controls')}
            >
              <Database className="h-4 w-4 mr-2" /> Data Controls
            </Button>
            <Button
              variant={activeSection === 'security' ? 'secondary' : 'ghost'}
              className={cn("w-full justify-start", activeSection === 'security' && 'bg-muted')}
              onClick={() => setActiveSection('security')}
            >
              <Shield className="h-4 w-4 mr-2" /> Security
            </Button>
            <Button
              variant={activeSection === 'account' ? 'secondary' : 'ghost'}
              className={cn("w-full justify-start", activeSection === 'account' && 'bg-muted')}
              onClick={() => setActiveSection('account')}
            >
              <User className="h-4 w-4 mr-2" /> Account
            </Button>

            {/* Admin-only sections */}
            {isAdmin && (
              <>
                <Separator className="my-4" />
                <Button
                  variant={activeSection === 'manage-accounts' ? 'secondary' : 'ghost'}
                  className={cn("w-full justify-start", activeSection === 'manage-accounts' && 'bg-muted')}
                  onClick={() => setActiveSection('manage-accounts')}
                >
                  <Users className="h-4 w-4 mr-2" /> Manage Accounts
                </Button>
              </>
            )}
          </div>

          {/* Right Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {renderSectionContent()}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
