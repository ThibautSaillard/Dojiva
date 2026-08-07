import { SignIn, SignUp } from "@clerk/react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const appearance = {
  variables: {
    colorPrimary: "#2563eb",
    colorBackground: "#0b0b10",
    colorForeground: "#fafafa",
    colorMutedForeground: "#a1a1aa",
    colorInput: "#15151d",
    colorInputForeground: "#fafafa",
    colorNeutral: "#27272a",
    fontFamily: "Outfit, sans-serif",
    borderRadius: "0.85rem",
  },
  elements: {
    cardBox: "bg-[#111118] border border-white/10 rounded-2xl shadow-2xl w-[440px] max-w-full",
    card: "!bg-transparent !shadow-none",
    footer: "!bg-transparent !shadow-none",
    headerTitle: "text-white",
    headerSubtitle: "text-zinc-400",
    formFieldLabel: "text-zinc-300",
    formFieldInput: "bg-[#15151d] border-white/10 text-white",
    formButtonPrimary: "bg-blue-600 hover:bg-blue-500",
    footerActionLink: "text-blue-400 hover:text-blue-300",
    footerActionText: "text-zinc-400",
    dividerText: "text-zinc-500",
    socialButtonsBlockButton: "bg-[#15151d] border-white/10 text-white",
  },
};

export function SignInPage() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background px-4 py-8">
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
        fallbackRedirectUrl={`${basePath}/apprendre`}
        appearance={appearance}
      />
    </div>
  );
}

export function SignUpPage() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background px-4 py-8">
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
        fallbackRedirectUrl={`${basePath}/apprendre`}
        appearance={appearance}
      />
    </div>
  );
}