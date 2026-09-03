import type { Practice, PracticeMembershipType } from "@/lib/api/types";

export interface PracticeCardData {
  id: string;
  slug: string;
  name: string;
  image: string;
  location: string;
  rating: number;
  reviewCount: number;
  tags: string[];
  description: string;
  featured: boolean;
  membershipType: PracticeMembershipType;
  branchCount: number;
}

export function practiceMembershipLabel(membershipType?: PracticeMembershipType | null) {
  return membershipType === "GROUP" ? "Vet Group" : "Independent Practice";
}

export function toPracticeCard(practice: Practice): PracticeCardData {
  const serviceTags = practice.services?.map((service) => service.name) ?? [];
  const animalTags = practice.animalTypes?.map(({ animalType }) => animalType.name) ?? [];
  return {
    id: practice.id,
    slug: practice.slug,
    name: practice.name,
    image: practice.bannerUrl ?? practice.logoUrl ?? "/images/practice-1.png",
    location: [practice.city, practice.county ?? "UK"].filter(Boolean).join(", "),
    rating: Number(practice.rating),
    reviewCount: practice.reviewCount,
    tags: [...new Set([...serviceTags, ...animalTags])].slice(0, 4),
    description: practice.description ?? "View this practice’s services, opening hours and contact details.",
    featured: practice.isFeatured,
    membershipType: practice.membershipType ?? "INDEPENDENT",
    branchCount: practice.branchCount ?? 1,
  };
}
