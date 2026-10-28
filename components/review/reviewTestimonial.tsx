import React from "react";
import Image from "next/image";
import { Star, Quote } from "lucide-react";

const testimonials = [
    { id: 1, image: "/images/person-1.png", name: "Sarah M.", subName: "Bristol", text: "Our rescue dog gets nervous at the vet. My Vet helped us find a nearby practice that took its time and let him settle before his check-up.", rating: 5, background: "/images/perp-1.png" },
    { id: 2, image: "/images/person-2.jpg", name: "Daniel R.", subName: "Leeds", text: "We needed a new vet after moving with our two cats. Having opening hours and services together made it much easier to choose who to call.", rating: 5, background: "/images/perp-2.png" },
    { id: 3, image: "/images/person-2.jpg", name: "James W.", subName: "York", text: "Finding a practice with rabbit experience was my priority. The directory gave me a useful shortlist, and I called to discuss our rabbit's needs.", rating: 4, background: "/images/perp-1.png" },
    { id: 4, image: "/images/person-4.png", name: "Emma L.", subName: "Bath", text: "I compared local services before booking a dental check for our older spaniel. It helped me know what to ask when I rang for an estimate.", rating: 5, background: "/images/perp-2.png" },
    { id: 5, image: "/images/person-1.png", name: "Claire P.", subName: "Exeter", text: "Our usual practice had changed its hours, so I needed somewhere open on Saturdays. I found a local option and checked availability by phone.", rating: 4, background: "/images/perp-1.png" },
    { id: 6, image: "/images/person-2.jpg", name: "Oliver B.", subName: "Manchester", text: "As a first-time puppy owner, I had plenty of questions. Comparing practices helped me choose a team who explained vaccinations and routine care clearly.", rating: 5, background: "/images/perp-2.png" },
    { id: 7, image: "/images/person-2.jpg", name: "Thomas H.", subName: "Norwich", text: "We wanted to register our elderly cat closer to home. The practice details made the search straightforward, and we arranged an introductory appointment.", rating: 5, background: "/images/perp-1.png" },
    { id: 8, image: "/images/person-4.png", name: "Lucy A.", subName: "Cardiff", text: "I liked being able to compare a few practices before deciding. We called two surgeries and chose the one whose hours suited our working week.", rating: 4, background: "/images/perp-2.png" },
    { id: 9, image: "/images/person-1.png", name: "Hannah C.", subName: "Nottingham", text: "We needed advice about ongoing care for our dog. My Vet helped us find local practices offering the services we wanted to discuss in person.", rating: 5, background: "/images/perp-1.png" },
];

const ReviewBlog = () => {
    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
                <p className="mb-8 text-center text-sm text-gray-500">Sample reviews with illustrative portraits. These examples are not verified customer testimonials.</p>
                {/* GRID CARDS */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {testimonials.map((testimonial) => (
                        <div
                            key={testimonial.id}
                            className="relative px-6 max-sm:px-12 md:px-12 py-14 rounded-lg min-h-[380px] flex flex-col  bg-white "
                            style={{
                                backgroundImage: `url(${testimonial.background})`,
                                backgroundSize: "contain",
                                backgroundPosition: "center",
                                backgroundRepeat: "no-repeat",
                            }}
                        >
                            <Quote className="absolute bottom-24 right-8 max-sm:right-14 w-10 h-10 text-[#fff] fill-[#044A55]" />

                            {/* Image + Name */}
                            <div className="flex gap-4">
                                <Image
                                    src={testimonial.image}
                                    alt={testimonial.name}
                                    width={80}
                                    height={80}
                                    className="w-16 h-16 rounded-full object-cover"
                                />

                                <div className="flex flex-col pt-1">
                                    <h3 className="text-xl font-medium font-heading text-foreground">
                                        {testimonial.name}
                                    </h3>
                                    <span className="text-primary text-sm">{testimonial.subName}</span>
                                </div>
                            </div>

                            {/* Text */}
                            <p className="mt-4 text-gray-600 text-sm  leading-relaxed">
                                {testimonial.text}
                            </p>

                            {/* Rating */}
                            <div className="flex mt-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ReviewBlog;
