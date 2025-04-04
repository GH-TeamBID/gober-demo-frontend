import { useState, useEffect } from 'react';
import { Lock, Users, Search } from 'lucide-react';
import { cn } from "@/lib/utils";
import Layout from "@/components/layout/Layout";
import PasswordSettings from '@/components/settings/PasswordSettings';
import UsersList from '@/components/settings/UsersList';
import SearchCriteriaSettings from '@/components/settings/SearchCriteriaSettings';
import { useRole } from '@/hooks/useRole';
import { useTranslation } from 'react-i18next';

const Settings = () => {
  const [activeTab, setActiveTab] = useState("password");
  const { isStaff } = useRole();
  const { t } = useTranslation('settings');

  // Generate tabs based on user role
  const tabs = [
    { id: "password", label: t('tabs.password'), icon: <Lock className="h-4 w-4 mr-2" /> },
    // Only show Users tab for staff (admin/account_manager)
    ...(isStaff ? [{ id: "users", label: t('tabs.users'), icon: <Users className="h-4 w-4 mr-2" /> }] : []),
    { id: "criteria", label: t('tabs.criteria'), icon: <Search className="h-4 w-4 mr-2" /> },
  ];
  
  // If user role changes and they're on a tab they shouldn't see, reset to password tab
  useEffect(() => {
    if (activeTab === "users" && !isStaff) {
      setActiveTab("password");
    }
  }, [isStaff, activeTab]);

  return (
    <Layout>
      <div className="page-container">
        <h1 className="mb-8">{t('page.title')}</h1>
        
        <div className="grid grid-cols-12 gap-6 max-w-6xl mx-auto">
          {/* Sidebar with vertical tabs */}
          <div className="col-span-12 md:col-span-3">
            <div className="bg-white dark:bg-gober-primary-800 rounded-lg shadow-sm border border-border">
              <div className="p-4 font-medium border-b">
                {t('page.menu')}
              </div>
              <div className="flex flex-col p-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center px-4 py-3 text-sm rounded-md transition-colors",
                      activeTab === tab.id 
                        ? "bg-gober-accent-500/10 text-gober-accent-500 font-medium" 
                        : "text-gober-primary-800 dark:text-gray-300 hover:bg-gober-bg-100 dark:hover:bg-gober-primary-700"
                    )}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Content area */}
          <div className="col-span-12 md:col-span-9">
            <div className="bg-white dark:bg-gober-primary-800 rounded-lg shadow-sm border border-border p-6">
              {activeTab === "password" && <PasswordSettings />}
              {activeTab === "users" && isStaff && <UsersList />}
              {activeTab === "criteria" && <SearchCriteriaSettings />}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
