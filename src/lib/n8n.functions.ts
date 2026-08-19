import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const WEBHOOK_URL =
  "https://munzilamehdi444.app.n8n.cloud/webhook-test/Lucknw-healthcare project-n8n";

const payloadSchema = z.object({
  appointment_number: z.string().max(64),
  patient_name: z.string().max(100),
  patient_phone: z.string().max(20),
  patient_email: z.string().max(255).nullable(),
  patient_age: z.number().nullable(),
  patient_gender: z.string().max(20).nullable(),
  reason: z.string().max(500).nullable(),
  hospital_name: z.string().max(200),
  hospital_slug: z.string().max(120),
  doctor_name: z.string().max(200).nullable(),
  doctor_specialization: z.string().max(200).nullable(),
  appointment_date: z.string().max(20),
  appointment_time: z.string().max(20),
  consultation_fee: z.number(),
  platform_fee: z.number(),
  tax_amount: z.number(),
  total_amount: z.number(),
  availability_mode: z.string().max(40),
});

export const sendAppointmentToWebhook = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => payloadSchema.parse(input))
  .handler(async ({ data }) => {
    try {
      const res = await fetch(encodeURI(WEBHOOK_URL), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "appointment.created",
          submitted_at: new Date().toISOString(),
          ...data,
        }),
      });
      if (!res.ok) {
        console.error("[n8n] webhook responded", res.status);
        return { ok: false as const, status: res.status };
      }
      return { ok: true as const, status: res.status };
    } catch (err) {
      console.error("[n8n] webhook failed", err);
      return { ok: false as const, status: 0 };
    }
  });
