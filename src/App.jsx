import AppRouter from './Navigation/AppRouter';
import ErrorBoundary from './components/Globales/ErrorBoundary';
import { ToastProvider } from './context/ToastContext';

function App() {
  return (
    <ToastProvider>
      <ErrorBoundary>
        <AppRouter />
      </ErrorBoundary>
    </ToastProvider>
  );
}

export default App;
