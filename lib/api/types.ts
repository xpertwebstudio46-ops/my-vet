export type Role = "PET_OWNER" | "VET" | "ADMIN";
export type PracticeMembershipType = "INDEPENDENT" | "GROUP";
export type BlogCategory = "HORSES" | "DOGS" | "CATS" | "EXOTIC" | "POULTRY";

export interface ApiEnvelope<T> {
  success: boolean;
  data: T | null;
  message: string | null;
  error: { code: string; details?: Record<string, string[]>; requestId?: string } | null;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  currency: string;
  billingPeriod: "MONTHLY";
  features: unknown;
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
  membershipType: PracticeMembershipType;
  branchCount: number;
  services?: PracticeService[];
  facilities?: Array<{ id: string; name: string; description: string | null; icon: string | null }>;
  animalTypes?: PracticeAnimalType[];
  openingHours?: OpeningHours[];
  holidayHours?: Array<{ id: string; date: string; isClosed: boolean; opensAt: string | null; closesAt: string | null; note: string | null }>;
  emergencyHours?: { enabled: boolean; phone: string | null; calloutAddress: string | null; instructions: string | null } | null;
  galleryMedia?: Array<{ id: string; url: string; altText: string | null; caption: string | null; mediaType: "IMAGE" | "VIDEO" }>;
  pricing?: Array<{ id: string; kind: "SERVICE" | "HEALTH_PACKAGE"; name: string; section: string; description: string | null; price: string; currency: string; billingPeriod: "ONE_OFF" | "MONTHLY" | "YEARLY" | null }>;
  teamMembers?: Array<{ id: string; name: string; role: string; bio: string | null; imageUrl: string | null; qualifications: string | null }>;
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

export interface BlogPostSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverUrl: string | null;
  category: BlogCategory | null;
  publishedAt: string;
  author: { firstName: string; lastName: string; avatar: string | null };
}

export interface BlogPost extends BlogPostSummary {
  content: string;
}

export interface Sponsorship {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  websiteUrl: string | null;
}
