import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarClock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import type { Appointment } from "@/lib/queries";

type Props = { appointment: Appointment; size?: "sm" | "default" };

export function AppointmentActions({ appointment, size = "sm" }: Props) {
  const qc = useQueryClient();
  const [openReschedule, setOpenReschedule] = useState(false);
  const [openCancel, setOpenCancel] = useState(false);
  const [date, setDate] = useState(appointment.appointment_date);
  const [time, setTime] = useState(appointment.appointment_time);
  const [busy, setBusy] = useState(false);

  const closed = appointment.status === "cancelled" || appointment.status === "completed";
  const today = new Date().toISOString().slice(0, 10);

  function refresh() {
    qc.invalidateQueries({ queryKey: ["my-appointments"] });
    qc.invalidateQueries({ queryKey: ["appointment", appointment.appointment_number] });
  }

  async function reschedule() {
    if (!date || !time) {
      toast.error("Pick a new date and time.");
      return;
    }
    if (date < today) {
      toast.error("Choose a date in the future.");
      return;
    }
    setBusy(true);
    const { error } = await supabase
      .from("appointments")
      .update({
        appointment_date: date,
        appointment_time: time,
        status: "rescheduled",
      })
      .eq("appointment_number", appointment.appointment_number);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setOpenReschedule(false);
    toast.success(
      `${appointment.appointment_number} rescheduled. The hospital will confirm the new slot.`,
    );
    refresh();
  }

  async function cancel() {
    setBusy(true);
    const { error } = await supabase
      .from("appointments")
      .update({ status: "cancelled" })
      .eq("appointment_number", appointment.appointment_number);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setOpenCancel(false);
    toast.success(`${appointment.appointment_number} cancelled. The hospital will be notified.`);
    refresh();
  }

  if (closed) return null;

  return (
    <>
      <Button size={size} variant="outline" onClick={() => setOpenReschedule(true)}>
        <CalendarClock className="size-4" /> Reschedule
      </Button>
      <Button size={size} variant="ghost" onClick={() => setOpenCancel(true)}>
        <XCircle className="size-4" /> Cancel
      </Button>

      <Dialog open={openReschedule} onOpenChange={setOpenReschedule}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule {appointment.appointment_number}</DialogTitle>
            <DialogDescription>
              {appointment.hospital_name} · new slots are requests only — the hospital confirms
              final availability.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="resched-date">New date</Label>
              <Input
                id="resched-date"
                type="date"
                min={today}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="resched-time">Preferred time</Label>
              <Input
                id="resched-time"
                value={time}
                placeholder="e.g. 10:30 AM"
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpenReschedule(false)}>
              Keep existing slot
            </Button>
            <Button onClick={reschedule} disabled={busy}>
              {busy ? "Saving…" : "Request reschedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={openCancel} onOpenChange={setOpenCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel {appointment.appointment_number}?</AlertDialogTitle>
            <AlertDialogDescription>
              This cancels your appointment at {appointment.hospital_name} on{" "}
              {appointment.appointment_date}. This cannot be undone — you would need to book again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep appointment</AlertDialogCancel>
            <AlertDialogAction onClick={cancel} disabled={busy}>
              {busy ? "Cancelling…" : "Cancel appointment"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
