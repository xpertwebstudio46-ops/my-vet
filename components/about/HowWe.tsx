import Image from "next/image";
import InvertedCorner from "../sharedComponents/InvertedSvg";


const steps = [
  {
    number: "01",
    title: "Schedule a consultation",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
  },
  {
    number: "02",
    title: "Grooming Experts Comes To You",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
  },
  {
    number: "03",
    title: "Grooming & Baths Your Pets",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
  },
];

function CheckIcon() {
  return (
    <span
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
      style={{ backgroundColor: "#e6f7f5" }}
    >
      <svg
        className="h-3.5 w-3.5"
        style={{ color: "#13b8a8" }}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={3}
          d="M5 13l4 4L19 7"
        />
      </svg>
    </span>
  );
}

export default function HowWe() {
  return (
    <section className=" py-16  ">
      <div className="mx-auto max-w-[90%]">
        {/* Heading */}
        <div className="text-center mb-12">
          <div className="flex flex-col items-center gap-2">

            {/* Top Wave */}
            <svg
              viewBox="0 0 180 12"
              className="w-30 h-3"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0 6
                  Q10 0 20 6
                  T40 6
                  T60 6
                  T80 6
                  T100 6
                  T120 6
                  T140 6
                  T160 6
                  T180 6"
                stroke="#000"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="1 8"
              />
            </svg>

            {/* Badge */}
            <div className="flex items-center gap-2">
              <Image
                src="/images/bones.png"
                alt=""
                width={400}
                height={400}
                className="w-6 h-6"
              />
              <span className="text-sm font-semibold text-[#13b8a8]">
                How We Help
              </span>
            </div>

            {/* Bottom Wave */}
            <svg
              viewBox="0 0 180 12"
              className="w-30 h-3"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0 6
                  Q10 0 20 6
                  T40 6
                  T60 6
                  T80 6
                  T100 6
                  T120 6
                  T140 6
                  T160 6
                  T180 6"
                stroke="#000"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="1 8"
              />
            </svg>

          </div>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-[#0d2e5e]">
            How We Help Your Pet
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Easily find and book trusted Pet Caregivers near you
          </p>
        </div>

        {/* Content */}
        <div className="relative grid lg:grid-cols-2 gap-8 items-start">
          {/* Left — vet image */}
          <div className="relative w-full h-[340px] sm:h-[460px] rounded-[24px] overflow-hidden">
            <Image
              src="/images/how.png"
              alt="Vets grooming a dog"
              fill
              sizes="(max-width: 1024px) 100vw, 20vw"
              className="object-cover"
            />
          </div>

          {/* Right — step cards */}
          <div className="flex flex-col gap-5">
            {steps.map((step) => (
              <div
                key={step.number}
                className="relative rounded-2xl p-5 pr-14"
                style={{ backgroundColor: "#f4f5f7" }}
              >
                <div className="flex items-center gap-3">
                  <CheckIcon />
                  <h3 className="font-semibold text-[#0d2e5e]">
                    {step.title}
                  </h3>
                </div>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed pl-9">
                  {step.description}
                </p>

                {/* Step number, top-right */}
                <span className="absolute top-1.5 z-10 right-2 text-sm font-bold text-slate-400">
                  {step.number}
                </span>

                {/* Inverted corner notch — top-right of the gray box, sits
                    behind/beside the number to create the concave cut.
                    color must match the section's background (white), not
                    the gray card, so it "erases" a quarter circle from the
                    card's corner. */}
                <InvertedCorner
                  corner="tr"
                  size={30}
                  color="#ffffff"
                  className="absolute top-0 right-0 "
                />
              </div>
            ))}
          </div>

          {/* Decorative cat illustration — overlaps bottom-right of the image / step 3 */}
          <div className="hidden sm:block absolute -bottom-10 right-0 w-23 h-42 pointer-events-none">
            <Image
              src="/images/cat.png"
              alt=""
              fill
              sizes="100px"
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}