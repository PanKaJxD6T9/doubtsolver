import React from 'react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, LogIn, UserPlus, HelpCircle, BookOpen, MessageSquare, Home, LayoutDashboard } from 'lucide-react';

export default function HeroComponent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setIsAuthenticated(true);
        setUserRole(user.role);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleDashboardClick = () => {
    if (userRole === 'teacher') {
      navigate('/dashboard/teacher');
    } else {
      navigate('/dashboard/student');
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

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
              {!isAuthenticated ? (
                <>
                  <Link to="/login" className="px-4 py-2 rounded-md bg-white text-blue-600 hover:bg-blue-100 flex items-center gap-1">
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                  </Link>
                  <Link to="/signup" className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-400 flex items-center gap-1">
                    <UserPlus className="w-4 h-4" />
                    <span>Sign Up</span>
                  </Link>
                </>
              ) : (
                <button 
                  onClick={handleDashboardClick}
                  className="px-4 py-2 rounded-md bg-white text-blue-600 hover:bg-blue-100 flex items-center gap-1"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </button>
              )}
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
                  
                  
                  {!isAuthenticated ? (
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
                  ) : (
                    <button 
                      onClick={handleDashboardClick}
                      className="w-full px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-center flex items-center justify-center gap-2"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Dashboard</span>
                    </button>
                  )}
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
            
            
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center md:justify-start">
              <Link to="/teachers" className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 text-center">
                Ask a Question
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
        
        {/* Reviews Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Review Card 1 */}
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center mb-4">
                <img 
                  src="https://randomuser.me/api/portraits/women/44.jpg" 
                  alt="User" 
                  className="w-12 h-12 rounded-full border-2 border-white"
                />
                <div className="ml-4">
                  <h3 className="text-white font-semibold">Sarah Johnson</h3>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-blue-100">
                "DoubtSolver has been a game-changer for my studies. The teachers are incredibly helpful and patient. I've improved my grades significantly!"
              </p>
            </div>

            {/* Review Card 2 */}
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center mb-4">
                <img 
                  src="https://randomuser.me/api/portraits/men/32.jpg" 
                  alt="User" 
                  className="w-12 h-12 rounded-full border-2 border-white"
                />
                <div className="ml-4">
                  <h3 className="text-white font-semibold">Michael Chen</h3>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-blue-100">
                "As a teacher, I love how easy it is to connect with students and help them understand complex concepts. The platform is intuitive and efficient."
              </p>
            </div>

            {/* Review Card 3 */}
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center mb-4">
                <img 
                  src="https://randomuser.me/api/portraits/women/68.jpg" 
                  alt="User" 
                  className="w-12 h-12 rounded-full border-2 border-white"
                />
                <div className="ml-4">
                  <h3 className="text-white font-semibold">Emily Rodriguez</h3>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-blue-100">
                "The 24/7 support is amazing! I can get help with my homework anytime, and the community is so supportive. Highly recommend!"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
