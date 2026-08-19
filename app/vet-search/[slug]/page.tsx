import { notFound } from "next/navigation";
import Header from "@/components/Header";
import AboutPracticeSection from "@/components/vetProfile/AboutPracticeSection";
import ContactInfoCard from "@/components/vetProfile/ContactInfoCard";
import LeaveReviewForm from "@/components/vetProfile/LeaveReviewForm";
import LocationMap from "@/components/vetProfile/LocationMap";
import PetOwnerReviews from "@/components/vetProfile/PetOwnerReviews";
import { vet as findAVetListings } from "@/data/card";
import { vet as directoryListings } from "@/data/directory";
import VetProfile from "@/components/vetProfile/ProfileHero";
import Footer from "@/components/Footer";


export default async function VetProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const vetProfile = [...findAVetListings, ...directoryListings].find(
    (item) => item.slug === slug
  );

  if (!vetProfile) {
    notFound();
  }

  const address =
    "address" in vetProfile && vetProfile.address
      ? vetProfile.address
      : vetProfile.location;
  const phone =
    "phone" in vetProfile && vetProfile.phone ? vetProfile.phone : undefined;

  return (
    <div>
      {/* Hero image with Header overlaid on top of it */}
      <div className="relative">
        <div className="absolute top-4 left-0 right-0 z-50">
          <Header />
        </div>
        <VetProfile name={vetProfile.name} />
      </div>

      <div className="w-full bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl grid lg:grid-cols-3 gap-8 items-start">
          {/* Left / main column */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            <AboutPracticeSection
              name={vetProfile.name}
              description={vetProfile.description}
            />
            <PetOwnerReviews
              averageRating={vetProfile.rating}
              totalReviews={vetProfile.reviewCount}
            />
            <LeaveReviewForm />
          </div>

          {/* Right / sidebar column */}
          <div className="flex flex-col gap-6">
            <ContactInfoCard address={address} phone={phone} />
            <LocationMap />
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}
