// Ikon garis konsisten (24px, tebal 1.9) untuk menu guru dan pemilik. Dekoratif: selalu aria-hidden.
const P: Record<string, React.ReactNode> = {
  absensi: <><rect x="5" y="4" width="14" height="17" rx="2.5" /><path d="M9 4V3h6v1M8.5 13l2.3 2.3L15.5 10.5" /></>,
  nilai: <><path d="M14.5 5.5l4 4L9 19l-4.5 1 1-4.5z" /><path d="M12.5 7.5l4 4" /></>,
  rencana: <><circle cx="12" cy="5" r="2.2" /><circle cx="6" cy="17" r="2.2" /><circle cx="18" cy="17" r="2.2" /><path d="M12 7.2v4.3M12 11.5c-3 0-6 1.5-6 3.3M12 11.5c3 0 6 1.5 6 3.3" /></>,
  bank: <><path d="M12 4l8 4-8 4-8-4z" /><path d="M4 12l8 4 8-4M4 16l8 4 8-4" /></>,
  pantau: <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="3" /></>,
  ujian: <><path d="M9.5 3.5h5M10.5 3.5v6L5 19a1.8 1.8 0 0 0 1.6 2.5h10.8A1.8 1.8 0 0 0 19 19l-5.5-9.5v-6" /><path d="M8 15h8" /></>,
  anggota: <><circle cx="9" cy="8.5" r="3.2" /><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" /><circle cx="17" cy="9.5" r="2.5" /><path d="M16.5 14.6c2.6 0 4.5 1.7 4.5 4.4" /></>,
  rombel: <><path d="M3 20h18M5 20V10l7-5 7 5v10" /><path d="M9.5 20v-5h5v5M12 5V3" /></>,
  berkas: <><path d="M3.5 7.5a2 2 0 0 1 2-2H10l2 2.5h6.5a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" /></>,
  tampilan: <><path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.4 0 2-1 2-2 0-1.6-1-2-1-3.2 0-1 .8-1.8 1.8-1.8H17a3.5 3.5 0 0 0 3.5-3.5C20.5 6.5 16.8 3.5 12 3.5z" /><circle cx="7.8" cy="11.5" r="1" /><circle cx="10.5" cy="7.5" r="1" /><circle cx="15" cy="7.8" r="1" /></>,
  keuangan: <><circle cx="12" cy="12" r="8.5" /><path d="M14.8 9.2c-.6-.8-1.6-1.2-2.8-1.2-1.6 0-2.8.8-2.8 2 0 3 5.6 1.4 5.6 4.2 0 1.2-1.2 2-2.8 2-1.3 0-2.4-.5-3-1.4M12 6.2V8M12 16v1.8" /></>,
  rapor: <><path d="M6.5 3.5h8l4 4V20a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z" /><path d="M14.5 3.5v4h4M9 12h6M9 15.5h6" /></>,
  integritas: <><path d="M12 3.5l7 2.8v5.4c0 4.4-3 7.6-7 8.8-4-1.2-7-4.4-7-8.8V6.3z" /><path d="M8.8 12l2.2 2.2 4.2-4.4" /></>,
  paket: <><path d="M9.5 4.5a2 2 0 1 1 4 0V6H18a1 1 0 0 1 1 1v3.5h-1.5a2 2 0 1 0 0 4H19V18a1 1 0 0 1-1 1h-4v-1.5a2 2 0 1 0-4 0V19H6a1 1 0 0 1-1-1v-4h1.5a2 2 0 1 0 0-4H5V7a1 1 0 0 1 1-1h3.5z" /></>,
};
export function Icon({ name, size = 24 }: { name: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {P[name] ?? P.paket}
    </svg>
  );
}
