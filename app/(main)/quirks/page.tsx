'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Filter, 
  Sparkles, 
  Users, 
  Heart,
  MapPin,
  Phone,
  TrendingUp,
  Star,
  Zap,
  Coffee,
  BookOpen,
  Palette,
  Music,
  Utensils,
  Gamepad,
  Hiking,
  Camera
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

interface Profile {
  id: string;
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

interface QuirkCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  quirks: string[];
}

export default function QuirksPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuirk, setSelectedQuirk] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');

  const quirkCategories: QuirkCategory[] = [
    {
      id: 'lifestyle',
      name: 'Lifestyle',
      icon: <Sparkles className="w-5 h-5" />,
      description: 'Daily habits and personal routines',
      color: 'from-purple-500 to-pink-500',
      quirks: ['Coffee Connoisseur', 'Plant Parent', 'Fitness Enthusiast', 'Night Owl', 'Morning Person', 'Yoga Practitioner']
    },
    {
      id: 'hobbies',
      name: 'Hobbies',
      icon: <Gamepad className="w-5 h-5" />,
      description: 'Creative and recreational activities',
      color: 'from-blue-500 to-cyan-500',
      quirks: ['Book Worm', 'Gamer', 'Photography Lover', 'Dancer', 'Chef', 'DIY Master']
    },
    {
      id: 'interests',
      name: 'Interests',
      icon: <Star className="w-5 h-5" />,
      description: 'Passions and areas of expertise',
      color: 'from-orange-500 to-red-500',
      quirks: ['Movie Buff', 'Music Lover', 'Art Lover', 'Tech Geek', 'Traveler', 'Foodie Explorer']
    },
    {
      id: 'adventure',
      name: 'Adventure',
      icon: <Hiking className="w-5 h-5" />,
      description: 'Outdoor and exploration activities',
      color: 'from-green-500 to-emerald-500',
      quirks: ['Adventure Seeker', 'Hiking Enthusiast', 'Traveler', 'Nature Lover', 'Explorer']
    }
  ];

  const allQuirks = quirkCategories.flatMap(category => category.quirks);
  const popularQuirks = ['Coffee Connoisseur', 'Book Worm', 'Adventure Seeker', 'Music Lover', 'Foodie Explorer', 'Traveler'];

  useEffect(() => {
    loadProfiles();
  }, []);

  useEffect(() => {
    filterProfiles();
  }, [profiles, searchQuery, selectedQuirk, activeCategory]);

  const loadProfiles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Load profiles with quirks
      const { data: profilesData, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .eq('is_active', true)
        .limit(50);

      if (error) throw error;
      setProfiles(profilesData || []);
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProfiles = () => {
    let filtered = profiles;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(profile =>
        profile.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.quirks?.some(quirk => 
          quirk.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Filter by selected quirk
    if (selectedQuirk) {
      filtered = filtered.filter(profile =>
        profile.quirks?.includes(selectedQuirk)
      );
    }

    // Filter by category
    if (activeCategory !== 'all') {
      const category = quirkCategories.find(cat => cat.id === activeCategory);
      if (category) {
        filtered = filtered.filter(profile =>
          profile.quirks?.some(quirk => category.quirks.includes(quirk))
        );
      }
    }

    setFilteredProfiles(filtered);
  };

  const openWhatsApp = (phoneNumber: string, userName: string) => {
    const quirkMessage = selectedQuirk 
      ? `Hi ${userName}! I noticed you're also into ${selectedQuirk} and would love to chat!`
      : `Hi ${userName}! I found you on Quirk Dating and would love to connect!`;
    
    const encodedMessage = encodeURIComponent(quirkMessage);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
  };

  const getQuirkIcon = (quirk: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      'Coffee Connoisseur': <Coffee className="w-4 h-4" />,
      'Book Worm': <BookOpen className="w-4 h-4" />,
      'Music Lover': <Music className="w-4 h-4" />,
      'Art Lover': <Palette className="w-4 h-4" />,
      'Foodie Explorer': <Utensils className="w-4 h-4" />,
      'Gamer': <Gamepad className="w-4 h-4" />,
      'Adventure Seeker': <Hiking className="w-4 h-4" />,
      'Photography Lover': <Camera className="w-4 h-4" />,
    };
    return icons[quirk] || <Sparkles className="w-4 h-4" />;
  };

  const getProfilesWithQuirk = (quirk: string) => {
    return profiles.filter(profile => profile.quirks?.includes(quirk)).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center"
        >
          <Sparkles className="w-12 h-12 text-purple-500 mb-4" />
          <p className="text-purple-600 font-semibold">Discovering quirky people...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Discover by Quirks
              </h1>
              <p className="text-gray-600 text-lg">
                Find people who share your unique interests and passions
              </p>
            </div>
          </div>
        </motion.div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search quirks or people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-gray-300 focus:border-purple-500 bg-white/80 backdrop-blur-sm"
            />
          </div>
          <Button 
            variant="outline" 
            className="border-gray-300 bg-white/80 backdrop-blur-sm"
            onClick={() => {
              setSelectedQuirk(null);
              setSearchQuery('');
              setActiveCategory('all');
            }}
          >
            <Filter className="w-4 h-4 mr-2" />
            Clear Filters
          </Button>
        </div>

        {/* Selected Quirk Banner */}
        <AnimatePresence>
          {selectedQuirk && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-pink-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        {getQuirkIcon(selectedQuirk)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">Browsing: {selectedQuirk}</h3>
                        <p className="text-sm text-gray-600">
                          {getProfilesWithQuirk(selectedQuirk)} people share this quirk
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedQuirk(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Categories and Quirks */}
          <div className="lg:col-span-1 space-y-6">
            {/* Categories */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                    activeCategory === 'all'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'bg-gray-50 hover:bg-purple-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>All Quirks</span>
                  </div>
                </button>
                
                {quirkCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                      activeCategory === category.id
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                        : 'bg-gray-50 hover:bg-purple-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {category.icon}
                      <div className="text-left">
                        <div className="font-medium">{category.name}</div>
                        <div className="text-xs opacity-75">{category.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Popular Quirks */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
                  Popular Quirks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {popularQuirks.map((quirk) => (
                  <button
                    key={quirk}
                    onClick={() => setSelectedQuirk(quirk)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                      selectedQuirk === quirk
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                        : 'bg-gray-50 hover:bg-purple-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getQuirkIcon(quirk)}
                        <span>{quirk}</span>
                      </div>
                      <Badge variant="secondary" className="bg-white/20 text-xs">
                        {getProfilesWithQuirk(quirk)}
                      </Badge>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-2">
                  <span className="text-sm text-gray-600">Total Profiles</span>
                  <Badge variant="secondary">{profiles.length}</Badge>
                </div>
                <div className="flex justify-between items-center p-2">
                  <span className="text-sm text-gray-600">Active Now</span>
                  <Badge variant="secondary">{profiles.length}</Badge>
                </div>
                <div className="flex justify-between items-center p-2">
                  <span className="text-sm text-gray-600">Unique Quirks</span>
                  <Badge variant="secondary">{allQuirks.length}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Profiles Grid */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedQuirk ? `People who are ${selectedQuirk}` : 'Discover People'}
                </h2>
                <p className="text-gray-600">
                  {filteredProfiles.length} {filteredProfiles.length === 1 ? 'person' : 'people'} found
                  {selectedQuirk && ` who share your interest in ${selectedQuirk}`}
                </p>
              </div>
            </div>

            {/* Profiles Grid */}
            {filteredProfiles.length === 0 ? (
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full flex items-center justify-center">
                    <Search className="w-10 h-10 text-purple-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    No profiles found
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {searchQuery || selectedQuirk 
                      ? 'Try adjusting your search terms or browse different quirks.'
                      : 'No profiles available at the moment. Check back later!'
                    }
                  </p>
                  {(searchQuery || selectedQuirk) && (
                    <Button
                      onClick={() => {
                        setSelectedQuirk(null);
                        setSearchQuery('');
                      }}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    >
                      Clear Filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filteredProfiles.map((profile, index) => (
                    <motion.div
                      key={profile.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      layout
                    >
                      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 h-full group">
                        <CardContent className="p-6">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <Avatar className="w-12 h-12 border-2 border-white shadow-md group-hover:scale-105 transition-transform duration-300">
                                <AvatarImage src={profile.avatar_url || ''} />
                                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold">
                                  {profile.full_name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
                                  {profile.full_name}
                                </h3>
                                <div className="flex items-center space-x-1 text-sm text-gray-500">
                                  <span>{profile.age}</span>
                                  <span>•</span>
                                  <MapPin className="w-3 h-3" />
                                  <span>{profile.city}</span>
                                </div>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                              onClick={() => openWhatsApp(profile.whatsapp_number, profile.full_name)}
                            >
                              <Phone className="w-3 h-3" />
                            </Button>
                          </div>

                          {/* Bio */}
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {profile.bio || "Excited to meet new people and share quirky conversations!"}
                          </p>

                          {/* Quirks */}
                          <div className="space-y-2">
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <Sparkles className="w-3 h-3" />
                              <span>Quirks</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {profile.quirks?.slice(0, 4).map((quirk, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-xs bg-purple-50 text-purple-700 border-purple-200 cursor-pointer hover:bg-purple-100 transition-colors"
                                  onClick={() => setSelectedQuirk(quirk)}
                                >
                                  {quirk}
                                </Badge>
                              ))}
                              {profile.quirks && profile.quirks.length > 4 && (
                                <Badge variant="outline" className="text-xs text-gray-500">
                                  +{profile.quirks.length - 4} more
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-100">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-50"
                              onClick={() => router.push(`/profile/${profile.id}`)}
                            >
                              View Profile
                            </Button>
                            <Button
                              size="sm"
                              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                              onClick={() => openWhatsApp(profile.whatsapp_number, profile.full_name)}
                            >
                              <Phone className="w-3 h-3 mr-1" />
                              Chat
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Load More */}
            {filteredProfiles.length > 0 && (
              <div className="text-center mt-12">
                <Button
                  variant="outline"
                  className="border-purple-200 text-purple-600 hover:bg-purple-50"
                  onClick={loadProfiles}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Load More Profiles
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}