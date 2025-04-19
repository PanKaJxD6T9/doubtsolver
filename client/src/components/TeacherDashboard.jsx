import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  BookOpen,
  HelpCircle,
  MessageSquare,
  Bell,
  LogOut,
  Search,
  UserPlus,
  CheckCircle,
  Clock,
  ChevronDown,
  BarChart2,
  Calendar,
  Mail,
  XCircle,
  Send
} from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeDoubts: 0,
    resolvedDoubts: 0,
    satisfaction: 0
  });
  const [doubts, setDoubts] = useState([]);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedDoubt, setSelectedDoubt] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [expandedDoubts, setExpandedDoubts] = useState(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Fetch teacher data
        const userResponse = await fetch(API_ENDPOINTS.AUTH.USER, {
          headers: {
            'x-auth-token': token
          }
        });

        if (!userResponse.ok) throw new Error('Failed to fetch user data');
        const userData = await userResponse.json();
        setUser(userData);

        // Fetch dashboard data
        const dashboardResponse = await fetch(API_ENDPOINTS.DASHBOARD.TEACHER, {
          headers: {
            'x-auth-token': token
          }
        });

        if (!dashboardResponse.ok) throw new Error('Failed to fetch dashboard data');
        const dashboardData = await dashboardResponse.json();
        setStats(dashboardData.stats);

        // Fetch students list
        const studentsResponse = await fetch(API_ENDPOINTS.STUDENTS, {
          headers: {
            'x-auth-token': token
          }
        });

        if (!studentsResponse.ok) throw new Error('Failed to fetch students');
        const studentsData = await studentsResponse.json();
        setStudents(studentsData);

        // Fetch doubts
        const doubtsResponse = await fetch(API_ENDPOINTS.DOUBTS.TEACHER, {
          headers: {
            'x-auth-token': token
          }
        });

        if (!doubtsResponse.ok) throw new Error('Failed to fetch doubts');
        const doubtsData = await doubtsResponse.json();
        setDoubts(doubtsData);

        // Generate notifications and activities from doubts
        const newNotifications = doubtsData
          .filter(doubt => doubt.status === 'pending')
          .map(doubt => ({
            id: doubt._id,
            message: `New doubt posted in ${doubt.subject}`,
            time: new Date(doubt.createdAt).toLocaleString()
          }));

        const newActivities = doubtsData
          .slice(0, 5) // Get last 5 doubts
          .map(doubt => ({
            id: doubt._id,
            type: doubt.status === 'accepted' ? 'doubt_resolved' : 'new_doubt',
            student: doubt.student.name,
            subject: doubt.subject,
            time: new Date(doubt.createdAt).toLocaleString()
          }));

        setNotifications(newNotifications);
        setRecentActivities(newActivities);

      } catch (error) {
        console.error('Error:', error);
        setError(error.message);
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Filter students based on search query
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStatusUpdate = async (doubtId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.DOUBTS.STATUS(doubtId), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update doubt status');

      setDoubts(doubts.map(doubt => 
        doubt._id === doubtId ? { ...doubt, status: newStatus } : doubt
      ));
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleReply = async (doubtId) => {
    const doubt = doubts.find(d => d._id === doubtId);
    setSelectedDoubt(doubt);
    setShowReplyModal(true);
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return;

    setIsReplying(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.DOUBTS.REPLY(selectedDoubt._id), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ 
          message: replyText
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to submit reply');
      }

      const updatedDoubt = await response.json();
      setDoubts(doubts.map(doubt => 
        doubt._id === selectedDoubt._id ? updatedDoubt : doubt
      ));

      setShowReplyModal(false);
      setReplyText('');
      setSelectedDoubt(null);
    } catch (err) {
      console.error('Error details:', err);
      alert('Failed to submit reply: ' + err.message);
    } finally {
      setIsReplying(false);
    }
  };

  const filteredDoubts = selectedStatus === 'all' 
    ? doubts 
    : doubts.filter(doubt => doubt.status === selectedStatus);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'accepted':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="text-red-600 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <HelpCircle className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Teacher Dashboard</span>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <Bell className="h-6 w-6" />
                  {notifications.length > 0 && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-20">
                    {notifications.length > 0 ? (
                      notifications.map(notification => (
                        <div key={notification.id} className="px-4 py-2 hover:bg-gray-50">
                          <p className="text-sm text-gray-900">{notification.message}</p>
                          <p className="text-xs text-gray-500">{notification.time}</p>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-2">
                        <p className="text-sm text-gray-500">No new notifications</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">{user?.name}</span>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-gray-500"
              >
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-10 w-10 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <MessageSquare className="h-10 w-10 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Doubts</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.activeDoubts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resolved Doubts</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.resolvedDoubts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <BarChart2 className="h-10 w-10 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Satisfaction Rate</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.satisfaction}%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Students List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Students</h2>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search students..."
                      className="w-64 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStudents.map((student) => (
                      <tr key={student._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-indigo-600">
                                {student.name.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{student.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(student.date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
              </div>
              <div className="p-6">
                <div className="flow-root">
                  <ul className="-mb-8">
                    {recentActivities.length > 0 ? (
                      recentActivities.map((activity, activityIdx) => (
                        <li key={activity.id}>
                          <div className="relative pb-8">
                            {activityIdx !== recentActivities.length - 1 ? (
                              <span
                                className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                aria-hidden="true"
                              />
                            ) : null}
                            <div className="relative flex space-x-3">
                              <div>
                                <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                                  activity.type === 'doubt_resolved' ? 'bg-green-500' : 'bg-blue-500'
                                }`}>
                                  {activity.type === 'doubt_resolved' ? (
                                    <CheckCircle className="h-5 w-5 text-white" />
                                  ) : (
                                    <MessageSquare className="h-5 w-5 text-white" />
                                  )}
                                </span>
                              </div>
                              <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                <div>
                                  <p className="text-sm text-gray-500">
                                    {activity.type === 'doubt_resolved' ? (
                                      <>Resolved doubt from <span className="font-medium text-gray-900">{activity.student}</span> in {activity.subject}</>
                                    ) : (
                                      <>New doubt from <span className="font-medium text-gray-900">{activity.student}</span> in {activity.subject}</>
                                    )}
                                  </p>
                                </div>
                                <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                  {activity.time}
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))
                    ) : (
                      <li>
                        <div className="text-center text-gray-500 py-4">
                          No recent activity
                        </div>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Doubts Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Doubt Requests</h2>
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-4">
              <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
                Filter by status:
              </label>
              <select
                id="status-filter"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {filteredDoubts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No doubt requests found</p>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {filteredDoubts.map((doubt) => (
                  <li key={doubt._id} className="p-6">
                    <div className="flex items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(doubt.status)}`}>
                            {getStatusIcon(doubt.status)}
                            <span className="ml-1 capitalize">{doubt.status}</span>
                          </span>
                          <h2 className="text-xl font-medium text-gray-900">
                            {doubt.subject}
                          </h2>
                        </div>
                        
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">Topic: {doubt.topic}</p>
                          <p className="mt-1 text-sm text-gray-700">{doubt.description}</p>
                        </div>

                        {/* Conversation Thread */}
                        {doubt.replies && doubt.replies.length > 0 && (
                          <div className="mt-4">
                            <button
                              onClick={() => {
                                const newExpanded = new Set(expandedDoubts);
                                if (newExpanded.has(doubt._id)) {
                                  newExpanded.delete(doubt._id);
                                } else {
                                  newExpanded.add(doubt._id);
                                }
                                setExpandedDoubts(newExpanded);
                              }}
                              className="flex items-center text-sm text-gray-500 hover:text-gray-700"
                            >
                              <ChevronDown
                                className={`h-4 w-4 mr-1 transition-transform duration-200 ${
                                  expandedDoubts.has(doubt._id) ? 'transform rotate-180' : ''
                                }`}
                              />
                              {expandedDoubts.has(doubt._id) ? 'Hide Conversation' : `Show Conversation (${doubt.replies.length} messages)`}
                            </button>
                            {expandedDoubts.has(doubt._id) && (
                              <div className="mt-2 space-y-4">
                                {doubt.replies.map((reply, index) => (
                                  <div 
                                    key={index}
                                    className={`flex items-start ${
                                      reply.sender.role === 'teacher' ? 'justify-end' : 'justify-start'
                                    }`}
                                  >
                                    <div className={`max-w-[80%] ${
                                      reply.sender.role === 'teacher' 
                                        ? 'bg-blue-50 text-blue-700' 
                                        : 'bg-green-50 text-green-700'
                                    } p-4 rounded-lg`}>
                                      <div className="flex items-center space-x-2 mb-1">
                                        <div className={`h-8 w-8 rounded-full ${
                                          reply.sender.role === 'teacher' ? 'bg-blue-100' : 'bg-green-100'
                                        } flex items-center justify-center`}>
                                          <span className={`font-medium ${
                                            reply.sender.role === 'teacher' ? 'text-blue-600' : 'text-green-600'
                                          }`}>
                                            {reply.sender.name.charAt(0)}
                                          </span>
                                        </div>
                                        <span className="text-sm font-medium">
                                          {reply.sender.name}
                                        </span>
                                      </div>
                                      <p className="text-sm">{reply.message}</p>
                                      <p className="text-xs mt-1 opacity-75">
                                        {new Date(reply.createdAt).toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="mt-2 text-sm text-gray-500">
                          From: {doubt.student.name} ({doubt.student.email})
                        </div>
                        <div className="text-xs text-gray-400">
                          Asked on: {new Date(doubt.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="ml-6 flex items-center space-x-3">
                        {doubt.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(doubt._id, 'accepted')}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Accept
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(doubt._id, 'rejected')}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </button>
                          </>
                        )}
                        {doubt.status !== 'rejected' && doubt.status !== 'pending' && (
                          <button
                            onClick={() => handleReply(doubt._id)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Reply
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>

      {/* Reply Modal */}
      {showReplyModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Reply to Doubt
                    </h3>
                    <div className="mt-2">
                      <div className="mb-4">
                        <p className="text-sm text-gray-500">
                          Subject: {selectedDoubt?.subject}
                        </p>
                        <p className="text-sm text-gray-500">
                          Topic: {selectedDoubt?.topic}
                        </p>
                        <p className="text-sm text-gray-700 mt-2">
                          {selectedDoubt?.description}
                        </p>
                      </div>

                      {/* Previous Replies */}
                      {selectedDoubt?.replies && selectedDoubt.replies.length > 0 && (
                        <div className="mb-4 space-y-4 max-h-60 overflow-y-auto border rounded-lg p-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Previous Replies:</h4>
                          {selectedDoubt.replies.map((reply, index) => (
                            <div 
                              key={index}
                              className={`flex items-start ${
                                reply.sender.role === 'teacher' ? 'justify-end' : 'justify-start'
                              }`}
                            >
                              <div className={`max-w-[80%] ${
                                reply.sender.role === 'teacher' 
                                  ? 'bg-blue-50 text-blue-700' 
                                  : 'bg-green-50 text-green-700'
                              } p-3 rounded-lg`}>
                                <div className="flex items-center space-x-2 mb-1">
                                  <div className={`h-6 w-6 rounded-full ${
                                    reply.sender.role === 'teacher' ? 'bg-blue-100' : 'bg-green-100'
                                  } flex items-center justify-center`}>
                                    <span className={`text-sm font-medium ${
                                      reply.sender.role === 'teacher' ? 'text-blue-600' : 'text-green-600'
                                    }`}>
                                      {reply.sender.name.charAt(0)}
                                    </span>
                                  </div>
                                  <span className="text-xs font-medium">
                                    {reply.sender.name}
                                  </span>
                                </div>
                                <p className="text-sm">{reply.message}</p>
                                <p className="text-xs mt-1 opacity-75">
                                  {new Date(reply.createdAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <textarea
                        rows="4"
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Type your reply here..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSubmitReply}
                  disabled={isReplying || !replyText.trim()}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {isReplying ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Send className="h-4 w-4 mr-2" />
                      Send Reply
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReplyModal(false);
                    setReplyText('');
                    setSelectedDoubt(null);
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 