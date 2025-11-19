import { Component } from 'solid-js';
import Icon from './ui/Icon';

export type TabId = 'notes' | 'sites' | 'add' | 'menu';

export interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const BottomNav: Component<BottomNavProps> = (props) => {
  const tabs = [
    { id: 'notes' as const, label: 'Notes', icon: 'document-text' as const },
    { id: 'sites' as const, label: 'Sites', icon: 'map-pin' as const },
    { id: 'add' as const, label: 'Add', icon: 'plus' as const },
    { id: 'menu' as const, label: 'Menu', icon: 'bars-3' as const },
  ];

  return (
    <nav class="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-[#015D7C] via-[#015D7C] to-[#015D7C]/95 backdrop-blur-lg border-t border-white/10 shadow-2xl">
      <div class="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = () => props.activeTab === tab.id;
          const isAddButton = tab.id === 'add';

          return (
            <button
              onClick={() => props.onTabChange(tab.id)}
              class={`
                flex flex-col items-center justify-center gap-1
                ${isAddButton ? 'relative -mt-8' : 'flex-1'}
                transition-all duration-300 ease-out
                focus:outline-none
                ${!isAddButton && 'py-2 px-3 rounded-xl'}
                ${isActive() && !isAddButton ? 'bg-white/10 scale-105' : ''}
                ${!isActive() && !isAddButton ? 'hover:bg-white/5 active:scale-95' : ''}
              `}
              aria-label={tab.label}
            >
              {isAddButton ? (
                /* Special styling for Add button */
                <div class="flex flex-col items-center">
                  <div class="w-14 h-14 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#FF8C42] shadow-2xl flex items-center justify-center mb-1 hover:scale-110 active:scale-95 transition-all duration-200 ring-4 ring-[#015D7C]">
                    <Icon
                      name={tab.icon}
                      size={28}
                      class="text-white"
                    />
                  </div>
                  <span class={`
                    text-xs font-medium transition-colors duration-300
                    ${isActive() ? 'text-white' : 'text-white/70'}
                  `}>
                    {tab.label}
                  </span>
                </div>
              ) : (
                /* Regular tab styling */
                <>
                  <Icon
                    name={tab.icon}
                    size={24}
                    class={`
                      transition-all duration-300
                      ${isActive() ? 'text-white scale-110' : 'text-white/60'}
                    `}
                  />
                  <span class={`
                    text-xs font-medium transition-colors duration-300
                    ${isActive() ? 'text-white' : 'text-white/70'}
                  `}>
                    {tab.label}
                  </span>
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom safe area for iOS */}
      <div class="h-safe-area-inset-bottom bg-[#015D7C]" />
    </nav>
  );
};

export default BottomNav;
