import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AvailabilityBadge } from "@/components/site/Badges";
import { doctorsQuery, hospitalQuery } from "@/lib/queries";
import { formatINR } from "@/lib/geo";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type BookSearch = { doctor?: string | undefined };

export const Route = createFileRoute("/book/$slug")({
  validateSearch: (search: Record<string, unknown>): BookSearch => ({
    doctor: typeof search["doctor"] === "string" ? search["doctor"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Request an Appointment | LucknowCare" },
      {
        name: "description",
        content:
          "Request a hospital appointment in Lucknow and receive a unique appointment number with the full fee breakdown.",
      },
      { property: "og:title", content: "Book a hospital appointment in Lucknow" },
      {
        property: "og:description",
        content: "Transparent fees and a unique appointment number for every booking.",
      },
    ],
  }),
  component: BookPage,
});

const formSchema = z.object({
  patient_name: z.string().trim().min(2, "Enter the patient name").max(100),
  patient_phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{8,15}$/, "Enter a valid phone number"),
  patient_email: z.string().trim().email("Enter a valid email").max(255).or(z.literal("")),
  patient_age: z.string().trim().max(3),
  patient_gender: z.string().trim().max(20),
  reason: z.string().trim().max(500),
  appointment_date: z.string().min(1, "Choose a date"),
  appointment_time: z.string().min(1, "Choose a preferred time"),
});

const PLATFORM_FEE = 20;
const GST_RATE = 0.18;

function BookPage() {
  const { slug } = Route.useParams();
  const { doctor: doctorId } = Route.useSearch();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { data: hospital } = useQuery(hospitalQuery(slug));
  const { data: doctors = [] } = useQuery({
    ...doctorsQuery(hospital?.id),
    enabled: Boolean(hospital?.id),
  });
  const [submitting, setSubmitting] = useState(false);

  const doctor = doctors.find((d) => d.id === doctorId) ?? null;
  const feeKnown = Boolean(doctor?.fee_verified && doctor?.consultation_fee !== null);
  const consultationFee = feeKnown ? Number(doctor!.consultation_fee) : 0;
  const tax = feeKnown ? Math.round(PLATFORM_FEE * GST_RATE * 100) / 100 : 0;
  const total = feeKnown ? consultationFee + PLATFORM_FEE + tax : 0;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!hospital) return;
    if (!user) {
      navigate({ to: "/auth", search: { redirect: `/book/${slug}` } });
      return;
    }
    const fd = new FormData(e.currentTarget);
    const parsed = formSchema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    const v = parsed.data;
    setSubmitting(true);
    const { data, error } = await supabase
      .from("appointments")
      .insert({
        patient_id: user.id,
        patient_name: v.patient_name,
        patient_phone: v.patient_phone,
        patient_email: v.patient_email || null,
        patient_age: v.patient_age ? Number(v.patient_age) : null,
        patient_gender: v.patient_gender || null,
        reason: v.reason || null,
        doctor_id: doctor?.id ?? null,
        doctor_name: doctor?.full_name ?? null,
        doctor_specialization: doctor?.specialization ?? null,
        hospital_id: hospital.id,
        hospital_name: hospital.name,
        appointment_date: v.appointment_date,
        appointment_time: v.appointment_time,
        consultation_fee: consultationFee,
        platform_fee: PLATFORM_FEE,
        tax_amount: tax,
        total_amount: total,
        availability_mode: doctor?.availability_mode ?? "confirmation_required",
      })
      .select("appointment_number")
      .single();
    setSubmitting(false);

    if (error || !data) {
      toast.error(error?.message ?? "Could not create the appointment request");
      return;
    }
    navigate({ to: "/appointment/$number", params: { number: data.appointment_number } });
  }

  if (!hospital) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-sm text-muted-foreground">Loading…</div>
    );
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link
        to="/hospitals/$slug"
        params={{ slug }}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← {hospital.name}
      </Link>
      <h1 className="mt-3 text-3xl">Request an appointment</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {doctor
          ? `${doctor.full_name} · ${doctor.specialization}`
          : "No doctor selected — the hospital will assign the appropriate department."}
      </p>
      <div className="mt-3">
        <AvailabilityBadge mode={doctor?.availability_mode ?? "confirmation_required"} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <form onSubmit={onSubmit} className="card-shadow space-y-4 rounded-xl bg-card p-6">
          <Field label="Patient name" name="patient_name" required maxLength={100} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Phone number" name="patient_phone" required maxLength={15} />
            <Field label="Email (optional)" name="patient_email" type="email" maxLength={255} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Age" name="patient_age" type="number" maxLength={3} />
            <Field label="Gender" name="patient_gender" maxLength={20} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Preferred date"
              name="appointment_date"
              type="date"
              required
              min={today}
            />
            <Field label="Preferred time" name="appointment_time" type="time" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reason">Health concern (optional)</Label>
            <Textarea id="reason" name="reason" maxLength={500} rows={3} />
          </div>
          <Button type="submit" size="lg" disabled={submitting || loading} className="w-full">
            {submitting ? "Submitting…" : "Confirm appointment request"}
          </Button>
          {!user && !loading ? (
            <p className="text-xs text-muted-foreground">
              You will be asked to sign in so the appointment is linked to your account.
            </p>
          ) : null}
        </form>

        <aside className="space-y-4">
          <div className="card-shadow rounded-xl bg-card p-5 text-sm">
            <p className="font-semibold">Payment summary</p>
            {feeKnown ? (
              <dl className="mt-3 space-y-2 text-muted-foreground">
                <Row label="Consultation fee" value={formatINR(consultationFee)!} />
                <Row label="Platform fee" value={formatINR(PLATFORM_FEE)!} />
                <Row label="Taxes (18% on platform fee)" value={formatINR(tax)!} />
                <div className="border-t border-border pt-2">
                  <Row label="Total" value={formatINR(total)!} bold />
                </div>
              </dl>
            ) : (
              <p className="mt-3 text-muted-foreground">
                Fee to be confirmed by hospital. The complete amount will be shown before any
                payment is taken.
              </p>
            )}
          </div>
          <div className="rounded-xl border border-border bg-surface p-5 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Availability</p>
            <p className="mt-1">
              Appointment availability will be confirmed by the hospital. This platform does
              not display slots unless a hospital or doctor schedule is connected.
            </p>
            <p className="mt-2">
              Online payment is enabled per hospital. Until a hospital's payment
              collection is live, payment is completed at the hospital reception.
            </p>
          </div>
        </aside>
      </div>
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

function Field({
  label,
  name,
  ...props
}: { label: string; name: string } & React.ComponentProps<typeof Input>) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} {...props} />
    </div>
  );
}