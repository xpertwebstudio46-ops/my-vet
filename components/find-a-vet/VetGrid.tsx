
import VetCard from "./VetCard";
import type { PracticeCardData } from "@/lib/practice-cards";

const VetGrid = ({ practices }: { practices: PracticeCardData[] }) => {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      {practices.map((item) => (
        <VetCard key={item.id} vet={item} />
      ))}
      {!practices.length && <p className="col-span-full py-12 text-center text-slate-500">No approved practices have been published yet.</p>}
    </div>
  );
};

export default VetGrid;
