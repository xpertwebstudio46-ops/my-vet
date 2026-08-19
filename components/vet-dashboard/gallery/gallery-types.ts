export type GalleryMediaType = 'photo' | 'video'

export type GalleryItem = {
  id: string
  title: string
  image: string
  type: GalleryMediaType
}

export type GalleryTab = 'all' | 'photo' | 'video'
