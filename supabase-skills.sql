-- Skill suggestions lookup table
CREATE TABLE IF NOT EXISTS public.skill_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL,
  locale TEXT NOT NULL CHECK (locale IN ('en', 'tr')),
  label TEXT NOT NULL,
  popularity INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS skill_suggestions_key_locale_idx
  ON public.skill_suggestions (key, locale);

CREATE INDEX IF NOT EXISTS skill_suggestions_locale_label_idx
  ON public.skill_suggestions (locale, label);

ALTER TABLE public.skill_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read skills" ON public.skill_suggestions
  FOR SELECT USING (auth.uid() IS NOT NULL);
