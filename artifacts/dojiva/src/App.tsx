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
import { Route, Switch, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/apprendre" component={Onboarding} />
      <Route path="/academie" component={Academy} />
      <Route path="/lecon/:id" component={Lesson} />
      <Route path="/simulateur" component={Simulator} />
      <Route path="/laboratoire" component={Laboratory} />
      <Route path="/coach" component={Coach} />
      <Route path="/journal" component={Journal} />
      <Route path="/profil" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
