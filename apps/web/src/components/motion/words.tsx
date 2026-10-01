// Memecah teks menjadi kata bertopeng agar bisa dianimasikan satu per satu (kinetic typography).
export function Words({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((w, i) => (
        <span key={`${w}-${i}`}>
          <span className="w">
            <span className="wi">{w}</span>
          </span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </>
  );
}
