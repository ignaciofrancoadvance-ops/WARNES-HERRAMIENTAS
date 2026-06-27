import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Service } from "@/components/Service";
import { Gallery } from "@/components/Gallery";
import { Testimonials } from "@/components/Testimonials";
import { Faq } from "@/components/Faq";
import { CalendlySection } from "@/components/CalendlySection";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Service />
        <Gallery />
        <Testimonials />
        <Faq />
        <CalendlySection />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
