import { describe, expect, it } from "vitest";
import { readPublicEnv } from "./env";

describe("readPublicEnv", () => {
  it("mengembalikan nilai bila lengkap", () => {
    expect(
      readPublicEnv({
        NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "pk",
      }),
    ).toEqual({ supabaseUrl: "https://x.supabase.co", supabasePublishableKey: "pk" });
  });

  it("menyebut env yang hilang", () => {
    expect(() => readPublicEnv({})).toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
  });
});
