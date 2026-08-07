import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import Home from '@/pages/home';
import Onboarding from '@/pages/onboarding';
import Academy from '@/pages/academy';
import Lesson from '@/pages/lesson';
import Simulator from '@/pages/simulator';
import Laboratory from '@/pages/laboratory';
import Coach from '@/pages/coach';
import Journal from '@/pages/journal';
import Profile from '@/pages/profile';
import Payment, { PaymentCheckout } from '@/pages/payment';
import { SignInPage, SignUpPage } from '@/pages/auth';
import LegalHub, { LegalDocument } from '@/pages/legal';
import { Redirect, Route, Switch, Router as WouterRouter } from 'wouter';
import { Layout } from '@/components/Layout';
import { ClerkProvider } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/sign-in/*?" component={SignInPage} />
        <Route path="/sign-up/*?" component={SignUpPage} />
        <Route path="/inscription">
          <Redirect to="/sign-up" />
        </Route>
        <Route path="/apprendre" component={Onboarding} />
        <Route path="/paiement" component={Payment} />
        <Route path="/paiement/checkout" component={PaymentCheckout} />
        <Route path="/legal" component={LegalHub} />
        <Route path="/legal/:slug" component={LegalDocument} />
        <Route path="/academie" component={Academy} />
        <Route path="/lecon/:id" component={Lesson} />
        <Route path="/simulateur" component={Simulator} />
        <Route path="/laboratoire" component={Laboratory} />
        <Route path="/coach" component={Coach} />
        <Route path="/journal" component={Journal} />
        <Route path="/profil" component={Profile} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  if (!clerkPubKey) {
    throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in the environment.');
  }

  return (
    <WouterRouter base={basePath}>
      <ClerkProvider
        publishableKey={clerkPubKey}
        proxyUrl={clerkProxyUrl}
        appearance={{ theme: shadcn }}
        signInUrl={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
        localization={{
          signIn: {
            start: {
              title: "Bon retour",
              subtitle: "Connecte-toi pour retrouver ton parcours",
              actionText: "Pas encore de compte ?",
              actionLink: "Créer un compte",
            },
          },
          signUp: {
            start: {
              title: "Crée ton compte",
              subtitle: "Commence ton parcours Dojiva",
              actionText: "Tu as déjà un compte ?",
              actionLink: "Se connecter",
            },
          },
          formFieldLabel__emailAddress: "Adresse e-mail",
          formFieldLabel__password: "Mot de passe",
          formFieldInputPlaceholder__emailAddress: "Entre ton adresse e-mail",
          formFieldInputPlaceholder__password: "Crée un mot de passe",
          formButtonPrimary: "Continuer",
          dividerText: "ou",
          socialButtonsBlockButton: "Continuer avec Google",
          footerActionLink__useAnotherMethod: "Utiliser une autre méthode",
          formFieldError__matchingPasswords: "Les mots de passe ne correspondent pas",
        }}
      >
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Router />
            <Toaster />
          </TooltipProvider>
        </QueryClientProvider>
      </ClerkProvider>
    </WouterRouter>
  );
}

export default App;
