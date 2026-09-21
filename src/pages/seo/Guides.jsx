import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { trackEvent } from "@/lib/tracking";
import { BookOpen, ArrowRight, MapPin } from "lucide-react";
import { SEO_LOCATIONS, locationPath } from "@/lib/seoConfig";
import BackButton from "@/components/BackButton";
import Logo from "@/components/Logo";
import Footer from "@/components/home/Footer";

export default function Guides() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trackEvent("page_view", { page: "/guides" });
    base44.entities.GeneratedPage.filter({ status: "published" })
      .then((rows) => setPages(rows))
      .catch(() => setPages([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white min-h-screen">
      <section className="bg-stone-950 text-white px-6 pt-16 pb-14">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <BackButton className="text-stone-300 hover:text-white" showLabel={false} />
              <Logo />
            </div>
            <Link to="/funnel" className="text-sm text-amber-400 hover:text-amber-300 font-semibold">Free Estimate →</Link>
          </div>
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.25em] text-amber-400">
            <BookOpen className="h-4 w-4" /> GUIDES
          </div>
          <h1 className="mt-4 text-4xl md:text-6xl font-bold tracking-tight">Garage floor guides</h1>
          <p className="mt-4 text-stone-300 max-w-2xl leading-relaxed">
            In-depth, expert-written guides on epoxy garage floor costs, systems, preparation, and installation.
            Get a personalized estimate in 60 seconds.
          </p>
        </div>
      </section>

      <section className="px-6 py-14">
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-stone-200 border-t-stone-800 rounded-full animate-spin" />
            </div>
          ) : pages.length === 0 ? (
            <p className="text-stone-500 text-center py-12">No guides yet — check back soon.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pages.map((p) => (
                <Link
                  key={p.id}
                  to={`/${p.slug}`}
                  className="group rounded-xl border border-stone-200 bg-white p-5 hover:border-amber-300 hover:shadow-sm transition flex flex-col"
                >
                  <div className="font-semibold text-stone-900 leading-snug group-hover:text-amber-700 transition">{p.h1 || p.title}</div>
                  {p.meta_description && (
                    <div className="mt-2 text-sm text-stone-500 line-clamp-3">{p.meta_description}</div>
                  )}
                  <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                    Read guide <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="px-6 py-12 bg-stone-50 border-t border-stone-200">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-semibold text-stone-900 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-amber-500" /> Find your city
          </h2>
          <p className="mt-2 text-sm text-stone-500">We serve garage floor customers nationwide. Browse local cost pages:</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {SEO_LOCATIONS.slice(0, 24).map((l) => (
              <Link
                key={`${l.state}-${l.city}`}
                to={locationPath(l)}
                className="inline-flex items-center rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700 hover:border-amber-300 hover:text-amber-700 transition"
              >
                {l.city}, {l.state}
              </Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}