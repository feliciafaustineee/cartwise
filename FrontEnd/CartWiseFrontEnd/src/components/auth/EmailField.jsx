import { MdEmail } from "react-icons/md";
import FieldError from "./FieldError";
import { inputBorderClass } from "../../utils/inputStyles";

export default function EmailField({value, onChange, onBlur, error}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-semibold text-black">
        Email Address
      </label>

      <div className="relative">
        <MdEmail
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#767C7E]"
        />

        <input
          type="email"
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder="name@example.com"
          className={`w-full rounded-2xl border bg-[#E8EDF2] py-3 pl-12 pr-4 outline-none transition focus:ring-2 focus:ring-[#4A541F] text-[#767C7E] font-medium ${inputBorderClass(error)}`}
        />
      </div>

      <FieldError message={error} />
    </div>
  );
}