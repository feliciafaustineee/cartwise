import { Link } from "react-router-dom";
import groceriesImg from "../assets/groceriesImg.png";
import { RiWallet3Fill } from "react-icons/ri";
import EmailField from "../components/auth/EmailField";
import PasswordField from "../components/auth/PasswordField";
import useSignIn from "../hooks/useSignIn";

export default function SignInPage() {
  const {
    email,setEmail,
    password, setPassword,
    rememberMe, setRememberMe,
    showPassword, setShowPassword,
    isLoading, successMessage,
    emailError, passwordError,
    setTouched,
    handleSignIn, 
  } = useSignIn();

  return (
    <div className="flex h-screen w-full items-center justify-center bg-white p-4 font-manrope">
      <div className="flex h-full max-h-[700px] w-full max-w-[1000px] overflow-hidden rounded-[2.5rem] bg-white shadow-2xl">

        <div className="relative hidden w-1/2 flex-col justify-center p-16 text-white md:flex">
          <img src={groceriesImg} alt="Groceries" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-white/80"></div>
          <div className="relative z-10">
            <div className="mb-12 flex items-center gap-3">
              <RiWallet3Fill className="text-4xl text-[#48521D]" />
              <span className="text-4xl font-semibold tracking-tight text-[#48521D]">CartWise</span>
            </div>
            <h1 className="text-[3.8rem] font-bold leading-[1.1] text-[#48521D]">
              Your <br /> Household <br /> Budget <br /> Companion
            </h1>
          </div>
        </div>

        <div className="flex w-full flex-col justify-center bg-[#FCFFF6] p-10 md:w-1/2 md:p-16">
          <h2 className="mb-2 text-3xl font-semibold text-black">Welcome Back</h2>
          <p className="mb-8 text-black">Please enter your details to access your account</p>

          {successMessage && (
            <div className="mb-4 rounded-xl bg-green-100 p-3">
              {successMessage}
            </div>
          )}

          <form
            onSubmit={handleSignIn}
            className="flex flex-col gap-4"
          >

            <EmailField
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              onBlur={() =>
                setTouched((prev) => ({
                  ...prev,
                  email: true,
                }))
              }
              error={emailError}
            />

            <PasswordField
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              onBlur={() =>
                setTouched((prev) => ({
                  ...prev,
                  password: true,
                }))
              }
              error={passwordError}
              showPassword={showPassword}
              setShowPassword={
                setShowPassword
              }
            />

            <div className="flex items-center gap-3 py-1">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-5 w-5 cursor-pointer rounded border-gray-300 accent-[#4A541F] focus:ring-[#4A541F]"
              />
              <label htmlFor="rememberMe" className="text-sm font-medium text-[#5A6062] cursor-pointer select-none">
                Remember this device for 30 days
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 w-full rounded-full bg-[#4A541F] py-3.5 font-bold text-[#E8FFE8] transition-all hover:bg-[#3d4519] active:scale-95 shadow-lg disabled:bg-gray-400"
            >
              {isLoading
                ? "Signing In..."
                : "Sign In"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-[#5A6062] font-medium">
            Don't have an account?{" "}

            <Link
              to="/sign-up"
              className="font-semibold text-[#48521D] underline transition hover:text-[#3d4519]"
            >
              Sign Up
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}