'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, X, Star, MapPin, Phone, Sparkles, RefreshCw, Filter } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  age: number;
  city: string;
  country: string;
  bio: string;
  whatsapp_number: string;
  quirks: string[];
  distance_km?: number;
}

export default function DiscoverPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [exitX, setExitX] = useState(0);
  const [filters, setFilters] = useState({
    maxDistance: 50,
    ageRange: [18, 40] as [number, number],
    genders: [] as string[],
  });

  useEffect(() => {
    checkAuth();
    loadProfiles();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
    }
  };

  const loadProfiles = async () => {
    try {
      setLoading(true);
      
      // Get current user's location
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // In a real app, you'd use the find_nearby_profiles function
      // For now, we'll fetch all active profiles except current user
      const { data: profilesData, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .eq('is_active', true)
        .limit(20);

      if (error) throw error;

      setProfiles(profilesData || []);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = useCallback(async (direction: 'left' | 'right') => {
    if (profiles.length === 0) return;

    const currentProfile = profiles[currentIndex];
    setSwipeDirection(direction);
    setExitX(direction === 'right' ? 500 : -500);

    // Save the match decision
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('matches')
          .insert([
            {
              user_id: user.id,
              matched_user_id: currentProfile.id,
              status: direction === 'right' ? 'matched' : 'rejected',
            },
          ]);
      }
    } catch (error) {
      console.error('Error saving match:', error);
    }

    // Move to next profile after a delay for animation
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setSwipeDirection(null);
      setExitX(0);
    }, 300);
  }, [currentIndex, profiles]);

  const handleDragEnd = useCallback((event: any, info: PanInfo) => {
    const swipeThreshold = 50;
    const velocityThreshold = 500;

    if (
      Math.abs(info.offset.x) > swipeThreshold ||
      Math.abs(info.velocity.x) > velocityThreshold
    ) {
      const direction = info.offset.x > 0 ? 'right' : 'left';
      handleSwipe(direction);
    }
  }, [handleSwipe]);

  const openWhatsApp = (phoneNumber: string) => {
    const message = "Hi! I found you on Quirk Dating and would love to connect!";
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
  };

  const currentProfile = profiles[currentIndex];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center"
        >
          <Sparkles className="w-12 h-12 text-purple-500 mb-4" />
          <p className="text-purple-600 font-semibold">Finding quirky matches...</p>
        </motion.div>
      </div>
    );
  }

  if (!currentProfile && profiles.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-purple-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No More Profiles</h3>
            <p className="text-gray-600 mb-6">
              You&apos;ve seen all the quirky people in your area. Check back later for new matches!
            </p>
            <Button
              onClick={loadProfiles}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Profiles
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 pb-20">
      {/* Header */}
      <div className="p-6">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Discover
            </h1>
            <p className="text-gray-600 text-sm">
              Swipe right to like, left to pass
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="border-purple-200 text-purple-600 hover:bg-purple-50"
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Profile Card Stack */}
      <div className="relative max-w-md mx-auto h-[70vh] px-6">
        <AnimatePresence>
          {profiles.slice(currentIndex, currentIndex + 3).map((profile, index) => {
            const isCurrent = index === 0;
            const stackOffset = index * 8;
            
            return (
              <motion.div
                key={profile.id}
                className="absolute inset-0"
                style={{
                  zIndex: 10 - index,
                  y: stackOffset,
                  scale: 1 - (index * 0.03),
                  rotate: index === 1 ? (swipeDirection === 'right' ? 2 : -2) : 
                         index === 2 ? (swipeDirection === 'right' ? 4 : -4) : 0,
                }}
                drag={isCurrent ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={isCurrent ? handleDragEnd : undefined}
                animate={{
                  x: isCurrent ? exitX : 0,
                  opacity: isCurrent ? (swipeDirection ? 0.7 : 1) : 1,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <Card className="w-full h-full border-0 shadow-2xl bg-white/90 backdrop-blur-sm overflow-hidden cursor-grab active:cursor-grabbing">
                  {/* Profile Image */}
                  <div className="relative h-2/3 bg-gradient-to-br from-purple-200 to-pink-200">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-20 h-20 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full flex items-center justify-center">
                          <span className="text-2xl font-bold text-white">
                            {profile.full_name.charAt(0)}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* Distance Badge */}
                    {profile.distance_km && (
                      <div className="absolute top-4 left-4">
                        <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
                          <MapPin className="w-3 h-3 mr-1" />
                          {Math.round(profile.distance_km)}km away
                        </Badge>
                      </div>
                    )}

                    {/* Age Badge */}
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        {profile.age}
                      </Badge>
                    </div>

                    {/* Swipe Indicator */}
                    {isCurrent && (
                      <motion.div
                        className="absolute inset-0 border-2 rounded-xl pointer-events-none"
                        animate={{
                          borderColor: swipeDirection === 'right' 
                            ? 'rgb(34, 197, 94)' 
                            : swipeDirection === 'left' 
                            ? 'rgb(239, 68, 68)' 
                            : 'transparent',
                        }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </div>

                  {/* Profile Info */}
                  <CardContent className="p-6 h-1/3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-800">
                            {profile.full_name}
                          </h2>
                          <p className="text-gray-600 flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {profile.city}, {profile.country}
                          </p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                          onClick={() => openWhatsApp(profile.whatsapp_number)}
                        >
                          <Phone className="w-5 h-5" />
                        </Button>
                      </div>

                      <p className="text-gray-700 line-clamp-2 mb-4">
                        {profile.bio || "Excited to meet new people and share quirky conversations!"}
                      </p>
                    </div>

                    {/* Quirks */}
                    <div className="flex flex-wrap gap-2">
                      {profile.quirks?.slice(0, 3).map((quirk, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="bg-purple-50 text-purple-700 border-purple-200"
                        >
                          {quirk}
                        </Badge>
                      ))}
                      {profile.quirks && profile.quirks.length > 3 && (
                        <Badge variant="outline" className="text-gray-500">
                          +{profile.quirks.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Empty State */}
        {!currentProfile && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm text-center p-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full flex items-center justify-center">
                <Star className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">That&apos;s all for now!</h3>
              <p className="text-gray-600 mb-4">
                You&apos;ve seen everyone in your area. Check back later for new quirky matches.
              </p>
              <Button
                onClick={loadProfiles}
                variant="outline"
                className="border-purple-200 text-purple-600 hover:bg-purple-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Action Buttons */}
      {currentProfile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 max-w-md w-full px-6"
        >
          <div className="flex justify-center space-x-8">
            {/* Dislike Button */}
            <motion.div whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.1 }}>
              <Button
                size="icon"
                className="w-16 h-16 bg-white border-2 border-red-300 text-red-500 hover:bg-red-50 shadow-lg rounded-full"
                onClick={() => handleSwipe('left')}
              >
                <X className="w-8 h-8" />
              </Button>
            </motion.div>

            {/* Super Like (Placeholder) */}
            <motion.div whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.1 }}>
              <Button
                size="icon"
                className="w-12 h-12 bg-white border-2 border-blue-300 text-blue-500 hover:bg-blue-50 shadow-lg rounded-full"
              >
                <Star className="w-6 h-6" />
              </Button>
            </motion.div>

            {/* Like Button */}
            <motion.div whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.1 }}>
              <Button
                size="icon"
                className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg rounded-full"
                onClick={() => handleSwipe('right')}
              >
                <Heart className="w-8 h-8" />
              </Button>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Progress Indicator */}
      <div className="max-w-md mx-auto px-6 mt-6">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{currentIndex} of {profiles.length} profiles</span>
          <span>{Math.round((currentIndex / profiles.length) * 100)}% viewed</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <motion.div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(currentIndex / profiles.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  );
}