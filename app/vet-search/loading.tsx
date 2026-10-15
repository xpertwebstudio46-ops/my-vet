import Hero from "@/components/find-a-vet/Hero";
import DirectorySkeleton from "@/components/directory/DirectorySkeleton";

export default function Loading() {
  return <><Hero /><section className="py-10 sm:py-16"><div className="container mx-auto max-w-7xl px-4"><DirectorySkeleton /></div></section></>;
}
