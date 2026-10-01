import { describe, expect, it } from "vitest";
import { addDays, allocate, buildMeetings, examDatesFromPlan, isoWeekday, layoutTree, parseDates, sanitizeChapterContent, spacedOffsets, spread, wib } from "./skilltree";

// 2026-10-05 adalah Senin
const slots = [{ weekday: 1, startMin: 450, endMin: 540 }, { weekday: 3, startMin: 450, endMin: 540 }];

describe("tanggal", () => {
  it("hari ISO dan WIB→UTC", () => {
    expect(isoWeekday("2026-10-05")).toBe(1); expect(isoWeekday("2026-10-11")).toBe(7);
    expect(wib("2026-10-04", 15 * 60)).toBe("2026-10-04T08:00:00.000Z");
    expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
  });
  it("parseDates membuang tanggal tidak sah dan duplikat", () => expect(parseDates("2026-10-17, 2026-02-30 2026-10-17 2026-10-01")).toEqual(["2026-10-01", "2026-10-17"]));
});
describe("buildMeetings", () => {
  it("dua pertemuan per minggu dan melewati libur", () => {
    const m = buildMeetings({ start: "2026-10-05", weeks: 2, slots, holidays: ["2026-10-07"] });
    expect(m.map((x) => x.date)).toEqual(["2026-10-05", "2026-10-12", "2026-10-14"]);
  });
});
describe("allocate", () => {
  it("jumlah pas dan tiap bab minimal satu", () => {
    const a = allocate([1, 1, 4], 12); expect(a.reduce((p, q) => p + q, 0)).toBe(12); expect(Math.min(...a)).toBeGreaterThanOrEqual(1); expect(a[2]).toBeGreaterThan(a[0]);
  });
  it("pertemuan kurang dari bab", () => expect(allocate([1, 1, 1], 2)).toEqual([1, 1, 0]));
});
describe("spacedOffsets", () => {
  it("rasio Cepeda dan batas jarak pendek", () => {
    expect(spacedOffsets(20)).toEqual([2, 5, 10]); expect(spacedOffsets(3)).toEqual([]); expect(spacedOffsets(5)).toEqual([1, 3]);
  });
});
describe("layoutTree", () => {
  const meetings = buildMeetings({ start: "2026-10-05", weeks: 8, slots });
  const exams = [{ date: "2026-11-02", label: "Ulangan tengah" }];
  const l = layoutTree({ chapters: [{ title: "A", weight: 1 }, { title: "B", weight: 2 }], meetings, exams, prefix: "ST-abc" });
  it("persiapan dibuka H-1 pukul 15.00 WIB, tepat sebelum pertemuan", () => {
    const p = l.nodes.filter((n) => n.kind === "persiapan");
    for (const n of p) {
      const meet = new Date(n.meetingAt!).getTime(), unlock = new Date(n.unlockAt).getTime();
      expect(meet - unlock).toBeGreaterThan(0); expect(meet - unlock).toBeLessThan(26 * 3600_000);
    }
    expect(p.length).toBeGreaterThanOrEqual(2);
  });
  it("latihan setelah pertemuan terakhir bab, ulang antara bab dan ujian, boss H-2", () => {
    const a = l.chapterMeetings[0]; const lastA = a[a.length - 1];
    const lat = l.nodes.find((n) => n.code === "ST-abc-1-L1")!;
    expect(lat.unlockAt).toBe(wib(lastA.date, lastA.endMin));
    const ul = l.nodes.filter((n) => n.kind === "ulang" && n.chapter === 0);
    expect(ul.length).toBeGreaterThan(0);
    for (const u of ul) { expect(u.unlockAt > lat.unlockAt).toBe(true); expect(u.unlockAt < wib("2026-11-02", 0)).toBe(true); }
    const boss = l.nodes.find((n) => n.kind === "boss")!; expect(boss.unlockAt).toBe(wib("2026-10-31", 420));
  });
  it("kode unik dan urut menurut waktu buka", () => {
    expect(new Set(l.nodes.map((n) => n.code)).size).toBe(l.nodes.length);
    const t = l.nodes.map((n) => n.unlockAt); expect([...t].sort()).toEqual(t);
  });
  it("peringatan bila pertemuan kurang", () => expect(layoutTree({ chapters: [{ title: "A", weight: 1 }, { title: "B", weight: 1 }], meetings: meetings.slice(0, 1), exams: [], prefix: "P" }).warnings).toHaveLength(1));
});
describe("examDatesFromPlan", () => {
  it("memakai pertemuan terakhir di minggu ujian", () => {
    const m = buildMeetings({ start: "2026-10-05", weeks: 8, slots });
    expect(examDatesFromPlan({ start: "2026-10-05", meetings: m, schedule: [{ week: 4, kind: "ulangan_tengah", what: "" }, { week: 2, kind: "tugas", what: "" }] })).toEqual([{ date: "2026-10-28", label: "Ulangan tengah" }]);
  });
});
describe("isi AI", () => {
  it("membuang soal rusak dan membatasi pratinjau", () => {
    const c = sanitizeChapterContent({ previews: [{ title: "a", body_md: "isi pratinjau panjang" }, { title: "b", body_md: "isi lain yang cukup" }], pretest: [{ prompt: "p?", options: ["a", "b"], answer: 5, explanation: "x1" }, { prompt: "ok?", options: ["a", "b"], answer: 1, explanation: "benar" }] }, 1);
    expect(c.previews).toHaveLength(1); expect(c.pretest).toHaveLength(1);
  });
  it("spread membagi merata", () => expect(spread([1, 2, 3, 4, 5], 2)).toEqual([[1, 3, 5], [2, 4]]));
});
