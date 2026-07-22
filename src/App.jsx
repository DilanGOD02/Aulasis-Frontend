import AppRouter from './Navigation/AppRouter';
import ErrorBoundary from './components/Globales/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AppRouter />
    </ErrorBoundary>
  );
}

export default App;
