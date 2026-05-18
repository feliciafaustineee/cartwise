import { RiTimeLine } from "react-icons/ri";

export default function ExpiringItem({ name, days, urgent }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-3 border border-gray-100">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl ${
          urgent ? "bg-red-50" : "bg-[#eef3e6]"
        }`}
      >
        <RiTimeLine
          size={18}
          className={urgent ? "text-[#6E0A12]" : "text-[#4A541F]"}
        />
      </div>
      <div>
        <p className="text-sm font-bold text-[#1a1a1a]">{name}</p>
        <p className={`text-xs font-semibold ${urgent ? "text-[#6E0A12]" : "text-[#5A6062]"}`}>
          Expires in {days} day{days > 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}