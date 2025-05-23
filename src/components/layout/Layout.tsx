
import { ReactNode } from 'react';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-gober-bg-100 dark:bg-gober-primary-900">
      <Header />
      <main className="flex-1 pt-16">
        {children}
      </main>
    </div>
  );
};

export default Layout;
