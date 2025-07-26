'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Settings, Bookmark, WandSparkles, Compass, Menu, X, ChevronLeft, ChevronRight, Wrench, Image as ImageIcon, GalleryVerticalEnd } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePathname, useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';

const sidebarItems = [
  { id: 'General Gallery', label: 'Gallery', icon: GalleryVerticalEnd, path: '/gallery' },
  { id: 'Client Gallery', label: 'Client Gallery', icon: ImageIcon, path: '/client-gallery' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsub();
  }, []);


  // If on base url, do not render sidebar/layout, just children
  if (pathname === '/') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-4 sticky top-0 z-50 rounded-b-3xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Image src="/logo.svg" alt="logo" width={120} height={100} />
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hover:bg-orange-50 transition-colors duration-200 rounded-2xl"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={
          `fixed lg:static inset-y-0 left-0
          z-[60]
          ${sidebarCollapsed ? 'w-20' : 'w-72'}
          bg-white/95 backdrop-blur-sm border-r border-gray-200 
          transform transition-all duration-300 ease-in-out lg:transform-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          shadow-2xl lg:shadow-none rounded-r-3xl lg:rounded-none
          h-screen lg:h-screen overflow-y-auto
        `}>
          <div className="flex flex-col h-full">
            {/* Desktop Header */}
            <div className="hidden lg:flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center justify-center w-full">
                <Image src={sidebarCollapsed ? '/logo.svg' : '/logo.svg'} alt="logo" width={sidebarCollapsed ? 48 : 180} height={48} />
              </div>
            </div>

            {/* Navigation */}
            <nav className={`flex-1 ${sidebarCollapsed ? 'px-2' : 'px-6'} mt-10`}>
              <div className="space-y-2">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  // Highlight if pathname starts with the item's path
                  const isActive = pathname.startsWith(item.path);
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        router.push(item.path);
                        setSidebarOpen(false);
                      }}
                      className={
                        `w-full flex items-center ${sidebarCollapsed ? "justify-center" : ""} space-x-3 px-4 py-3 rounded-2xl text-left transition-all duration-300`
                        + (isActive 
                          ? ' bg-gray-50 text-gray-900 shadow-sm transform scale-[1.02] border border-gray-200' 
                          : ' text-gray-700 hover:bg-orange-50 hover:text-orange-700 hover:scale-[1.01]')
                        + ' group'
                      }
                    >
                      <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                      {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            </nav>

            {/* User Profile in Sidebar */}
            <div className={`p-6 border-t border-gray-200 ${sidebarCollapsed ? 'px-2' : 'px-6'}`}>
              <div 
                className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} p-3 rounded-2xl hover:bg-gray-50 transition-colors duration-200`}
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage src={user?.photoURL || ''} />
                  <AvatarFallback className="bg-gradient-to-br from-gray-600 to-black text-white font-bold text-sm">
                    {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                {!sidebarCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.email || 'Not signed in'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user ? 'Signed in' : 'Please sign in'}
                    </p>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <button
                    className="hidden lg:inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors duration-200"
                    onClick={() => setSidebarCollapsed((c) => !c)}
                    aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                  >
                    {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                  </button>
                  {!sidebarCollapsed && user && (
                    <button
                      className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 hover:text-red-700 transition-colors duration-200 border border-red-200"
                      onClick={() => signOut(auth)}
                    >
                      Sign Out
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 z-50 transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-0 overflow-y-auto h-screen">
          <div className={pathname === '/ai' ? 'p-0' : 'p-6 lg:p-8'}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 