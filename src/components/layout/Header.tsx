import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, User, LogOut, Globe } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  // Use both header and common namespaces
  const { t, i18n } = useTranslation(['header', 'common']);
  
  useEffect(() => {
    // Close mobile menu when route changes
    setIsOpen(false);
    
    // Add scroll listener
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location]);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };
  
  const navLinks = [
    { name: t('navigation.overview', { ns: 'header' }), path: '/' },
    { name: t('navigation.myTenders', { ns: 'header' }), path: '/saved' },
    { name: t('navigation.search', { ns: 'header' }), path: '/' },
    { name: t('navigation.myTasks', { ns: 'header' }), path: '#' },
    { name: t('navigation.otherCompetitors', { ns: 'header' }), path: '#' },
  ];
  
  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/80 dark:bg-gober-primary-900/80 backdrop-blur-md shadow-sm' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link 
              to="/" 
              className="text-2xl font-bold text-gober-primary-900 dark:text-white transition-colors hover:text-gober-accent-500"
            >
              {t('logo', { ns: 'header' })}
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-gober-accent-500 ${
                  location.pathname === link.path
                    ? 'text-gober-accent-500'
                    : 'text-gober-primary-800 dark:text-gray-300'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
          
          {/* User Profile, Language Switcher, and Logout */}
          <div className="flex items-center">
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full"
                  aria-label={t('language.switchLanguage', { ns: 'common' })}
                >
                  <Globe className="h-5 w-5 text-gober-primary-800 dark:text-gray-300 hover:text-gober-accent-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => changeLanguage('en')}>
                  {t('language.en', { ns: 'common' })}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage('es')}>
                  {t('language.es', { ns: 'common' })}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* User Settings */}
            <Link to="/settings">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full ml-2"
              >
                <User className="h-5 w-5" />
                <span className="sr-only">{t('userActions.userSettings', { ns: 'header' })}</span>
              </Button>
            </Link>
            
            {/* Logout Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full ml-2"
              onClick={handleLogout}
              aria-label={t('userActions.logout', { ns: 'header' })}
            >
              <LogOut className="h-5 w-5 text-gober-primary-800 dark:text-gray-300 hover:text-gober-accent-500" />
              <span className="sr-only">{t('userActions.logout', { ns: 'header' })}</span>
            </Button>
            
            {/* Mobile menu button */}
            <div className="flex md:hidden ml-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
              >
                {isOpen ? (
                  <X className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="h-6 w-6" aria-hidden="true" />
                )}
                <span className="sr-only">{t('userActions.toggleMenu', { ns: 'header' })}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="glass-panel m-2 py-3 px-2 rounded-lg shadow-lg animate-fade-in">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`block py-2 px-4 text-base font-medium rounded-md ${
                  location.pathname === link.path
                    ? 'text-gober-accent-500 bg-gober-bg-100 dark:bg-gober-primary-800/50'
                    : 'text-gober-primary-800 dark:text-gray-300 hover:bg-gober-bg-100 dark:hover:bg-gober-primary-800/30'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            
            {/* Add Settings link to mobile menu */}
            <Link
              to="/settings"
              className={`block py-2 px-4 text-base font-medium rounded-md ${
                location.pathname === '/settings'
                  ? 'text-gober-accent-500 bg-gober-bg-100 dark:bg-gober-primary-800/50'
                  : 'text-gober-primary-800 dark:text-gray-300 hover:bg-gober-bg-100 dark:hover:bg-gober-primary-800/30'
              }`}
              onClick={() => setIsOpen(false)}
            >
              {t('navigation.settings', { ns: 'header' })}
            </Link>
            
            {/* Add language switcher to mobile menu */}
            <div className="flex py-2 px-4 items-center">
              <Globe className="h-4 w-4 mr-2" />
              <button 
                className="mr-2 text-base font-medium text-gober-primary-800 dark:text-gray-300"
                onClick={() => {
                  changeLanguage('en');
                  setIsOpen(false);
                }}
              >
                {t('language.en', { ns: 'common' })}
              </button>
              <span className="mx-2 text-gray-400">|</span>
              <button 
                className="text-base font-medium text-gober-primary-800 dark:text-gray-300"
                onClick={() => {
                  changeLanguage('es');
                  setIsOpen(false);
                }}
              >
                {t('language.es', { ns: 'common' })}
              </button>
            </div>
            
            {/* Add Logout link to mobile menu */}
            <button
              className="w-full text-left block py-2 px-4 text-base font-medium rounded-md text-gober-primary-800 dark:text-gray-300 hover:bg-gober-bg-100 dark:hover:bg-gober-primary-800/30"
              onClick={() => {
                setIsOpen(false);
                handleLogout();
              }}
            >
              <div className="flex items-center">
                <LogOut className="h-4 w-4 mr-2" />
                {t('userActions.logout', { ns: 'header' })}
              </div>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
