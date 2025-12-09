import { ArrowLeft, Eye, MessageCircle, TrendingUp, ThumbsUp, Heart, Lightbulb, Laugh, MoreHorizontal, Link2, Image as ImageIcon, Smile, AtSign, ArrowUpDown, Send, X } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/textarea";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner@2.0.3";
import { Input } from "../ui/input";
import { ParsedContent, extractMentions } from "../utils/commentParser";
import { createMentionNotification } from "../utils/notificationHelper";

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

interface DiscussionDetailPageProps {
  discussion: Discussion;
  onBack: () => void;
  onAddComment: (content: string) => void;
  onReaction: (commentId: string, reactionType: keyof CommentReaction) => void;
  onUserClick: (username: string) => void;
}

type SortType = "recent" | "oldest" | "popular";

// Available users for mentions
const AVAILABLE_USERS = [
  { name: "John D.", avatar: "JD" },
  { name: "Sarah M.", avatar: "SM" },
  { name: "Alex K.", avatar: "AK" },
  { name: "Emma W.", avatar: "EW" },
  { name: "Michael R.", avatar: "MR" },
  { name: "Lisa T.", avatar: "LT" },
  { name: "David S.", avatar: "DS" },
  { name: "Rachel P.", avatar: "RP" }
];

// Popular emojis
const EMOJI_LIST = [
  "😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊",
  "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘",
  "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪",
  "🤨", "🧐", "🤓", "😎", "🤩", "🥳", "😏", "😒",
  "😞", "😔", "😟", "😕", "🙁", "😣", "😖", "😫",
  "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬",
  "👍", "👎", "👌", "✌️", "🤞", "🤟", "🤘", "👏",
  "🙌", "👐", "🤲", "🤝", "🙏", "✍️", "💪", "🦾",
  "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍",
  "💯", "💢", "💥", "💫", "💦", "💨", "🕳️", "💬",
  "👁️", "🗨️", "🗯️", "💭", "🔥", "⭐", "✨", "💡"
];

export function DiscussionDetailPage({ 
  discussion, 
  onBack, 
  onAddComment, 
  onReaction,
  onUserClick 
}: DiscussionDetailPageProps) {
  const [newComment, setNewComment] = useState("");
  const [sortBy, setSortBy] = useState<SortType>("recent");
  const [userReactions, setUserReactions] = useState<Record<string, keyof CommentReaction | null>>({});
  
  // Feature states
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");
  const [mentionPosition, setMentionPosition] = useState(0);
  const [linkText, setLinkText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const mentionDropdownRef = useRef<HTMLDivElement>(null);

  // Load user reactions from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`userReactions_${discussion.id}`);
    if (saved) {
      setUserReactions(JSON.parse(saved));
    }
  }, [discussion.id]);

  // Save user reactions to localStorage
  useEffect(() => {
    localStorage.setItem(`userReactions_${discussion.id}`, JSON.stringify(userReactions));
  }, [userReactions, discussion.id]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
      if (mentionDropdownRef.current && !mentionDropdownRef.current.contains(event.target as Node)) {
        setShowMentionDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Detect @ mentions in textarea
  useEffect(() => {
    const cursorPosition = textareaRef.current?.selectionStart || 0;
    const textBeforeCursor = newComment.slice(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      // Check if there's no space after @
      if (!textAfterAt.includes(" ")) {
        setMentionSearch(textAfterAt);
        setMentionPosition(lastAtIndex);
        setShowMentionDropdown(true);
      } else {
        setShowMentionDropdown(false);
      }
    } else {
      setShowMentionDropdown(false);
    }
  }, [newComment]);

  const handleAddComment = () => {
    if (newComment.trim()) {
      // Extract mentions from the comment
      const mentions = extractMentions(newComment);
      
      // Add the comment
      onAddComment(newComment);
      
      // Create notification for each mentioned user
      mentions.forEach(username => {
        createMentionNotification({
          mentionedBy: "You",
          discussionTitle: discussion.title,
          discussionId: discussion.id,
          commentId: Date.now().toString(),
          commentPreview: newComment,
        });
        toast.success(`${username} will be notified of your mention`, { duration: 2000 });
      });
      
      setNewComment("");
      toast.success("Comment posted successfully!");
    }
  };

  const handleReaction = (commentId: string, reactionType: keyof CommentReaction) => {
    const currentReaction = userReactions[commentId];
    
    if (currentReaction === reactionType) {
      setUserReactions(prev => ({ ...prev, [commentId]: null }));
      onReaction(commentId, reactionType);
      toast.success("Reaction removed");
    } else {
      if (currentReaction) {
        onReaction(commentId, currentReaction);
      }
      setUserReactions(prev => ({ ...prev, [commentId]: reactionType }));
      onReaction(commentId, reactionType);
      
      const reactionNames = {
        like: "Liked",
        loved: "Loved",
        insightful: "Marked as insightful",
        funny: "Reacted with laugh"
      };
      toast.success(reactionNames[reactionType]);
    }
  };

  const handleEmojiClick = (emoji: string) => {
    const cursorPosition = textareaRef.current?.selectionStart || newComment.length;
    const newText = newComment.slice(0, cursorPosition) + emoji + newComment.slice(cursorPosition);
    setNewComment(newText);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
    toast.success("Emoji added!");
  };

  const handleMentionSelect = (user: typeof AVAILABLE_USERS[0]) => {
    const beforeMention = newComment.slice(0, mentionPosition);
    const afterMention = newComment.slice(textareaRef.current?.selectionStart || newComment.length);
    const newText = beforeMention + `@${user.name} ` + afterMention;
    setNewComment(newText);
    setShowMentionDropdown(false);
    textareaRef.current?.focus();
    toast.success(`Mentioned ${user.name}`);
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => {
          const imageUrl = reader.result as string;
          setNewComment(prev => prev + `\n![Image](${file.name})`);
          toast.success("Image attached to comment!");
        };
        reader.readAsDataURL(file);
      } else {
        toast.error("Please select an image file");
      }
    }
  };

  const handleInsertLink = () => {
    if (linkText && linkUrl) {
      const linkMarkdown = `[${linkText}](${linkUrl})`;
      const cursorPosition = textareaRef.current?.selectionStart || newComment.length;
      const newText = newComment.slice(0, cursorPosition) + linkMarkdown + newComment.slice(cursorPosition);
      setNewComment(newText);
      setShowLinkDialog(false);
      setLinkText("");
      setLinkUrl("");
      textareaRef.current?.focus();
      toast.success(`Link "${linkText}" inserted!`);
    } else {
      toast.error("Please enter both link text and URL");
    }
  };

  const filteredUsers = AVAILABLE_USERS.filter(user => 
    user.name.toLowerCase().includes(mentionSearch.toLowerCase())
  );

  const toggleSort = () => {
    const nextSort: Record<SortType, SortType> = {
      recent: "oldest",
      oldest: "popular",
      popular: "recent"
    };
    setSortBy(nextSort[sortBy]);
  };

  const getSortLabel = () => {
    const labels: Record<SortType, string> = {
      recent: "Most Recent",
      oldest: "Oldest First",
      popular: "Most Popular"
    };
    return labels[sortBy];
  };

  const getSortedComments = () => {
    const commentsCopy = [...(discussion.comments || [])];
    
    switch (sortBy) {
      case "recent":
        return commentsCopy.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      case "oldest":
        return commentsCopy.sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      case "popular":
        return commentsCopy.sort((a, b) => {
          const reactionsA = a.reactions || { like: 0, funny: 0, insightful: 0, loved: 0 };
          const reactionsB = b.reactions || { like: 0, funny: 0, insightful: 0, loved: 0 };
          const totalA = reactionsA.like + reactionsA.funny + reactionsA.insightful + reactionsA.loved;
          const totalB = reactionsB.like + reactionsB.funny + reactionsB.insightful + reactionsB.loved;
          return totalB - totalA;
        });
      default:
        return commentsCopy;
    }
  };

  if (!discussion) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-slate-400 mb-4">Discussion not found</div>
          <Button onClick={onBack} className="bg-cyan-500 hover:bg-cyan-600">
            Back to Community
          </Button>
        </div>
      </div>
    );
  }

  const comments = getSortedComments();

  const getReactionIcon = (type: keyof CommentReaction) => {
    switch (type) {
      case "like":
        return ThumbsUp;
      case "loved":
        return Heart;
      case "insightful":
        return Lightbulb;
      case "funny":
        return Laugh;
    }
  };

  const getReactionColor = (type: keyof CommentReaction, isActive: boolean) => {
    if (!isActive) return "text-slate-400 hover:text-slate-300";
    
    switch (type) {
      case "like":
        return "text-blue-400";
      case "loved":
        return "text-pink-400";
      case "insightful":
        return "text-yellow-400";
      case "funny":
        return "text-orange-400";
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
            Back to Community
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-5xl pb-20">
        {/* Discussion Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <Badge
              className={
                discussion.category === "Technical"
                  ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50"
                  : discussion.category === "Tutorial"
                  ? "bg-purple-500/20 text-purple-400 border-purple-500/50"
                  : discussion.category === "Feature Request"
                  ? "bg-orange-500/20 text-orange-400 border-orange-500/50"
                  : "bg-slate-700 text-slate-300"
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
          <h1 className="text-white text-3xl mb-3">{discussion.title}</h1>
          <div className="text-slate-400 text-sm">
            Posted by {discussion.author} • {new Date(discussion.timestamp).toLocaleDateString()}
          </div>
        </div>

        {/* Original Post */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-8">
          <div className="flex items-start gap-5 mb-6">
            <div 
              className={`size-16 rounded-full bg-gradient-to-br ${
                discussion.category === "Technical" ? "from-cyan-500 to-blue-500" :
                discussion.category === "Tutorial" ? "from-purple-500 to-pink-500" :
                discussion.category === "Feature Request" ? "from-orange-500 to-red-500" :
                "from-emerald-500 to-teal-500"
              } flex items-center justify-center text-white text-xl shrink-0 cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg`}
              onClick={() => onUserClick(discussion.author)}
            >
              {discussion.avatar}
            </div>
            <div className="flex-1">
              <div 
                className="text-white text-lg mb-2 cursor-pointer hover:text-cyan-400 transition-colors inline-flex items-center gap-2 group"
                onClick={() => onUserClick(discussion.author)}
              >
                {discussion.author}
                <span className="text-xs text-slate-500 group-hover:text-cyan-500 transition-colors">View Profile</span>
              </div>
              <div className="text-slate-300 text-base leading-relaxed">{discussion.content}</div>
            </div>
          </div>
          
          {/* Enhanced Stats */}
          <div className="flex items-center gap-6 pt-6 border-t border-slate-800">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors">
              <div className="p-1.5 rounded-full bg-cyan-500/20">
                <Eye className="size-4 text-cyan-400" />
              </div>
              <div>
                <div className="text-white text-sm">{discussion.views}</div>
                <div className="text-slate-500 text-[10px]">views</div>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors">
              <div className="p-1.5 rounded-full bg-purple-500/20">
                <MessageCircle className="size-4 text-purple-400" />
              </div>
              <div>
                <div className="text-white text-sm">{comments.length}</div>
                <div className="text-slate-500 text-[10px]">comments</div>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors">
              <div className="p-1.5 rounded-full bg-pink-500/20">
                <TrendingUp className="size-4 text-pink-400" />
              </div>
              <div>
                <div className="text-white text-sm">{discussion.likes}</div>
                <div className="text-slate-500 text-[10px]">likes</div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Comment Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 relative">
          <div className="flex gap-4">
            <div className="size-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white shrink-0 shadow-md">
              YO
            </div>
            <div className="flex-1 relative">
              <div className="mb-3 relative">
                <Textarea
                  ref={textareaRef}
                  placeholder="Share your thoughts... Use @ to mention someone"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="bg-slate-800/60 border-slate-700 text-white placeholder-slate-400 focus:border-cyan-500 resize-none min-h-[80px] rounded-xl w-full"
                />
                
                {/* Mention Dropdown */}
                {showMentionDropdown && filteredUsers.length > 0 && (
                  <div 
                    ref={mentionDropdownRef}
                    className="absolute top-full left-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto"
                  >
                    {filteredUsers.map((user) => (
                      <button
                        key={user.name}
                        type="button"
                        onClick={() => handleMentionSelect(user)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700 transition-colors text-left"
                      >
                        <div className="size-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs shrink-0">
                          {user.avatar}
                        </div>
                        <span className="text-white">{user.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-1 relative">
                  {/* Link Button */}
                  <button 
                    type="button"
                    className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
                    onClick={() => setShowLinkDialog(!showLinkDialog)}
                    title="Add link"
                  >
                    <Link2 className="size-4" />
                  </button>
                  
                  {/* Image Button */}
                  <button 
                    type="button"
                    className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
                    onClick={handleImageUpload}
                    title="Add image"
                  >
                    <ImageIcon className="size-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  
                  {/* Emoji Button */}
                  <button 
                    type="button"
                    className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    title="Add emoji"
                  >
                    <Smile className="size-4" />
                  </button>
                  
                  {/* Mention Button */}
                  <button 
                    type="button"
                    className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
                    onClick={() => {
                      setNewComment(prev => prev + "@");
                      textareaRef.current?.focus();
                    }}
                    title="Mention user"
                  >
                    <AtSign className="size-4" />
                  </button>

                  {/* Emoji Picker */}
                  {showEmojiPicker && (
                    <div 
                      ref={emojiPickerRef}
                      className="absolute bottom-full left-0 mb-2 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-xl p-4 z-50"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white">Pick an emoji</h4>
                        <button
                          onClick={() => setShowEmojiPicker(false)}
                          className="text-slate-400 hover:text-white transition-colors"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-8 gap-2 max-h-64 overflow-y-auto">
                        {EMOJI_LIST.map((emoji, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleEmojiClick(emoji)}
                            className="text-2xl hover:bg-slate-700 rounded p-2 transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Link Dialog */}
                  {showLinkDialog && (
                    <div className="absolute bottom-full left-0 mb-2 w-96 bg-slate-800 border border-slate-700 rounded-xl shadow-xl p-4 z-50">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-white">Insert Link</h4>
                        <button
                          onClick={() => {
                            setShowLinkDialog(false);
                            setLinkText("");
                            setLinkUrl("");
                          }}
                          className="text-slate-400 hover:text-white transition-colors"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="text-slate-300 text-sm mb-1 block">Link Text</label>
                          <Input
                            placeholder="Enter link text"
                            value={linkText}
                            onChange={(e) => setLinkText(e.target.value)}
                            className="bg-slate-900 border-slate-600 text-white"
                          />
                        </div>
                        <div>
                          <label className="text-slate-300 text-sm mb-1 block">URL</label>
                          <Input
                            placeholder="https://example.com"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            className="bg-slate-900 border-slate-600 text-white"
                          />
                        </div>
                        <Button
                          onClick={handleInsertLink}
                          className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                        >
                          Insert Link
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                
                <Button
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 rounded-full px-6 h-9"
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          {/* Comments Header with Sort */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white text-xl flex items-center gap-3">
              <span>Comments</span>
              <Badge className="bg-indigo-500 text-white border-0 rounded-full px-3 py-1">
                {comments.length}
              </Badge>
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSort}
              className="h-9 px-4 bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-600 rounded-lg transition-all"
            >
              <ArrowUpDown className="size-4 mr-2" />
              {getSortLabel()}
            </Button>
          </div>

          {/* Comments List */}
          {comments.length > 0 ? (
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="pb-6 border-b border-slate-800 last:border-0 last:pb-0">
                  <div className="flex gap-4">
                    <div 
                      className="size-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm shrink-0 cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => onUserClick(comment.author)}
                    >
                      {comment.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div 
                        className="text-white mb-1 cursor-pointer hover:text-cyan-400 transition-colors inline-block"
                        onClick={() => onUserClick(comment.author)}
                      >
                        {comment.author}
                      </div>
                      <div className="text-slate-300 mb-3 leading-relaxed">
                        <ParsedContent 
                          content={comment.content}
                          onMentionClick={(username) => {
                            onUserClick(username);
                            toast.info(`Viewing profile of ${username}`);
                          }}
                        />
                      </div>
                      
                      {/* Reaction Buttons */}
                      <div className="flex items-center gap-1.5">
                        {comment.reactions && (Object.keys(comment.reactions) as Array<keyof CommentReaction>).map((reactionType) => {
                          const Icon = getReactionIcon(reactionType);
                          const isActive = userReactions[comment.id] === reactionType;
                          const count = comment.reactions[reactionType];
                          
                          return (
                            <button
                              key={reactionType}
                              type="button"
                              onClick={() => handleReaction(comment.id, reactionType)}
                              className={`flex items-center justify-center gap-1.5 w-[60px] h-[32px] rounded-lg transition-all ${
                                isActive 
                                  ? "bg-slate-800 border border-slate-700" 
                                  : "bg-transparent hover:bg-slate-800/50"
                              }`}
                            >
                              <Icon className={`size-4 shrink-0 ${getReactionColor(reactionType, isActive)} transition-colors`} />
                              <span className={`text-sm w-[20px] text-center tabular-nums ${
                                count > 0 
                                  ? (isActive ? "text-white" : "text-slate-400")
                                  : "text-transparent"
                              }`}>
                                {count > 0 ? count : "0"}
                              </span>
                            </button>
                          );
                        })}
                        <div className="ml-auto text-slate-500 text-xs">
                          {new Date(comment.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex p-4 rounded-full bg-slate-800 mb-4">
                <MessageCircle className="size-12 text-slate-600" />
              </div>
              <h3 className="text-white mb-2">No comments yet. Be the first to share your thoughts!</h3>
              <p className="text-slate-400 text-sm">
                Start the conversation by posting a comment above.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}