// Suara EduSmart: santai, jelas, tidak berbau mesin. Dipakai di dua tempat:
// 1) VOICE_RULES ditambahkan ke setiap prompt AI yang hasilnya dibaca orang;
// 2) scrubAi membersihkan sisa kebiasaan model yang lolos dari prompt (tanda pisah panjang, pembuka dan penutup basa-basi).
// Panduan lengkap dan alasannya: docs/design/voice-guide.md.

export const VOICE_RULES = [
  "Gaya tulis: seperti kakak kelas atau guru muda yang menjelaskan di samping meja. Kalimat pendek, kata sehari-hari, boleh sedikit jenaka kalau pas.",
  "Langsung ke isi. Jangan membuka dengan sapaan basa-basi atau pujian (\"Tentu!\", \"Pertanyaan bagus!\", \"Berikut adalah...\") dan jangan menutup dengan ringkasan, ajakan bertanya lagi, atau \"Semoga membantu\".",
  "Jangan pakai tanda pisah panjang (— atau –); pakai titik atau koma. Hindari pola \"bukan hanya X, tetapi juga Y\" dan \"bukan X, melainkan Y\". Jangan memaksakan daftar tiga hal. Jangan pakai judul tebal, huruf tebal, atau poin-poin kecuali diminta.",
  "Hindari kata dan klise ini: krusial, esensial, sangat penting untuk, di era digital, mari kita selami, menyelami, memfasilitasi, mengoptimalkan, holistik, komprehensif, tak terpisahkan, ekosistem, perjalanan belajar.",
  "Jangan menyebut \"para ahli\" atau \"banyak orang\" tanpa sumber. Beri contoh konkret yang dekat dengan murid (kantin, ponsel, bola, jajan) kalau membantu.",
  "Variasikan panjang kalimat. Akui kalau sesuatu memang sulit. Jangan memuji berlebihan.",
].join(" ");

const OPENERS = /^\s*(?:(?:tentu(?: saja)?|baik(?:lah)?|oke(?:y)?|wah|halo|hai)[,!.]\s*)+/i;
const PRAISE = /^\s*(?:itu\s+)?(?:pertanyaan|ide|pemikiran|pertanyaannya)\s+(?:yang\s+)?(?:bagus|menarik|hebat|keren)[^.!?\n]*[.!]\s*/i;
const CLOSERS = /(?:^|(?<=[.!?]\s))(?:semoga[^.!?\n]*membantu|jangan ragu(?: untuk)?[^.!?\n]*|silakan (?:bertanya|tanya)[^.!?\n]*|apakah ada[^.!?\n]*\?|ada (?:hal|pertanyaan)[^.!?\n]*\?)[.!?]?\s*$/i;
const SWAPS: [RegExp, string][] = [
  [/\bmari kita\b/gi, "ayo"],
  [/\bkrusial\b/gi, "penting"],
  [/\besensial\b/gi, "penting"],
  [/\bmemfasilitasi\b/gi, "membantu"],
  [/\bmenyelami\b/gi, "mempelajari"],
];

/** Merapikan teks buatan AI. Murni dan idempoten; tidak mengubah angka rentang seperti 10–12. */
export function scrubAi(input: string, opts: { plain?: boolean } = {}): string {
  let t = input;
  t = t.replace(/\s*—\s*/g, ", ").replace(/(?<=\p{L})\s+–\s+(?=\p{L})/gu, ", ");
  const before = t;
  t = t.replace(OPENERS, "").replace(PRAISE, "");
  const stripped = t !== before;
  for (let i = 0; i < 2; i++) t = t.replace(CLOSERS, "").trimEnd();
  for (const [re, to] of SWAPS) t = t.replace(re, (m) => (m[0] === m[0].toUpperCase() ? to[0].toUpperCase() + to.slice(1) : to));
  if (opts.plain) t = t.replace(/\*\*(.+?)\*\*/g, "$1").replace(/(?<![\w*])\*(\S[^*\n]*?\S|\S)\*(?![\w*])/g, "$1").replace(/^#{1,6}\s+/gm, "");
  t = t.replace(/,\s*,/g, ",").replace(/[ \t]{2,}/g, " ").trim();
  return stripped && t.length ? t[0].toUpperCase() + t.slice(1) : t;
}
