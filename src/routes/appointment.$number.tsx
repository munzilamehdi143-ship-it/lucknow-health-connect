import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Navigation, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HospitalMap } from "@/components/site/HospitalMap";
import { AvailabilityBadge } from "@/components/site/Badges";
import { AppointmentActions } from "@/components/site/AppointmentActions";
import { supabase } from "@/integrations/supabase/client";
import { formatINR, mapsUrl } from "@/lib/geo";
import type { Appointment, Hospital } from "@/lib/queries";

export const Route = createFileRoute("/appointment/$number")({
  head: ({ params }) => ({
    meta: [
      { title: `Appointment ${params.number} | LucknowCare` },
      {
        name: "description",
        content:
          "Digital appointment receipt with appointment number, hospital location and full fee breakdown.",
      },
      { property: "og:title", content: "Appointment details | LucknowCare" },
      {
        property: "og:description",
        content: "Your Lucknow hospital appointment number, receipt and directions.",
      },
    ],
  }),
  component: AppointmentPage,
  errorComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center text-sm text-muted-foreground">
      This appointment could not be loaded.
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center text-sm text-muted-foreground">
      Appointment not found.
    </div>
  ),
});

function AppointmentPage() {
  const { number } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["appointment", number],
    queryFn: async (): Promise<{ appointment: Appointment; hospital: Hospital | null } | null> => {
      const { data: appointment, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("appointment_number", number)
        .maybeSingle();
      if (error) throw error;
      if (!appointment) return null;
      const { data: hospital } = await supabase
        .from("hospitals")
        .select("*")
        .eq("id", appointment.hospital_id)
        .maybeSingle();
      return { appointment, hospital };
    },
  });

  if (isLoading) {
    return <div className="mx-auto max-w-3xl px-4 py-20 text-sm text-muted-foreground">Loading…</div>;
  }
  if (!data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl">Appointment not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Check the appointment number, or sign in with the account used for the booking.
        </p>
        <Button asChild className="mt-6">
          <Link to="/auth">Sign in</Link>
        </Button>
      </div>
    );
  }

  const a = data.appointment;
  const h = data.hospital;
  const paid = a.payment_status === "paid";

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="card-shadow rounded-xl bg-card p-6">
        <p className="flex items-center gap-2 text-lg font-semibold text-success">
          <CheckCircle2 className="size-5" />
          {a.status === "cancelled" ? "Appointment cancelled" : "Appointment request confirmed"}
        </p>
        <p className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">
          Appointment number
        </p>
        <p className="font-display text-3xl font-semibold tracking-tight">
          {a.appointment_number}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Show this appointment number at the hospital reception.
        </p>

        <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
          <Item label="Patient" value={a.patient_name} />
          <Item label="Doctor" value={a.doctor_name ?? "To be assigned by hospital"} />
          <Item label="Specialisation" value={a.doctor_specialization ?? "As per department"} />
          <Item label="Hospital" value={a.hospital_name} />
          <Item label="Date" value={a.appointment_date} />
          <Item label="Time" value={a.appointment_time} />
          <Item label="Booked on" value={new Date(a.created_at).toLocaleString("en-IN")} />
          <Item label="Payment ID" value={a.payment_id ?? "—"} />
        </dl>

        <div className="mt-6 rounded-lg border border-border bg-surface p-4 text-sm">
          <p className="font-medium">Fee breakdown</p>
          <dl className="mt-2 space-y-1.5 text-muted-foreground">
            <Row
              label="Consultation fee"
              value={
                Number(a.consultation_fee) > 0
                  ? formatINR(a.consultation_fee)!
                  : "To be confirmed by hospital"
              }
            />
            <Row label="Platform fee" value={formatINR(a.platform_fee)!} />
            <Row label="Taxes" value={formatINR(a.tax_amount)!} />
            <Row
              label="Total"
              value={
                Number(a.total_amount) > 0
                  ? formatINR(a.total_amount)!
                  : "To be confirmed by hospital"
              }
              bold
            />
          </dl>
          <p className="mt-3">
            Payment status:{" "}
            <span className={paid ? "font-semibold text-success" : "font-semibold"}>
              {paid ? "Paid ✓" : "Payable at hospital / awaiting confirmation"}
            </span>
          </p>
        </div>

        <div className="mt-4">
          <AvailabilityBadge mode={a.availability_mode} />
          <p className="mt-2 text-sm text-muted-foreground">
            Appointment availability will be confirmed by the hospital.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <AppointmentActions appointment={a} />
          </div>
        </div>
      </div>

      {h && h.latitude !== null && h.longitude !== null ? (
        <div className="card-shadow mt-6 rounded-xl bg-card p-6">
          <h2 className="text-xl">{h.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{h.address}</p>
          <div className="mt-4">
            <HospitalMap lat={h.latitude} lng={h.longitude} name={h.name} />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button asChild>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${h.latitude},${h.longitude}&travelmode=driving`}
                target="_blank"
                rel="noreferrer noopener"
              >
                <Navigation className="size-4" /> Get directions
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href={mapsUrl(h.latitude, h.longitude)} target="_blank" rel="noreferrer noopener">
                <ExternalLink className="size-4" /> Open in Google Maps
              </a>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/dashboard">My appointments</Link>
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "font-semibold text-foreground" : ""}`}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}