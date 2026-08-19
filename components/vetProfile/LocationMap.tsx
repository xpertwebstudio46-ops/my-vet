export default function LocationMap({
  mapEmbedSrc = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.618!2d-2.2426!3d53.4808!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sManchester!5e0!3m2!1sen!2suk!4v1600000000000",
}: {
  mapEmbedSrc?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-2 overflow-hidden">
      <div className="w-full h-[160px] sm:h-[180px] rounded-xl overflow-hidden">
        <iframe
          title="Practice location map"
          src={mapEmbedSrc}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}