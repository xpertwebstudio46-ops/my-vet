'use client'

import { useState } from 'react'
import { Eye, EyeOff, Settings, Shield } from 'lucide-react'
import { currentUser } from '@/lib/dashboard-data'
import { Card, PageHeader } from '@/components/dashboard/ui'
import { Modal } from '@/components/dashboard/modal'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function Input({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="dashboard-font mb-1.5 block text-[13px] font-medium text-[#425350]">
        {label}
      </label>
      <input
        {...props}
        className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </div>
  )
}

function Toggle({
  on,
  onToggle,
}: {
  on: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
        on ? 'bg-brand' : 'bg-input',
      )}
    >
      <span
        className={cn(
          'inline-block size-5 rounded-full bg-card shadow transition-transform',
          on ? 'translate-x-5' : 'translate-x-0.5',
        )}
      />
    </button>
  )
}

export default function AccountSettingsPage() {
  const [twoFA, setTwoFA] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleteText, setDeleteText] = useState('')

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Account settings"
        description="Account, security and privacy controls for your practice."
      >
        <Button className="inline-flex items-center justify-center gap-2 bg-[#01AEAD] text-brand-foreground hover:bg-[#019897]">
          <Settings className="size-4" />
          Save settings
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="dashboard-outfit text-[16px] font-semibold text-primary">
            Account settings
          </h2>
          <div className="mt-5 flex flex-col gap-4">
            <Input label="Account email" type="email" defaultValue={currentUser.email} />
            <Input label="Backup email" type="email" placeholder="Add a backup email" />
            <Input label="Phone number" type="tel" defaultValue={currentUser.phone} />
            <Input label="Language" defaultValue="English (UK)" />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="dashboard-outfit text-[16px] font-semibold text-primary">
            Change password
          </h2>
          <div className="mt-5 flex flex-col gap-4">
            <Input label="Current password" type="password" placeholder="••••••••" />
            <div className="relative">
              <Input
                label="New password"
                type={showPw ? 'text' : 'password'}
                placeholder="Enter a new password"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-3 top-9 text-muted-foreground hover:text-foreground"
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <Input
              label="Confirm new password"
              type={showPw ? 'text' : 'password'}
              placeholder="Re-enter new password"
            />
            <Button variant="outline" className="mt-1 self-start">
              Update password
            </Button>
          </div>
        </Card>
      </div>

      <Card className="mt-6 flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-brand-muted text-brand">
            <Shield className="size-5" />
          </span>
          <div>
            <p className="dashboard-outfit text-[16px] font-semibold">
              Two-factor authentication
            </p>
            <p className="text-sm text-muted-foreground">
              Strongly recommended to keep your account secure with a second
              step at login.
            </p>
          </div>
        </div>
        <Toggle on={twoFA} onToggle={() => setTwoFA((v) => !v)} />
      </Card>

      <Card className="mt-6 border-destructive/30 p-6">
        <h2 className="dashboard-outfit text-[16px] font-semibold text-destructive">
          Delete account
        </h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Once you delete your account, there is no going back. All your data,
          saved practices, reviews and appointment history will be permanently
          removed.
        </p>
        <Button
          variant="destructive"
          className="mt-4 bg-destructive text-destructive-foreground hover:bg-destructive/90"
          onClick={() => setConfirmDelete(true)}
        >
          Delete my account
        </Button>
      </Card>

      <Modal
        open={confirmDelete}
        onClose={() => {
          setConfirmDelete(false)
          setDeleteText('')
        }}
        title="Delete your account?"
        description="Type DELETE to confirm. This cannot be undone."
      >
        <div className="flex flex-col gap-4">
          <input
            value={deleteText}
            onChange={(e) => setDeleteText(e.target.value)}
            placeholder="Type DELETE"
            className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setConfirmDelete(false)
                setDeleteText('')
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteText !== 'DELETE'}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete permanently
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
