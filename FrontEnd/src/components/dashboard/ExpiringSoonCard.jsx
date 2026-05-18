import { RxExclamationMark } from "react-icons/rx";
import ExpiringItem from "../ui/ExpiringItem";
import { daysUntil } from "../../utils/date";

export default function ExpiringSoonCard({ items }) {
  return (
    <div className="rounded-3xl bg-[#F1F4F5] p-6 shadow-sm border border-gray-100">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[1.2rem] font-bold text-[#2D3335]">Expiring Soon</p>
        <RxExclamationMark className="text-[#5A6062] cursor-pointer" size={25} />
      </div>

      <div className="flex flex-col gap-3">
        {items?.length > 0 ? (
          items.map((item, index) => {
            const days = daysUntil(item.expiration_date);
            return (
              <ExpiringItem
                key={index}
                name={item.name}
                days={days}
                urgent={days <= 3}
              />
            );
          })
        ) : (
          <p className="text-sm text-[#5A6062]">No expiring items.</p>
        )}
      </div>
    </div>
  );
}