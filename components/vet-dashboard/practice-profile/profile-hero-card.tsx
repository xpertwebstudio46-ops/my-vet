'use client'

import Image from 'next/image'
import { Upload } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Card } from '@/components/dashboard/ui'
import { apiClient, ApiClientError } from '@/lib/api/client'
import { discardUpload, uploadImage } from '@/lib/api/uploads'

type Practice = { id: string; name: string; description: string | null; logoUrl: string | null; bannerUrl: string | null }

export function ProfileHeroCard() {
  const [practice, setPractice] = useState<Practice | null>(null)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState<'logo' | 'banner' | null>(null)

  useEffect(() => {
    void apiClient<{ practice: Practice }>('/api/vet/dashboard').then(({ practice: item }) => setPractice(item)).catch((caught) => setError(caught instanceof ApiClientError ? caught.message : 'Practice profile could not be loaded.'))
  }, [])

  async function replaceImage(file: File, kind: 'logo' | 'banner') {
    setUploading(kind); setError('')
    let asset
    try {
      asset = await uploadImage(file, kind === 'logo' ? 'PRACTICE_LOGO' : 'PRACTICE_BANNER')
      const media = await apiClient<{ logoUrl: string | null; bannerUrl: string | null }>('/api/vet/practice-media', { method: 'PUT', body: JSON.stringify({ kind, assetId: asset.id }) })
      setPractice((current) => current ? { ...current, ...media } : current)
    } catch (caught) {
      if (asset) await discardUpload(asset)
      setError(caught instanceof ApiClientError ? caught.message : 'Practice image could not be saved.')
    } finally { setUploading(null) }
  }

  return (
    <Card className="overflow-hidden p-0">
      {error && <div role="alert" className="border-b border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <div className="relative h-[260px] bg-slate-100">
        <Image src={practice?.bannerUrl || '/images/profile-banner.png'} alt="Practice cover" fill sizes="100vw" className="object-cover" priority />
        <div className="absolute inset-0 bg-black/10" />
        <label className="absolute right-4 top-4 inline-flex cursor-pointer items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-[#064071] shadow-md hover:bg-[#EEF7F5]"><Upload className="size-4" />{uploading === 'banner' ? 'Uploadingâ€¦' : 'Change cover'}<input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" disabled={Boolean(uploading)} onChange={(event) => { const file = event.target.files?.[0]; if (file) void replaceImage(file, 'banner') }} /></label>
        <span className="absolute -bottom-14 left-5 z-10 size-28 overflow-hidden rounded-md border-4 border-white bg-white shadow-lg shadow-black/20">
          <Image src={practice?.logoUrl || '/placeholder.svg'} alt={practice?.name || 'Practice logo'} fill sizes="112px" className="object-cover" />
          <label aria-label="Upload practice logo" className="absolute bottom-2 right-2 flex size-8 cursor-pointer items-center justify-center rounded-md bg-white text-[#064071] shadow-md hover:bg-[#EEF7F5]"><Upload className="size-4" /><input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" disabled={Boolean(uploading)} onChange={(event) => { const file = event.target.files?.[0]; if (file) void replaceImage(file, 'logo') }} /></label>
        </span>
      </div>
      <div className="bg-white px-5 pb-5 pt-20"><div className="max-w-3xl"><h2 className="dashboard-outfit text-[22px] font-semibold text-[#01AEAD]">{practice?.name || 'Loading practiceâ€¦'}</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">{practice?.description || 'Add a practice description from your profile details.'}</p></div></div>
    </Card>
  )
}
