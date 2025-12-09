import { ArrowLeft, Calendar, Clock, User, ArrowRight, Search, Tag, TrendingUp, MessageCircle, Heart, Share2, Bookmark } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner@2.0.3";

interface BlogPageProps {
  onBack: () => void;
}

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  date: string;
  readTime: string;
  category: string;
  tags: string[];
  image: string;
  likes: number;
  comments: number;
  featured?: boolean;
}

const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "The Future of Customer Service: How AI Voice Agents Are Transforming Support",
    excerpt: "Discover how AI voice agents are revolutionizing customer service with 24/7 availability, instant responses, and personalized experiences that scale.",
    content: "Full article content here...",
    author: {
      name: "Sarah Chen",
      role: "Head of Product",
      avatar: "SC"
    },
    date: "2025-01-15",
    readTime: "8 min read",
    category: "Product Updates",
    tags: ["AI", "Customer Service", "Automation"],
    image: "https://images.unsplash.com/photo-1556155092-490a1ba16284?w=800&auto=format&fit=crop",
    likes: 234,
    comments: 45,
    featured: true
  },
  {
    id: "2",
    title: "Building Scalable Voice AI: Best Practices for Enterprise Deployment",
    excerpt: "Learn the key considerations and best practices for deploying voice AI at enterprise scale, from architecture design to security compliance.",
    content: "Full article content here...",
    author: {
      name: "Michael Rodriguez",
      role: "Engineering Lead",
      avatar: "MR"
    },
    date: "2025-01-12",
    readTime: "12 min read",
    category: "Engineering",
    tags: ["Enterprise", "Architecture", "Scale"],
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop",
    likes: 189,
    comments: 32,
    featured: true
  },
  {
    id: "3",
    title: "40+ Languages, 400+ Voices: Breaking Down Language Barriers with AI",
    excerpt: "How our multilingual AI voice agents are helping businesses serve global customers in their native languages with natural-sounding voices.",
    content: "Full article content here...",
    author: {
      name: "Emma Thompson",
      role: "AI Research Lead",
      avatar: "ET"
    },
    date: "2025-01-10",
    readTime: "6 min read",
    category: "AI Research",
    tags: ["Multilingual", "Voices", "Global"],
    image: "https://images.unsplash.com/photo-1526498460520-4c246339dccb?w=800&auto=format&fit=crop",
    likes: 312,
    comments: 67
  },
  {
    id: "4",
    title: "Case Study: How TechCorp Reduced Call Center Costs by 60% with Voice AI",
    excerpt: "Real-world results from a Fortune 500 company that transformed their customer support operations with AI voice agents.",
    content: "Full article content here...",
    author: {
      name: "James Wilson",
      role: "Solutions Architect",
      avatar: "JW"
    },
    date: "2025-01-08",
    readTime: "10 min read",
    category: "Case Studies",
    tags: ["ROI", "Success Story", "Enterprise"],
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop",
    likes: 445,
    comments: 89
  },
  {
    id: "5",
    title: "Understanding Sentiment Analysis in Voice Conversations",
    excerpt: "Deep dive into how our AI analyzes emotional cues and sentiment in real-time voice conversations to improve customer interactions.",
    content: "Full article content here...",
    author: {
      name: "Dr. Lisa Park",
      role: "ML Research Scientist",
      avatar: "LP"
    },
    date: "2025-01-05",
    readTime: "15 min read",
    category: "AI Research",
    tags: ["Sentiment Analysis", "NLP", "Machine Learning"],
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop",
    likes: 267,
    comments: 54
  },
  {
    id: "6",
    title: "Voice AI Security: Protecting Customer Data in the Age of Conversational AI",
    excerpt: "Learn about our enterprise-grade security measures, compliance certifications, and best practices for secure voice AI deployment.",
    content: "Full article content here...",
    author: {
      name: "David Kumar",
      role: "Security Engineer",
      avatar: "DK"
    },
    date: "2025-01-03",
    readTime: "9 min read",
    category: "Security",
    tags: ["Security", "Compliance", "Privacy"],
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop",
    likes: 198,
    comments: 41
  },
  {
    id: "7",
    title: "API Deep Dive: Integrating Voice AI into Your Existing Workflow",
    excerpt: "A comprehensive guide to our REST API, webhooks, and SDK with practical examples for common integration patterns.",
    content: "Full article content here...",
    author: {
      name: "Alex Martinez",
      role: "Developer Advocate",
      avatar: "AM"
    },
    date: "2024-12-28",
    readTime: "20 min read",
    category: "Developer",
    tags: ["API", "Integration", "Tutorial"],
    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&auto=format&fit=crop",
    likes: 523,
    comments: 112
  },
  {
    id: "8",
    title: "The Psychology of Voice: Why People Trust AI Voice Agents",
    excerpt: "Research-backed insights into human-AI interaction and how voice quality, tone, and pacing affect user trust and satisfaction.",
    content: "Full article content here...",
    author: {
      name: "Dr. Rachel Green",
      role: "UX Research Lead",
      avatar: "RG"
    },
    date: "2024-12-25",
    readTime: "11 min read",
    category: "Research",
    tags: ["Psychology", "UX", "Voice Design"],
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop",
    likes: 389,
    comments: 76
  }
];

const categories = ["All", ...Array.from(new Set(blogPosts.map(post => post.category)))];

export function BlogPage({ onBack }: BlogPageProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set());

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    const matchesSearch = searchQuery === "" || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredPosts = blogPosts.filter(post => post.featured);

  const handleLike = (postId: string) => {
    const newLiked = new Set(likedPosts);
    if (newLiked.has(postId)) {
      newLiked.delete(postId);
      toast.success('Removed from likes');
    } else {
      newLiked.add(postId);
      toast.success('Added to likes');
    }
    setLikedPosts(newLiked);
  };

  const handleBookmark = (postId: string) => {
    const newBookmarked = new Set(bookmarkedPosts);
    if (newBookmarked.has(postId)) {
      newBookmarked.delete(postId);
      toast.success('Removed from bookmarks');
    } else {
      newBookmarked.add(postId);
      toast.success('Added to bookmarks');
    }
    setBookmarkedPosts(newBookmarked);
  };

  const handleShare = (post: BlogPost) => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (selectedPost) {
    return (
      <div className="min-h-screen bg-black">
        {/* Header */}
        <div className="border-b border-slate-800">
          <div className="container mx-auto px-4 py-6">
            <Button
              variant="ghost"
              onClick={() => setSelectedPost(null)}
              className="text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <ArrowLeft className="size-4 mr-2" />
              Back to Blog
            </Button>
          </div>
        </div>

        {/* Article */}
        <article className="container mx-auto px-4 py-12 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50 mb-4">
              {selectedPost.category}
            </Badge>
            <h1 className="text-white text-4xl md:text-5xl mb-6">{selectedPost.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 mb-8 text-slate-400">
              <div className="flex items-center gap-2">
                <div className="size-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-sm">
                  {selectedPost.author.avatar}
                </div>
                <div>
                  <p className="text-white text-sm">{selectedPost.author.name}</p>
                  <p className="text-slate-500 text-xs">{selectedPost.author.role}</p>
                </div>
              </div>
              <span className="flex items-center gap-1">
                <Calendar className="size-4" />
                {new Date(selectedPost.date).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="size-4" />
                {selectedPost.readTime}
              </span>
            </div>

            <img
              src={selectedPost.image}
              alt={selectedPost.title}
              className="w-full h-96 object-cover rounded-lg mb-8"
            />

            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleLike(selectedPost.id)}
                className={`border-slate-700 ${
                  likedPosts.has(selectedPost.id)
                    ? 'text-red-400 border-red-500/50 bg-red-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Heart className={`size-4 mr-2 ${likedPosts.has(selectedPost.id) ? 'fill-current' : ''}`} />
                {selectedPost.likes + (likedPosts.has(selectedPost.id) ? 1 : 0)}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <MessageCircle className="size-4 mr-2" />
                {selectedPost.comments}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBookmark(selectedPost.id)}
                className={`border-slate-700 ${
                  bookmarkedPosts.has(selectedPost.id)
                    ? 'text-cyan-400 border-cyan-500/50 bg-cyan-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Bookmark className={`size-4 mr-2 ${bookmarkedPosts.has(selectedPost.id) ? 'fill-current' : ''}`} />
                Bookmark
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare(selectedPost)}
                className="border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <Share2 className="size-4 mr-2" />
                Share
              </Button>
            </div>

            <div className="prose prose-invert prose-lg max-w-none">
              <p className="text-slate-300 text-lg leading-relaxed mb-6">
                {selectedPost.excerpt}
              </p>
              <p className="text-slate-400 leading-relaxed mb-6">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
              <h2 className="text-white text-2xl mb-4 mt-8">Key Insights</h2>
              <p className="text-slate-400 leading-relaxed mb-6">
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>
              <ul className="list-disc list-inside text-slate-400 space-y-2 mb-6">
                <li>Advanced AI algorithms for natural conversations</li>
                <li>Real-time sentiment analysis and adaptive responses</li>
                <li>Enterprise-grade security and compliance</li>
                <li>Seamless integration with existing systems</li>
              </ul>
              <h2 className="text-white text-2xl mb-4 mt-8">Conclusion</h2>
              <p className="text-slate-400 leading-relaxed">
                Voice AI technology is transforming how businesses interact with customers. By leveraging advanced natural language processing and machine learning, companies can deliver personalized, scalable customer experiences that were previously impossible.
              </p>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-800">
              <div className="flex flex-wrap gap-2">
                {selectedPost.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="border-slate-700 text-slate-400">
                    <Tag className="size-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </motion.div>
        </article>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-slate-800">
        <div className="container mx-auto px-4 py-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <ArrowLeft className="size-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50 mb-4">
            Blog & Insights
          </Badge>
          <h1 className="text-white text-4xl md:text-6xl mb-6">
            The VoiceAI <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">Blog</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl mb-8">
            Latest insights, tutorials, and updates from the world of AI voice technology
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border-slate-800 text-white pl-12 h-12"
            />
          </div>
        </motion.div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-12 justify-center">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category 
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white" 
                : "border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800"
              }
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Featured Posts */}
        {selectedCategory === "All" && searchQuery === "" && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="size-6 text-cyan-400" />
              <h2 className="text-white text-2xl">Featured Articles</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {featuredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700 hover:border-cyan-500/50 transition-all cursor-pointer group overflow-hidden h-full"
                    onClick={() => setSelectedPost(post)}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                      <Badge className="absolute top-4 left-4 bg-cyan-500/20 text-cyan-400 border-cyan-500/50">
                        {post.category}
                      </Badge>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-white text-xl mb-3 group-hover:text-cyan-400 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-slate-400 mb-4 line-clamp-2">{post.excerpt}</p>
                      <div className="flex items-center justify-between text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                          <div className="size-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs">
                            {post.author.avatar}
                          </div>
                          <span>{post.author.name}</span>
                        </div>
                        <span className="flex items-center gap-1">
                          <Clock className="size-4" />
                          {post.readTime}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* All Posts */}
        <div>
          <h2 className="text-white text-2xl mb-6">
            {selectedCategory === "All" ? "Latest Articles" : selectedCategory}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-all cursor-pointer group overflow-hidden h-full flex flex-col"
                  onClick={() => setSelectedPost(post)}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                  </div>
                  <CardContent className="p-6 flex-1 flex flex-col">
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50 w-fit mb-3 text-xs">
                      {post.category}
                    </Badge>
                    <h3 className="text-white mb-3 group-hover:text-cyan-400 transition-colors line-clamp-2 flex-1">
                      {post.title}
                    </h3>
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-800">
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {post.readTime}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1">
                          <Heart className="size-3" />
                          {post.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="size-3" />
                          {post.comments}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-400">No articles found matching your criteria</p>
            </div>
          )}
        </div>

        {/* Newsletter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-16"
        >
          <Card className="bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 border-cyan-500/30">
            <CardContent className="p-8 md:p-12 text-center">
              <h2 className="text-white text-3xl mb-4">Stay Updated</h2>
              <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
                Subscribe to our newsletter for the latest insights on AI voice technology, product updates, and industry trends.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-slate-900 border-slate-800 text-white flex-1"
                />
                <Button className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-700 text-white">
                  Subscribe
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
