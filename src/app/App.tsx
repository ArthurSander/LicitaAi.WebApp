import { RouterProvider } from 'react-router';
import { router } from './routes';
import { ThemeProvider } from './context/ThemeContext';
import { RepositoriesProvider } from './context/RepositoriesContext';
import { SearchFiltersProvider } from './context/SearchFiltersContext';

export default function App() {
  return (
    <RepositoriesProvider>
      <SearchFiltersProvider>
        <ThemeProvider>
          <RouterProvider router={router} />
        </ThemeProvider>
      </SearchFiltersProvider>
    </RepositoriesProvider>
  );
}