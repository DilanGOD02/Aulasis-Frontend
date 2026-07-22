import { Outlet } from 'react-router-dom';
import { Navbar, BottomNav, OnboardingTour } from '../components/Globales';

/** Shared chrome for every screen: top navbar + bottom tab bar (mobile only). */
function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[#E9EDF3]">
      <Navbar />
      <div className="flex flex-1 flex-col pb-16 md:pb-0">
        <Outlet />
      </div>
      <BottomNav />
      <OnboardingTour />
    </div>
  );
}

export default AppLayout;
