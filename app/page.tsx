'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MessageCircle, Sparkles, Users, Shield, Zap } from 'lucide-react';

export default function HomePage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const testimonials = [
    {
      text: "Finally found someone who appreciates my obsession with vintage typewriters!",
      name: "Alex, 28"
    },
    {
      text: "No more awkward small talk. We connected over our mutual love for urban gardening!",
      name: "Sam, 25"
    },
    {
      text: "From first match to WhatsApp date in minutes. So much more authentic!",
      name: "Taylor, 30"
    }
  ];

  const features = [
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Embrace Quirks",
      description: "Showcase what makes you unique and find others who appreciate it"
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "Direct WhatsApp Chat",
      description: "Skip the awkward app messaging and connect directly on WhatsApp"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Authentic Connections",
      description: "No algorithms, just genuine connections based on shared interests"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Instant Connection",
      description: "See a match? Chat immediately on WhatsApp without delays"
    }
  ];

  const floatingShapes = [
    { top: '10%', left: '5%', delay: 0 },
    { top: '20%', right: '10%', delay: 0.5 },
    { bottom: '30%', left: '15%', delay: 1 },
    { bottom: '20%', right: '5%', delay: 1.5 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 overflow-hidden">
      {/* Floating Background Shapes */}
      <div className="fixed inset-0 pointer-events-none">
        {floatingShapes.map((shape, index) => (
          <motion.div
            key={index}
            className="absolute w-72 h-72 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full blur-3xl opacity-20"
            initial={{ y: 0, x: 0 }}
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
            }}
            transition={{
              duration: 8,
              delay: shape.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={shape}
          />
        ))}
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Quirk
            </span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex space-x-4"
          >
            <Button variant="ghost" className="text-gray-600 hover:text-purple-600">
              Login
            </Button>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
              Sign Up Free
            </Button>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
                Embrace Your
              </span>
              <br />
              <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                Beautiful Quirks
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Find people who love you for what makes you different. 
              <span className="font-semibold text-purple-600"> No in-app chats</span>, just real conversations on WhatsApp.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-6 text-lg font-semibold rounded-full shadow-lg"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Your Journey
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="outline" 
                  size="lg"
                  className="px-8 py-6 text-lg font-semibold rounded-full border-2 border-purple-200 text-purple-600 hover:bg-purple-50"
                >
                  How It Works
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Animated Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mb-16"
          >
            {[
              { number: "10K+", label: "Active Users" },
              { number: "50K+", label: "Matches Made" },
              { number: "95%", label: "Real Connections" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="text-center"
              >
                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-gray-500 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-6 py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Why Quirk Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We&apos;re changing dating by focusing on what really matters - authentic connections
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-purple-50/50 h-full">
                  <CardContent className="p-6 text-center">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white"
                    >
                      {feature.icon}
                    </motion.div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-800">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold mb-16 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
          >
            Real Stories, Real Connections
          </motion.h2>

          <div className="relative h-32 mb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex flex-col items-center justify-center"
              >
                <p className="text-xl md:text-2xl text-gray-700 italic mb-4 max-w-2xl">
                  &ldquo;{testimonials[currentTestimonial].text}&ldquo;
                </p>
                <p className="text-lg font-semibold text-purple-600">
                  {testimonials[currentTestimonial].name}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-center space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentTestimonial 
                    ? 'bg-purple-500 w-8' 
                    : 'bg-purple-200'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-12 shadow-2xl"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Find Your Quirky Match?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Join thousands of unique individuals finding authentic connections through their quirks.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              size="lg" 
              className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold rounded-full shadow-lg"
            >
              <Users className="w-5 h-5 mr-2" />
              Create Your Profile
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 text-center text-gray-600">
        <p>© 2024 Quirk Dating. Embrace your uniqueness.</p>
      </footer>
    </div>
  );
}