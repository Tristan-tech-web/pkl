import type { Metadata } from "next";
import { ViewTransition } from "react";
import { Atkinson_Hyperlegible_Mono, Atkinson_Hyperlegible_Next, Baloo_2, Bricolage_Grotesque, Nunito, Rubik } from "next/font/google";
import { NO_FLASH_SCRIPT } from "@/lib/appearance";
import "./globals.css";

const display = Bricolage_Grotesque({
  variable: "--ff-bricolage",
  subsets: ["latin"],
  axes: ["opsz"],
});

const sans = Atkinson_Hyperlegible_Next({
  variable: "--ff-atkinson",
  subsets: ["latin"],
});

const mono = Atkinson_Hyperlegible_Mono({
  variable: "--ff-mono",
  subsets: ["latin"],
});

const baloo = Baloo_2({ variable: "--ff-baloo", subsets: ["latin"], weight: ["500", "700", "800"] });
const nunito = Nunito({ variable: "--ff-nunito", subsets: ["latin"] });
const rubik = Rubik({ variable: "--ff-rubik", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EduSmart · Platform untuk semua jenis sekolah",
  description:
    "Atur kurikulum, mata pelajaran, dan struktur sekolah Anda sendiri: dari SD, madrasah, SMA, SMK, hingga SLB dan pesantren.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${display.variable} ${sans.variable} ${mono.variable} ${baloo.variable} ${nunito.variable} ${rubik.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ViewTransition>{children}</ViewTransition>
      </body>
    </html>
  );
}
