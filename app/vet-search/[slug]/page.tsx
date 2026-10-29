import { notFound } from "next/navigation";
import Header from "@/components/Header";
import AboutPracticeSection from "@/components/vetProfile/AboutPracticeSection";
import ContactInfoCard from "@/components/vetProfile/ContactInfoCard";
import LeaveReviewForm from "@/components/vetProfile/LeaveReviewForm";
import PetOwnerReviews from "@/components/vetProfile/PetOwnerReviews";
import VetProfile from "@/components/vetProfile/ProfileHero";
import { PublicPracticeDetails } from "@/components/vetProfile/PublicPracticeDetails";
import { PricingConsumerInformation } from "@/components/vetProfile/PricingConsumerInformation";
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
  const publishedPricingItems = (practice.pricing ?? [])
    .filter((item) => item.kind === "SERVICE" && item.currency === "GBP" && (!item.billingPeriod || item.billingPeriod === "ONE_OFF") && item.price.trim() !== "" && Number.isFinite(Number(item.price)) && Number(item.price) >= 0)
    .map((item) => ({ service: item.vatMode === "EX_VAT" ? `${item.name} (ex VAT)` : item.name, price: Number(item.price), benchmarkPrice: null }));
  const pricingItems = publishedPricingItems.length > 0 ? publishedPricingItems : (practice.services ?? [])
    .filter((item) => item.currency === "GBP" && item.price !== null && item.price.trim() !== "" && Number.isFinite(Number(item.price)) && Number(item.price) >= 0)
    .map((item) => ({ service: item.name, price: Number(item.price), benchmarkPrice: null }));
  const address = [practice.addressLine1, practice.addressLine2, practice.city, practice.county, practice.postcode, "United Kingdom"].filter(Boolean).join(", ");
  const [description, mission] = (practice.description ?? "Contact this practice to learn more about its veterinary care.").split(/\n\n/, 2);
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
      <div className="practice-profile-banner relative">
        <svg aria-hidden="true" className="absolute h-0 w-0" focusable="false">
          <defs>
            <clipPath id="practice-logo-cutout" clipPathUnits="objectBoundingBox">
              <path d="M0,0 H1 L0.88,0.58 Q0.78,1 0.51,0.84 L0,0.32 Z" />
            </clipPath>
          </defs>
        </svg>
        <div aria-hidden="true" className="practice-logo-cutout pointer-events-none absolute left-0 top-0 z-20 bg-white" />
        <div className="public-hero-header absolute top-4 left-0 right-0 z-50"><Header /></div>
        <VetProfile name={practice.name} bannerUrl={practice.bannerUrl} bannerWidth={practice.bannerWidth} bannerHeight={practice.bannerHeight} bannerObjectFit={practice.bannerObjectFit} logoUrl={practice.logoUrl} rating={Number(practice.rating)} reviewCount={practice.reviewCount} address={address} phone={practice.phone} practiceId={practice.id} membershipType={practice.membershipType} />
      </div>
      <div className="w-full bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
          <div className="min-w-0 lg:col-span-2 flex flex-col gap-6 sm:gap-8">
            <AboutPracticeSection name={practice.name} membershipType={practice.membershipType} description={description} mission={mission} whatWeDo={practice.whatWeDo} careOptions={practice.careOptions ?? []} services={practice.services ?? []} calloutAreas={practice.calloutAreas ?? []} facilities={practice.facilities ?? []} animalTypes={practice.animalTypes?.map(({ animalType }) => animalType.name) ?? []} vetComparison={<PricingConsumerInformation items={pricingItems} />} />
            <PublicPracticeDetails practice={practice} />
            <PetOwnerReviews reviews={reviewCards} averageRating={Number(practice.rating)} totalReviews={practice.reviewCount} />
            <LeaveReviewForm practiceId={practice.id} />
          </div>
          <div className="min-w-0 flex flex-col gap-6">
            <ContactInfoCard practiceId={practice.id} address={address} phone={practice.phone} openingHours={practice.openingHours ?? []} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
