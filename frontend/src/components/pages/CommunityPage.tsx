import { ArrowLeft, Users, MessageCircle, Trophy, Calendar, TrendingUp, Star, Search, Send, Bot, AlertCircle, Eye, ThumbsUp, ThumbsDown, MoreHorizontal, Link2, Image as ImageIcon, Smile, AtSign, ArrowUpDown } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { toast } from "sonner@2.0.3";
import { UserProfileModal, EventModal, CommentReactions } from "../community/CommunityExtras";

interface CommentReaction {
  like: number;
  funny: number;
  insightful: number;
  loved: number;
}

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  avatar: string;
  reactions: CommentReaction;
  replies: Comment[];
}

interface Discussion {
  id: string;
  title: string;
  author: string;
  avatar: string;
  replies: number;
  likes: number;
  category: string;
  solved: boolean;
  content: string;
  timestamp: string;
  comments: Comment[];
  views: number;
}

interface UserProfile {
  name: string;
  avatar: string;
  points: number;
  badge: string;
  discussionsStarted: number;
  commentsPosted: number;
  solutionsProvided: number;
  joinDate: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  description: string;
  registeredUsers: number;
  maxUsers: number;
  registered: boolean;
}

interface AIInsight {
  issueType: string;
  frequency: number;
  keywords: string[];
  discussions: string[];
}

interface CommunityPageProps {
  onBack: () => void;
  onViewDiscussion?: (discussion: Discussion) => void;
  isLoggedIn?: boolean;
  onLoginRequired?: () => void;
}

export function CommunityPage({ onBack, onViewDiscussion, isLoggedIn = false, onLoginRequired }: CommunityPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isNewDiscussionOpen, setIsNewDiscussionOpen] = useState(false);
  const [newDiscussionTitle, setNewDiscussionTitle] = useState("");
  const [newDiscussionCategory, setNewDiscussionCategory] = useState("");
  const [newDiscussionContent, setNewDiscussionContent] = useState("");
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [newComment, setNewComment] = useState("");
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [contributors, setContributors] = useState<UserProfile[]>([]);
  const [replyToComment, setReplyToComment] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  // Initialize events
  useEffect(() => {
    const savedEvents = localStorage.getItem("communityEvents");
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    } else {
      const defaultEvents: Event[] = [
        { id: "1", title: "Office Hours Q&A", date: "Dec 8, 2024", description: "Join our live Q&A session with VoiceAI experts. Ask anything about building voice agents, integrations, best practices, and more. Get real-time answers and network with other developers.", registeredUsers: 45, maxUsers: 100, registered: false },
        { id: "2", title: "Build-a-thon Challenge", date: "Dec 15, 2024", description: "Participate in our 24-hour coding competition! Build the most innovative voice agent and win prizes. Categories include Best Customer Service Agent, Most Creative Use Case, and Best Integration.", registeredUsers: 28, maxUsers: 50, registered: false },
        { id: "3", title: "Product Webinar: New Features", date: "Dec 20, 2024", description: "Learn about the latest VoiceAI platform features including enhanced multilingual support, advanced sentiment analysis, and new integration options. Live demos and Q&A included.", registeredUsers: 67, maxUsers: 150, registered: false },
      ];
      setEvents(defaultEvents);
      localStorage.setItem("communityEvents", JSON.stringify(defaultEvents));
    }
  }, []);

  // Initialize contributors
  useEffect(() => {
    const savedContributors = localStorage.getItem("communityContributors");
    if (savedContributors) {
      setContributors(JSON.parse(savedContributors));
    } else {
      const defaultContributors: UserProfile[] = [
        { name: "Alex Johnson", avatar: "AJ", points: 2450, badge: "Expert", discussionsStarted: 45, commentsPosted: 234, solutionsProvided: 67, joinDate: "2023-05-12" },
        { name: "Maria Garcia", avatar: "MG", points: 1890, badge: "Pro", discussionsStarted: 38, commentsPosted: 189, solutionsProvided: 42, joinDate: "2023-07-20" },
        { name: "David Lee", avatar: "DL", points: 1654, badge: "Pro", discussionsStarted: 29, commentsPosted: 167, solutionsProvided: 38, joinDate: "2023-08-15" },
      ];
      setContributors(defaultContributors);
      localStorage.setItem("communityContributors", JSON.stringify(defaultContributors));
    }
  }, []);

  // Update contributors when discussions change (recalculate points)
  useEffect(() => {
    if (contributors.length > 0) {
      // Sort by points descending
      const sorted = [...contributors].sort((a, b) => b.points - a.points);
      if (JSON.stringify(sorted) !== JSON.stringify(contributors)) {
        setContributors(sorted);
        localStorage.setItem("communityContributors", JSON.stringify(sorted));
      }
    }
  }, [discussions]);

  // Load discussions from localStorage on mount
  useEffect(() => {
    const savedDiscussions = localStorage.getItem("communityDiscussions");
    if (savedDiscussions) {
      setDiscussions(JSON.parse(savedDiscussions));
    } else {
      // Initialize with default discussions
      const defaultDiscussions: Discussion[] = [
        {
          id: "1",
          title: "Best practices for reducing call latency?",
          author: "Sarah M.",
          avatar: "SM",
          replies: 24,
          likes: 45,
          category: "Technical",
          solved: true,
          content: "I'm experiencing high latency in my voice agents. What are the best practices to reduce this?",
          timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
          comments: [
            {
              id: "c1",
              author: "John D.",
              avatar: "JD",
              content: "Try using edge servers closer to your users. This helped reduce our latency by 40%.",
              timestamp: new Date(Date.now() - 86400000).toISOString(),
              reactions: { like: 15, funny: 2, insightful: 5, loved: 3 },
              replies: [],
            },
          ],
          views: 120,
        },
        {
          id: "2",
          title: "Share your most successful voice agent use cases",
          author: "Mike R.",
          avatar: "MR",
          replies: 67,
          likes: 132,
          category: "General",
          solved: false,
          content: "I'd love to hear about your successful implementations and what worked well.",
          timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
          comments: [],
          views: 85,
        },
        {
          id: "3",
          title: "How to handle multiple languages in one agent?",
          author: "Emma W.",
          avatar: "EW",
          replies: 18,
          likes: 34,
          category: "Tutorial",
          solved: true,
          content: "Looking for guidance on implementing multilingual support in a single agent.",
          timestamp: new Date(Date.now() - 86400000 * 4).toISOString(),
          comments: [],
          views: 60,
        },
        {
          id: "4",
          title: "Feature request: Custom wake words",
          author: "John D.",
          avatar: "JD",
          replies: 42,
          likes: 89,
          category: "Feature Request",
          solved: false,
          content: "Would be great to have custom wake words instead of the default ones.",
          timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
          comments: [],
          views: 45,
        },
      ];
      setDiscussions(defaultDiscussions);
      localStorage.setItem("communityDiscussions", JSON.stringify(defaultDiscussions));
    }
  }, []);

  // Save discussions to localStorage whenever they change
  useEffect(() => {
    if (discussions.length > 0) {
      localStorage.setItem("communityDiscussions", JSON.stringify(discussions));
      // Run AI analysis
      analyzeDiscussionsWithAI();
    }
  }, [discussions]);

  // AI Analysis Function
  const analyzeDiscussionsWithAI = () => {
    const technicalDiscussions = discussions.filter(d => d.category === "Technical");
    
    if (technicalDiscussions.length === 0) return;

    // Extract keywords and analyze patterns
    const insights: AIInsight[] = [];
    const keywordMap: { [key: string]: { count: number; discussions: string[] } } = {};

    technicalDiscussions.forEach(discussion => {
      const text = `${discussion.title} ${discussion.content} ${discussion.comments.map(c => c.content).join(" ")}`.toLowerCase();
      
      // Common technical issues
      const issues = [
        { keyword: "latency", type: "High Latency Issues" },
        { keyword: "connection", type: "Connection Problems" },
        { keyword: "error", type: "Error Reports" },
        { keyword: "crash", type: "Stability Issues" },
        { keyword: "integration", type: "Integration Challenges" },
        { keyword: "api", type: "API Issues" },
        { keyword: "performance", type: "Performance Concerns" },
        { keyword: "timeout", type: "Timeout Issues" },
      ];

      issues.forEach(issue => {
        if (text.includes(issue.keyword)) {
          if (!keywordMap[issue.type]) {
            keywordMap[issue.type] = { count: 0, discussions: [] };
          }
          keywordMap[issue.type].count++;
          keywordMap[issue.type].discussions.push(discussion.title);
        }
      });
    });

    // Convert to insights array and sort by frequency
    const aiInsights = Object.entries(keywordMap)
      .map(([type, data]) => ({
        issueType: type,
        frequency: data.count,
        keywords: [type.toLowerCase()],
        discussions: data.discussions.slice(0, 3), // Top 3 discussions
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5); // Top 5 issues

    // Save AI insights
    localStorage.setItem("aiCommunityInsights", JSON.stringify(aiInsights));

    // Notify admin if there are critical issues
    if (aiInsights.length > 0 && aiInsights[0].frequency >= 2) {
      const topIssue = aiInsights[0];
      console.log(`[AI ADMIN ALERT] Most discussed technical issue: ${topIssue.issueType} (${topIssue.frequency} discussions)`);
      
      // Store admin notification
      const adminNotifications = JSON.parse(localStorage.getItem("adminNotifications") || "[]");
      const newNotification = {
        id: Date.now().toString(),
        type: "technical_issue",
        title: `High Activity: ${topIssue.issueType}`,
        message: `${topIssue.frequency} discussions mention this issue. Consider addressing: ${topIssue.discussions[0]}`,
        timestamp: new Date().toISOString(),
        read: false,
      };
      adminNotifications.unshift(newNotification);
      localStorage.setItem("adminNotifications", JSON.stringify(adminNotifications.slice(0, 50)));
    }
  };

  const categories = ["All", "Technical", "General", "Tutorial", "Feature Request"];

  // Filter discussions based on search and category
  const filteredDiscussions = discussions.filter((discussion) => {
    const matchesSearch = 
      discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      discussion.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      discussion.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      !selectedCategory || 
      selectedCategory === "All" || 
      discussion.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const topContributors = [
    { name: "Alex Johnson", avatar: "AJ", points: 2450, badge: "Expert" },
    { name: "Maria Garcia", avatar: "MG", points: 1890, badge: "Pro" },
    { name: "David Lee", avatar: "DL", points: 1654, badge: "Pro" },
  ];

  const upcomingEvents: Event[] = [
    { id: "1", title: "Office Hours Q&A", date: "Dec 8, 2024", description: "Join our live Q&A session with experts.", registeredUsers: 50, maxUsers: 100, registered: false },
    { id: "2", title: "Build-a-thon", date: "Dec 15, 2024", description: "Participate in a coding competition.", registeredUsers: 30, maxUsers: 50, registered: false },
    { id: "3", title: "Product Webinar", date: "Dec 20, 2024", description: "Learn about the latest product features.", registeredUsers: 70, maxUsers: 150, registered: false },
  ];

  // Handle creating a new discussion
  const handleCreateDiscussion = () => {
    if (!isLoggedIn && onLoginRequired) {
      onLoginRequired();
      return;
    }

    if (newDiscussionTitle && newDiscussionCategory && newDiscussionContent) {
      const newDiscussion: Discussion = {
        id: Date.now().toString(),
        title: newDiscussionTitle,
        author: "You",
        avatar: "YO",
        replies: 0,
        likes: 0,
        category: newDiscussionCategory,
        solved: false,
        content: newDiscussionContent,
        timestamp: new Date().toISOString(),
        comments: [],
        views: 0,
      };

      setDiscussions([newDiscussion, ...discussions]);
      toast.success("Discussion created successfully! Your post is now live.");
      setIsNewDiscussionOpen(false);
      setNewDiscussionTitle("");
      setNewDiscussionCategory("");
      setNewDiscussionContent("");
    }
  };

  // Handle adding a comment to a discussion
  const handleAddComment = () => {
    if (!isLoggedIn && onLoginRequired) {
      onLoginRequired();
      return;
    }

    if (newComment && selectedDiscussion) {
      const comment: Comment = {
        id: Date.now().toString(),
        author: "You",
        avatar: "YO",
        content: newComment,
        timestamp: new Date().toISOString(),
        reactions: { like: 0, funny: 0, insightful: 0, loved: 0 },
        replies: [],
      };

      const updatedDiscussions = discussions.map(d => {
        if (d.id === selectedDiscussion.id) {
          return {
            ...d,
            comments: [...d.comments, comment],
            replies: d.replies + 1,
          };
        }
        return d;
      });

      setDiscussions(updatedDiscussions);
      
      // Update selected discussion
      const updated = updatedDiscussions.find(d => d.id === selectedDiscussion.id);
      if (updated) {
        setSelectedDiscussion(updated);
      }

      setNewComment("");
      toast.success("Comment added successfully!");
    }
  };

  // Get AI insights
  const getAIInsights = () => {
    const saved = localStorage.getItem("aiCommunityInsights");
    return saved ? JSON.parse(saved) : [];
  };

  // Handle user profile click
  const handleUserClick = (username: string) => {
    // Find user in contributors or create profile
    let userProfile = contributors.find(c => c.name === username);
    
    if (!userProfile) {
      // Create a profile for discussion authors not in contributors list
      const userDiscussions = discussions.filter(d => d.author === username);
      const userComments = discussions.reduce((total, d) => {
        return total + d.comments.filter(c => c.author === username).length;
      }, 0);
      
      userProfile = {
        name: username,
        avatar: username.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
        points: (userDiscussions.length * 10) + (userComments * 5),
        badge: username === "You" ? "Member" : "Contributor",
        discussionsStarted: userDiscussions.length,
        commentsPosted: userComments,
        solutionsProvided: 0,
        joinDate: "2024-01-01",
      };
    }
    
    setSelectedUser(userProfile);
  };

  // Handle comment reaction
  const handleCommentReaction = (commentId: string, reactionType: keyof CommentReaction) => {
    if (!isLoggedIn && onLoginRequired) {
      onLoginRequired();
      return;
    }

    if (!selectedDiscussion) return;

    const updatedDiscussions = discussions.map(d => {
      if (d.id === selectedDiscussion.id) {
        const updatedComments = d.comments.map(c => {
          if (c.id === commentId) {
            return {
              ...c,
              reactions: {
                ...c.reactions,
                [reactionType]: c.reactions[reactionType] + 1,
              },
            };
          }
          return c;
        });
        return { ...d, comments: updatedComments };
      }
      return d;
    });

    setDiscussions(updatedDiscussions);
    const updated = updatedDiscussions.find(d => d.id === selectedDiscussion.id);
    if (updated) {
      setSelectedDiscussion(updated);
    }

    // Award points to comment author
    const comment = selectedDiscussion.comments.find(c => c.id === commentId);
    if (comment) {
      const pointsAwarded = reactionType === 'insightful' ? 5 : 2;
      const updatedContributors = contributors.map(c => {
        if (c.name === comment.author) {
          return { ...c, points: c.points + pointsAwarded };
        }
        return c;
      });
      setContributors(updatedContributors);
      localStorage.setItem("communityContributors", JSON.stringify(updatedContributors));
    }

    toast.success(`Reacted with ${reactionType}!`);
  };

  // Handle reply to comment
  const handleReplyToComment = (commentId: string) => {
    setReplyToComment(commentId);
  };

  // Handle event registration
  const handleEventRegister = (eventId: string) => {
    const updatedEvents = events.map(e => {
      if (e.id === eventId && e.registeredUsers < e.maxUsers) {
        return {
          ...e,
          registered: true,
          registeredUsers: e.registeredUsers + 1,
        };
      }
      return e;
    });

    setEvents(updatedEvents);
    localStorage.setItem("communityEvents", JSON.stringify(updatedEvents));

    // Award points for event registration
    const updatedContributors = contributors.map(c => {
      if (c.name === "You" || c.avatar === "YO") {
        return { ...c, points: c.points + 15 };
      }
      return c;
    });
    setContributors(updatedContributors);
    localStorage.setItem("communityContributors", JSON.stringify(updatedContributors));

    toast.success("Successfully registered for event! (+15 points)");
    setSelectedEvent(updatedEvents.find(e => e.id === eventId) || null);
  };

  // Handle opening a discussion (increment views)
  const handleOpenDiscussion = (discussion: Discussion) => {
    const updatedDiscussions = discussions.map(d => {
      if (d.id === discussion.id) {
        return { ...d, views: d.views + 1 };
      }
      return d;
    });
    setDiscussions(updatedDiscussions);
    const updated = updatedDiscussions.find(d => d.id === discussion.id);
    if (updated && onViewDiscussion) {
      onViewDiscussion(updated);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
          >
            <ArrowLeft className="size-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>

      {/* Hero Section with Gradient Background */}
      <section className="relative overflow-hidden">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute inset-0 bg-black/50"></div>
        
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 mb-6">
              <Users className="size-4 text-cyan-400" />
              <span className="text-cyan-400 text-sm">Join 12.5K+ Active Members</span>
            </div>
            <h1 className="text-white mb-6 bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent">
              VoiceAI Community
            </h1>
            <p className="text-slate-300 text-xl leading-relaxed">
              Connect with thousands of developers, share knowledge, and get expert help
            </p>
          </div>

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {[
              { icon: Users, label: "Members", value: "12.5K", gradient: "from-cyan-500 to-blue-500", squareColor: "bg-cyan-500" },
              { icon: MessageCircle, label: "Discussions", value: `${discussions.length}`, gradient: "from-purple-500 to-pink-500", squareColor: "bg-purple-500" },
              { icon: Trophy, label: "Solutions", value: "1.8K", gradient: "from-orange-500 to-red-500", squareColor: "bg-orange-600" },
              { icon: Calendar, label: "Events/Month", value: "4", gradient: "from-emerald-500 to-teal-500", squareColor: "bg-teal-500" },
            ].map((stat) => (
              <Card key={stat.label} className="bg-slate-900/80 backdrop-blur-sm border-slate-800 hover:border-slate-700 transition-all duration-300 hover:scale-105 group cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex mb-4 group-hover:scale-110 transition-transform duration-300">
                    <div className={`${stat.squareColor} w-16 h-16 rounded-2xl`}></div>
                  </div>
                  <div className={`text-3xl bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-1`}>
                    {stat.value}
                  </div>
                  <div className="text-slate-400 text-sm">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-4 py-12 pb-20">
        {/* Discussions */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white">Recent Discussions</h2>
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-500" onClick={() => setIsNewDiscussionOpen(true)}>
              New Discussion
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-500" />
              <Input
                type="text"
                placeholder="Search discussions, authors, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-slate-900 border-slate-800 text-white placeholder-slate-500 focus:border-cyan-500"
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={!selectedCategory && category === "All" || selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category === "All" ? null : category)}
                  className={
                    !selectedCategory && category === "All" || selectedCategory === category
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0"
                      : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-cyan-500/50"
                  }
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Discussions List */}
          <div className="space-y-4">
            {filteredDiscussions.length > 0 ? (
              filteredDiscussions.map((discussion, index) => (
                <Card
                  key={index}
                  onClick={() => handleOpenDiscussion(discussion)}
                  className="bg-slate-900 border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer group relative overflow-hidden"
                >
                  {/* Gradient Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className={`size-12 rounded-full bg-gradient-to-br ${
                        discussion.category === "Technical" ? "from-cyan-500 to-blue-500" :
                        discussion.category === "Tutorial" ? "from-purple-500 to-pink-500" :
                        discussion.category === "Feature Request" ? "from-orange-500 to-red-500" :
                        "from-emerald-500 to-teal-500"
                      } flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                        {discussion.avatar}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge
                            className={
                              discussion.category === "Technical"
                                ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50"
                                : discussion.category === "Tutorial"
                                ? "bg-purple-500/20 text-purple-400 border-purple-500/50"
                                : discussion.category === "Feature Request"
                                ? "bg-orange-500/20 text-orange-400 border-orange-500/50"
                                : "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
                            }
                          >
                            {discussion.category}
                          </Badge>
                          {discussion.solved && (
                            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50">
                              ✓ Solved
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-white mb-2 group-hover:text-cyan-400 transition-colors text-lg">
                          {discussion.title}
                        </h3>
                        <p className="text-slate-400 text-sm mb-3 line-clamp-1">
                          {discussion.content}
                        </p>
                        <div className="flex items-center gap-4 text-slate-400 text-sm">
                          <span 
                            className="flex items-center gap-1 cursor-pointer hover:text-cyan-400 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUserClick(discussion.author);
                            }}
                          >
                            <div className={`size-6 rounded-full bg-gradient-to-br ${
                              discussion.category === "Technical" ? "from-cyan-500/20 to-blue-500/20" :
                              discussion.category === "Tutorial" ? "from-purple-500/20 to-pink-500/20" :
                              discussion.category === "Feature Request" ? "from-orange-500/20 to-red-500/20" :
                              "from-emerald-500/20 to-teal-500/20"
                            } flex items-center justify-center text-xs text-white shrink-0`}>
                              {discussion.author.charAt(0)}
                            </div>
                            {discussion.author}
                          </span>
                          <span 
                            className="flex items-center gap-1 cursor-pointer hover:text-cyan-400 transition-colors"
                            onClick={() => handleOpenDiscussion(discussion)}
                          >
                            <MessageCircle className="size-4" />
                            {discussion.comments.length}
                          </span>
                          <span 
                            className="flex items-center gap-1 text-blue-400 cursor-pointer hover:text-blue-300 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                            title="Engagement score"
                          >
                            <TrendingUp className="size-4" />
                            {discussion.likes}
                          </span>
                          <span 
                            className="text-xs text-slate-500 ml-auto"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {new Date(discussion.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-12 text-center">
                  <div className="inline-flex p-4 rounded-full bg-slate-800 mb-4">
                    <MessageCircle className="size-12 text-slate-600" />
                  </div>
                  <h3 className="text-white mb-2">No discussions found</h3>
                  <p className="text-slate-400">
                    Try adjusting your search or filter criteria
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Insights */}
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white flex items-center gap-2">
                  <Bot className="size-5 text-purple-400" />
                  AI Insights
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAIInsights(true)}
                  className="text-cyan-400 hover:text-cyan-300 hover:bg-slate-800"
                >
                  View All
                </Button>
              </div>
              <div className="space-y-3">
                {getAIInsights().slice(0, 3).map((insight: AIInsight, index: number) => (
                  <div key={index} className="p-3 rounded-lg bg-slate-800 border border-slate-700">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="size-4 text-orange-400" />
                      <div className="text-white text-sm">{insight.issueType}</div>
                    </div>
                    <div className="text-slate-400 text-xs">
                      {insight.frequency} {insight.frequency === 1 ? "discussion" : "discussions"}
                    </div>
                  </div>
                ))}
                {getAIInsights().length === 0 && (
                  <div className="text-center text-slate-500 text-sm py-4">
                    No technical issues detected yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Contributors */}
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-6">
              <h3 className="text-white mb-4 flex items-center gap-2">
                <Trophy className="size-5 text-yellow-400" />
                Top Contributors
              </h3>
              <div className="space-y-4">
                {contributors.slice(0, 3).map((contributor, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-3 cursor-pointer hover:bg-slate-800 p-2 rounded-lg transition-all"
                    onClick={() => handleUserClick(contributor.name)}
                  >
                    <div className={`size-10 rounded-full ${
                      contributor.badge === "Expert" 
                        ? "bg-gradient-to-br from-yellow-500 to-orange-500"
                        : contributor.badge === "Pro"
                        ? "bg-gradient-to-br from-purple-500 to-pink-500"
                        : "bg-gradient-to-br from-cyan-500 to-blue-500"
                    } flex items-center justify-center text-white shrink-0 hover:scale-110 transition-transform`}>
                      {contributor.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="text-white text-sm hover:text-cyan-400 transition-colors">{contributor.name}</div>
                      <div className="flex items-center gap-2">
                        <Star className="size-3 text-yellow-400" />
                        <span className="text-slate-400 text-xs">{contributor.points} points</span>
                      </div>
                    </div>
                    <Badge className={
                      contributor.badge === "Expert"
                        ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
                        : contributor.badge === "Pro"
                        ? "bg-purple-500/20 text-purple-400 border-purple-500/50"
                        : "bg-cyan-500/20 text-cyan-400 border-cyan-500/50"
                    }>
                      {contributor.badge}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-6">
              <h3 className="text-white mb-4 flex items-center gap-2">
                <Calendar className="size-5 text-cyan-400" />
                Upcoming Events
              </h3>
              <div className="space-y-3">
                {events.slice(0, 3).map((event, index) => (
                  <div 
                    key={index} 
                    className="p-3 rounded-lg bg-slate-800 border border-slate-700 hover:border-cyan-500/50 transition-all cursor-pointer group"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="text-white text-sm mb-1 group-hover:text-cyan-400 transition-colors">{event.title}</div>
                    <div className="text-slate-400 text-xs mb-2">{event.date}</div>
                    <div className="flex items-center gap-2 text-xs pointer-events-none">
                      <div className="flex-1 bg-slate-700 rounded-full h-1 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                          style={{ width: `${(event.registeredUsers / event.maxUsers) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-slate-500">{event.registeredUsers}/{event.maxUsers}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* New Discussion Dialog */}
      <Dialog open={isNewDiscussionOpen} onOpenChange={setIsNewDiscussionOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Start a New Discussion</DialogTitle>
            <DialogDescription className="text-slate-400">
              Share your thoughts and questions with the community.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-slate-300">Title</Label>
              <Input
                id="title"
                placeholder="Enter a descriptive title..."
                value={newDiscussionTitle}
                onChange={(e) => setNewDiscussionTitle(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-slate-300">Category</Label>
              <Select value={newDiscussionCategory} onValueChange={setNewDiscussionCategory}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white focus:border-cyan-500">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  {categories.filter(cat => cat !== "All").map((category) => (
                    <SelectItem key={category} value={category} className="text-white hover:bg-slate-800 focus:bg-slate-800">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content" className="text-slate-300">Description</Label>
              <Textarea
                id="content"
                placeholder="Describe your question or topic in detail..."
                value={newDiscussionContent}
                onChange={(e) => setNewDiscussionContent(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500 min-h-[150px]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              variant="outline"
              onClick={() => {
                setIsNewDiscussionOpen(false);
                setNewDiscussionTitle("");
                setNewDiscussionCategory("");
                setNewDiscussionContent("");
              }}
              className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600"
              disabled={!newDiscussionTitle || !newDiscussionCategory || !newDiscussionContent}
              onClick={handleCreateDiscussion}
            >
              Post Discussion
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Discussion is now shown on a separate page - using DiscussionDetailPage instead */}

      {/* AI Insights Dialog */}
      <Dialog open={showAIInsights} onOpenChange={setShowAIInsights}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Bot className="size-6 text-purple-400" />
              AI Community Insights
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              AI-powered analysis of technical discussions and trending issues
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-6">
            {getAIInsights().length > 0 ? (
              getAIInsights().map((insight: AIInsight, index: number) => (
                <Card key={index} className="bg-slate-800 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-3 rounded-lg bg-orange-500/20">
                        <AlertCircle className="size-6 text-orange-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white mb-2">{insight.issueType}</h4>
                        <div className="text-slate-400 text-sm mb-3">
                          Mentioned in {insight.frequency} {insight.frequency === 1 ? "discussion" : "discussions"}
                        </div>
                        <div className="space-y-2">
                          <div className="text-slate-300 text-sm">Related Discussions:</div>
                          {insight.discussions.map((disc, idx) => (
                            <div key={idx} className="text-cyan-400 text-sm pl-4 border-l-2 border-cyan-500/30">
                              • {disc}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-4 border-t border-slate-700">
                      <Bot className="size-4 text-purple-400" />
                      <span className="text-slate-400 text-xs">
                        AI recommends addressing this in upcoming updates or documentation
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-12 text-center">
                  <Bot className="size-12 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-white mb-2">No Issues Detected</h3>
                  <p className="text-slate-400">
                    AI analysis hasn't found any recurring technical issues yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* User Profile Modal */}
      <UserProfileModal user={selectedUser} onClose={() => setSelectedUser(null)} />

      {/* Event Modal */}
      <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} onRegister={handleEventRegister} />
    </div>
  );
}