import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../config/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { LogOut, User, Crown, Shield, Users, Trophy, MessageSquare, Settings, Mail, Calendar, Award, TrendingUp, Clock, Star, BarChart3, Activity, Target, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [userStats, setUserStats] = useState({
    totalDebates: 0,
    wins: 0,
    rank: 1,
    totalUsers: 0,
    usersWithSameScore: 0,
    usersWithHigherScore: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser?.uid) {
        try {
          // Fetch user data from Firestore
          const userDocRef = doc(db, "DebateGoUsers", currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData({
              displayName: data.displayName || currentUser.displayName || "Guest",
              email: data.email || currentUser.email || "",
              role: data.role || "user",
              score: data.score || 0,
              uid: currentUser.uid,
              createdAt: data.createdAt || currentUser.metadata?.creationTime || ""
            });
          }

          // Fetch all users to calculate rank
          const usersSnapshot = await getDocs(collection(db, "DebateGoUsers"));
          const allUsers = usersSnapshot.docs
            .map(doc => ({ 
              id: doc.id, 
              ...doc.data(),
              score: doc.data().score || 0 // Ensure score is always a number
            }))
            .sort((a, b) => {
              // Primary sort by score (descending)
              if (b.score !== a.score) {
                return b.score - a.score;
              }
              // Secondary sort by creation time (ascending) for users with same score
              return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
            });
          
          const currentUserIndex = allUsers.findIndex(user => user.id === currentUser.uid);
          const currentUserRank = currentUserIndex !== -1 ? currentUserIndex + 1 : allUsers.length + 1;
          
          // Calculate additional stats
          const usersWithSameScore = allUsers.filter(user => user.score === (userData?.score || 0));
          const usersWithHigherScore = allUsers.filter(user => user.score > (userData?.score || 0));
          
          setUserStats({
            totalDebates: 0, // This would need to be tracked separately
            wins: 0, // This would need to be tracked separately
            rank: currentUserRank,
            totalUsers: allUsers.length,
            usersWithSameScore: usersWithSameScore.length,
            usersWithHigherScore: usersWithHigherScore.length
          });
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  const getRoleIcon = (userRole) => {
    switch (userRole?.toLowerCase()) {
      case 'admin':
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 'moderator':
        return <Shield className="w-6 h-6 text-blue-500" />;
      default:
        return <User className="w-6 h-6 text-gray-500" />;
    }
  };

  const getRoleBadgeColor = (userRole) => {
    switch (userRole?.toLowerCase()) {
      case 'admin':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'moderator':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const getRankDisplay = () => {
    if (userStats.rank === 1) {
      return "1st";
    } else if (userStats.rank === 2) {
      return "2nd";
    } else if (userStats.rank === 3) {
      return "3rd";
    } else {
      return `${userStats.rank}th`;
    }
  };

  const getRankDescription = () => {
    if (userData?.score === 0) {
      return "Ready to start your first debate!";
    } else if (userStats.rank === 1) {
      return "You're in 1st place!";
    } else if (userStats.rank <= 3) {
      return `You're in the top 3!`;
    } else if (userStats.rank <= 10) {
      return `You're in the top 10!`;
    } else if (userStats.usersWithSameScore > 1) {
      return `You're tied with ${userStats.usersWithSameScore - 1} other user${userStats.usersWithSameScore > 2 ? 's' : ''}`;
    } else {
      return `You're ranked ${getRankDisplay()} out of ${userStats.totalUsers}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Professional Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-slate-700 to-slate-900 rounded-lg flex items-center justify-center shadow-md">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900 tracking-tight">DebateGo</h1>
                <p className="text-sm text-slate-500 font-medium">Professional Debate Platform</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-slate-900">{userData?.displayName || "User"}</p>
                <p className="text-xs text-slate-500">{userData?.role || "Member"}</p>
              </div>
              
              {currentUser && (
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all duration-200 border border-slate-200 hover:border-slate-300"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Sign Out</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Professional Welcome Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-8">
          <div className="flex flex-col lg:flex-row items-start justify-between">
            <div className="flex-1 mb-6 lg:mb-0">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-slate-700 to-slate-900 rounded-xl flex items-center justify-center mr-6 shadow-lg">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-1">
                    Welcome back, {userData?.displayName || "Guest"}
                  </h2>
                  <p className="text-slate-600 text-base font-medium">
                    Professional Debate Platform Dashboard
                  </p>
                </div>
              </div>
              
              {userData?.role && (
                <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg border ${getRoleBadgeColor(userData.role)}`}>
                  {getRoleIcon(userData.role)}
                  <span className="font-semibold text-sm">{userData.role.toUpperCase()}</span>
                </div>
              )}
            </div>
            
            {/* Professional Stats Grid */}
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center bg-slate-50 rounded-xl p-6 border border-slate-200">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Award className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-slate-900 mb-1">{userData?.score || 0}</p>
                <p className="text-sm text-slate-600 font-medium">Total Points</p>
              </div>
              <div className="text-center bg-slate-50 rounded-xl p-6 border border-slate-200">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Trophy className="w-6 h-6 text-green-600" />
                </div>
                {userData?.score === 0 ? (
                  <>
                    <p className="text-2xl font-bold text-slate-900 mb-1">Start</p>
                    <p className="text-sm text-slate-600 font-medium">Your First Debate</p>
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-slate-900 mb-1">{getRankDisplay()}</p>
                    <p className="text-sm text-slate-600 font-medium">Global Rank</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action for New Users */}
        {userData?.score === 0 && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-8 mb-8 text-white">
            <div className="flex flex-col lg:flex-row items-center justify-between">
              <div className="text-center lg:text-left mb-6 lg:mb-0">
                <div className="flex items-center justify-center lg:justify-start mb-4">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mr-4">
                    <MessageSquare className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Ready to Start Your First Debate?</h3>
                    <p className="text-blue-100 text-lg">
                      Join a debate room and begin earning points to climb the leaderboard!
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <button
                    onClick={() => handleNavigation('/rooms')}
                    className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-200 shadow-lg hover:shadow-xl"
                  >
                    Join Debate Room
                  </button>
                  <button
                    onClick={() => handleNavigation('/how-to')}
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-400 transition-colors duration-200 border border-blue-400"
                  >
                    Learn How to Debate
                  </button>
                </div>
              </div>
              
              <div className="text-center">
                <div className="bg-white bg-opacity-20 rounded-xl p-6 backdrop-blur-sm">
                  <div className="text-3xl font-bold mb-2">0</div>
                  <div className="text-blue-100 text-sm">Current Points</div>
                  <div className="text-blue-200 text-xs mt-2">Start debating to earn points!</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Professional User Details */}
        {userData && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
              <BarChart3 className="w-5 h-5 text-slate-600 mr-2" />
              Account Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-medium">Email Address</p>
                  <p className="font-semibold text-slate-900 text-sm truncate">{userData.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-medium">Member Since</p>
                  <p className="font-semibold text-slate-900 text-sm">
                    {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : "Unknown"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-medium">Performance Level</p>
                  <p className="font-semibold text-slate-900 text-sm">
                    {userStats.rank <= 3 ? "Elite" : userStats.rank <= 10 ? "Advanced" : "Developing"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Professional Action Center */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
            <Activity className="w-5 h-5 text-slate-600 mr-2" />
            Action Center
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Join Debate Room */}
            <div 
              onClick={() => handleNavigation('/rooms')}
              className={`rounded-xl shadow-sm border p-6 hover:shadow-md transition-all duration-200 cursor-pointer group ${
                userData?.score === 0 
                  ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200 hover:border-emerald-300 ring-2 ring-emerald-100' 
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-all duration-200 ${
                  userData?.score === 0 
                    ? 'bg-emerald-500 group-hover:bg-emerald-600' 
                    : 'bg-emerald-100 group-hover:bg-emerald-200'
                }`}>
                  <MessageSquare className={`w-6 h-6 ${
                    userData?.score === 0 ? 'text-white' : 'text-emerald-600'
                  }`} />
                </div>
                <div>
                  <h3 className={`text-base font-semibold ${
                    userData?.score === 0 ? 'text-emerald-900' : 'text-slate-900'
                  }`}>
                    {userData?.score === 0 ? 'Start Your First Debate!' : 'Join Debate'}
                  </h3>
                  <p className={`text-sm ${
                    userData?.score === 0 ? 'text-emerald-700' : 'text-slate-600'
                  }`}>
                    {userData?.score === 0 ? 'Begin earning points now' : 'Enter a debate room'}
                  </p>
                </div>
              </div>
              {userData?.score === 0 && (
                <div className="mt-3 flex items-center text-emerald-600 text-xs font-medium">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></div>
                  Recommended for new users
                </div>
              )}
            </div>

            {/* View Leaderboard */}
            <div 
              onClick={() => handleNavigation('/leaderboard')}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-200 transition-colors duration-200">
                  <Trophy className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Leaderboard</h3>
                  <p className="text-slate-600 text-sm">View rankings</p>
                </div>
              </div>
            </div>

            {/* Browse Topics */}
            <div 
              onClick={() => handleNavigation('/topics')}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center group-hover:bg-violet-200 transition-colors duration-200">
                  <Users className="w-6 h-6 text-violet-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Browse Topics</h3>
                  <p className="text-slate-600 text-sm">Explore topics</p>
                </div>
              </div>
            </div>

            {/* Chat */}
            <div 
              onClick={() => handleNavigation('/chat')}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-200">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Chat</h3>
                  <p className="text-slate-600 text-sm">Connect with others</p>
                </div>
              </div>
            </div>

            {/* How To */}
            <div 
              onClick={() => handleNavigation('/how-to')}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-slate-200 transition-colors duration-200">
                  <Settings className="w-6 h-6 text-slate-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">How To</h3>
                  <p className="text-slate-600 text-sm">Learn the rules</p>
                </div>
              </div>
            </div>

            {/* Admin Dashboard (only for admins) */}
            {userData?.role === 'admin' && (
              <div 
                onClick={() => handleNavigation('/admin-dashboard')}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors duration-200">
                    <Crown className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">Admin Panel</h3>
                    <p className="text-slate-600 text-sm">Manage users</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Professional Analytics & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Activity Timeline */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
              <Clock className="w-5 h-5 text-slate-600 mr-2" />
              Activity Timeline
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">Account Created</p>
                  <p className="text-slate-600 text-xs">Welcome to DebateGo platform</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">Current Score: {userData?.score || 0} points</p>
                  <p className="text-slate-600 text-xs">
                    {userData?.score === 0 
                      ? "Start your first debate to earn points!" 
                      : "Continue participating to earn more"
                    }
                  </p>
                </div>
              </div>
              
              {userData?.score > 0 && (
                <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{getRankDescription()}</p>
                    <p className="text-slate-600 text-xs">Current global ranking position</p>
                  </div>
                </div>
              )}

              {userData?.score === 0 && (
                <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                  <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-900 text-sm">Ready to Start?</p>
                    <p className="text-emerald-700 text-xs">Click "Join Debate" to begin your journey!</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Performance Analytics */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
              <BarChart3 className="w-5 h-5 text-slate-600 mr-2" />
              Performance Analytics
            </h3>
            <div className="space-y-6">
              <div className="text-center p-6 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-16 h-16 bg-gradient-to-r from-slate-700 to-slate-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-base font-semibold text-slate-900 mb-2">Performance Level</h4>
                <p className="text-slate-600 text-sm mb-4">
                  {userData?.score === 0 
                    ? "New member - Start your first debate to earn points!"
                    : userStats.rank <= 3 
                    ? "Elite performer - Top 3 ranking" 
                    : userStats.rank <= 10 
                    ? "Advanced level - Top 10 ranking" 
                    : "Developing skills - Continue to improve"
                  }
                </p>
                {userData?.score === 0 ? (
                  <div className="text-xl font-bold text-slate-900">
                    Start Debating!
                  </div>
                ) : (
                  <div className="text-xl font-bold text-slate-900">
                    {getRankDisplay()} of {userStats.totalUsers}
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <Award className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                  <p className="text-xl font-bold text-slate-900">{userData?.score || 0}</p>
                  <p className="text-xs text-slate-600 font-medium">Total Points</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <MessageSquare className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-xl font-bold text-slate-900">{userStats.totalDebates}</p>
                  <p className="text-xs text-slate-600 font-medium">Debates Joined</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
