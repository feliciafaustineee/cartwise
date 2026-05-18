import { rupiah } from "../../utils/formatter";

export default function BudgetProgressCard({ data }) {
  const budget    = data?.total_budget    || 0;
  const spent     = data?.total_spent     || 0;
  const remaining = data?.total_remaining || 0;
  const progress  = data?.percentage_used || 0;

  return (
    <div className="col-span-2 rounded-3xl bg-white p-7 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between mb-5">
        <p className="text-[1.2rem] font-bold text-[#2D3335]">
          Monthly Budget Progress
        </p>
        <div className="text-right">
          <span className="text-xl font-semibold text-[#7E8E21]">
            {rupiah(spent)}
          </span>
          <span className="text-sm text-[#5A6062]"> of {rupiah(budget)}</span>
        </div>
      </div>

      <div className="h-3 w-full overflow-hidden rounded-full bg-[#F1F4F5]">
        <div
          className="h-full rounded-full bg-[#7E8E21] transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-[#5A6062]">
          <span className="h-2.5 w-2.5 rounded-full bg-[#7E8E21]" />
          Spent so far
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-[#5A6062]">
          <span className="h-2.5 w-2.5 rounded-full bg-[#DEE3E6]" />
          Remaining: {rupiah(remaining)}
        </div>
      </div>
    </div>
  );
}