import {MdLock, MdVisibility, MdVisibilityOff} from "react-icons/md";
import FieldError from "./FieldError";
import { inputBorderClass } from "../../utils/inputStyles";

export default function PasswordField({value, onChange, onBlur, error, showPassword, setShowPassword}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-semibold text-black">
        Password
      </label>

      <div className="relative">
        <MdLock
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#767C7E]"
        />

        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder="••••••••"
          className={`w-full rounded-2xl border bg-[#E8EDF2] py-3 pl-12 pr-10 outline-none transition focus:ring-2 focus:ring-[#4A541F] text-[#767C7E] font-medium ${inputBorderClass(error)}`}
        />

        <div
          className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-[#767C7E]"
          onClick={() =>
            setShowPassword(!showPassword)
          }
        >
          {showPassword ? (
            <MdVisibilityOff size={20} />
          ) : (
            <MdVisibility size={20} />
          )}
        </div>
      </div>

      <FieldError message={error} />
    </div>
  );
}