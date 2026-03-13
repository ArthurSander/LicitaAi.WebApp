import { createBrowserRouter, redirect } from 'react-router';
import { BuscarPage } from './pages/BuscarPage';
import { ResultsPage } from './pages/ResultsPage';
import { SavedLicitacoesPage } from './pages/SavedLicitacoesPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { supabase } from '../lib/supabaseClient';

function isInvalidRefreshTokenError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const maybeMessage = 'message' in error ? (error as { message?: unknown }).message : undefined;
  const message = typeof maybeMessage === 'string' ? maybeMessage.toLowerCase() : '';
  return message.includes('invalid refresh token') || message.includes('refresh token not found');
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    loader: async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error && isInvalidRefreshTokenError(error)) {
        await supabase.auth.signOut({ scope: 'local' });
      }
      if (error || !data.session?.user) {
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
        element: <SavedLicitacoesPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
