import { RiFileListLine, RiShoppingCart2Line, RiArchiveLine } from "react-icons/ri";
import { FaArrowTrendDown } from "react-icons/fa6";
import { rupiah } from "../../utils/formatter";

function StatCard({ icon, label, value, sub, badge }) {
  return (
    <div className="flex flex-1 items-start justify-between rounded-[1.8rem] border border-[#E9E9E9] bg-white px-6 py-5">
      <div>
        <p className="text-sm font-medium text-[#5A6062]">{label}</p>
        <h2 className="mt-2 text-[1.5rem] font-bold leading-none text-[#2D3335]">{value}</h2>
        {sub && <p className="mt-3 text-xs font-medium text-[#5A6062]">{sub}</p>}
        {badge && (
          <div className="mt-3 inline-flex rounded-md bg-[#FA746F] px-2 py-1">
            <span className="text-[10px] font-bold tracking-wide text-[#6E0A12]">{badge}</span>
          </div>
        )}
      </div>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7E8E21]">
        {icon}
      </div>
    </div>
  );
}

export default function StatCards({ data }) {
  return (
    <div className="mb-5 flex gap-5">
      <StatCard
        icon={<RiFileListLine className="text-xl text-[#B7CA93]" />}
        label="Total Monthly Spending"
        value={rupiah(data?.monthly_spending || 0)}
        sub={
          <span className="flex items-center gap-1 text-[#7E8E21]">
            <FaArrowTrendDown /> 8% from last month
          </span>
        }
      />
      <StatCard
        icon={<RiShoppingCart2Line className="text-xl text-[#B7CA93]" />}
        label="Shopping Pending"
        value={`${data?.shopping_pending || 0} Items`}
        sub="Next trip scheduled: Sat"
      />
      <StatCard
        icon={<RiArchiveLine className="text-xl text-[#B7CA93]" />}
        label="Inventory Alerts"
        value={`${data?.inventory_alerts || 0} Low Stock`}
        badge="ACTION NEEDED"
      />
    </div>
  );
}