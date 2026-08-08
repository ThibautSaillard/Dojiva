import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import Home from '@/pages/home';
import Onboarding from '@/pages/onboarding';
import Academy from '@/pages/academy';
import Lesson from '@/pages/lesson';
import Simulator from '@/pages/simulator';
import SimulatorMission from '@/pages/simulator-mission';
import SimulatorLibre from '@/pages/simulator-libre';
import Laboratory from '@/pages/laboratory';
import Coach from '@/pages/coach';
import Journal from '@/pages/journal';
import Profile from '@/pages/profile';
import Payment, { PaymentCheckout } from '@/pages/payment';
import { SignInPage, SignUpPage } from '@/pages/auth';
import LegalHub, { LegalDocument } from '@/pages/legal';
import { Redirect, Route, Switch, Router as WouterRouter } from 'wouter';
import { Layout } from '@/components/Layout';
import { AuthProvider } from '@/lib/auth-context';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

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
        <Route path="/simulateur/libre" component={SimulatorLibre} />
        <Route path="/simulateur/mission/:id">
          {(params) => <SimulatorMission id={params.id ?? ''} />}
        </Route>
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
  return (
    <WouterRouter base={basePath}>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Router />
            <Toaster />
          </TooltipProvider>
        </QueryClientProvider>
      </AuthProvider>
    </WouterRouter>
  );
}

export default App;
