import { Outlet } from 'react-router-dom';
import { Navbar, BottomNav, OnboardingTour } from '../components/Globales';
import { useUnseenRiskCount } from '../hooks/useUnseenRiskCount';

/** Shared chrome for every screen: top navbar + bottom tab bar (mobile only). */
function AppLayout() {
  const unseenRiskCount = useUnseenRiskCount();

  return (
    <div className="flex min-h-screen flex-col bg-[#E9EDF3]">
      <Navbar unseenRiskCount={unseenRiskCount} />
      <div className="flex flex-1 flex-col pb-16 md:pb-0">
        <Outlet />
      </div>
      <BottomNav unseenRiskCount={unseenRiskCount} />
      <OnboardingTour />
    </div>
  );
}

export default AppLayout;
