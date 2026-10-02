import { describe, expect, it } from "vitest";
import { penaLine, type PenaState } from "./pena-says";

const base: PenaState = { hour: 14, day: 0, name: "Ayu Lestari", level: 2, streak: 0, into: 10, need: 282, missionsDone: false };
describe("penaLine", () => {
  it("malam menyuruh istirahat", () => expect(penaLine({ ...base, hour: 22 })).toMatch(/tidur/));
  it("streak panjang diutamakan", () => expect(penaLine({ ...base, streak: 9 })).toContain("9 hari beruntun"));
  it("dekat naik level menyebut sisa XP", () => expect(penaLine({ ...base, into: 250 })).toBe("Tinggal 32 XP lagi ke level 3."));
  it("memakai nama depan", () => expect(penaLine({ ...base, hour: 7, day: 0 })).toContain("Ayu"));
  it("misi beres", () => expect(penaLine({ ...base, missionsDone: true })).toMatch(/Misi hari ini beres/));
  it("tidak memakai tanda pisah panjang atau seru berlebihan", () => {
    for (let d = 0; d < 6; d++) for (const h of [7, 14]) { const t = penaLine({ ...base, hour: h, day: d }); expect(t).not.toMatch(/—|!!/); }
  });
});
