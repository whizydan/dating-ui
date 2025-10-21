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
  Heart, 
  MessageCircle, 
  Phone, 
  MapPin, 
  Calendar, 
  Search, 
  Filter,
  Sparkles,
  Users,
  Clock,
  Star
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

interface Match {
  id: string;
  matched_user: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    age: number;
    city: string;
    country: string;
    bio: string;
    whatsapp_number: string;
    quirks: string[];
  };
  matched_at: string;
  status: string;
  unread_messages?: number;
}

export default function MatchesPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadMatches();
  }, []);

  useEffect(() => {
    filterMatches();
  }, [matches, searchQuery, activeTab]);

  const loadMatches = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Get matches where status is 'matched'
      const { data: matchesData, error } = await supabase
        .from('matches')
        .select(`
          id,
          matched_at,
          status,
          matched_user:profiles!matches_matched_user_id_fkey (
            id,
            full_name,
            avatar_url,
            age,
            city,
            country,
            bio,
            whatsapp_number,
            quirks
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'matched')
        .order('matched_at', { ascending: false });

      if (error) throw error;

      // Also get matches where current user is the matched user
      const { data: reverseMatchesData, error: reverseError } = await supabase
        .from('matches')
        .select(`
          id,
          matched_at,
          status,
          matched_user:profiles!matches_user_id_fkey (
            id,
            full_name,
            avatar_url,
            age,
            city,
            country,
            bio,
            whatsapp_number,
            quirks
          )
        `)
        .eq('matched_user_id', user.id)
        .eq('status', 'matched')
        .order('matched_at', { ascending: false });

      if (reverseError) throw reverseError;

      // Combine and deduplicate matches
      const allMatches = [...(matchesData || []), ...(reverseMatchesData || [])];
      const uniqueMatches = allMatches.filter((match, index, self) =>
        index === self.findIndex(m => 
          m.matched_user.id === match.matched_user.id
        )
      );

      setMatches(uniqueMatches as Match[]);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMatches = () => {
    let filtered = matches;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(match =>
        match.matched_user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        match.matched_user.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        match.matched_user.quirks?.some(quirk => 
          quirk.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Filter by tab
    if (activeTab === 'recent') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      filtered = filtered.filter(match => 
        new Date(match.matched_at) > oneWeekAgo
      );
    } else if (activeTab === 'nearby') {
      // In a real app, you'd filter by distance
      // For now, we'll just return all matches
      filtered = filtered;
    }

    setFilteredMatches(filtered);
  };

  const openWhatsApp = (phoneNumber: string, userName: string) => {
    const message = `Hi ${userName}! I found you on Quirk Dating and would love to chat!`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return `${Math.floor(diffInHours / 168)}w ago`;
  };

  const getMatchQuality = (quirks: string[]) => {
    // Simple match quality calculation based on number of quirks
    if (quirks.length >= 5) return { label: 'Great Match', color: 'bg-green-100 text-green-700' };
    if (quirks.length >= 3) return { label: 'Good Match', color: 'bg-blue-100 text-blue-700' };
    return { label: 'New Match', color: 'bg-purple-100 text-purple-700' };
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
          <p className="text-purple-600 font-semibold">Loading your matches...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Your Matches
              </h1>
              <p className="text-gray-600 text-lg">
                {matches.length} quirky connections waiting to chat
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Matches</p>
                  <p className="text-3xl font-bold">{matches.length}</p>
                </div>
                <Users className="w-8 h-8 opacity-90" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">This Week</p>
                  <p className="text-3xl font-bold text-gray-800">
                    {matches.filter(match => {
                      const oneWeekAgo = new Date();
                      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                      return new Date(match.matched_at) > oneWeekAgo;
                    }).length}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Now</p>
                  <p className="text-3xl font-bold text-gray-800">
                    {matches.filter(match => {
                      const oneHourAgo = new Date();
                      oneHourAgo.setHours(oneHourAgo.getHours() - 1);
                      return new Date(match.matched_at) > oneHourAgo;
                    }).length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Match Rate</p>
                  <p className="text-3xl font-bold text-gray-800">
                    {matches.length > 0 ? 'High' : '--'}
                  </p>
                </div>
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search matches by name, bio, or quirks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-gray-300 focus:border-purple-500 bg-white/80 backdrop-blur-sm"
            />
          </div>
          <Button variant="outline" className="border-gray-300 bg-white/80 backdrop-blur-sm">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm border border-purple-100">
            <TabsTrigger value="all" className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              All Matches ({matches.length})
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Recent
            </TabsTrigger>
            <TabsTrigger value="nearby" className="flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              Nearby
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Matches Grid */}
        {filteredMatches.length === 0 ? (
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full flex items-center justify-center">
                <Heart className="w-10 h-10 text-purple-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {searchQuery ? 'No matches found' : 'No matches yet'}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {searchQuery 
                  ? 'Try adjusting your search terms or browse more profiles.'
                  : 'Start swiping in Discover to find your first quirky match!'
                }
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => router.push('/discover')}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start Discovering
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredMatches.map((match, index) => {
                const matchQuality = getMatchQuality(match.matched_user.quirks || []);
                
                return (
                  <motion.div
                    key={match.id}
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
                              <AvatarImage src={match.matched_user.avatar_url || ''} />
                              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold">
                                {match.matched_user.full_name?.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
                                {match.matched_user.full_name}
                              </h3>
                              <div className="flex items-center space-x-1 text-sm text-gray-500">
                                <span>{match.matched_user.age}</span>
                                <span>•</span>
                                <MapPin className="w-3 h-3" />
                                <span>{match.matched_user.city}</span>
                              </div>
                            </div>
                          </div>
                          <Badge className={matchQuality.color}>
                            {matchQuality.label}
                          </Badge>
                        </div>

                        {/* Bio */}
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {match.matched_user.bio || "Excited to meet new people and share quirky conversations!"}
                        </p>

                        {/* Quirks */}
                        <div className="flex flex-wrap gap-1 mb-4">
                          {match.matched_user.quirks?.slice(0, 3).map((quirk, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-xs bg-purple-50 text-purple-700 border-purple-200"
                            >
                              {quirk}
                            </Badge>
                          ))}
                          {match.matched_user.quirks && match.matched_user.quirks.length > 3 && (
                            <Badge variant="outline" className="text-xs text-gray-500">
                              +{match.matched_user.quirks.length - 3} more
                            </Badge>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="text-xs text-gray-500 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {getTimeAgo(match.matched_at)}
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-gray-300 text-gray-600 hover:bg-gray-50"
                              onClick={() => router.push(`/profile/${match.matched_user.id}`)}
                            >
                              View
                            </Button>
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                              onClick={() => openWhatsApp(match.matched_user.whatsapp_number, match.matched_user.full_name)}
                            >
                              <Phone className="w-3 h-3 mr-1" />
                              Chat
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Load More */}
        {filteredMatches.length > 0 && (
          <div className="text-center mt-12">
            <Button
              variant="outline"
              className="border-purple-200 text-purple-600 hover:bg-purple-50"
              onClick={loadMatches}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Load More Matches
            </Button>
          </div>
        )}

        {/* Tips Section */}
        {matches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12"
          >
            <Card className="border-0 shadow-xl bg-gradient-to-r from-purple-50 to-pink-50">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Conversation Starters
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <strong className="text-purple-600">Ask about quirks:</strong>
                        <p>"I noticed you're into {matches[0]?.matched_user.quirks?.[0] || 'adventure'}! Tell me more about that?"</p>
                      </div>
                      <div>
                        <strong className="text-purple-600">Be genuine:</strong>
                        <p>"Your profile made me smile! What's the best part of your day been?"</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}