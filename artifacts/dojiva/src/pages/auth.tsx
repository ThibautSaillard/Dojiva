import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation } from 'wouter';
import { Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase, supabaseOrigin, supabasePublicKey } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

/**
 * Vérifie si le provider Google est activé côté Supabase.
 * Nécessaire car signInWithOAuth REDIRIGE le navigateur vers /auth/v1/authorize :
 * si le provider est désactivé, l'utilisateur atterrit sur une page JSON brute (400)
 * au lieu de recevoir une erreur interceptable côté client.
 * En cas de doute (réseau), on répond true et on laisse le vrai flux se lancer.
 */
async function isGoogleEnabled(): Promise<boolean> {
  try {
    const res = await fetch(`${supabaseOrigin}/auth/v1/settings`, {
      headers: { apikey: supabasePublicKey },
    });
    if (!res.ok) return true;
    const settings = (await res.json()) as { external?: { google?: boolean } };
    return settings.external?.google !== false;
  } catch {
    return true;
  }
}

type AuthMode = 'sign-in' | 'sign-up';

/** Traduit les erreurs Supabase Auth les plus courantes en français clair. */
function frAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) {
    return 'E-mail ou mot de passe incorrect.';
  }
  if (m.includes('user already registered') || m.includes('already been registered')) {
    return 'Un compte existe déjà avec cette adresse. Connecte-toi plutôt.';
  }
  if (m.includes('password should be at least')) {
    return 'Le mot de passe doit contenir au moins 6 caractères.';
  }
  if (m.includes('email not confirmed')) {
    return "Confirme d'abord ton adresse e-mail : un lien t'a été envoyé à l'inscription.";
  }
  if (m.includes('rate limit') || m.includes('too many requests') || m.includes('for security purposes')) {
    return 'Trop de tentatives. Patiente quelques minutes puis réessaie.';
  }
  if (m.includes('unable to validate email') || m.includes('invalid email') || m.includes('invalid format')) {
    return 'Cette adresse e-mail ne semble pas valide.';
  }
  if (m.includes('provider is not enabled') || m.includes('unsupported provider')) {
    return "La connexion Google n'est pas encore activée. Utilise ton e-mail et ton mot de passe.";
  }
  if (m.includes('anonymous') || m.includes('signups not allowed')) {
    return "Les inscriptions sont désactivées pour le moment.";
  }
  return 'Une erreur est survenue. Réessaie dans un instant.';
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3.01c-1.07.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.72-4.95H1.27v3.11A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.28A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.56.38-2.28V6.61H1.27a12 12 0 0 0 0 10.78l4.01-3.11Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.44-3.44A11.98 11.98 0 0 0 12 0 12 12 0 0 0 1.27 6.61l4.01 3.11C6.22 6.88 8.87 4.77 12 4.77Z"
      />
    </svg>
  );
}

const COPY: Record<
  AuthMode,
  {
    title: string;
    subtitle: string;
    passwordPlaceholder: string;
    switchQuestion: string;
    switchAction: string;
    switchHref: string;
  }
> = {
  'sign-in': {
    title: 'Bon retour',
    subtitle: 'Connecte-toi pour retrouver ton parcours',
    passwordPlaceholder: 'Ton mot de passe',
    switchQuestion: 'Pas encore de compte ?',
    switchAction: 'Créer un compte',
    switchHref: '/sign-up',
  },
  'sign-up': {
    title: 'Crée ton compte',
    subtitle: 'Commence ton parcours Dojiva',
    passwordPlaceholder: 'Crée un mot de passe (6 caractères min.)',
    switchQuestion: 'Tu as déjà un compte ?',
    switchAction: 'Se connecter',
    switchHref: '/sign-in',
  },
};

function AuthCard({ mode }: { mode: AuthMode }) {
  const copy = COPY[mode];
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  // Déjà connecté ? Direction le parcours.
  useEffect(() => {
    if (!loading && user) {
      navigate('/apprendre', { replace: true });
    }
  }, [loading, user, navigate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === 'sign-up') {
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) {
          setError(frAuthError(signUpError.message));
          return;
        }
        if (data.session) {
          navigate('/apprendre');
          return;
        }
        // Confirmation par e-mail requise par Supabase.
        setConfirmationEmail(email);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          setError(frAuthError(signInError.message));
          return;
        }
        navigate('/apprendre');
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setGoogleLoading(true);
    if (!(await isGoogleEnabled())) {
      setError("La connexion Google n'est pas encore activée. Utilise ton e-mail et ton mot de passe.");
      setGoogleLoading(false);
      return;
    }
    const redirectTo = new URL(
      `${import.meta.env.BASE_URL}apprendre`,
      window.location.origin,
    ).toString();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
    if (oauthError) {
      setError(frAuthError(oauthError.message));
      setGoogleLoading(false);
    }
    // En cas de succès, le navigateur part vers Google : on laisse le spinner jusqu'au départ.
  }

  async function handleResend() {
    if (!confirmationEmail || resending) return;
    setResending(true);
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: confirmationEmail,
      });
      if (resendError) {
        setError(frAuthError(resendError.message));
        return;
      }
      setResent(true);
    } finally {
      setResending(false);
    }
  }

  if (confirmationEmail) {
    return (
      <div className="w-[440px] max-w-full rounded-2xl border border-white/10 bg-[#111118] p-8 shadow-2xl text-center">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/15 text-blue-400">
          <Mail className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold text-white">Vérifie ta boîte mail</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400" data-testid="text-confirmation-sent">
          On t'a envoyé un lien de confirmation à{' '}
          <span className="font-medium text-zinc-200">{confirmationEmail}</span>. Clique dessus pour
          activer ton compte, puis reviens te connecter.
        </p>
        {error && (
          <p className="mt-4 text-sm text-red-400" role="alert" data-testid="text-auth-error">
            {error}
          </p>
        )}
        <div className="mt-6 flex flex-col gap-2">
          <Button
            variant="outline"
            onClick={handleResend}
            disabled={resent || resending}
            data-testid="button-resend-confirmation"
          >
            {resending && <Loader2 className="h-4 w-4 animate-spin" />}
            {resent ? 'E-mail renvoyé' : "Renvoyer l'e-mail"}
          </Button>
          <Button variant="ghost" asChild data-testid="link-back-to-sign-in">
            <Link href="/sign-in">Retour à la connexion</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[440px] max-w-full rounded-2xl border border-white/10 bg-[#111118] p-8 shadow-2xl">
      <div className="mb-7 text-center">
        <h1 className="text-xl font-bold text-white">{copy.title}</h1>
        <p className="mt-1.5 text-sm text-zinc-400">{copy.subtitle}</p>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full gap-2.5 border-white/10 bg-[#15151d] text-white hover:bg-[#1b1b25]"
        onClick={handleGoogle}
        disabled={googleLoading || submitting}
        data-testid="button-google"
      >
        {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
        Continuer avec Google
      </Button>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs text-zinc-500">ou</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="auth-email" className="text-zinc-300">
            Adresse e-mail
          </Label>
          <Input
            id="auth-email"
            type="email"
            required
            autoComplete="email"
            placeholder="Entre ton adresse e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-white/10 bg-[#15151d] text-white placeholder:text-zinc-500"
            data-testid="input-email"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="auth-password" className="text-zinc-300">
            Mot de passe
          </Label>
          <Input
            id="auth-password"
            type="password"
            required
            minLength={6}
            autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
            placeholder={copy.passwordPlaceholder}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border-white/10 bg-[#15151d] text-white placeholder:text-zinc-500"
            data-testid="input-password"
          />
        </div>

        {error && (
          <p className="text-sm text-red-400" role="alert" data-testid="text-auth-error">
            {error}
          </p>
        )}

        <Button
          type="submit"
          className="w-full bg-blue-600 text-white hover:bg-blue-500"
          disabled={submitting || googleLoading}
          data-testid="button-submit"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Continuer
        </Button>
      </form>

      {mode === 'sign-up' && (
        <p className="mt-4 text-center text-xs leading-relaxed text-zinc-500">
          En créant un compte, tu acceptes nos{' '}
          <Link href="/legal" className="text-zinc-400 underline hover:text-zinc-300" data-testid="link-legal">
            conditions d'utilisation
          </Link>
          .
        </p>
      )}

      <p className="mt-6 text-center text-sm text-zinc-400">
        {copy.switchQuestion}{' '}
        <Link
          href={copy.switchHref}
          className="font-medium text-blue-400 hover:text-blue-300"
          data-testid="link-switch-mode"
        >
          {copy.switchAction}
        </Link>
      </p>
    </div>
  );
}

function AuthShell({ mode }: { mode: AuthMode }) {
  return (
    <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center bg-background px-4 py-8">
      <AuthCard mode={mode} />
    </div>
  );
}

export function SignInPage() {
  return <AuthShell mode="sign-in" />;
}

export function SignUpPage() {
  return <AuthShell mode="sign-up" />;
}
