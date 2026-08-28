import Image from "next/image";
import { CheckCircle2 } from "lucide-react";

const missionPoints = [
  "Safe & Supervised Environment — Your pet's safety is our top priority. All play and care areas are professionally supervised and sanitized daily.",
  "Personalized Attention — We treat every pet as an individual, tailoring care, feeding, and activities to their specific needs and temperament.",
];

export default function AboutMissionSection() {
  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="max-w-[90%] mx-auto">
        {/* Badge */}
        <span className="inline-flex items-center rounded-full border border-[#10B7A6] px-5 py-2 text-[12px] font-medium text-[#01AEAD]">
          About Our Company
        </span>

        {/* Heading */}
        <h2 className="mt-5 max-w-3xl text-[32px] font-bold font-heading leading-tight text-[#064071] sm:text-[40px]">
          Providing Loving Care for
          <br />
          <span className="text-[#01AEAD]">Your Pets</span>, Always.
        </h2>

        {/* Content */}
        <div className="mt-8 grid items-center gap-8 sm:mt-12 lg:mt-14 lg:grid-cols-[1.1fr_1fr] lg:gap-10">
          {/* Left Image */}
          <div className="overflow-hidden rounded-3xl">
            <Image
              src="/images/mission.png"
              alt="Veterinarian with Dog"
              width={650}
              height={500}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Right Content */}
          <div>
            <h3 className="text-[28px] font-bold text-black sm:text-[36px]">
              Our Mission
            </h3>

            <p className=" text-[14px] font-sans font-normal leading-6 text-[#4E4E4E]">
              Lorem Ipsum is simply dummy text of the printing and
              typesetting industry. Lorem Ipsum has been the industry&apos;s
              standard dummy text ever since the 1500s, when an unknown
              printer took a galley of type and scrambled it to make a type
              specimen book. It has survived not only five centuries, but
              also the leap into electronic typesetting, remaining
              essentially unchanged.
            </p>

            <div className="mt-8 space-y-6">
              {missionPoints.map((point) => (
                <div key={point} className="flex items-start gap-4">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E7FAF8]">
                    <CheckCircle2
                      size={18}
                      className="text-[#10B7A6]"
                    />
                  </div>

                  <p className="text-sm leading-7 text-[#606060]">
                    {point}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
