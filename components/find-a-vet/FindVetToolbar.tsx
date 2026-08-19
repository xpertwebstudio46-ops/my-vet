import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FindVetToolbar = () => {
  return (
    <div className="mb-8 flex flex-col gap-4 bg-white border border-gray-500/15 rounded-lg shadow-lg p-5 md:flex-row md:items-center md:justify-between">
      {/* Left */}
      <h2 className="text-[16px] font-medium text-[#475569]">
        Showing <span className="font-bold text-[#064071]">104</span> Practices
      </h2>

      {/* Right */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-500">
          Sort By
        </span>

        <Select defaultValue="recommended">
          <SelectTrigger className="w-[200px] rounded-md bg-gray-500/10 p-5 border-gray-200">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="recommended">
              Recommended
            </SelectItem>

            <SelectItem value="highest-rated">
              Highest Rated
            </SelectItem>

            <SelectItem value="newest">
              Newest
            </SelectItem>

            <SelectItem value="distance">
              Distance
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default FindVetToolbar;