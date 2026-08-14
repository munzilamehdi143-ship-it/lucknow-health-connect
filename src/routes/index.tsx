import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, MapPin, ShieldCheck, Stethoscope, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { hospitalsQuery } from "@/lib/queries";
import { VerificationBadge } from "@/components/site/Badges";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LucknowCare — Verified Hospitals & Doctor Appointments in Lucknow" },
      {
        name: "description",
        content:
          "Find, compare and book verified hospitals and doctors across Lucknow. Real hospital data, Google Maps locations and transparent consultation fees.",
      },
      {
        property: "og:title",
        content: "LucknowCare — All Your Healthcare Options in One Place",
      },
      {
        property: "og:description",
        content:
          "A Lucknow healthcare aggregator with verified hospitals, real locations and transparent appointment booking.",
      },
    ],
  }),
  component: Index,
});

const steps = [
  { icon: Search, title: "Find", text: "Search by doctor, hospital, speciality or concern." },
  { icon: Building2, title: "Compare", text: "Compare hospitals on type, location and specialities." },
  { icon: MapPin, title: "Locate", text: "See the verified location on Google Maps." },
  { icon: ShieldCheck, title: "Book", text: "Get a unique appointment number for the hospital." },
];

function Index() {
  const [term, setTerm] = useState("");
  const navigate = useNavigate();
  const { data: hospitals = [] } = useQuery(hospitalsQuery);
  const phase1 = hospitals.filter((h) => h.phase === 1);

  return (
    <div>
      <section className="hero-gradient text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <p className="text-sm font-medium uppercase tracking-[0.2em] opacity-80">
            Lucknow · Uttar Pradesh
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl leading-tight md:text-6xl">
            All your healthcare options in one place.
          </h1>
          <p className="mt-4 max-w-2xl text-base opacity-90">
            Search healthcare in Lucknow across real, verified hospitals. We publish only
            information confirmed by hospitals, official sources or platform administrators.
          </p>

          <form
            className="mt-8 flex max-w-2xl flex-col gap-2 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              navigate({ to: "/hospitals", search: { q: term || undefined } });
            }}
          >
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              maxLength={80}
              placeholder="Cardiologist, KGMU, orthopaedics near Gomti Nagar…"
              className="h-12 border-transparent bg-card text-foreground"
            />
            <Button type="submit" size="lg" variant="secondary" className="h-12">
              <Search className="size-4" /> Search
            </Button>
          </form>
          <p className="mt-3 text-xs opacity-80">
            Phase 1 covers {phase1.length} verified hospitals. More hospitals are onboarded
            as they are verified.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.title} className="card-shadow rounded-xl bg-card p-5">
              <s.icon className="size-5 text-primary" />
              <h3 className="mt-3 text-lg">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl">Phase 1 verified hospitals</h2>
            <p className="text-sm text-muted-foreground">
              Verified against official hospital sources.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/hospitals">View all hospitals</Link>
          </Button>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {phase1.map((h) => (
            <Link
              key={h.id}
              to="/hospitals/$slug"
              params={{ slug: h.slug }}
              className="card-shadow rounded-xl bg-card p-5 transition-transform hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold leading-snug">{h.name}</h3>
                <VerificationBadge status={h.verification_status} />
              </div>
              <p className="mt-2 flex items-start gap-1.5 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 size-3.5 shrink-0" /> {h.address}
              </p>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Stethoscope className="size-3.5" />
                {h.departments.slice(0, 3).join(" · ")}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
