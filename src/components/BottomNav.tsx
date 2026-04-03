import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faTicketAlt, faWallet, faBook, faCheckSquare, faUsers } from '@fortawesome/free-solid-svg-icons';

const navItems = [
  { id: 'schedule', label: '行程', icon: faCalendarAlt },
  { id: 'bookings', label: '預訂', icon: faTicketAlt },
  { id: 'expense', label: '記帳', icon: faWallet },
  { id: 'journal', label: '日誌', icon: faBook },
  { id: 'planning', label: '準備', icon: faCheckSquare },
  { id: 'members', label: '成員', icon: faUsers },
];

export const BottomNav = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (id: string) => void }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-[#E0E5D5]/50 pb-8 pt-3 px-2 flex justify-around items-center z-[1000]">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`flex flex-col items-center min-w-[50px] transition-all duration-300 ${
            activeTab === item.id ? 'text-[#4BA3E3] scale-110' : 'text-gray-300'
          }`}
        >
          <FontAwesomeIcon icon={item.icon} className="text-xl mb-1" />
          <span className="text-[10px] font-bold tracking-tighter">{item.label}</span>
          {activeTab === item.id && (
            <div className="w-1 h-1 bg-[#4BA3E3] rounded-full mt-1" />
          )}
        </button>
      ))}
    </nav>
  );
};