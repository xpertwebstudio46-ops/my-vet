export type Role = "PET_OWNER" | "VET" | "ADMIN";

export interface ApiEnvelope<T> {
  success: boolean;
  data: T | null;
  message: string | null;
  error: { code: string; details?: Record<string, string[]>; requestId?: string } | null;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface User {
  id: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  avatar: string | null;
  createdAt: string;
}

export interface PracticeService {
  id: string;
  name: string;
  description: string | null;
  price: string | null;
  currency: string;
}

export interface PracticeAnimalType {
  animalType: { id: string; name: string; slug: string; icon: string | null; active: boolean };
}

export interface OpeningHours {
  dayOfWeek: number;
  opensAt: string | null;
  closesAt: string | null;
  isClosed: boolean;
}

export interface Practice {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  county: string | null;
  postcode: string;
  phone: string;
  email: string;
  website: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  rating: string;
  reviewCount: number;
  isFeatured: boolean;
  services?: PracticeService[];
  facilities?: Array<{ id: string; name: string; description: string | null; icon: string | null }>;
  animalTypes?: PracticeAnimalType[];
  openingHours?: OpeningHours[];
  galleryMedia?: Array<{ id: string; url: string; caption: string | null; type: "IMAGE" | "VIDEO" }>;
  pricing?: Array<{ id: string; name: string; section: string; price: string; currency: string }>;
}

export interface PracticeReview {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  reply: string | null;
  repliedAt: string | null;
  helpfulCount: number;
  createdAt: string;
  user: { firstName: string; lastName: string; avatar: string | null };
}

export interface AuthResult {
  user: User;
  accessToken: string;
}
