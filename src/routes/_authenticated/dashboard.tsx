import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppointmentActions } from "@/components/site/AppointmentActions";
import { supabase } from "@/integrations/supabase/client";
import type { Appointment } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "My Appointments | LucknowCare" },
      {
        name: "description",
        content:
          "View, reschedule or cancel your Lucknow hospital appointments and open hospital directions.",
      },
      { property: "og:title", content: "My appointments | LucknowCare" },
      { property: "og:description", content: "Manage your Lucknow hospital appointments." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["my-appointments"],
    queryFn: async (): Promise<Appointment[]> => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .order("appointment_date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl">My appointments</h1>
      {isLoading ? (
        <p className="mt-6 text-sm text-muted-foreground">Loading…</p>
      ) : appointments.length === 0 ? (
        <div className="card-shadow mt-6 rounded-xl bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">You have no appointments yet.</p>
          <Button asChild className="mt-4">
            <Link to="/hospitals">Find a hospital</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {appointments.map((a) => (
            <div key={a.id} className="card-shadow rounded-xl bg-card p-5">
              <p className="font-display text-lg font-semibold">{a.appointment_number}</p>
              <p className="mt-1 text-sm">
                {a.doctor_name ?? "Doctor assigned by hospital"}
                {a.doctor_specialization ? ` · ${a.doctor_specialization}` : ""}
              </p>
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-3.5" /> {a.hospital_name}
              </p>
              <p className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="size-3.5" /> {a.appointment_date}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="size-3.5" /> {a.appointment_time}
                </span>
              </p>
              <p className="mt-2 text-sm">
                Status: <span className="font-medium capitalize">{a.status.replace(/_/g, " ")}</span>
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild size="sm">
                  <Link to="/appointment/$number" params={{ number: a.appointment_number }}>
                    View appointment
                  </Link>
                </Button>
                <AppointmentActions appointment={a} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}