import { createBrowserRouter } from 'react-router';
import { HomePage } from './pages/HomePage';
import { ResultsPage } from './pages/ResultsPage';
import { SavedOpportunitiesPage } from './pages/SavedOpportunitiesPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
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