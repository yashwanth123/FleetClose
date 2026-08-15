export function Wordmark({ tone = "light" }: { tone?: "light" | "dark" }) {
  const onDark = tone === "dark";
  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        className={`grid h-8 w-8 place-items-center rounded-md text-[11px] font-semibold tracking-tight ${
          onDark ? "bg-paper text-navy" : "bg-navy text-paper"
        }`}
      >
        FC
      </span>
      <span className={`text-[17px] font-semibold tracking-tight ${onDark ? "text-paper" : "text-navy"}`}>
        FleetClose
      </span>
    </span>
  );
}
