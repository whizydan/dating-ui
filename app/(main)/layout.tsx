'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Heart, User, MessageCircle, Compass, LogOut, Menu, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/');
      } else if (session) {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase]);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error checking user:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const navigation = [
    {
      name: 'Discover',
      href: '/discover',
      icon: Compass,
      description: 'Find new matches'
    },
    {
      name: 'Matches',
      href: '/matches',
      icon: Heart,
      description: 'Your connections'
    },
    {
      name: 'Quirks',
      href: '/quirks',
      icon: MessageCircle,
      description: 'Browse by interests'
    },
    {
      name: 'Profile',
      href: '/profile/edit',
      icon: User,
      description: 'Edit your profile'
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <p className="text-purple-600 font-semibold">Loading your quirky world...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-purple-100 bg-white/80 backdrop-blur-sm px-6 pb-4">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Quirk
              </span>
            </motion.div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <li key={item.name}>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            variant={isActive ? "secondary" : "ghost"}
                            className={`w-full justify-start h-12 ${
                              isActive
                                ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-700 border border-purple-200'
                                : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                            }`}
                            onClick={() => router.push(item.href)}
                          >
                            <item.icon className={`w-5 h-5 mr-3 ${
                              isActive ? 'text-purple-600' : 'text-gray-400'
                            }`} />
                            <div className="text-left">
                              <div className="font-medium">{item.name}</div>
                              <div className="text-xs text-gray-500">{item.description}</div>
                            </div>
                          </Button>
                        </motion.div>
                      </li>
                    );
                  })}
                </ul>
              </li>
              
              {/* User Section */}
              <li className="mt-auto">
                <div className="flex items-center gap-x-4 px-2 py-3 text-sm font-semibold leading-6 text-gray-900">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {user?.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 font-medium truncate">
                      {user?.user_metadata?.full_name || 'User'}
                    </p>
                    <p className="text-gray-500 text-xs truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-2"
                >
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-700 hover:text-red-600 hover:bg-red-50 h-10"
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign out
                  </Button>
                </motion.div>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 z-40 flex items-center justify-between w-full bg-white/80 backdrop-blur-sm border-b border-purple-100 px-4 h-16">
        <div className="flex items-center">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 bg-white/95 backdrop-blur-sm border-r border-purple-100">
              <div className="flex items-center justify-between h-16 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Quirk
                  </span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <nav className="flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-4">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <li key={item.name}>
                        <Button
                          variant={isActive ? "secondary" : "ghost"}
                          className={`w-full justify-start h-12 ${
                            isActive
                              ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-700 border border-purple-200'
                              : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                          }`}
                          onClick={() => {
                            router.push(item.href);
                            setMobileMenuOpen(false);
                          }}
                        >
                          <item.icon className={`w-5 h-5 mr-3 ${
                            isActive ? 'text-purple-600' : 'text-gray-400'
                          }`} />
                          <div className="text-left">
                            <div className="font-medium">{item.name}</div>
                            <div className="text-xs text-gray-500">{item.description}</div>
                          </div>
                        </Button>
                      </li>
                    );
                  })}
                </ul>

                {/* Mobile User Section */}
                <div className="mt-8 border-t border-gray-200 pt-4">
                  <div className="flex items-center gap-x-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {user?.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 font-medium truncate">
                        {user?.user_metadata?.full_name || 'User'}
                      </p>
                      <p className="text-gray-500 text-xs truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-center text-gray-700 border-gray-300 hover:border-red-300 hover:text-red-600 hover:bg-red-50"
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Quirk
            </span>
          </div>
        </div>

        {/* Mobile Navigation Icons */}
        <div className="flex items-center space-x-2">
          {navigation.slice(0, 2).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Button
                key={item.name}
                variant="ghost"
                size="icon"
                className={`${
                  isActive
                    ? 'text-purple-600 bg-purple-50'
                    : 'text-gray-600'
                }`}
                onClick={() => router.push(item.href)}
              >
                <item.icon className="w-5 h-5" />
              </Button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Mobile Spacer */}
        <div className="lg:hidden h-16" />
        
        {/* Main Content Area */}
        <main className="py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-purple-100 z-40">
        <nav className="flex justify-around items-center h-16">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <motion.button
                key={item.name}
                whileTap={{ scale: 0.9 }}
                className={`flex flex-col items-center justify-center flex-1 p-2 ${
                  isActive
                    ? 'text-purple-600'
                    : 'text-gray-500'
                }`}
                onClick={() => router.push(item.href)}
              >
                <item.icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{item.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="mobileNavIndicator"
                    className="w-1 h-1 bg-purple-600 rounded-full mt-1"
                  />
                )}
              </motion.button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}