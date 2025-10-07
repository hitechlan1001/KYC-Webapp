import { LoginForm } from "../components/LoginForm";

export const Login = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#263144] via-[#253244] to-[#494949] flex items-center justify-center p-4 ">
      {/* Login Container */}
      <div className="w-full max-w-md border border-slate-700 rounded-[32px] p-6 shadow-lg">
        {/* Logo */}
        <div className="w-[100px] h-[100px] mx-auto mb-6 relative">
          <img
            src="/logo.png"
            alt="Union Logo"
            className="w-full h-full object-contain"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              (
                e.currentTarget.nextElementSibling as HTMLElement
              ).style.display = "block";
            }}
          />
          {/* SVG Fallback */}
          <div
            className="w-full h-full bg-cyan-500/20 rounded-full items-center justify-center text-white text-2xl font-bold"
            style={{ display: "none" }}
          >
            UU
          </div>
        </div>

        {/* Title and Subtitle */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">KYC Admin Portal</h1>
          <p className="text-white/60 text-sm">Sign in to manage user KYC submissions</p>
        </div>

        {/* Login Form Card */}
        <div className="">
          <LoginForm />
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-white/50 text-xs">
          © 2024 UniversalUnion. All Rights Reserved.
        </div>
      </div>
    </div>
  );
};
