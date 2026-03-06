import { NavLink } from 'react-router-dom';
import { IconSymbol } from './IconSymbol';

const TAB_ITEMS = [
  { path: '/', label: 'Home', icon: 'house.fill' },
  { path: '/insights', label: 'Insights', icon: 'chart.bar.fill' },
  { path: '/history', label: 'History', icon: 'clock.fill' },
  { path: '/categories', label: 'Categories', icon: 'square.grid.2x2' }
];

export function TabLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-background">
      <div className="pb-20">
        {children}
      </div>
      <nav className="fixed bottom-0 left-0 right-0 bg-brand-background border-t border-[#2A2B2B]">
        <div className="flex justify-around items-center h-[88px] px-2 pt-2">
          {TAB_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-colors ${
                  isActive ? 'text-brand-primary' : 'text-[#666666]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <IconSymbol
                    name={item.icon}
                    size={28}
                    color={isActive ? '#B4DE00' : '#666666'}
                  />
                  <span className={`text-[10px] mt-1 ${isActive ? 'text-brand-primary' : 'text-[#666666]'}`}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
