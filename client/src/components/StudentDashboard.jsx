import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Clock, CheckCircle, XCircle, Users, Send, ChevronDown } from 'lucide-react';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [doubts, setDoubts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedDoubts, setExpandedDoubts] = useState(new Set());

  useEffect(() => {
    fetchDoubts();
  }, [navigate]);

  const fetchDoubts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/doubts/student', {
        headers: {
          'x-auth-token': token
        }
      });

      if (!response.ok) throw new Error('Failed to fetch doubts');
      const data = await response.json();
      setDoubts(data);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReplySubmit = async (doubtId) => {
    if (!replyText.trim()) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/doubts/${doubtId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ message: replyText })
      });

      if (!response.ok) throw new Error('Failed to submit reply');

      const updatedDoubt = await response.json();
      setDoubts(doubts.map(d => d._id === doubtId ? updatedDoubt : d));
      setReplyText('');
      setReplyingTo(null);
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to submit reply: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'accepted':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'resolved':
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
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
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
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="bg-white shadow-sm mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">My Doubts</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/teachers')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Users className="h-5 w-5 mr-2" />
                Find Teachers
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto">
        {doubts.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No doubts yet</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by asking a doubt to a teacher.</p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/teachers')}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Users className="h-5 w-5 mr-2" />
                Find Teachers
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {doubts.map((doubt) => (
                <li key={doubt._id} className="p-6">
                  <div className="flex items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(doubt.status)}`}>
                          {getStatusIcon(doubt.status)}
                          <span className="ml-1 capitalize">{doubt.status}</span>
                        </span>
                        <h3 className="text-lg font-medium text-gray-900">{doubt.subject}</h3>
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
                                    reply.sender.role === 'teacher' ? 'justify-start' : 'justify-end'
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

                      {/* Reply Form */}
                      {doubt.status !== 'rejected' && (
                        <div className="mt-4">
                          {replyingTo === doubt._id ? (
                            <div className="space-y-3">
                              <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Type your reply..."
                                rows="3"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              />
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => {
                                    setReplyingTo(null);
                                    setReplyText('');
                                  }}
                                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleReplySubmit(doubt._id)}
                                  disabled={isSubmitting || !replyText.trim()}
                                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                >
                                  {isSubmitting ? (
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
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setReplyingTo(doubt._id)}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Reply
                            </button>
                          )}
                        </div>
                      )}

                      <div className="mt-2 text-xs text-gray-500">
                        Asked to: {doubt.teacher.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        Asked on: {new Date(doubt.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}