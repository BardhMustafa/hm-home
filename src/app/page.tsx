import { Header } from "@/components/home/header";
import { Hero } from "@/components/home/hero";
import { CategoryStrip } from "@/components/home/category-strip";
import { ValuesStrip } from "@/components/home/values-strip";
import { ShowroomCTA } from "@/components/home/showroom-cta";
import { Footer } from "@/components/home/footer";

export default function HomePage() {
  return (
    <>
      <div style={{ position: "relative" }}>
        <Header overlay />
        <Hero />
      </div>
      <CategoryStrip />
      <ValuesStrip />
      <ShowroomCTA />
      <Footer />
    </>
  );
}
