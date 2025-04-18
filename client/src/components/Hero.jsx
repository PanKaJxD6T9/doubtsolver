import React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Menu, X, LogIn, UserPlus, HelpCircle, BookOpen, MessageSquare, Home } from 'lucide-react';

export default function HeroComponent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // const handleSearch = (e) => {
  //   e.preventDefault();
  //   console.log("Searching for:", searchQuery);
  //   // Here you would implement actual search functionality
  // };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-600 to-indigo-700">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-indigo-700 z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <HelpCircle className="w-8 h-8 text-white" />
              <span className="text-xl font-bold text-white">DoubtSolver</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {/* Nav Links */}
              <Link to="/" className="text-white hover:text-blue-200 flex items-center gap-1">
                <Home className="w-4 h-4" />
                <span>Home</span>
              </Link>
              {/* <a href="/subjects" className="text-white hover:text-blue-200 flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                <span>Subjects</span>
              </a>
              <a href="/ask" className="text-white hover:text-blue-200 flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                <span>Ask Doubt</span>
              </a> */}
              
              {/* Auth Links */}
              <Link to="/login" className="px-4 py-2 rounded-md bg-white text-blue-600 hover:bg-blue-100 flex items-center gap-1">
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </Link>
              <Link to="/signup" className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-400 flex items-center gap-1">
                <UserPlus className="w-4 h-4" />
                <span>Sign Up</span>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-white focus:outline-none" 
              onClick={toggleMenu}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden absolute left-0 right-0 top-full mt-2 mx-4">
              <div className="bg-white rounded-lg p-4 shadow-lg">
                <div className="flex flex-col space-y-4">
                  <Link to="/" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
                    <Home className="w-4 h-4" />
                    <span>Home</span>
                  </Link>
                  {/* <a href="/subjects" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>Subjects</span>
                  </a>
                  <a href="/ask" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>Ask Doubt</span>
                  </a> */}
                  
                  <div className="border-t border-gray-200 pt-2 flex flex-col space-y-2">
                    <Link to="/login" className="w-full px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-center flex items-center justify-center gap-2">
                      <LogIn className="w-4 h-4" />
                      <span>Login</span>
                    </Link>
                    <Link to="/signup" className="w-full px-4 py-2 rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200 text-center flex items-center justify-center gap-2">
                      <UserPlus className="w-4 h-4" />
                      <span>Sign Up</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Get Your Doubts Solved Instantly
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8">
              Connect with experts and peers to solve academic problems in real-time. From math equations to complex science concepts.
            </p>
            
            {/* Search Bar */}
            {/* <form onSubmit={handleSearch} className="mb-8">
              <div className="relative max-w-md mx-auto md:mx-0">
                <input 
                  type="text" 
                  placeholder="Search your doubt..." 
                  className="w-full px-4 py-3 pl-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <button 
                  type="submit" 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-md hover:bg-blue-700"
                >
                  Search
                </button>
              </div>
            </form> */}
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center md:justify-start">
              <Link to="/ask" className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 text-center">
                Ask a Question
              </Link>
              <Link to="/browse" className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-400 text-center">
                Browse Topics
              </Link>
            </div>
          </div>
          
          {/* Hero Image */}
          <div className="md:w-1/2 flex justify-center">
            <div className="bg-blue-800/30 p-6 rounded-xl w-full max-w-lg">
              <img 
                src="https://img.freepik.com/free-vector/cartoon-working-day-scene-illustration_52683-62609.jpg?t=st=1744657758~exp=1744661358~hmac=8112aa7c350026ec61b36b7ca53cc3d7d2213df3fc1c55405ca892e19dd5e969&w=996" 
                alt="Students solving doubts together" 
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
        
        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
            <div className="text-2xl sm:text-3xl font-bold text-white">10K+</div>
            <div className="text-sm text-blue-100">Questions Solved</div>
          </div>
          <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
            <div className="text-2xl sm:text-3xl font-bold text-white">500+</div>
            <div className="text-sm text-blue-100">Experts</div>
          </div>
          <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
            <div className="text-2xl sm:text-3xl font-bold text-white">50+</div>
            <div className="text-sm text-blue-100">Subjects</div>
          </div>
          <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
            <div className="text-2xl sm:text-3xl font-bold text-white">24/7</div>
            <div className="text-sm text-blue-100">Support</div>
          </div>
        </div>
      </div>
    </div>
  );
}
