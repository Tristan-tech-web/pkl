"use client";

import { Button } from "@/components/ui";

export function PrintButton() {
  return (
    <Button type="button" variant="ghost" onClick={() => window.print()}>
      Cetak atau simpan PDF
    </Button>
  );
}
