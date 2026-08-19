import Hero from "@/components/find-a-vet/Hero";
import FindVetFilters from "@/components/find-a-vet/FindVetFilters";
import FindVetToolbar from "@/components/find-a-vet/FindVetToolbar";
import VetGrid from "@/components/find-a-vet/VetGrid";
import FindVetPagination from "@/components/find-a-vet/FindVetPagination";

const Page = () => {
  return (
    <>
      <Hero />

      <section className="py-16">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid gap-8 lg:grid-cols-[280px_1fr] items-start">
            
            {/* Left Sidebar */}
            <FindVetFilters />

            {/* Right Content */}
            <div className="space-y-8">
              <FindVetToolbar />

              <VetGrid />

              <FindVetPagination />
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

export default Page;