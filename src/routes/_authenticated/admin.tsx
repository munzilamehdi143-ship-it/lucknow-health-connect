import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { hospitalsQuery, doctorsQuery } from "@/lib/queries";
import { VerificationBadge } from "@/components/site/Badges";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Administrator Console | LucknowCare" },
      {
        name: "description",
        content:
          "Platform and hospital administrators verify hospitals, add verified doctors and review hospital registrations.",
      },
      { property: "og:title", content: "Administrator console | LucknowCare" },
      { property: "og:description", content: "Verify hospitals and manage verified doctors." },
    ],
  }),
  component: AdminPage,
});

const doctorSchema = z.object({
  hospital_id: z.string().uuid("Select a hospital"),
  full_name: z.string().trim().min(3, "Enter the doctor's full name").max(120),
  qualification: z.string().trim().max(120),
  registration_number: z.string().trim().max(60),
  specialization: z.string().trim().min(2, "Enter a specialisation").max(80),
  sub_specialization: z.string().trim().max(80),
  department: z.string().trim().max(80),
  years_experience: z.string().trim().max(2),
  consultation_fee: z.string().trim().max(7),
  languages: z.string().trim().max(120),
  profile: z.string().trim().max(1000),
});

function AdminPage() {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const { data: hospitals = [] } = useQuery(hospitalsQuery);
  const { data: doctors = [] } = useQuery(doctorsQuery());
  const { data: roles = [] } = useQuery({
    queryKey: ["my-roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("role, hospital_id");
      if (error) throw error;
      return data ?? [];
    },
  });
  const { data: registrations = [] } = useQuery({
    queryKey: ["registrations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hospital_registrations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const isPlatformAdmin = roles.some((r) => r.role === "platform_admin");
  const adminHospitalIds = roles
    .filter((r) => r.role === "hospital_admin" && r.hospital_id)
    .map((r) => r.hospital_id as string);
  const manageable = isPlatformAdmin
    ? hospitals
    : hospitals.filter((h) => adminHospitalIds.includes(h.id));

  async function addDoctor(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = doctorSchema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check the form");
      return;
    }
    const v = parsed.data;
    setBusy(true);
    const { error } = await supabase.from("doctors").insert({
      hospital_id: v.hospital_id,
      full_name: v.full_name,
      qualification: v.qualification || null,
      registration_number: v.registration_number || null,
      specialization: v.specialization,
      sub_specialization: v.sub_specialization || null,
      department: v.department || null,
      years_experience: v.years_experience ? Number(v.years_experience) : null,
      consultation_fee: v.consultation_fee ? Number(v.consultation_fee) : null,
      fee_verified: Boolean(v.consultation_fee),
      languages: v.languages ? v.languages.split(",").map((l) => l.trim()) : [],
      profile: v.profile || null,
      verification_status: "verified",
      last_verified_at: new Date().toISOString().slice(0, 10),
      availability_mode: "verified_schedule",
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Verified doctor added");
    (e.target as HTMLFormElement).reset();
    qc.invalidateQueries({ queryKey: ["doctors"] });
  }

  async function setHospitalStatus(id: string, status: "verified" | "pending" | "suspended") {
    const { error } = await supabase
      .from("hospitals")
      .update({
        verification_status: status,
        last_verified_at: status === "verified" ? new Date().toISOString().slice(0, 10) : null,
      })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["hospitals"] });
  }

  if (roles.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl">Administrator access required</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This console is available to platform administrators and approved hospital
          administrators only.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl">Administrator console</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {isPlatformAdmin ? "Platform administrator" : "Hospital administrator"}
      </p>

      <section className="mt-10">
        <h2 className="text-xl">Add a verified doctor</h2>
        <form onSubmit={addDoctor} className="card-shadow mt-4 space-y-4 rounded-xl bg-card p-6">
          <div className="space-y-1.5">
            <Label htmlFor="hospital_id">Hospital</Label>
            <select
              id="hospital_id"
              name="hospital_id"
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
            >
              {manageable.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <F label="Full name" name="full_name" required maxLength={120} />
            <F label="Qualification" name="qualification" maxLength={120} />
            <F label="Medical registration number" name="registration_number" maxLength={60} />
            <F label="Specialisation" name="specialization" required maxLength={80} />
            <F label="Sub-specialisation" name="sub_specialization" maxLength={80} />
            <F label="Department" name="department" maxLength={80} />
            <F label="Years of experience" name="years_experience" type="number" maxLength={2} />
            <F label="Consultation fee (₹)" name="consultation_fee" type="number" maxLength={7} />
            <F label="Languages (comma separated)" name="languages" maxLength={120} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profile">Professional profile</Label>
            <Textarea id="profile" name="profile" rows={3} maxLength={1000} />
          </div>
          <Button type="submit" disabled={busy}>
            {busy ? "Saving…" : "Add verified doctor"}
          </Button>
        </form>
      </section>

      <section className="mt-12">
        <h2 className="text-xl">Published doctors ({doctors.length})</h2>
        <div className="mt-3 space-y-2">
          {doctors.map((d) => (
            <div
              key={d.id}
              className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-sm"
            >
              <span>
                {d.full_name} · {d.specialization}
              </span>
              <VerificationBadge status={d.verification_status} />
            </div>
          ))}
          {doctors.length === 0 ? (
            <p className="text-sm text-muted-foreground">No doctors published yet.</p>
          ) : null}
        </div>
      </section>

      {isPlatformAdmin ? (
        <>
          <section className="mt-12">
            <h2 className="text-xl">Hospital verification</h2>
            <div className="mt-3 space-y-2">
              {hospitals.map((h) => (
                <div
                  key={h.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm"
                >
                  <span>{h.name}</span>
                  <div className="flex items-center gap-2">
                    <VerificationBadge status={h.verification_status} />
                    <Button size="sm" variant="outline" onClick={() => setHospitalStatus(h.id, "verified")}>
                      Verify
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setHospitalStatus(h.id, "suspended")}>
                      Suspend
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-xl">Hospital registration requests ({registrations.length})</h2>
            <div className="mt-3 space-y-2">
              {registrations.map((r) => (
                <div key={r.id} className="rounded-lg border border-border bg-card px-4 py-3 text-sm">
                  <p className="font-medium">{r.hospital_name}</p>
                  <p className="text-muted-foreground">
                    {r.address} · {r.contact_person} · {r.official_email} · {r.phone}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                    {r.status}
                  </p>
                </div>
              ))}
              {registrations.length === 0 ? (
                <p className="text-sm text-muted-foreground">No pending submissions.</p>
              ) : null}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}

function F({
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