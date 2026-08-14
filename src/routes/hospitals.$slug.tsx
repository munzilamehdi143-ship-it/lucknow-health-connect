import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  MapPin,
  Phone,
  Globe,
  Navigation,
  ExternalLink,
  CalendarClock,
  Ambulance,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { HospitalMap } from "@/components/site/HospitalMap";
import { VerificationBadge, AvailabilityBadge } from "@/components/site/Badges";
import { doctorsQuery, hospitalQuery } from "@/lib/queries";
import { formatINR, haversineKm, mapsUrl } from "@/lib/geo";
import { computeTravel } from "@/lib/routes.functions";

export const Route = createFileRoute("/hospitals/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — Hospital Profile | LucknowCare` },
      {
        name: "description",
        content:
          "Verified hospital profile with address, departments, facilities, OPD timings, doctors and Google Maps location in Lucknow.",
      },
      { property: "og:title", content: "Hospital profile | LucknowCare" },
      {
        property: "og:description",
        content: "Verified Lucknow hospital details, location and appointment booking.",
      },
    ],
  }),
  component: HospitalProfile,
  errorComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center text-sm text-muted-foreground">
      This hospital profile could not be loaded.
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center text-sm text-muted-foreground">
      Hospital not found.
    </div>
  ),
});

function HospitalProfile() {
  const { slug } = Route.useParams();
  const { data: hospital, isLoading } = useQuery(hospitalQuery(slug));
  const { data: doctors = [] } = useQuery({
    ...doctorsQuery(hospital?.id),
    enabled: Boolean(hospital?.id),
  });
  const [travel, setTravel] = useState<{
    distanceKm: number | null;
    durationMin: number | null;
  } | null>(null);
  const [geoDenied, setGeoDenied] = useState(false);

  useEffect(() => {
    if (!hospital?.latitude || !hospital.longitude) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const origin = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const fallback = Math.round(
          haversineKm(origin, { lat: hospital.latitude!, lng: hospital.longitude! }) * 10,
        ) / 10;
        try {
          const result = await computeTravel({
            data: {
              originLat: origin.lat,
              originLng: origin.lng,
              destLat: hospital.latitude!,
              destLng: hospital.longitude!,
            },
          });
          setTravel(
            result.distanceKm
              ? result
              : { distanceKm: fallback, durationMin: null },
          );
        } catch {
          setTravel({ distanceKm: fallback, durationMin: null });
        }
      },
      () => setGeoDenied(true),
      { timeout: 8000 },
    );
  }, [hospital?.latitude, hospital?.longitude, hospital?.id]);

  if (isLoading) {
    return <div className="mx-auto max-w-5xl px-4 py-20 text-sm text-muted-foreground">Loading…</div>;
  }
  if (!hospital) throw notFound();

  const hasCoords = hospital.latitude !== null && hospital.longitude !== null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            {hospital.type} hospital · {hospital.city}
          </p>
          <h1 className="mt-2 text-3xl">{hospital.name}</h1>
          <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 size-4 shrink-0" /> {hospital.address}
            {hospital.pincode ? ` – ${hospital.pincode}` : ""}
          </p>
        </div>
        <VerificationBadge status={hospital.verification_status} />
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
        {hospital.phone ? (
          <a className="flex items-center gap-1.5" href={`tel:${hospital.phone}`}>
            <Phone className="size-4" /> {hospital.phone}
          </a>
        ) : null}
        {hospital.website ? (
          <a
            className="flex items-center gap-1.5"
            href={hospital.website}
            target="_blank"
            rel="noreferrer noopener"
          >
            <Globe className="size-4" /> Official website
          </a>
        ) : null}
        <span className="flex items-center gap-1.5">
          <Ambulance className="size-4" />
          {hospital.emergency_available === null
            ? "Emergency availability to be confirmed"
            : hospital.emergency_available
              ? "Emergency available"
              : "No emergency service"}
        </span>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="card-shadow overflow-hidden rounded-xl bg-card p-4">
          {hasCoords ? (
            <HospitalMap
              lat={hospital.latitude!}
              lng={hospital.longitude!}
              name={hospital.name}
            />
          ) : (
            <div className="flex h-72 items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
              Verified coordinates pending for this hospital.
            </div>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button asChild disabled={!hasCoords}>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}&travelmode=driving`}
                target="_blank"
                rel="noreferrer noopener"
              >
                <Navigation className="size-4" /> Get directions
              </a>
            </Button>
            <Button asChild variant="outline">
              <a
                href={
                  hasCoords
                    ? mapsUrl(hospital.latitude!, hospital.longitude!)
                    : (hospital.google_maps_url ?? "#")
                }
                target="_blank"
                rel="noreferrer noopener"
              >
                <ExternalLink className="size-4" /> Open in Google Maps
              </a>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/book/$slug" params={{ slug: hospital.slug }}>
                Book appointment
              </Link>
            </Button>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {travel?.distanceKm
              ? `Distance from you: ${travel.distanceKm} km${
                  travel.durationMin ? ` · Estimated travel time: ${travel.durationMin} min` : ""
                }`
              : geoDenied
                ? "Allow location access to see distance and travel time."
                : "Calculating distance from your location…"}
          </p>
        </div>

        <div className="space-y-4">
          <InfoCard title="OPD timings" icon={<CalendarClock className="size-4" />}>
            {hospital.opd_timings ?? "To be confirmed by hospital."}
          </InfoCard>
          <InfoCard title="Departments">
            <TagList items={hospital.departments} />
          </InfoCard>
          <InfoCard title="Specialisations">
            <TagList items={hospital.specializations} />
          </InfoCard>
          <InfoCard title="Facilities">
            <TagList items={hospital.facilities} />
          </InfoCard>
          <div className="rounded-xl border border-border bg-surface p-4 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">Data source</p>
            <p className="mt-1">{hospital.data_source ?? "Awaiting verification"}</p>
            <p className="mt-1">
              {hospital.last_verified_at
                ? `Last verified on ${hospital.last_verified_at}`
                : "Not yet verified by the platform administrator."}
            </p>
          </div>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="text-2xl">Doctors at this hospital</h2>
        {doctors.length === 0 ? (
          <p className="mt-3 max-w-2xl rounded-lg border border-border bg-surface p-4 text-sm text-muted-foreground">
            No verified doctor profiles have been published for this hospital yet. Doctors
            are added only by the hospital administrator or the platform administrator from
            official sources — we never list invented doctors. You can still request an
            appointment; the hospital will confirm the doctor and slot.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {doctors.map((d) => (
              <div key={d.id} className="card-shadow rounded-xl bg-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold">{d.full_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {d.specialization}
                      {d.qualification ? ` · ${d.qualification}` : ""}
                    </p>
                  </div>
                  <VerificationBadge status={d.verification_status} />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <AvailabilityBadge mode={d.availability_mode} />
                  <span className="text-sm text-muted-foreground">
                    {d.fee_verified && d.consultation_fee !== null
                      ? `Consultation ${formatINR(d.consultation_fee)}`
                      : "Fee to be confirmed by hospital."}
                  </span>
                </div>
                <Button asChild size="sm" className="mt-4">
                  <Link
                    to="/book/$slug"
                    params={{ slug: hospital.slug }}
                    search={{ doctor: d.id }}
                  >
                    Book appointment
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function InfoCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="card-shadow rounded-xl bg-card p-4">
      <p className="flex items-center gap-2 text-sm font-semibold">
        {icon} {title}
      </p>
      <div className="mt-2 text-sm text-muted-foreground">{children}</div>
    </div>
  );
}

function TagList({ items }: { items: string[] }) {
  if (items.length === 0) return <span>Not provided yet.</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((i) => (
        <span key={i} className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
          {i}
        </span>
      ))}
    </div>
  );
}