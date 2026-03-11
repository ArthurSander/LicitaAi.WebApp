import { createBrowserRouter, redirect } from 'react-router';
import { BuscarPage } from './pages/BuscarPage';
import { ResultsPage } from './pages/ResultsPage';
import { SavedOpportunitiesPage } from './pages/SavedOpportunitiesPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { supabase } from '../lib/supabaseClient';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    loader: async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        throw redirect('/login');
      }
      return null;
    },
    element: <Layout />,
    children: [
      {
        index: true,
        element: <BuscarPage />,
      },
      {
        path: 'resultados',
        element: <ResultsPage />,
      },
      {
        path: 'licitacoes-salvas',
        element: <SavedOpportunitiesPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);