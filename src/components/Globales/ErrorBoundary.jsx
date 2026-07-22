import { Component } from 'react';

/**
 * Sin esto, cualquier excepción no atrapada durante el render (ej. un bug
 * puntual que solo se dispara en cierto navegador/dispositivo) hace que React
 * desmonte todo el árbol y deje la pantalla en blanco, sin ningún rastro para
 * el usuario. Acá al menos se ve un mensaje y se loguea el error real.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Error no atrapado:', error, info?.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#E9EDF3] p-6 text-center">
          <i className="ph-bold ph-warning-circle text-[40px] text-[#DC2626]" />
          <div className="text-[18px] font-extrabold text-[#0F172A]">Ocurrió un error inesperado</div>
          <p className="max-w-[36ch] text-[14px] font-medium text-[#64748B]">
            Algo falló al mostrar esta pantalla. Recargá la página — si vuelve a pasar, contanos qué estabas
            haciendo justo antes.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="press mt-1 rounded-[12px] bg-[var(--brand)] px-4 py-2.5 text-[14px] font-extrabold text-white"
          >
            Recargar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
