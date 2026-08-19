'use client'

import { useState } from 'react'
import { Eye, EyeOff, Save, Shield } from 'lucide-react'
import { Card } from '@/components/dashboard/ui'
import { DeleteAccountModal } from './delete-account-modal'
import { SettingsBanner } from './settings-banner'
import { SettingsInput } from './settings-input'
import { SettingsToggle } from './settings-toggle'

export function VetSettingsPage() {
  const [twoFactor, setTwoFactor] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <div className="space-y-6">
      <SettingsBanner onSave={() => undefined} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="dashboard-outfit text-[16px] font-semibold text-black">
            Account settings
          </h2>
          <div className="mt-5 grid gap-4">
            <SettingsInput
              label="Practice email"
              type="email"
              defaultValue="amelia@greenpawsvet.co.uk"
            />
            <SettingsInput
              label="Backup email"
              type="email"
              placeholder="Add backup email"
            />
            <SettingsInput
              label="Phone number"
              type="tel"
              defaultValue="+44 1865 555 011"
            />
            <SettingsInput label="Dashboard language" defaultValue="English (UK)" />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="dashboard-outfit text-[16px] font-semibold text-black">
            Change password
          </h2>
          <div className="mt-5 grid gap-4">
            <SettingsInput
              label="Current password"
              type="password"
              placeholder="Enter current password"
            />
            <div className="relative">
              <SettingsInput
                label="New password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-3 top-9 text-muted-foreground hover:text-black"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            <SettingsInput
              label="Confirm new password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm new password"
            />
            <button
              type="button"
              className="mt-1 inline-flex h-10 w-fit items-center justify-center gap-2 rounded-md border border-gray-200 bg-transparent px-4 text-sm font-semibold text-black hover:bg-slate-50"
            >
              <Save className="size-4 text-slate-400" />
              Update password
            </button>
          </div>
        </Card>
      </div>

      <Card className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-[#EEF7F5] text-[#01AEAD]">
            <Shield className="size-5" />
          </span>
          <div>
            <h2 className="dashboard-outfit text-[16px] font-semibold text-black">
              Two-factor authentication
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Require a second verification step for vet dashboard sign-ins.
            </p>
          </div>
        </div>
        <SettingsToggle
          active={twoFactor}
          onClick={() => setTwoFactor((current) => !current)}
        />
      </Card>

      <Card className="border-red-200 p-6">
        <h2 className="dashboard-outfit text-[16px] font-semibold text-red-600">
          Delete vet account
        </h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Removing this account will revoke dashboard access and hide your
          practice listing controls. This action cannot be undone.
        </p>
        <button
          type="button"
          onClick={() => setDeleteOpen(true)}
          className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700"
        >
          Delete account
        </button>
      </Card>

      {deleteOpen && <DeleteAccountModal onClose={() => setDeleteOpen(false)} />}
    </div>
  )
}
