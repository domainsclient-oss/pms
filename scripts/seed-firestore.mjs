import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

for (const line of readFileSync(join(root, ".env"), "utf8").split(/\r?\n/)) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (!match) continue;
  const [, key, rawValue] = match;
  const value = rawValue.trim().replace(/^"(.*)"$/, "$1");
  process.env[key.trim()] = value;
}

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
});
const firestore = getFirestore(app);

const service = (url, username, password, notes = "") => ({ url, username, password, notes });

const projects = [
  {
    id: "northstar", name: "Northstar Commerce", client: "Northstar Retail Co.", type: "E-commerce", status: "Live",
    startDate: "2025-01-14", launchDate: "2025-03-28", description: "A high-volume commerce experience for a multi-brand retail group.", owner: "Maya Chen",
    website: service("https://northstar-retail.com", "admin@northstar-retail.com", "northstar-admin-2025", "Storefront and CMS access."),
    vercel: service("https://vercel.com/northstar", "maya@studio.test", "vercel-northstar"),
    github: service("https://github.com/pms/northstar-commerce", "pms-studio", "github-northstar"),
    gmail: service("", "ops@northstar-retail.com", "gmail-northstar"),
    resend: { ...service("https://resend.com", "ops@northstar-retail.com", "resend-northstar"), apiKey: "re_northstar_8d7f9d2c" },
    hosting: { ...service("https://dashboard.hosting.test", "northstar-host", "hosting-northstar"), provider: "Vercel", plan: "Pro", serverIp: "76.76.21.21", renewalDate: "2025-12-01", sshPort: "22" },
    cpanel: service("https://cpanel.northstar-retail.com", "northstar", "cpanel-northstar"),
    webmail: service("https://mail.northstar-retail.com", "ops@northstar-retail.com", "webmail-northstar"),
    notes: "Quarterly performance review scheduled for June.",
  },
  {
    id: "atlas", name: "Atlas Health Portal", client: "Atlas Health Network", type: "Web Application", status: "Development",
    startDate: "2025-05-06", launchDate: "2025-08-18", description: "Secure patient engagement and care coordination portal.", owner: "Jordan Smith",
    website: service("https://atlas-preview.studio.test", "portal-admin@atlas.test", "atlas-portal-admin"),
    vercel: service("https://vercel.com/atlas-health", "jordan@studio.test", "vercel-atlas"),
    github: service("https://github.com/pms/atlas-portal", "pms-studio", "github-atlas"),
    gmail: service("", "engineering@atlas.test", "gmail-atlas"),
    resend: { ...service("https://resend.com", "engineering@atlas.test", "resend-atlas"), apiKey: "re_atlas_4b9c8e11" },
    hosting: { ...service("", "", ""), provider: "AWS", plan: "Production", serverIp: "18.203.12.41", renewalDate: "2026-05-06", sshPort: "22" },
    cpanel: service("", "", ""),
    webmail: service("https://mail.atlas.test", "engineering@atlas.test", "webmail-atlas"),
    notes: "Pending clinical review of onboarding flow.",
  },
  {
    id: "shoreline", name: "Shoreline Studio", client: "Shoreline Architecture", type: "Website", status: "Testing",
    startDate: "2025-02-20", launchDate: "2025-06-09", description: "An editorial portfolio site for a coastal architecture practice.", owner: "Maya Chen",
    website: service("https://shoreline-preview.studio.test", "hello@shoreline.test", "shoreline-admin"),
    vercel: service("https://vercel.com/shoreline", "maya@studio.test", "vercel-shoreline"),
    github: service("https://github.com/pms/shoreline", "pms-studio", "github-shoreline"),
    gmail: service("", "hello@shoreline.test", "gmail-shoreline"),
    resend: { ...service("https://resend.com", "hello@shoreline.test", "resend-shoreline"), apiKey: "re_shoreline_2a7e5c90" },
    hosting: { ...service("", "", ""), provider: "Vercel", plan: "Hobby", serverIp: "76.76.21.21", renewalDate: "2025-09-20", sshPort: "22" },
    cpanel: service("", "", ""),
    webmail: service("https://mail.shoreline.test", "hello@shoreline.test", "webmail-shoreline"),
    notes: "Client QA in progress.",
  },
  {
    id: "forge", name: "Forge Manufacturing", client: "Forge Industrial Group", type: "WordPress", status: "Maintenance",
    startDate: "2024-09-04", launchDate: "2024-11-22", description: "A product catalogue and lead generation site for industrial manufacturing.", owner: "Alex Rivera",
    website: service("https://forge-industrial.com", "admin@forge-industrial.com", "forge-admin"),
    vercel: service("", "", ""),
    github: service("https://github.com/pms/forge-wordpress", "pms-studio", "github-forge"),
    gmail: service("", "marketing@forge-industrial.com", "gmail-forge"),
    resend: { ...service("https://resend.com", "marketing@forge-industrial.com", "resend-forge"), apiKey: "re_forge_9b8c7d12" },
    hosting: { ...service("https://forge-host.test", "forge-host", "hosting-forge"), provider: "Cloudways", plan: "Business", serverIp: "104.21.8.77", renewalDate: "2025-11-12", sshPort: "22" },
    cpanel: service("https://cpanel.forge-industrial.com", "forge", "cpanel-forge"),
    webmail: service("https://mail.forge-industrial.com", "marketing@forge-industrial.com", "webmail-forge"),
    notes: "Monthly plugin and dependency maintenance.",
  },
  {
    id: "kindred", name: "Kindred Goods", client: "Kindred Goods Ltd.", type: "Shopify", status: "Completed",
    startDate: "2024-04-12", launchDate: "2024-07-01", description: "A refined Shopify storefront for a sustainable home goods label.", owner: "Alex Rivera",
    website: service("https://kindredgoods.co", "studio@kindredgoods.co", "kindred-admin"),
    vercel: service("", "", ""),
    github: service("https://github.com/pms/kindred-goods", "pms-studio", "github-kindred"),
    gmail: service("", "studio@kindredgoods.co", "gmail-kindred"),
    resend: { ...service("https://resend.com", "studio@kindredgoods.co", "resend-kindred"), apiKey: "re_kindred_3c6d8a10" },
    hosting: { ...service("", "", ""), provider: "Shopify", plan: "Advanced", serverIp: "", renewalDate: "2025-07-01", sshPort: "" },
    cpanel: service("", "", ""),
    webmail: service("https://mail.kindredgoods.co", "studio@kindredgoods.co", "webmail-kindred"),
    notes: "Handover complete. Retainer ended.",
  },
];

const users = [
  { id: "u1", name: "Maya Chen", email: "maya@studio.test", role: "Admin", status: "Active", createdDate: "2024-01-14", lastLogin: "Today, 09:42" },
  { id: "u2", name: "Jordan Smith", email: "jordan@studio.test", role: "Staff", status: "Active", createdDate: "2024-02-22", lastLogin: "Today, 08:17" },
  { id: "u3", name: "Alex Rivera", email: "alex@studio.test", role: "Staff", status: "Active", createdDate: "2024-03-08", lastLogin: "Yesterday, 16:30" },
  { id: "u4", name: "Sam Taylor", email: "sam@client.test", role: "Viewer", status: "Invited", createdDate: "2025-05-01", lastLogin: "Not yet" },
];

const batch = firestore.batch();
for (const { id, ...project } of projects) {
  batch.set(firestore.collection("projects").doc(id), { ...project, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
}
for (const { id, ...user } of users) {
  batch.set(firestore.collection("users").doc(id), { ...user, createdAt: FieldValue.serverTimestamp() }, { merge: true });
}
await batch.commit();
console.log(`Seeded ${projects.length} projects and ${users.length} users into Firestore.`);
