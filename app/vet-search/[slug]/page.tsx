import { notFound } from "next/navigation";
import Header from "@/components/Header";
import AboutPracticeSection from "@/components/vetProfile/AboutPracticeSection";
import ContactInfoCard from "@/components/vetProfile/ContactInfoCard";
import LeaveReviewForm from "@/components/vetProfile/LeaveReviewForm";
import LocationMap from "@/components/vetProfile/LocationMap";
import PetOwnerReviews from "@/components/vetProfile/PetOwnerReviews";
import VetProfile from "@/components/vetProfile/ProfileHero";
import { PublicPracticeDetails } from "@/components/vetProfile/PublicPracticeDetails";
import Footer from "@/components/Footer";
import { ApiRequestError, getPractice, getPracticeReviews } from "@/lib/api/server";

export const dynamic = "force-dynamic";

export default async function VetProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let practice;
  try {
    practice = await getPractice(slug);
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) notFound();
    throw error;
  }
  const reviews = await getPracticeReviews(practice.id);
  const address = [practice.addressLine1, practice.addressLine2, practice.city, practice.county, practice.postcode, "United Kingdom"].filter(Boolean).join(", ");
  const [description, mission] = (practice.description ?? "Contact this practice to learn more about its veterinary care.").split(/\n\n/, 2);
  const mapEmbedSrc = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
  const reviewCards = reviews.items.map((review) => ({
    id: review.id,
    name: `${review.user.firstName} ${review.user.lastName.slice(0, 1)}.`,
    timeAgo: new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(review.createdAt)),
    rating: review.rating,
    comment: review.comment,
    avatarInitial: review.user.firstName.slice(0, 1).toUpperCase(),
  }));

  return (
    <div>
      <div className="relative">
        <div className="absolute top-4 left-0 right-0 z-50"><Header /></div>
        <VetProfile name={practice.name} bannerUrl={practice.bannerUrl} rating={Number(practice.rating)} reviewCount={practice.reviewCount} address={address} phone={practice.phone} practiceId={practice.id} membershipType={practice.membershipType} />
      </div>
      <div className="w-full bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 flex flex-col gap-8">
            <AboutPracticeSection name={practice.name} description={description} mission={mission} services={practice.services ?? []} facilities={practice.facilities ?? []} animalTypes={practice.animalTypes?.map(({ animalType }) => animalType.name) ?? []} />
            <PublicPracticeDetails practice={practice} />
            <PetOwnerReviews reviews={reviewCards} averageRating={Number(practice.rating)} totalReviews={practice.reviewCount} />
            <LeaveReviewForm practiceId={practice.id} />
          </div>
          <div className="flex flex-col gap-6">
            <ContactInfoCard practiceId={practice.id} address={address} phone={practice.phone} openingHours={practice.openingHours ?? []} />
            <LocationMap mapEmbedSrc={mapEmbedSrc} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
