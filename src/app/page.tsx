import { Header } from "@/components/home/header";
import { Hero } from "@/components/home/hero";
import { CategoryStrip } from "@/components/home/category-strip";
import { Featured } from "@/components/home/featured";
import { Footer } from "@/components/home/footer";

export default function HomePage() {
  return (
    <>
      <div style={{ position: "relative" }}>
        <Header overlay />
        <Hero />
      </div>
      <CategoryStrip />
      <Featured />
      <Footer />
    </>
  );
}
