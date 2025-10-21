'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  MapPin, 
  Phone, 
  Camera, 
  Save, 
  Upload, 
  X, 
  Plus,
  Edit3,
  Eye,
  Shield,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  age: number;
  gender: string;
  city: string;
  country: string;
  whatsapp_number: string;
  bio: string;
  quirks: string[];
  location_visible: boolean;
  max_distance_km: number;
  profile_completed: boolean;
  is_verified: boolean;
}

const availableQuirks = [
  'Coffee Connoisseur', 'Book Worm', 'Plant Parent', 'Adventure Seeker',
  'Foodie Explorer', 'Movie Buff', 'Music Lover', 'Gamer',
  'Fitness Enthusiast', 'DIY Master', 'Pet Lover', 'Tech Geek',
  'Art Lover', 'Night Owl', 'Morning Person', 'Traveler',
  'Yoga Practitioner', 'Photography Lover', 'Dancer', 'Chef'
];

export default function ProfileEditPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newQuirk, setNewQuirk] = useState('');
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(profileData);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof Profile, value: any) => {
    if (profile) {
      setProfile(prev => prev ? { ...prev, [field]: value } : null);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          age: profile.age,
          gender: profile.gender,
          city: profile.city,
          country: profile.country,
          whatsapp_number: profile.whatsapp_number,
          bio: profile.bio,
          quirks: profile.quirks,
          location_visible: profile.location_visible,
          max_distance_km: profile.max_distance_km,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (error) throw error;

      // Show success feedback
      const saveButton = document.getElementById('save-button');
      if (saveButton) {
        saveButton.innerHTML = 'Saved!';
        setTimeout(() => {
          if (saveButton) saveButton.innerHTML = 'Save Changes';
        }, 2000);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    setUploading(true);
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Error uploading avatar. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const addQuirk = () => {
    if (newQuirk.trim() && profile) {
      const updatedQuirks = [...(profile.quirks || []), newQuirk.trim()];
      setProfile(prev => prev ? { ...prev, quirks: updatedQuirks } : null);
      setNewQuirk('');
    }
  };

  const removeQuirk = (index: number) => {
    if (profile) {
      const updatedQuirks = profile.quirks.filter((_, i) => i !== index);
      setProfile(prev => prev ? { ...prev, quirks: updatedQuirks } : null);
    }
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
          <p className="text-purple-600 font-semibold">Loading your profile...</p>
        </motion.div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full border-0 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Profile Not Found</h3>
            <p className="text-gray-600 mb-4">
              We couldn't load your profile. Please try refreshing the page.
            </p>
            <Button onClick={loadProfile} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Your Profile
          </h1>
          <p className="text-gray-600 text-lg">
            Manage your information and showcase your unique quirks
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Avatar & Quick Stats */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm sticky top-8">
              <CardContent className="p-6">
                {/* Avatar Section */}
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <Avatar className="w-32 h-32 mx-auto border-4 border-white shadow-lg">
                      <AvatarImage src={profile.avatar_url || ''} />
                      <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-2xl font-bold">
                        {profile.full_name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <label htmlFor="avatar-upload" className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <Camera className="w-4 h-4 text-gray-600" />
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-800 mt-4">
                    {profile.full_name}
                  </h2>
                  <p className="text-gray-600 flex items-center justify-center mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    {profile.city}, {profile.country}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {profile.age} years old • {profile.gender}
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm font-medium text-purple-700">Quirks</span>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      {profile.quirks?.length || 0}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-pink-50 rounded-lg">
                    <span className="text-sm font-medium text-pink-700">Profile Complete</span>
                    <Badge variant="secondary" className="bg-pink-100 text-pink-700">
                      {profile.profile_completed ? '100%' : 'Incomplete'}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-green-700">Status</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      {profile.is_verified ? 'Verified' : 'Active'}
                    </Badge>
                  </div>
                </div>

                {/* Save Button */}
                <Button
                  id="save-button"
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  {saving ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Edit Forms */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm border border-purple-100">
                <TabsTrigger value="basic" className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Basic Info
                </TabsTrigger>
                <TabsTrigger value="quirks" className="flex items-center">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Quirks
                </TabsTrigger>
                <TabsTrigger value="privacy" className="flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  Privacy
                </TabsTrigger>
              </TabsList>

              {/* Basic Info Tab */}
              <TabsContent value="basic">
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <User className="w-5 h-5 mr-2 text-purple-600" />
                      Basic Information
                    </CardTitle>
                    <CardDescription>
                      Update your personal details and contact information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name *</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="fullName"
                            value={profile.full_name}
                            onChange={(e) => handleInputChange('full_name', e.target.value)}
                            className="pl-10 border-gray-300 focus:border-purple-500"
                            placeholder="Enter your full name"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="age">Age *</Label>
                        <Input
                          id="age"
                          type="number"
                          min="18"
                          max="100"
                          value={profile.age}
                          onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                          className="border-gray-300 focus:border-purple-500"
                          placeholder="Your age"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select value={profile.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                          <SelectTrigger className="border-gray-300 focus:border-purple-500">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="non-binary">Non-binary</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                            <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="whatsappNumber">WhatsApp Number *</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="whatsappNumber"
                            value={profile.whatsapp_number}
                            onChange={(e) => handleInputChange('whatsapp_number', e.target.value)}
                            className="pl-10 border-gray-300 focus:border-purple-500"
                            placeholder="+1234567890"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="city">City *</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="city"
                            value={profile.city}
                            onChange={(e) => handleInputChange('city', e.target.value)}
                            className="pl-10 border-gray-300 focus:border-purple-500"
                            placeholder="Your city"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="country">Country *</Label>
                        <Input
                          id="country"
                          value={profile.country}
                          onChange={(e) => handleInputChange('country', e.target.value)}
                          className="border-gray-300 focus:border-purple-500"
                          placeholder="Your country"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={profile.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        className="border-gray-300 focus:border-purple-500 min-h-[100px]"
                        placeholder="Tell others about yourself, your interests, and what makes you unique..."
                      />
                      <p className="text-sm text-gray-500">
                        {profile.bio?.length || 0}/500 characters
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Quirks Tab */}
              <TabsContent value="quirks">
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                      Your Quirks & Interests
                    </CardTitle>
                    <CardDescription>
                      Showcase what makes you unique. Add quirks that describe your personality and interests.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Add Quirk Input */}
                    <div className="space-y-2">
                      <Label>Add a Quirk</Label>
                      <div className="flex gap-2">
                        <Input
                          value={newQuirk}
                          onChange={(e) => setNewQuirk(e.target.value)}
                          placeholder="E.g., Coffee Connoisseur, Adventure Seeker..."
                          className="border-gray-300 focus:border-purple-500"
                          onKeyPress={(e) => e.key === 'Enter' && addQuirk()}
                        />
                        <Button
                          onClick={addQuirk}
                          disabled={!newQuirk.trim()}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500">
                        Press Enter or click the + button to add a quirk
                      </p>
                    </div>

                    {/* Current Quirks */}
                    <div>
                      <Label>Your Quirks ({profile.quirks?.length || 0})</Label>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {profile.quirks?.map((quirk, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200 px-3 py-1.5"
                          >
                            {quirk}
                            <button
                              onClick={() => removeQuirk(index)}
                              className="ml-2 hover:text-red-500 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                        {(!profile.quirks || profile.quirks.length === 0) && (
                          <p className="text-gray-500 text-sm">No quirks added yet. Start adding some above!</p>
                        )}
                      </div>
                    </div>

                    {/* Popular Quirks Suggestions */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-3 block">
                        Popular Quirks
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {availableQuirks.map((quirk) => (
                          <Badge
                            key={quirk}
                            variant="outline"
                            className="cursor-pointer hover:bg-purple-50 hover:text-purple-700 transition-colors"
                            onClick={() => {
                              setNewQuirk(quirk);
                              addQuirk();
                            }}
                          >
                            {quirk}
                            <Plus className="w-3 h-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Privacy Tab */}
              <TabsContent value="privacy">
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                      <Shield className="w-5 h-5 mr-2 text-purple-600" />
                      Privacy & Discovery Settings
                    </CardTitle>
                    <CardDescription>
                      Control how others discover and interact with your profile
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="space-y-1">
                        <Label htmlFor="location-visible" className="text-base">
                          Show Location
                        </Label>
                        <p className="text-sm text-gray-500">
                          Allow others to see your city and country
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleInputChange('location_visible', !profile.location_visible)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            profile.location_visible
                              ? 'bg-purple-500'
                              : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              profile.location_visible
                                ? 'translate-x-6'
                                : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <Eye className={`w-4 h-4 ${profile.location_visible ? 'text-purple-500' : 'text-gray-400'}`} />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="maxDistance">Maximum Discovery Distance</Label>
                      <div className="space-y-2">
                        <Input
                          id="maxDistance"
                          type="range"
                          min="1"
                          max="100"
                          value={profile.max_distance_km}
                          onChange={(e) => handleInputChange('max_distance_km', parseInt(e.target.value))}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>1 km</span>
                          <span className="font-medium text-purple-600">
                            {profile.max_distance_km} km
                          </span>
                          <span>100 km</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">
                        Show me profiles within {profile.max_distance_km} kilometers of my location
                      </p>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex">
                        <Shield className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-900">Privacy Note</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            Your WhatsApp number is only shared with mutual matches. 
                            We never share your exact location or personal contact information publicly.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}