const logos = [
    { src: '/images/Frame 34.png', alt: 'Sheba' },
    { src: '/images/Frame 35.png', alt: 'Brand Logo' },
    { src: '/images/Frame 36.png', alt: 'Brand Logo' },
    { src: '/images/Frame 37.png', alt: 'Brand Logo' },
    { src: '/images/Frame 39.png', alt: 'Brand Logo' },
    { src: '/images/Frame 41.png', alt: 'Brand Logo' },
]

const Partner = () => {
    const track = [...logos, ...logos]

    return (
        <section className="py-10 bg-white  overflow-hidden">
            <h1 className="font-bold text-center mb-10 font-heading text-[48px] text-[#064071]">Our Current <span className="text-teal-500">Partner</span></h1>
            <div
                className="flex items-center"
                style={{
                    animation: 'marquee 18s linear infinite',
                    width: 'max-content',
                }}
            >
                {track.map((logo, i) => (
                    <div
                        key={i}
                        className="shrink-0 mx-8 flex items-center justify-center"
                        style={{
                            width: '180px',
                            height: '80px',
                            background: '#ffffff',
                            borderRadius: '12px',
                            padding: '8px 16px',
                        }}
                    >
                        <img
                            src={logo.src}
                            alt={logo.alt}
                            className="logo-img"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }}
                        />
                    </div>
                ))}
            </div>

            <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .logo-img {
          transition: opacity 0.3s;
        }
        .logo-img:hover {
          opacity: 0.8;
        }
      `}</style>
        </section>
    )
}

export default Partner
