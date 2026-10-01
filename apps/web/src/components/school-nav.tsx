import Link from "next/link";

const ITEMS = [
  { slug: "", label: "Ringkasan" },
  { slug: "rombel", label: "Rombel" },
  { slug: "anggota", label: "Anggota" },
  { slug: "mapel", label: "Mata pelajaran" },
  { slug: "materi", label: "Materi" },
  { slug: "pantau", label: "Pantau belajar" },
  { slug: "ai", label: "Tutor AI" },
];

export function SchoolNav({ schoolId, active }: { schoolId: string; active: string }) {
  return (
    <nav aria-label="Pengelolaan sekolah" className="mb-8 overflow-x-auto border-b border-line">
      <ul className="flex min-w-max gap-1">
        {ITEMS.map((i) => {
          const current = i.slug === active;
          return (
            <li key={i.slug}>
              <Link
                href={`/dashboard/sekolah/${schoolId}${i.slug ? `/${i.slug}` : ""}`}
                aria-current={current ? "page" : undefined}
                className={`inline-flex min-h-11 items-center border-b-2 px-3 font-semibold ${
                  current ? "border-pen text-pen" : "border-transparent text-ink-soft hover:text-ink"
                }`}
              >
                {i.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
