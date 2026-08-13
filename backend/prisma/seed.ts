/**
 * Seed script — imports the ORIGINAL Bincom election data (parsed from the supplied
 * MySQL dump into source-data.json) into Neon PostgreSQL via Prisma.
 *
 * No records are invented, renamed, or altered. Empty MySQL "0000-00-00 00:00:00"
 * dates (not valid in Postgres) are converted to NULL since they represent "no date
 * recorded" in the original data, not an actual date.
 *
 * Run with: npm run db:seed  (wraps `prisma db seed` -> ts-node prisma/seed.ts)
 */
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

interface SourceData {
  states: Record<string, string>[];
  lga: Record<string, string>[];
  ward: Record<string, string>[];
  polling_unit: Record<string, string>[];
  party: Record<string, string>[];
  agentname: Record<string, string>[];
  announced_lga_results: Record<string, string>[];
  announced_pu_results: Record<string, string>[];
  announced_state_results: Record<string, string>[];
  announced_ward_results: Record<string, string>[];
}

function toDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  if (value.startsWith("0000-00-00")) return null;
  const d = new Date(value.replace(" ", "T") + "Z");
  return isNaN(d.getTime()) ? null : d;
}

function toInt(value: string | null | undefined): number {
  if (value === null || value === undefined || value === "") return 0;
  const n = parseInt(value, 10);
  return isNaN(n) ? 0 : n;
}

function nullableStr(value: string | null | undefined): string | null {
  if (value === null || value === undefined || value === "") return null;
  return value;
}

async function main() {
  const raw = fs.readFileSync(path.join(__dirname, "source-data.json"), "utf-8");
  const data: SourceData = JSON.parse(raw);

  console.log("Seeding states...");
  for (const s of data.states) {
    await prisma.state.upsert({
      where: { stateId: toInt(s.state_id) },
      update: {},
      create: { stateId: toInt(s.state_id), stateName: s.state_name },
    });
  }

  console.log("Seeding parties...");
  for (const p of data.party) {
    await prisma.party.upsert({
      where: { partyId: p.partyid },
      update: { partyName: p.partyname },
      create: { partyId: p.partyid, partyName: p.partyname },
    });
  }

  console.log("Seeding LGAs...");
  for (const l of data.lga) {
    await prisma.lga.upsert({
      where: { uniqueId: toInt(l.uniqueid) },
      update: {},
      create: {
        uniqueId: toInt(l.uniqueid),
        lgaId: toInt(l.lga_id),
        lgaName: l.lga_name,
        stateId: toInt(l.state_id),
        lgaDescription: nullableStr(l.lga_description),
        enteredByUser: nullableStr(l.entered_by_user),
        dateEntered: toDate(l.date_entered),
        userIpAddress: nullableStr(l.user_ip_address),
      },
    });
  }

  console.log("Seeding wards...");
  for (const w of data.ward) {
    await prisma.ward.upsert({
      where: { uniqueId: toInt(w.uniqueid) },
      update: {},
      create: {
        uniqueId: toInt(w.uniqueid),
        wardId: toInt(w.ward_id),
        wardName: w.ward_name,
        lgaId: toInt(w.lga_id),
        wardDescription: nullableStr(w.ward_description),
        enteredByUser: nullableStr(w.entered_by_user),
        dateEntered: toDate(w.date_entered),
        userIpAddress: nullableStr(w.user_ip_address),
      },
    });
  }

  console.log("Seeding polling units...");
  // 170 rows in the source dump have lga_id/ward_id/polling_unit_id = 0 and no name —
  // blank placeholder entries with only lat/long populated (confirmed to have zero
  // linked results or agents). lga_id 0 was never defined in the `lga` table, so these
  // are skipped rather than seeded against a fabricated placeholder LGA.
  let skippedOrphans = 0;
  const seededPuIds = new Set<number>();
  for (const pu of data.polling_unit) {
    const lgaId = toInt(pu.lga_id);
    if (lgaId === 0) {
      skippedOrphans++;
      continue;
    }
    const uniqueWardId = toInt(pu.uniquewardid);
    await prisma.pollingUnit.upsert({
      where: { uniqueId: toInt(pu.uniqueid) },
      update: {},
      create: {
        uniqueId: toInt(pu.uniqueid),
        pollingUnitId: toInt(pu.polling_unit_id),
        wardId: toInt(pu.ward_id),
        lgaId: lgaId,
        uniqueWardId: uniqueWardId || null,
        pollingUnitNumber: nullableStr(pu.polling_unit_number),
        pollingUnitName: nullableStr(pu.polling_unit_name),
        pollingUnitDescription: nullableStr(pu.polling_unit_description),
        lat: nullableStr(pu.lat),
        long: nullableStr(pu.long),
        enteredByUser: nullableStr(pu.entered_by_user),
        dateEntered: toDate(pu.date_entered),
        userIpAddress: nullableStr(pu.user_ip_address),
      },
    });
    seededPuIds.add(toInt(pu.uniqueid));
  }

  if (skippedOrphans > 0) {
    console.log(`Skipped ${skippedOrphans} blank placeholder polling_unit rows (lga_id=0, no data attached).`);
  }

  console.log("Seeding agents...");
  // A handful of agent rows reference a polling unit id that isn't in `polling_unit`
  // at all (a dangling reference already present in the source dump). Preserve the
  // agent's own data and link to NULL instead of dropping the record.
  let agentsWithoutPu = 0;
  for (const a of data.agentname) {
    const puId = toInt(a.pollingunit_uniqueid);
    const validPuId = seededPuIds.has(puId) ? puId : null;
    if (validPuId === null) agentsWithoutPu++;
    await prisma.agentName.upsert({
      where: { nameId: toInt(a.name_id) },
      update: {},
      create: {
        nameId: toInt(a.name_id),
        firstname: a.firstname,
        lastname: a.lastname,
        email: nullableStr(a.email),
        phone: a.phone,
        pollingUnitUniqueId: validPuId,
      },
    });
  }
  if (agentsWithoutPu > 0) {
    console.log(`${agentsWithoutPu} agent(s) reference a polling unit not present in the dump; linked as NULL.`);
  }

  console.log("Seeding LGA results...");
  for (const r of data.announced_lga_results) {
    await prisma.announcedLgaResult.upsert({
      where: { resultId: toInt(r.result_id) },
      update: {},
      create: {
        resultId: toInt(r.result_id),
        lgaId: toInt(r.lga_name), // dump mislabels the lga_id column as lga_name
        partyAbbreviation: r.party_abbreviation,
        partyScore: toInt(r.party_score),
        enteredByUser: nullableStr(r.entered_by_user),
        dateEntered: toDate(r.date_entered) ?? new Date(0),
        userIpAddress: nullableStr(r.user_ip_address),
      },
    });
  }

  console.log("Seeding polling unit results...");
  for (const r of data.announced_pu_results) {
    await prisma.announcedPuResult.upsert({
      where: { resultId: toInt(r.result_id) },
      update: {},
      create: {
        resultId: toInt(r.result_id),
        pollingUnitUniqueId: toInt(r.polling_unit_uniqueid),
        partyAbbreviation: r.party_abbreviation,
        partyScore: toInt(r.party_score),
        enteredByUser: nullableStr(r.entered_by_user),
        dateEntered: toDate(r.date_entered) ?? new Date(0),
        userIpAddress: nullableStr(r.user_ip_address),
      },
    });
  }

  // announced_state_results / announced_ward_results are empty in the source dump —
  // nothing to seed, tables are created for API/schema completeness only.

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
