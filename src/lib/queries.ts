import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Hospital = Tables<"hospitals">;
export type Doctor = Tables<"doctors">;
export type Appointment = Tables<"appointments">;

export const hospitalsQuery = {
  queryKey: ["hospitals"],
  queryFn: async (): Promise<Hospital[]> => {
    const { data, error } = await supabase
      .from("hospitals")
      .select("*")
      .order("phase", { ascending: true })
      .order("name", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },
};

export const hospitalQuery = (slug: string) => ({
  queryKey: ["hospital", slug],
  queryFn: async (): Promise<Hospital | null> => {
    const { data, error } = await supabase
      .from("hospitals")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return data;
  },
});

export const doctorsQuery = (hospitalId?: string) => ({
  queryKey: ["doctors", hospitalId ?? "all"],
  queryFn: async (): Promise<Doctor[]> => {
    let q = supabase.from("doctors").select("*").order("full_name");
    if (hospitalId) q = q.eq("hospital_id", hospitalId);
    const { data, error } = await q;
    if (error) throw error;
    return data ?? [];
  },
});