"use client";

import { useState } from "react";
import Image from "next/image";
import {
    Phone,

} from "lucide-react";

const members = [
    {
        id: 1,
        thumb: "/images/person-1.png",
        image: "/images/center-big.png",
        name: "Alina Maisner",
        role: "Pet Sitter",
        description:
            "Emma leads our team with a passion for animal welfare and years of experience. Although expert groomers themselves, lots of cats like being brushed and it's a great way of bonding with your cat. As well as fewer hairballs and less shedding, grooming your cats will imitate how they groom each other naturally and increase affection for you as a result.",
    },
    {
        id: 2,
        thumb: "/images/person-2.png",
        image: "/images/center-big-2.png",
        name: "David Smith",
        role: "Pet Coordinator",
        description:
            "David ensures every pet receives the best care possible. He coordinates appointments and works closely with the veterinary staff to provide a smooth experience for every pet owner.",
    },
    {
        id: 3,
        thumb: "/images/person-3.png",
        image: "/images/center-big-3.png",
        name: "Emma Brown",
        role: "Veterinarian",
        description:
            "Emma is an experienced veterinarian specializing in surgery, diagnostics, and preventive healthcare. She believes every pet deserves compassionate treatment.",
    },
    {
        id: 4,
        thumb: "/images/bt.jpg",
        image: "/images/bt.jpg",
        name: "Mary Douglas",
        role: "Groomer",
        description:
            "Mary specializes in professional grooming services. She ensures every pet looks and feels their best while providing a stress-free grooming experience.",
    },
];

export default function TeamMembers() {
    const [active, setActive] = useState(0);

    const member = members[active];

    return (
        <section className="max-w-7xl mx-auto px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
            {/* Heading */}
            <div className="mb-10 sm:mb-16">
                <div className="flex items-center gap-2 mb-4">


                    <div className="flex flex-col items-start gap-2">

                        {/* Top Wave */}
                        <svg
                            viewBox="0 0 180 12"
                            className="w-35 h-3"
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
                                strokeWidth="2"
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
                                Team Members
                            </span>
                        </div>

                        {/* Bottom Wave */}
                        <svg
                            viewBox="0 0 180 12"
                            className="w-35 h-3"
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
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeDasharray="1 8"
                            />
                        </svg>

                    </div>
                </div>

                <h2 className="text-[32px] font-bold leading-tight text-[#064071] font-heading sm:text-[40px]">
                    Loyal,
                    <span className="text-[#01AEAD]"> Passionate, </span>
                    and Driven
                </h2>

                <p className="mt-5 text-gray-500 max-w-xl font-sans font-normal text-[16px]">
                    Our team is made up of dedicated individuals who share a common love
                    for animals.
                </p>
            </div>

            {/* Slider */}
            <div className="grid gap-8 items-center lg:grid-cols-[280px_420px_1fr] lg:gap-14">
                {/* Left */}
                <div className="relative">
                    <div className="absolute left-0 top-0 w-[3px] h-full bg-[#15c8be]" />

                    <div className="space-y-8 pl-8">
                        {members.map((item, index) => (
                            <button
                                key={item.id}
                                onClick={() => setActive(index)}
                                className="flex items-center gap-4 w-full text-left group"
                            >
                                <Image
                                    src={item.thumb}
                                    alt={item.name}
                                    width={70}
                                    height={70}
                                    className={`rounded-full transition duration-300 border-2 ${active === index
                                        ? "border-[#15c8be] scale-105"
                                        : "border-transparent opacity-70 group-hover:opacity-100"
                                        }`}
                                />

                                <div>
                                    <h4 className="font-bold text-[#143B66]">{item.name}</h4>

                                    <p className="text-sm text-gray-500">{item.role}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Center */}
                <div className="flex justify-center">
                    <div className="rounded-2xl overflow-hidden ">
                        <Image
                            src={member.image}
                            alt={member.name}
                            width={390}
                            height={510}
                            className="object-cover transition-all duration-500"
                        />
                    </div>
                </div>

                {/* Right */}
                <div>
                    <h3 className="text-[28px] font-heading font-bold text-black sm:text-[36px]">
                        {member.name}
                    </h3>

                    <p className="text-gray-500 ">{member.role}</p>

                    <p className="mt-6 leading-8 text-gray-500">
                        {member.description}
                    </p>

                    <button className="mt-10 flex items-center gap-3 rounded-full bg-[#15c8be] px-8 py-4 text-white hover:bg-[#12b3aa] transition">
                        <Phone size={18} />
                        Contact Us
                    </button>

                    <div className="flex items-center gap-4 mt-10">
                        <img src="images/ico-1.png" className="w-10 h-10 object-contain"  alt="" />
                        <img src="images/ico-2.png" className="w-10 h-10 object-contain"  alt="" />
                        <img src="images/ico-3.png" className="w-10 h-10 object-contain"  alt="" />
                        <img src="images/ico-4.png" className="w-10 h-10 object-contain"  alt="" />
                    </div>
                </div>
            </div>
        </section>
    );
}
