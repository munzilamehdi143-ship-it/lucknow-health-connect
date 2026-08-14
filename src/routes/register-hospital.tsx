import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/register-hospital")({
  head: () => ({
    meta: [
      { title: "Register Your Hospital | LucknowCare" },
      {
        name: "description",
        content:
          "Hospital representatives in Lucknow can submit their hospital for verification and receive administrator access to manage doctors and appointments.",
      },
      { property: "og:title", content: "Register your hospital on LucknowCare" },
      {
        property: "og:description",
        content: "Submit your hospital for platform verification and admin access.",
      },
    ],
  }),
  component: RegisterHospital,
});

const schema = z.object({
  hospital_name: z.string().trim().min(3, "Enter the official hospital name").max(150),
  hospital_type: z.enum(["government", "private"]),
  address: z.string().trim().min(5, "Enter the complete address").max(300),
  pincode: z.string().trim().max(10),
  registration_details: z.string().trim().max(300),
  contact_person: z.string().trim().min(2, "Enter a contact person").max(100),
  official_email: z.string().trim().email("Enter a valid official email").max(255),
  phone: z.string().trim().regex(/^[0-9+\-\s]{8,15}$/, "Enter a valid phone number"),
  website: z.string().trim().max(255),
  departments: z.string().trim().max(1000),
  doctors_info: z.string().trim().max(1000),
  appointment_system: z.string().trim().max(500),
});

function RegisterHospital() {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = schema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("hospital_registrations").insert(parsed.data);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-3xl">Submission received</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Your hospital is now marked <strong>Pending verification</strong>. Our platform
          administrator will review the submitted details against official sources. Once
          approved, you will receive hospital administrator credentials to manage doctors,
          schedules and appointments.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl">Register your hospital</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        For authorised hospital representatives in Lucknow. Every submission is reviewed
        before the hospital appears as verified.
      </p>
      <form onSubmit={submit} className="card-shadow mt-8 space-y-4 rounded-xl bg-card p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Official hospital name" name="hospital_name" required maxLength={150} />
          <div className="space-y-1.5">
            <Label htmlFor="hospital_type">Hospital type</Label>
            <select
              id="hospital_type"
              name="hospital_type"
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              defaultValue="private"
            >
              <option value="private">Private</option>
              <option value="government">Government</option>
            </select>
          </div>
        </div>
        <Field label="Complete address" name="address" required maxLength={300} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Pincode" name="pincode" maxLength={10} />
          <Field label="Registration / licence details" name="registration_details" maxLength={300} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Contact person" name="contact_person" required maxLength={100} />
          <Field label="Official email" name="official_email" type="email" required maxLength={255} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone" name="phone" required maxLength={15} />
          <Field label="Website" name="website" maxLength={255} />
        </div>
        <TextField label="Departments" name="departments" maxLength={1000} />
        <TextField label="Doctors (names, specialities, registration)" name="doctors_info" maxLength={1000} />
        <TextField
          label="Existing appointment system / API details"
          name="appointment_system"
          maxLength={500}
        />
        <Button type="submit" size="lg" disabled={busy} className="w-full">
          {busy ? "Submitting…" : "Submit for verification"}
        </Button>
      </form>
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

function TextField({
  label,
  name,
  maxLength,
}: {
  label: string;
  name: string;
  maxLength: number;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Textarea id={name} name={name} maxLength={maxLength} rows={3} />
    </div>
  );
}