// Kalimat Pena di beranda murid: dipilih dari keadaan nyata (jam, streak, XP menuju level, misi), bukan acak.
// Suara mengikuti docs/design/voice-guide.md: pendek, hangat, konkret, tanpa pujian berlebihan.
export type PenaState = { hour: number; day: number; name: string; level: number; streak: number; into: number; need: number; missionsDone: boolean };

export function penaLine(s: PenaState): string {
  const first = s.name.trim().split(/\s+/)[0] || "kamu";
  const left = Math.max(0, s.need - s.into);
  if (s.hour >= 21 || s.hour < 4) return "Sudah malam. Satu simpul lagi, habis itu tidur ya.";
  if (s.streak >= 7) return `${s.streak} hari beruntun! Api unggunmu sudah besar.`;
  if (left > 0 && left <= 60) return `Tinggal ${left} XP lagi ke level ${s.level + 1}.`;
  if (s.streak >= 3) return `${s.streak} hari berturut-turut. Jangan sampai putus ya.`;
  if (s.missionsDone) return "Misi hari ini beres. Mau nambah satu latihan?";
  const pool = s.hour < 10
    ? [`Pagi, ${first}! Siap jalan?`, "Otak masih hangat. Waktu bagus buat satu simpul.", `Halo ${first}, jalannya sudah menunggu.`]
    : [`Ayo ${first}, satu simpul dulu.`, "Pelan-pelan juga sampai.", "Yang kemarin sudah lewat. Hari ini mulai lagi."];
  return pool[Math.abs(s.day) % pool.length];
}
