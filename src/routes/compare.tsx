import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { hospitalsQuery } from "@/lib/queries";
import { VerificationBadge } from "@/components/site/Badges";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Compare Lucknow Hospitals | LucknowCare" },
      {
        name: "description",
        content:
          "Compare government and private hospitals in Lucknow by type, location, specialities, doctor availability and consultation basis.",
      },
      { property: "og:title", content: "Compare hospitals in Lucknow" },
      {
        property: "og:description",
        content: "Side-by-side comparison of verified Lucknow hospitals.",
      },
    ],
  }),
  component: ComparePage,
});

function ComparePage() {
  const { data: hospitals = [] } = useQuery(hospitalsQuery);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl">Compare hospitals</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Ratings, fees, doctors and slots are never fabricated. Where a hospital has not
        confirmed information, the cell reads “Check with hospital”.
      </p>

      <div className="card-shadow mt-8 overflow-x-auto rounded-xl bg-card">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="hero-gradient text-left text-primary-foreground">
            <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:font-semibold">
              <th>Hospital</th>
              <th>Type</th>
              <th>Location</th>
              <th>Specialities</th>
              <th>Doctor availability</th>
              <th>Consultation</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {hospitals.map((h) => (
              <tr
                key={h.id}
                className="border-t border-border transition-colors odd:bg-surface/60 hover:bg-accent/25 [&>td]:px-4 [&>td]:py-3"
              >
                <td>
                  <Link
                    to="/hospitals/$slug"
                    params={{ slug: h.slug }}
                    className="font-medium text-primary"
                  >
                    {h.name}
                  </Link>
                </td>
                <td>
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                      h.type === "government"
                        ? "bg-info/10 text-info"
                        : "bg-accent text-accent-foreground"
                    }`}
                  >
                    {h.type}
                  </span>
                </td>
                <td className="text-muted-foreground">{h.locality ?? h.city}</td>
                <td className="text-muted-foreground">
                  {h.specializations[0] ?? "Multiple"}
                </td>
                <td className="text-muted-foreground">Check availability</td>
                <td className="text-muted-foreground">Doctor dependent</td>
                <td>
                  <VerificationBadge status={h.verification_status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}