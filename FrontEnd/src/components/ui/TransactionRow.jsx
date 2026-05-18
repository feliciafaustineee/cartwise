import { rupiah } from "../../utils/formatter";

export default function TransactionRow({ img, name, date, category, amount }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl px-2 py-3 transition hover:bg-[#f5f9ee]">
      <img
        src={img}
        alt={name}
        className="h-13 w-13 rounded-full object-cover"
      />
      <div className="flex-1 min-w-0">
        <p className="text-lg font-bold text-[#2D3335] truncate">{name}</p>
        <p className="text-base text-[#5A6062]">
          {date} · {category}
        </p>
      </div>
      <p className="text-lg font-bold text-[#2D3335]">
        -{rupiah(Math.abs(amount))}
      </p>
    </div>
  );
}