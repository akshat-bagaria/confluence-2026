import type { APIRoute } from "astro";
import { MongoClient } from "mongodb";

export const prerender = false;

const THEMES = [
  "LOSSLESS",
  "Autopsy",
  "Featherlight",
  "Need-To-Know-Basis",
  "Resurrections",
  "Hands-off",
  "CrossBreed",
] as const;
const SRN_PATTERN = /^PES1UG\d{2}[A-Z]{2}\d{3}$/;

type Registration = {
  submittedAt: Date;
  teamName: string;
  institution: string;
  leadName: string;
  leadEmail: string;
  leadPhone: string;
  leadSRN: string;
  member2: string;
  member2SRN: string;
  member3: string;
  member3SRN: string;
  member4: string;
  member4SRN: string;
  theme: string;
  idea: string;
};

type MongoGlobal = typeof globalThis & {
  confluenceMongoClient?: Promise<MongoClient>;
};
const mongoGlobal = globalThis as MongoGlobal;

function getMongoClient() {
  // Astro loads local .env values into import.meta.env during development.
  // Vercel supplies production environment variables through process.env.
  const uri = import.meta.env.MONGODB_URI || process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not configured.");

  if (!mongoGlobal.confluenceMongoClient) {
    mongoGlobal.confluenceMongoClient = new MongoClient(uri, {
      serverSelectionTimeoutMS: 10000,
    }).connect().catch((error: unknown) => {
      delete mongoGlobal.confluenceMongoClient;
      throw error;
    });
  }

  return mongoGlobal.confluenceMongoClient;
}

function json(message: string, status: number) {
  return new Response(JSON.stringify({ message }), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function readField(form: FormData, name: string, maxLength: number) {
  const value = form.get(name);
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export const POST: APIRoute = async ({ request }) => {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return json("This registration request came from an unexpected site.", 403);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json("The submitted form could not be read. Please try again.", 400);
  }

  if (readField(form, "website", 200)) {
    return json("Registration could not be accepted.", 400);
  }

  const teamName = readField(form, "teamName", 80);
  const institution = readField(form, "college", 120);
  const leadName = readField(form, "leadName", 100);
  const leadEmail = readField(form, "leadEmail", 160).toLowerCase();
  const leadPhone = readField(form, "leadPhone", 20);
  const leadSRN = readField(form, "leadSRN", 13).toUpperCase();
  const member2 = readField(form, "member2", 100);
  const member2SRN = readField(form, "member2SRN", 13).toUpperCase();
  const member3 = readField(form, "member3", 100);
  const member3SRN = readField(form, "member3SRN", 13).toUpperCase();
  const member4 = readField(form, "member4", 100);
  const member4SRN = readField(form, "member4SRN", 13).toUpperCase();
  const theme = readField(form, "theme", 80);
  const idea = readField(form, "idea", 2000);
  const consent = readField(form, "consent", 10);

  const srns = [leadSRN, member2SRN, member3SRN, member4SRN].filter(Boolean);
  const invalid =
    !teamName || !institution || !leadName || !leadEmail || !leadPhone ||
    !member2 || !member3 || !leadSRN || !member2SRN || !member3SRN ||
    consent !== "yes" ||
    !THEMES.includes(theme as (typeof THEMES)[number]) ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leadEmail) ||
    !/^\+?[0-9][0-9\s()\-]{7,18}$/.test(leadPhone) ||
    idea.length < 30 ||
    !SRN_PATTERN.test(leadSRN) ||
    !SRN_PATTERN.test(member2SRN) ||
    !SRN_PATTERN.test(member3SRN) ||
    (member4 ? !SRN_PATTERN.test(member4SRN) : Boolean(member4SRN)) ||
    new Set(srns).size !== srns.length;

  if (invalid) {
    return json("Some information is missing or invalid. Check the team details, SRNs, track, and idea.", 400);
  }

  const registration: Registration = {
    submittedAt: new Date(),
    teamName,
    institution,
    leadName,
    leadEmail,
    leadPhone,
    leadSRN,
    member2,
    member2SRN,
    member3,
    member3SRN,
    member4,
    member4SRN,
    theme,
    idea,
  };

  try {
    const client = await getMongoClient();
    const database = import.meta.env.MONGODB_DB || process.env.MONGODB_DB || "confluence";
    await client.db(database).collection<Registration>("registrations").insertOne(registration);
    return json("Registration saved successfully.", 201);
  } catch (error) {
    console.error("Registration database write failed:", error);
    return json("We couldn’t save your registration right now. Please try again later.", 503);
  }
};
