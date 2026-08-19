
import { vet } from "@/data/card";
import VetCard from "./VetCard";

const VetGrid = () => {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      {vet.map((item) => (
        <VetCard key={item.id} vet={item} />
      ))}
    </div>
  );
};

export default VetGrid;