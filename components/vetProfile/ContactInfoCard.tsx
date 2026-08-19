import { MapPin, Phone, Clock } from "lucide-react";

const openingHours = [
  { day: "Monday", hours: "8:00 AM - 7:00 PM" },
  { day: "Tuesday", hours: "8:00 AM - 7:00 PM" },
  { day: "Wednesday", hours: "8:00 AM - 7:00 PM" },
  { day: "Thursday", hours: "8:00 AM - 7:00 PM" },
  { day: "Friday", hours: "8:00 AM - 7:00 PM" },
  { day: "Saturday", hours: "9:00 AM - 1:00 PM" },
  { day: "Sunday", hours: "Emergency Only", isEmergency: true },
];

export default function ContactInfoCard({
  address = "123 Greenfield Road, Manchester, M1 1AB, United Kingdom",
  phone = "0161 123 4567",
  onContactClick,
}: {
  address?: string;
  phone?: string;
  onContactClick?: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      {/* Contact info */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="text-base font-bold text-[#0d2e5e]">Contact Info</h3>

        <div className="mt-4 flex flex-col gap-3">
          <div className="flex items-start gap-2.5">
            <MapPin
              className="h-4 w-4 shrink-0 mt-0.5"
              style={{ color: "#13b8a8" }}
            />
            <p className="text-sm text-slate-600 leading-relaxed">
              {address}
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Phone className="h-4 w-4 shrink-0" style={{ color: "#13b8a8" }} />
            <p className="text-sm text-slate-600">{phone}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onContactClick}
          className="mt-5 w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#13b8a8" }}
        >
          Contact Us
        </button>
      </div>

      {/* Opening hours */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" style={{ color: "#13b8a8" }} />
          <h3 className="text-base font-bold text-[#0d2e5e]">
            Opening Hours
          </h3>
        </div>

        <div className="mt-4 flex flex-col gap-2.5">
          {openingHours.map(({ day, hours, isEmergency }) => (
            <div key={day} className="flex items-center justify-between text-sm">
              <span className="text-slate-500">{day}</span>
              <span
                className={
                  isEmergency ? "font-medium text-red-500" : "text-slate-900"
                }
              >
                {hours}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-lg bg-red-50 px-3 py-2.5 text-xs text-red-500 leading-relaxed">
          On Sunday, only emergency service is available for registered
          clients. Call ahead to confirm.
        </div>
      </div>
    </div>
  );
}