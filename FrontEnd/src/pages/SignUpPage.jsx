import { Link } from "react-router-dom";
import { RiWallet3Fill } from "react-icons/ri";
import groceriesImg from "../assets/groceriesImg.png";
import NameField from "../components/auth/NameField";
import EmailField from "../components/auth/EmailField";
import PasswordField from "../components/auth/PasswordField";
import CheckItem from "../components/auth/CheckItem";
import useSignUp from "../hooks/useSignUp";

export default function SignUpPage() {
  const {
    name, setName,
    email, setEmail,
    password, setPassword,
    showPassword, setShowPassword,
    isLoading,
    successMessage,
    nameError,
    emailError,
    passwordError,
    touched, setTouched,
    handleSignUp,
  } = useSignUp();

  return (
    <div className="flex h-screen w-full items-center justify-center bg-white p-4 font-manrope">
      <div className="flex h-full max-h-[700px] w-full max-w-[1000px] overflow-hidden rounded-[2.5rem] bg-white shadow-2xl">
        <div className="relative hidden w-1/2 flex-col justify-center p-16 text-white md:flex">
          <img
            src={groceriesImg}
            alt="Groceries"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-white/80"></div>
          <div className="relative z-10">
            <div className="mb-12 flex items-center gap-3">
              <RiWallet3Fill className="text-4xl text-[#48521D]" />
              <span className="text-4xl font-semibold tracking-tight text-[#48521D]">
                CartWise
              </span>
            </div>
            <h1 className="text-[3.8rem] font-bold leading-[1.1] text-[#48521D]">
              Your <br />
              Household <br />
              Budget <br />
              Companion
            </h1>
          </div>
        </div>

        <div className="flex w-full flex-col justify-center bg-[#FCFFF6] p-10 pb-14 md:w-1/2 md:p-16">
          <h2 className="mb-2 text-3xl font-semibold text-black">
            Welcome
          </h2>

          <p className="mb-8 text-black">
            Please enter your details to access your account
          </p>

          {successMessage && (
            <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 shadow-sm">
              <p className="text-sm font-semibold text-green-700">
                {successMessage}
              </p>
            </div>
          )}

          <form
            onSubmit={handleSignUp}
            className="flex flex-col gap-1"
            noValidate
          >

            <NameField
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() =>
                setTouched((prev) => ({
                  ...prev,
                  name: true,
                }))
              }
              error={nameError}
            />

            <EmailField
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() =>
                setTouched((prev) => ({
                  ...prev,
                  password: true,
                }))
              }
              error={passwordError}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />

            {touched.password &&
              password.length > 0 &&
              passwordError !== "" && (
                <ul className="mt-1.5 space-y-0.5 text-xs text-[#767C7E]">
                  <CheckItem
                    ok={
                      password.length >= 8 &&
                      password.length <= 12
                    }
                    label="8–12 characters"
                  />

                  <CheckItem
                    ok={/[A-Z]/.test(password)}
                    label="Minimal 1 uppercase letter"
                  />

                  <CheckItem
                    ok={
                      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
                        password
                      )
                    }
                    label="Minimal 1 special character (!@#$ dll.)"
                  />
                </ul>
              )}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 w-full rounded-full bg-[#4A541F] py-3.5 font-bold text-[#E8FFE8] transition-all hover:bg-[#3d4519] active:scale-95 shadow-lg disabled:bg-gray-400"
            >
              {isLoading
                ? "Mendaftarkan..."
                : "Sign Up"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-[#5A6062] font-medium">
            Already have an account?{" "}
            <Link
              to="/sign-in"
              className="font-semibold text-[#48521D] underline transition hover:text-[#3d4519]"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}