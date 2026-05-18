export default function CheckItem({ok, label}) {
  return (
    <li
      className={`flex items-center gap-1.5 ${
        ok
          ? "text-green-600"
          : "text-[#767C7E]"
      }`}
    >
      <span>
        {ok ? "✓" : "○"}
      </span>

      <span>
        {label}
      </span>
    </li>
  );
}