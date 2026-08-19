// Mock data for the MY VET dashboard.
// Keep this file isolated so it can easily be swapped for real API data.

export type Practice = {
  id: string
  name: string
  image: string
  location: string
  distance: string
  rating: number
  reviews: number
  openNow: boolean
  tags: string[]
  description: string
}

export const currentUser = {
  firstName: 'Priya',
  lastName: 'Baksh',
  fullName: 'Priya Baksh',
  email: 'priya.kansal@email.com',
  phone: '+44 7700 900123',
  address: '14 Banbury Road, Oxford, OX2 6NN',
  avatar:
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  location: 'Oxford',
}

export const pets = [
  {
    id: 'mochi',
    name: 'Mochi',
    type: 'Dog',
    breed: 'Cavapoo',
    age: '3 years',
    image:
      'https://images.unsplash.com/photo-1586671267731-da2cf3ceeb80?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'biscuit',
    name: 'Biscuit',
    type: 'Cat',
    breed: 'British Shorthair',
    age: '5 years',
    image:
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=300&q=80',
  },
]

export const practices: Practice[] = [
  {
    id: 'greenfield',
    name: 'Greenfield Veterinary Surgery',
    image:
      'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=800&q=80',
    location: 'Headington, Oxford',
    distance: '1.2 mi',
    rating: 4.8,
    reviews: 214,
    openNow: true,
    tags: ['Small animals', 'Emergency care', 'Surgery'],
    description:
      'A long-established practice offering high-quality care for cats, dogs and small animals.',
  },
  {
    id: 'riverside',
    name: 'Riverside Animal Clinic',
    image:
      'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=800&q=80',
    location: 'Botley, Oxford',
    distance: '2.4 mi',
    rating: 4.6,
    reviews: 176,
    openNow: true,
    tags: ['Cats', 'Dogs', 'Dental care'],
    description:
      'Modern facilities with a compassionate team dedicated to animal wellness.',
  },
  {
    id: 'highland',
    name: 'Highland Farm Vets',
    image:
      'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80',
    location: 'Kidlington, Oxford',
    distance: '4.6 mi',
    rating: 4.9,
    reviews: 98,
    openNow: false,
    tags: ['Large animals', 'Farm', 'Equine'],
    description:
      'Specialist large-animal veterinary services covering the wider Oxford region.',
  },
  {
    id: 'citycenter',
    name: 'City Center Pet Hospital',
    image:
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    location: 'Central Oxford',
    distance: '0.8 mi',
    rating: 4.7,
    reviews: 302,
    openNow: true,
    tags: ['Small animals', 'Emergency care', 'Diagnostics'],
    description:
      'State-of-the-art hospital providing round-the-clock emergency and specialist care.',
  },
  {
    id: 'cherwell',
    name: 'Cherwell Small Animal Vets',
    image:
      'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80',
    location: 'Summertown, Oxford',
    distance: '1.9 mi',
    rating: 4.5,
    reviews: 141,
    openNow: true,
    tags: ['Cats', 'Dogs', 'Vaccinations'],
    description:
      'A friendly neighbourhood clinic focused on preventative pet healthcare.',
  },
  {
    id: 'botley-emergency',
    name: 'Botley Emergency Vets 24/7',
    image:
      'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=800&q=80',
    location: 'Botley, Oxford',
    distance: '2.6 mi',
    rating: 4.4,
    reviews: 209,
    openNow: true,
    tags: ['Emergency care', '24/7', 'Critical care'],
    description:
      'Round-the-clock emergency veterinary service for urgent pet care needs.',
  },
  {
    id: 'meadow-lane',
    name: 'Meadow Lane Equine Practice',
    image:
      'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80',
    location: 'Wolvercote, Oxford',
    distance: '3.8 mi',
    rating: 4.8,
    reviews: 64,
    openNow: false,
    tags: ['Equine', 'Large animals'],
    description: 'Dedicated equine specialists serving stables across Oxfordshire.',
  },
  {
    id: 'willowbrook',
    name: 'Willowbrook Veterinary Clinic',
    image:
      'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=800&q=80',
    location: 'Marston, Oxford',
    distance: '2.1 mi',
    rating: 4.6,
    reviews: 188,
    openNow: true,
    tags: ['Small animals', 'Dental care', 'Vaccinations'],
    description: 'Compassionate everyday care for your family pets.',
  },
]

export type Appointment = {
  id: string
  petId: string
  petName: string
  title: string
  practice: string
  date: string
  time: string
  status: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled'
  type: 'Upcoming' | 'Previous'
}

export const appointments: Appointment[] = [
  {
    id: 'a1',
    petId: 'mochi',
    petName: 'Mochi',
    title: 'Booster vaccination',
    practice: 'Willowbrook Veterinary Clinic',
    date: '2 Nov 2026',
    time: '10:30',
    status: 'Confirmed',
    type: 'Upcoming',
  },
  {
    id: 'a2',
    petId: 'biscuit',
    petName: 'Biscuit',
    title: '6-month health check',
    practice: 'Cherwell Small Animal Vets',
    date: '24 Nov 2026',
    time: '14:00',
    status: 'Pending',
    type: 'Upcoming',
  },
  {
    id: 'a3',
    petId: 'mochi',
    petName: 'Mochi',
    title: 'Dental cleaning',
    practice: 'Riverside Animal Clinic',
    date: '12 Aug 2026',
    time: '09:15',
    status: 'Completed',
    type: 'Previous',
  },
  {
    id: 'a4',
    petId: 'biscuit',
    petName: 'Biscuit',
    title: 'Microchip & flea treatment',
    practice: 'City Center Pet Hospital',
    date: '3 Jun 2026',
    time: '16:45',
    status: 'Completed',
    type: 'Previous',
  },
]

export type Review = {
  id: string
  practice: string
  rating: number
  date: string
  body: string
  reply?: string
  helpful: number
}

export const reviews: Review[] = [
  {
    id: 'r1',
    practice: 'Willowbrook Veterinary Clinic',
    rating: 5,
    date: '14 Jun 2026',
    body: 'Absolutely fantastic experience. The nurses came out to the car to greet us and Mochi felt completely at ease. Friendly, thorough and efficient.',
    reply:
      'Thank you Priya — we are thrilled to hear it. We look forward to seeing Mochi again soon!',
    helpful: 12,
  },
  {
    id: 'r2',
    practice: 'Botley Emergency Vets 24/7',
    rating: 4,
    date: '2 Dec 2025',
    body: 'Seen quickly on a late-night call for a minor emergency. Prices could be a little clearer but the care was excellent.',
    helpful: 6,
  },
  {
    id: 'r3',
    practice: 'Riverside Animal Hospital',
    rating: 5,
    date: '18 Mar 2025',
    body: 'The appointment was cancelled last minute, but the clinic rebooked us the very next day and could not have been more helpful.',
    helpful: 9,
  },
]

export type SavedPractice = {
  id: string
  name: string
  location: string
  rating: number
  reviews: number
  openNow: boolean
}

export const savedPractices: SavedPractice[] = [
  {
    id: 's1',
    name: 'Willowbrook Veterinary Clinic',
    location: 'Marston, Oxford · 2.1 mi',
    rating: 4.6,
    reviews: 188,
    openNow: true,
  },
  {
    id: 's2',
    name: 'Riverside Animal Hospital',
    location: 'Botley, Oxford · 2.4 mi',
    rating: 4.6,
    reviews: 176,
    openNow: true,
  },
  {
    id: 's3',
    name: 'Botley Emergency Vets 24/7',
    location: 'Botley, Oxford · 2.6 mi',
    rating: 4.4,
    reviews: 209,
    openNow: false,
  },
]

export type NotificationItem = {
  id: string
  category: 'Reminders' | 'Replies' | 'Messages' | 'Appointment'
  title: string
  body: string
  time: string
  unread: boolean
}

export const notifications: NotificationItem[] = [
  {
    id: 'n1',
    category: 'Appointment',
    title: 'Appointment confirmed',
    body: 'Your booster vaccination for Mochi at Willowbrook Veterinary Clinic is confirmed for 2 Nov.',
    time: '2 hours ago',
    unread: true,
  },
  {
    id: 'n2',
    category: 'Replies',
    title: 'Willowbrook replied to your review',
    body: 'Thank you Priya — we are thrilled to hear it!',
    time: '1 day ago',
    unread: true,
  },
  {
    id: 'n3',
    category: 'Messages',
    title: 'New message from Cherwell Small Animal Vets',
    body: 'Hi Priya, just a reminder that Biscuit is due for a check-up.',
    time: '2 days ago',
    unread: false,
  },
  {
    id: 'n4',
    category: 'Reminders',
    title: "Reminder: Biscuit's MMR vaccine is due",
    body: 'Book an appointment to keep Biscuit up to date.',
    time: '4 days ago',
    unread: false,
  },
  {
    id: 'n5',
    category: 'Reminders',
    title: 'Flea & worming treatment due',
    body: 'Mochi is due for monthly flea and worming treatment.',
    time: '6 days ago',
    unread: false,
  },
]

export const faqs = [
  {
    q: 'How do I register my vet practice on MY VET?',
    a: 'Complete the sign-up form from the practice portal, verify your practice details and our team will review your listing within 48 hours.',
  },
  {
    q: 'Can I hide my exact address?',
    a: 'Yes. In your practice settings you can choose to display only your town or region rather than a full street address.',
  },
  {
    q: 'Why is a review not showing on my listing?',
    a: 'Reviews are moderated for spam and abuse. Genuine reviews typically appear within 24 hours of being submitted.',
  },
  {
    q: 'How do I add a second location?',
    a: 'From the practice dashboard select "Locations" and then "Add location" to create an additional listing.',
  },
  {
    q: 'What happens if I downgrade my plan?',
    a: 'Your listing remains live, but premium features such as featured placement and analytics will be paused.',
  },
  {
    q: 'How do I add a second location?',
    a: 'Each location gets its own profile, reviews and opening hours which you can manage independently.',
  },
  {
    q: 'What happens if I cancel my plan?',
    a: 'Your listing will be removed from search results at the end of your current billing period.',
  },
]

export const animalTypes = [
  'Small animals',
  'Cats',
  'Dogs',
  'Large animals',
  'Equine',
  'Exotic',
]

export const services = [
  'Emergency care',
  'Surgery',
  'Dental care',
  'Vaccinations',
  'Microchipping',
  'Grooming',
]
