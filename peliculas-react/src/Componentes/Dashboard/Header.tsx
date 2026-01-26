interface HeaderProps {
  onMenuClick: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
  onLogout: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  return (
    <header className="bg-white shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="text-gray-600 hover:text-gray-900 lg:hidden mr-4"
          >
            ☰
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">
            
          </h1>
        </div>

       
      </div>
    </header>
  );
};

export default Header;