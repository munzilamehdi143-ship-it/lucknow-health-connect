import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { MapPin, Phone, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { hospitalsQuery } from "@/lib/queries";
import { VerificationBadge } from "@/components/site/Badges";

type HospitalSearch = { q?: string | undefined };

export const Route = createFileRoute("/hospitals/")({
  validateSearch: (search: Record<string, unknown>): HospitalSearch => ({
    q: typeof search["q"] === "string" ? search["q"].slice(0, 80) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Hospital Directory in Lucknow | LucknowCare" },
      {
        name: "description",
        content:
          "Browse government and private hospitals in Lucknow with verified addresses, departments, facilities and Google Maps locations.",
      },
      { property: "og:title", content: "Lucknow Hospital Directory" },
      {
        property: "og:description",
        content: "Verified government and private hospitals across Lucknow.",
      },
    ],
  }),
  component: HospitalsPage,
});

function HospitalsPage() {
  const { q } = Route.useSearch();
  const [term, setTerm] = useState(q ?? "");
  const [type, setType] = useState<"all" | "government" | "private">("all");
  const { data: hospitals = [], isLoading } = useQuery(hospitalsQuery);

  const results = useMemo(() => {
    const needle = term.trim().toLowerCase();
    return hospitals.filter((h) => {
      if (type !== "all" && h.type !== type) return false;
      if (!needle) return true;
      return [
        h.name,
        h.address,
        h.locality ?? "",
        ...h.departments,
        ...h.specializations,
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [hospitals, term, type]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl">Search healthcare in Lucknow</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Search by hospital, department, speciality, health concern or locality.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={term}
            maxLength={80}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="e.g. cardiology, Gomti Nagar, KGMU"
            className="h-11 pl-9"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "government", "private"] as const).map((t) => (
            <Button
              key={t}
              variant={type === t ? "default" : "outline"}
              onClick={() => setType(t)}
              className="capitalize"
            >
              {t}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className="mt-10 text-sm text-muted-foreground">Loading hospitals…</p>
      ) : results.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">
          No registered hospital matches this search yet.
        </p>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {results.map((h) => (
            <Link
              key={h.id}
              to="/hospitals/$slug"
              params={{ slug: h.slug }}
              className="card-shadow rounded-xl bg-card p-5 transition-transform hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold leading-snug">{h.name}</h2>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wide text-primary">
                    {h.type}
                  </p>
                </div>
                <VerificationBadge status={h.verification_status} />
              </div>
              <p className="mt-3 flex items-start gap-1.5 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 size-3.5 shrink-0" /> {h.address}
              </p>
              {h.phone ? (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Phone className="size-3.5" /> {h.phone}
                </p>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {h.departments.slice(0, 4).map((d) => (
                  <span
                    key={d}
                    className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}