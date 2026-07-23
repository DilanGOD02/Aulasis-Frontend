import AppRouter from './Navigation/AppRouter';
import ErrorBoundary from './components/Globales/ErrorBoundary';
import { ToastProvider } from './context/ToastContext';
import { ConfirmProvider } from './context/ConfirmContext';

function App() {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <ErrorBoundary>
          <AppRouter />
        </ErrorBoundary>
      </ConfirmProvider>
    </ToastProvider>
  );
}

export default App;
