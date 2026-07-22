import { useEffect, useState } from 'react';
import { riesgoService } from '../services/riesgoService';
import { mapRiesgoEstudiante } from '../utils/mappers';
import { countUnseen } from '../utils/alertsSeen';

/**
 * Cuántas alertas de riesgo hay que el profesor todavía no vio — para el
 * punto de la campanita y el badge de la pestaña Alertas. Se recalcula al
 * montar y cada vez que RiskAlertPage marca las alertas actuales como vistas.
 */
export function useUnseenRiskCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      riesgoService
        .listar()
        .then((data) => {
          if (cancelled) return;
          setCount(countUnseen(data.map(mapRiesgoEstudiante)));
        })
        .catch(() => {
          if (!cancelled) setCount(0);
        });
    };

    load();
    window.addEventListener('aulasis:alerts-seen', load);
    return () => {
      cancelled = true;
      window.removeEventListener('aulasis:alerts-seen', load);
    };
  }, []);

  return count;
}
