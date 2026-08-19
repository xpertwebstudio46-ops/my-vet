import Image from "next/image";

const features = [
    "Trusted Vet Network",
    "Verified Veterinary Listings",
    "Easy Pet Care Access",
    "Nationwide Coverage Platform",
    "Real Pet Reviews",
    "Grow Vet Practices",
];

export default function OurStorySection() {
    return (
        <section className="py-20">
            <div className="max-w-[90%] mx-auto grid items-center gap-12 lg:grid-cols-2">
                {/* Left Content */}
                <div className="relative">
                    <img src="/images/pa.png" className="absolute -top-30 left-0" alt="" />
                    <div className="flex flex-col items-start gap-2">

                        {/* Top Wave */}
                        <svg
                            viewBox="0 0 180 12"
                            className="w-26 h-3"
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
                                Our Story
                            </span>
                        </div>

                        {/* Bottom Wave */}
                        <svg
                            viewBox="0 0 180 12"
                            className="w-26 h-3"
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

                    <h2 className="mt-3  font-bold leading-tight text-[#0d2e5e] text-[48px]">
                        We are fully committed to better veterinary care
                    </h2>

                    <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-500">
                        For over 12 years, MY VET has been helping pet owners connect with
                        trusted veterinary practices. We make it easier to find reliable
                        care so every pet gets the attention they deserve.
                    </p>

                    <div className=" mt-8 grid gap-x-8 gap-y-4 sm:grid-cols-2">

                        {features.map((feature) => (
                            <div key={feature} className="flex  items-center gap-3">
                                <span className="flex h-5 w-5 items-center justify-center  border-2 border-[#13b8a8]">

                                    <svg
                                        className="h-3 w-3 text-[#13b8a8]"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            d="M5 13l4 4L19 7"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={3}
                                        />
                                    </svg>
                                </span>

                                <span className="text-sm text-slate-600">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Image */}
                <div className="flex justify-center lg:justify-end">
                    <Image
                        src="/images/cat-and-dog.png"
                        alt="Cat and Dog"
                        width={550}
                        height={550}
                        className="h-auto w-full max-w-[550px] object-contain"
                    />
                </div>
            </div>
        </section>
    );
}