export interface Vet {
  id: number;
  slug: string;
  image: string;
  name: string;
  location: string;
  miles: string;
  rating: number;
  reviewCount: number;
  tags: string[];
  description: string;
  href: string;
}

export const vet: Vet[] = [
  {
    id: 1,
    slug: "greenfield-veterinary-surgery",
    image: "/images/practice-1.png",
    name: "Greenfield Veterinary Surgery",
    location: "Manchester, UK",
    miles: "2.4 miles away",
    rating: 4.9,
    reviewCount: 248,
    tags: ["Small Animals", "Emergency Care", "Surgery"],
    description:
      "It is a long established fact that a reader will be page when looking at its layout.",
    href: "/find-a-vet/greenfield-veterinary-surgery",
  },
  {
    id: 2,
    slug: "riverside-animal-clinic",
    image: "/images/vet-1.png",
    name: "Riverside Animal Clinic",
    location: "Bristol, UK",
    miles: "5.8 miles away",
    rating: 4.8,
    reviewCount: 186,
    tags: ["Exotics", "Small Animals", "Dental"],
    description:
      "It is a long established fact that a reader will be page when looking at its layout.",
    href: "/find-a-vet/riverside-animal-clinic",
  },
  {
    id: 3,
    slug: "highland-farm-vets",
    image: "/images/practice-3.png",
    name: "Highland Farm Vets",
    location: "Edinburgh, UK",
    miles: "8.1 miles away",
    rating: 4.7,
    reviewCount: 312,
    tags: ["Equine", "Farm Animals", "Mobile"],
    description:
      "It is a long established fact that a reader will be page when looking at its layout.",
    href: "/find-a-vet/highland-farm-vets",
  },
  {
    id: 4,
    slug: "oakwood-pet-health-centre",
    image: "/images/vet-2.png",
    name: "Oakwood Pet Health Centre",
    location: "Birmingham, UK",
    miles: "1.9 miles away",
    rating: 5.0,
    reviewCount: 421,
    tags: ["Vaccinations", "Diagnostics", "Surgery"],
    description:
      "It is a long established fact that a reader will be page when looking at its layout.",
    href: "/find-a-vet/oakwood-pet-health-centre",
  },
];
