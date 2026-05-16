import * as cheerio from "cheerio";

/**
 * Result of scraping a job posting URL. Every field is best-effort — we return
 * what we can confidently extract; the form treats them as suggestions.
 */
export type ParsedJob = {
  companyName?: string;
  position?: string;
  location?: string;
  jobPostingContent?: string;
  jobPostingUrl: string;
  source?: string;
  workType?: "remote" | "hybrid" | "onsite";
  salaryExpectation?: string;
  /** What heuristic the data came from — handy for debugging. */
  via: "json-ld" | "open-graph" | "source-specific" | "title-fallback";
};

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) JobTrack/1.0";

/**
 * Fetches a job URL and returns extracted metadata. Tries schema.org JobPosting
 * JSON-LD first (the cleanest source — most modern ATS embed it), then falls
 * back to OpenGraph tags and HTML heuristics.
 */
export async function parseJobUrl(rawUrl: string): Promise<ParsedJob> {
  const url = normalizeUrl(rawUrl);
  const host = new URL(url).hostname.replace(/^www\./, "");
  const source = sourceFromHost(host);

  const html = await fetchHtml(url);
  const $ = cheerio.load(html);

  // 1) Schema.org JobPosting JSON-LD — the gold path.
  const jsonLd = readJobPostingJsonLd($);
  if (jsonLd) {
    const desc =
      typeof jsonLd.description === "string"
        ? stripHtml(jsonLd.description)
        : undefined;
    const org = jsonLd.hiringOrganization as AnyRecord | undefined;
    return {
      companyName: cleanText(org?.name),
      position: cleanText(jsonLd.title),
      location: locationFromJsonLd(jsonLd),
      jobPostingContent: desc,
      jobPostingUrl: url,
      source,
      workType: workTypeFromJsonLd(jsonLd, desc),
      salaryExpectation: salaryFromJsonLd(jsonLd),
      via: "json-ld",
    };
  }

  // 2) Source-specific HTML parsing for sites that don't ship JSON-LD.
  const specific = sourceSpecific(host, $);
  if (specific) {
    return {
      ...specific,
      source,
      jobPostingUrl: url,
      via: "source-specific",
    };
  }

  // 3) OpenGraph / meta — site has a real preview at least.
  const ogTitle = $("meta[property='og:title']").attr("content");
  const ogSite = $("meta[property='og:site_name']").attr("content");
  const ogDesc =
    $("meta[property='og:description']").attr("content") ||
    $("meta[name='description']").attr("content");
  if (ogTitle) {
    const split = splitTitle(ogTitle);
    return {
      companyName: cleanText(split.company ?? ogSite ?? undefined),
      position: cleanText(split.position ?? ogTitle),
      jobPostingContent: cleanText(ogDesc),
      jobPostingUrl: url,
      source,
      via: "open-graph",
    };
  }

  // 4) Last resort — page title.
  const title = $("title").first().text();
  const split = splitTitle(title);
  return {
    companyName: cleanText(split.company),
    position: cleanText(split.position ?? title),
    jobPostingUrl: url,
    source,
    via: "title-fallback",
  };
}

/* ---------- helpers ---------- */

function normalizeUrl(input: string): string {
  let s = input.trim();
  if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
  const u = new URL(s);
  // Strip common tracking params so we don't store noisy URLs.
  const noise = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "trk",
    "trkInfo",
    "refId",
    "_gl",
  ];
  for (const k of noise) u.searchParams.delete(k);
  return u.toString();
}

async function fetchHtml(url: string): Promise<string> {
  const ctl = new AbortController();
  const timeout = setTimeout(() => ctl.abort(), 12000);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
      signal: ctl.signal,
    });
    if (!res.ok) {
      throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
    }
    return await res.text();
  } finally {
    clearTimeout(timeout);
  }
}

type AnyRecord = Record<string, unknown>;

function readJobPostingJsonLd($: cheerio.CheerioAPI): AnyRecord | null {
  const blocks = $("script[type='application/ld+json']").toArray();
  for (const el of blocks) {
    const raw = $(el).contents().text().trim();
    if (!raw) continue;
    // Some sites wrap multiple JSON-LD documents in an array, or have
    // CDATA / comment wrappers that break JSON.parse — be lenient.
    const cleaned = raw
      .replace(/^\/\*<!\[CDATA\[\*\//, "")
      .replace(/\/\*\]\]>\*\/$/, "");
    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      continue;
    }
    const match = findJobPosting(parsed);
    if (match) return match;
  }
  return null;
}

function findJobPosting(node: unknown): AnyRecord | null {
  if (!node || typeof node !== "object") return null;
  if (Array.isArray(node)) {
    for (const item of node) {
      const found = findJobPosting(item);
      if (found) return found;
    }
    return null;
  }
  const obj = node as AnyRecord;
  const type = obj["@type"];
  const types = Array.isArray(type) ? type : [type];
  if (types.includes("JobPosting")) return obj;
  if (obj["@graph"]) return findJobPosting(obj["@graph"]);
  return null;
}

function locationFromJsonLd(j: AnyRecord): string | undefined {
  const loc = j.jobLocation;
  if (!loc) return undefined;
  const arr = Array.isArray(loc) ? loc : [loc];
  const parts = arr
    .map((entry) => {
      const e = entry as AnyRecord;
      const addr = (e.address || e) as AnyRecord;
      const city = cleanText(addr.addressLocality as string);
      const region = cleanText(addr.addressRegion as string);
      const country = cleanText(addr.addressCountry as string | AnyRecord);
      const countryStr =
        typeof country === "string"
          ? country
          : ((country as AnyRecord | undefined)?.name as string | undefined);
      return [city, region, countryStr].filter(Boolean).join(", ");
    })
    .filter(Boolean);
  return parts[0] || undefined;
}

function workTypeFromJsonLd(
  j: AnyRecord,
  desc?: string,
): ParsedJob["workType"] {
  const remote = j.jobLocationType;
  if (typeof remote === "string" && /telecommute|remote/i.test(remote)) {
    return "remote";
  }
  if (!desc) return undefined;
  if (/\bhybrid\b/i.test(desc)) return "hybrid";
  if (/\b(remote|work from home|wfh)\b/i.test(desc)) return "remote";
  if (/\bon[- ]?site\b|\bin[- ]?office\b/i.test(desc)) return "onsite";
  return undefined;
}

function salaryFromJsonLd(j: AnyRecord): string | undefined {
  const bs = j.baseSalary as AnyRecord | undefined;
  if (!bs) return undefined;
  const currency = (bs.currency || "USD") as string;
  const value = bs.value as AnyRecord | number | undefined;
  if (typeof value === "number") return `${currency} ${value}`;
  if (value && typeof value === "object") {
    const v = value as AnyRecord;
    const min = v.minValue;
    const max = v.maxValue;
    const single = v.value;
    if (typeof single === "number") return `${currency} ${single}`;
    if (typeof min === "number" && typeof max === "number") {
      return `${currency} ${min} – ${max}`;
    }
    if (typeof min === "number") return `${currency} ${min}+`;
  }
  return undefined;
}

function sourceSpecific(
  host: string,
  $: cheerio.CheerioAPI,
): Partial<ParsedJob> | null {
  // LinkedIn job page (when accessible without auth) — the JobPosting JSON-LD
  // is usually absent; fall back to their known DOM hooks.
  if (host.endsWith("linkedin.com")) {
    const title = $(".top-card-layout__title, h1.topcard__title").first().text();
    const company = $(".topcard__org-name-link, .top-card-layout__second-subline a")
      .first()
      .text();
    const location = $(".topcard__flavor--bullet, .top-card-layout__second-subline span")
      .first()
      .text();
    const desc = $(".show-more-less-html__markup, .description__text")
      .first()
      .text();
    if (title || company) {
      return {
        position: cleanText(title),
        companyName: cleanText(company),
        location: cleanText(location),
        jobPostingContent: cleanText(desc),
      };
    }
  }
  return null;
}

function sourceFromHost(host: string): string | undefined {
  if (host.endsWith("linkedin.com")) return "LinkedIn";
  if (host.endsWith("indeed.com")) return "Indeed";
  if (host.includes("greenhouse.io")) return "Greenhouse";
  if (host.includes("lever.co")) return "Lever";
  if (host.includes("workable.com")) return "Workable";
  if (host.includes("ashbyhq.com")) return "Ashby";
  if (host.includes("smartrecruiters.com")) return "SmartRecruiters";
  if (host.includes("wellfound.com") || host.includes("angel.co")) {
    return "Wellfound";
  }
  if (host.endsWith("ycombinator.com")) return "Y Combinator";
  return undefined;
}

function splitTitle(s?: string): { position?: string; company?: string } {
  if (!s) return {};
  // Common patterns:
  //   "Senior Frontend Engineer at Stripe"
  //   "Stripe — Senior Frontend Engineer"
  //   "Senior Frontend Engineer | Stripe"
  //   "Senior Frontend Engineer – Stripe – jobs.lever.co"
  const t = s.trim();
  const atMatch = t.match(/^(.+?)\s+(?:at|@)\s+([^|–—\-]+)/i);
  if (atMatch) return { position: atMatch[1].trim(), company: atMatch[2].trim() };
  const sepMatch = t.split(/\s+[|–—\-]\s+/);
  if (sepMatch.length >= 2) {
    // Heuristic: company is usually the shorter side, position the longer.
    const [a, b] = sepMatch;
    if (a.length < b.length) return { company: a.trim(), position: b.trim() };
    return { position: a.trim(), company: b.trim() };
  }
  return { position: t };
}

function cleanText<T extends string | undefined | null | unknown>(
  s: T,
): string | undefined {
  if (s === undefined || s === null) return undefined;
  const str = typeof s === "string" ? s : String(s);
  const collapsed = str.replace(/\s+/g, " ").trim();
  return collapsed.length > 0 ? collapsed : undefined;
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
