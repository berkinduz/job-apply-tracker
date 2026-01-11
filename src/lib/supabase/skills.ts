import { createClient } from "@/lib/supabase/client";

export type SkillSuggestion = {
  label: string;
};

const escapeForIlike = (value: string) =>
  value.replace(/[\\%_]/g, "\\\\$&");

export async function fetchSkillSuggestions(
  query: string,
  locale: "en" | "tr",
  limit = 8
): Promise<SkillSuggestion[]> {
  if (!query.trim()) return [];
  const supabase = createClient();
  const safeQuery = escapeForIlike(query.trim());
  const { data, error } = await supabase
    .from("skill_suggestions")
    .select("label")
    .eq("locale", locale)
    .ilike("label", `${safeQuery}%`)
    .order("popularity", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data;
}
