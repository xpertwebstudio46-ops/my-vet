// Single source of truth for vet data + its type.
// Both app/find-a-vet/page.tsx (listing) and
// app/find-a-vet/[slug]/page.tsx (profile) import from here.

export interface Vet {
  id: number;
  slug: string;
  name: string;
  image: string;
  location: string;
  rating: number;
  reviewCount: number;
  tags: string[];
  featured?: boolean;

  // extra fields used on the [slug] profile page —
  // optional so the listing page doesn't need all of them
  description?: string;
  mission?: string;
  phone?: string;
  address?: string;
}

export const vet: Vet[] = [
  {
    id: 1,
    slug: "oakwood-veterinary-centre",
    name: "Oakwood Veterinary Centre",
    image: "/images/vet-1.png",
    location: "Leeds, UK",
    rating: 4.9,
    reviewCount: 312,
    tags: ["Vaccinations", "Surgery", "Dental Care"],
    featured: true,
    description:
      "Oakwood Veterinary Centre has been providing exceptional care to the pets of Leeds for over 20 years. Our state-of-the-art facility is equipped with the latest technology to ensure your furry family members receive the best possible treatment.",
    mission:
      "To provide compassionate, comprehensive and advanced veterinary care while maintaining a warm, welcoming environment for both pets and their owners.",
    phone: "0113 123 4567",
    address: "12 Oakwood Lane, Leeds, LS1 1AB, United Kingdom",
  },
  {
    id: 2,
    slug: "meadow-view-equine-clinic",
    name: "Meadow View Equine Clinic",
    image: "/images/vet-2.png",
    location: "York, UK",
    rating: 4.8,
    reviewCount: 187,
    tags: ["Lameness Exams", "Dentistry", "Mobile Unit"],
    featured: true,
    description:
      "Meadow View Equine Clinic specializes in horse health across Yorkshire, offering both in-clinic and mobile veterinary services for equine care of all kinds.",
    mission:
      "To keep every horse in our care healthy, comfortable, and performing at its best through expert, compassionate treatment.",
    phone: "01904 123 456",
    address: "45 Meadow View Road, York, YO1 2CD, United Kingdom",
  },
  {
    id: 3,
    slug: "city-pets-hospital",
    name: "City Pets Hospital",
    image: "/images/practice-3.png",
    location: "London, UK",
    rating: 4.6,
    reviewCount: 254,
    tags: ["24/7 Emergency", "ICU", "Imaging"],
    featured: false,
    description:
      "City Pets Hospital is central London's trusted round-the-clock emergency and general veterinary hospital, staffed by experienced vets and nurses.",
    mission:
      "To be there for pets and their owners in every moment that matters, day or night.",
    phone: "020 7123 4567",
    address: "8 City Road, London, EC1V 2NX, United Kingdom",
  },
  {
    id: 4,
    slug: "countryside-farm-vets",
    name: "Countryside Farm Vets",
    image: "/images/practice-2.png",
    location: "Devon, UK",
    rating: 4.7,
    reviewCount: 98,
    tags: ["Herd Health", "TB Testing", "Emergency Calving"],
    featured: false,
    description:
      "Countryside Farm Vets supports livestock farmers across Devon with routine herd health, emergency callouts, and specialist large-animal expertise.",
    mission:
      "To support the health and productivity of farm animals through practical, on-site veterinary care farmers can rely on.",
    phone: "01392 123 456",
    address: "Fieldgate Farm, Devon, EX1 3AB, United Kingdom",
  },
];
