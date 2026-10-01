"use client";

import { useEffect } from "react";
import { encodeAvatar, type Avatar } from "@/lib/avatar";

// Menerapkan pilihan maskot pengguna ke <html data-avatar> agar semua maskot di halaman ikut berubah.
export function AvatarApply({ avatar }: { avatar: Avatar }) {
  const key = encodeAvatar(avatar);
  useEffect(() => { document.documentElement.dataset.avatar = key; }, [key]);
  return null;
}
