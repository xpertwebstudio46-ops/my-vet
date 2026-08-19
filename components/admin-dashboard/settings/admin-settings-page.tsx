'use client'

import { useState } from 'react'
import { Eye, EyeOff, Save, Shield } from 'lucide-react'
import { Modal } from '@/components/dashboard/modal'
import { Card } from '@/components/dashboard/ui'
import { AdminPageBanner } from '../shared/admin-page-banner'
import { AdminToggle } from '../shared/admin-toggle'

export function AdminSettingsPage() {
  const [twoFactor, setTwoFactor] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteText, setDeleteText] = useState('')

  return (
    <div className="space-y-6">
      <AdminPageBanner
        title="Account Settings"
        description="Admin profile, security and access controls for the MY VET dashboard."
        action={{
          label: 'Save Settings',
          icon: 'download',
          tone: 'teal',
        }}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="dashboard-outfit text-[16px] font-semibold text-black">
            Account settings
          </h2>
          <div className="mt-5 grid gap-4">
            <AdminInput
              label="Admin email"
              type="email"
              defaultValue="admin@myvet.co.uk"
            />
            <AdminInput
              label="Backup email"
              type="email"
              placeholder="Add backup email"
            />
            <AdminInput
              label="Phone number"
              type="tel"
              defaultValue="+44 7700 900123"
            />
            <AdminInput label="Dashboard language" defaultValue="English (UK)" />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="dashboard-outfit text-[16px] font-semibold text-black">
            Change password
          </h2>
          <div className="mt-5 grid gap-4">
            <AdminInput
              label="Current password"
              type="password"
              placeholder="Enter current password"
            />
            <div className="relative">
              <AdminInput
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
            <AdminInput
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
              Require a second verification step for admin dashboard sign-ins.
            </p>
          </div>
        </div>
        <AdminToggle
          active={twoFactor}
          onClick={() => setTwoFactor((current) => !current)}
        />
      </Card>

      <Card className="border-red-200 p-6">
        <h2 className="dashboard-outfit text-[16px] font-semibold text-red-600">
          Delete admin account
        </h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Removing this admin account will revoke dashboard access and cannot be
          undone without a new invitation.
        </p>
        <button
          type="button"
          onClick={() => setDeleteOpen(true)}
          className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700"
        >
          Delete account
        </button>
      </Card>

      <Modal
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false)
          setDeleteText('')
        }}
        title="Delete admin account?"
        description="Type DELETE to confirm this action."
      >
        <div className="grid gap-4">
          <input
            value={deleteText}
            onChange={(event) => setDeleteText(event.target.value)}
            placeholder="Type DELETE"
            className="h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#01AEAD] focus:ring-3 focus:ring-[#01AEAD]/15"
          />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                setDeleteOpen(false)
                setDeleteText('')
              }}
              className="inline-flex h-10 items-center justify-center rounded-md border border-gray-200 px-4 text-sm font-semibold text-[#064071] hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleteText !== 'DELETE'}
              className="inline-flex h-10 items-center justify-center rounded-md bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:pointer-events-none disabled:opacity-50"
            >
              Delete permanently
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function AdminInput({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block text-sm font-medium text-black">
      {label}
      <input
        {...props}
        className="mt-2 h-11 w-full rounded-lg border border-gray-200 bg-white px-3.5 text-sm outline-none focus:border-[#01AEAD] focus:ring-3 focus:ring-[#01AEAD]/15"
      />
    </label>
  )
}
