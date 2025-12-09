import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { Progress } from "../ui/progress";
import { Trophy, Star, MessageCircle, CheckCircle, Calendar, Users, ThumbsUp, Laugh, Lightbulb, Heart } from "lucide-react";
import { toast } from "sonner@2.0.3";

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

interface UserProfileModalProps {
  user: UserProfile | null;
  onClose: () => void;
}

export function UserProfileModal({ user, onClose }: UserProfileModalProps) {
  if (!user) return null;

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case "Expert":
        return "bg-gradient-to-r from-yellow-500 to-orange-500";
      case "Pro":
        return "bg-gradient-to-r from-purple-500 to-pink-500";
      default:
        return "bg-gradient-to-r from-cyan-500 to-blue-500";
    }
  };

  const pointsToNextLevel = user.badge === "Expert" ? 3000 : user.badge === "Pro" ? 2000 : 1000;
  const progress = (user.points / pointsToNextLevel) * 100;

  return (
    <Dialog open={!!user} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">User Profile</DialogTitle>
          <DialogDescription className="text-slate-400">
            View community member details, stats, and achievements
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-5">
          {/* User Header */}
          <div className="flex flex-col items-center text-center gap-3">
            <div className={`size-20 rounded-full ${getBadgeColor(user.badge)} flex items-center justify-center text-white text-2xl shrink-0`}>
              {user.avatar}
            </div>
            <div>
              <h3 className="text-white text-xl mb-2">{user.name}</h3>
              <div className="flex items-center gap-3 justify-center">
                <Badge className={`${getBadgeColor(user.badge)} text-white border-0 px-3 py-1`}>
                  {user.badge}
                </Badge>
                <div className="flex items-center gap-1 text-yellow-400">
                  <Star className="size-4 fill-yellow-400" />
                  <span className="text-white text-sm">{user.points} points</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress to Next Level */}
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300 text-xs">Progress to Next Level</span>
                <span className="text-cyan-400 text-xs">{user.points} / {pointsToNextLevel}</span>
              </div>
              <Progress value={progress} className="h-2 bg-slate-700" />
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-3 text-center">
                <div className="inline-flex p-2 rounded-full bg-cyan-500/20 mb-2">
                  <MessageCircle className="size-4 text-cyan-400" />
                </div>
                <div className="text-xl text-white mb-1">{user.discussionsStarted}</div>
                <div className="text-slate-400 text-[10px]">Discussions</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-3 text-center">
                <div className="inline-flex p-2 rounded-full bg-purple-500/20 mb-2">
                  <MessageCircle className="size-4 text-purple-400" />
                </div>
                <div className="text-xl text-white mb-1">{user.commentsPosted}</div>
                <div className="text-slate-400 text-[10px]">Comments</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-3 text-center">
                <div className="inline-flex p-2 rounded-full bg-emerald-500/20 mb-2">
                  <CheckCircle className="size-4 text-emerald-400" />
                </div>
                <div className="text-xl text-white mb-1">{user.solutionsProvided}</div>
                <div className="text-slate-400 text-[10px]">Solutions</div>
              </CardContent>
            </Card>
          </div>

          {/* How to Earn Points */}
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-3">
              <h4 className="text-white mb-3 flex items-center gap-2 text-sm">
                <Trophy className="size-4 text-yellow-400" />
                How to Earn Points
              </h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span>• Start a new discussion</span>
                  <span className="text-cyan-400">+10 pts</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>• Post a comment</span>
                  <span className="text-cyan-400">+5 pts</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>• Your comment gets liked</span>
                  <span className="text-cyan-400">+2 pts</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>• Your comment gets marked insightful</span>
                  <span className="text-cyan-400">+5 pts</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>• Provide accepted solution</span>
                  <span className="text-cyan-400">+25 pts</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>• Attend community events</span>
                  <span className="text-cyan-400">+15 pts</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Member Since */}
          <div className="text-center text-slate-400 text-xs">
            Member since {new Date(user.joinDate).toLocaleDateString()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface EventModalProps {
  event: Event | null;
  onClose: () => void;
  onRegister: (eventId: string) => void;
}

export function EventModal({ event, onClose, onRegister }: EventModalProps) {
  if (!event) return null;

  const spotsLeft = event.maxUsers - event.registeredUsers;
  const fillPercentage = (event.registeredUsers / event.maxUsers) * 100;

  return (
    <Dialog open={!!event} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-full bg-cyan-500/20">
              <Calendar className="size-6 text-cyan-400" />
            </div>
            <div>
              <DialogTitle className="text-white text-2xl">{event.title}</DialogTitle>
              <DialogDescription className="text-slate-400 mt-1">{event.date}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-6 space-y-6">
          {/* Event Description */}
          <div>
            <h4 className="text-white mb-2">About This Event</h4>
            <p className="text-slate-300">{event.description}</p>
          </div>

          {/* Registration Status */}
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Users className="size-5 text-purple-400" />
                  <span className="text-white">Registration Status</span>
                </div>
                <span className="text-slate-300 text-sm">
                  {event.registeredUsers} / {event.maxUsers} registered
                </span>
              </div>
              <Progress value={fillPercentage} className="h-2 bg-slate-700 mb-2" />
              <div className="text-slate-400 text-sm text-center">
                {spotsLeft > 0 ? `${spotsLeft} spots remaining` : "Event is full"}
              </div>
            </CardContent>
          </Card>

          {/* Event Details */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="text-slate-400 text-sm mb-1">Date</div>
                <div className="text-white">{event.date}</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="text-slate-400 text-sm mb-1">Duration</div>
                <div className="text-white">1-2 hours</div>
              </CardContent>
            </Card>
          </div>

          {/* Benefits */}
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <h4 className="text-white mb-3">Event Benefits</h4>
              <div className="space-y-2 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <Star className="size-4 text-yellow-400" />
                  <span>Earn +15 community points</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="size-4 text-orange-400" />
                  <span>Get event completion badge</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="size-4 text-cyan-400" />
                  <span>Network with community members</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Button */}
          <Button
            className={
              event.registered
                ? "w-full bg-slate-700 text-slate-300 cursor-not-allowed"
                : spotsLeft > 0
                ? "w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600"
                : "w-full bg-slate-700 text-slate-300 cursor-not-allowed"
            }
            onClick={() => {
              if (!event.registered && spotsLeft > 0) {
                onRegister(event.id);
              }
            }}
            disabled={event.registered || spotsLeft === 0}
          >
            {event.registered ? "✓ Registered" : spotsLeft > 0 ? "Register for Event" : "Event Full"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface CommentReactionsProps {
  comment: Comment;
  onReact: (commentId: string, reactionType: keyof CommentReaction) => void;
  onReply: (commentId: string) => void;
}

export function CommentReactions({ comment, onReact, onReply }: CommentReactionsProps) {
  const reactions = [
    { key: "like" as keyof CommentReaction, icon: ThumbsUp, label: "Like", color: "text-blue-400" },
    { key: "funny" as keyof CommentReaction, icon: Laugh, label: "Funny", color: "text-yellow-400" },
    { key: "insightful" as keyof CommentReaction, icon: Lightbulb, label: "Insightful", color: "text-purple-400" },
    { key: "loved" as keyof CommentReaction, icon: Heart, label: "Loved", color: "text-pink-400" },
  ];

  // Ensure reactions object exists with defaults
  const commentReactions = comment.reactions || { like: 0, funny: 0, insightful: 0, loved: 0 };

  return (
    <div className="flex items-center gap-2 mt-3 flex-wrap">
      {reactions.map((reaction) => (
        <Button
          key={reaction.key}
          variant="ghost"
          size="sm"
          onClick={() => onReact(comment.id, reaction.key)}
          className="h-8 px-2 hover:bg-slate-700 group"
        >
          <reaction.icon className={`size-4 ${reaction.color} group-hover:scale-110 transition-transform`} />
          {commentReactions[reaction.key] > 0 && (
            <span className="ml-1 text-slate-400 text-xs">{commentReactions[reaction.key]}</span>
          )}
        </Button>
      ))}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onReply(comment.id)}
        className="h-8 px-2 hover:bg-slate-700 text-slate-400 text-xs ml-auto"
      >
        Reply
      </Button>
    </div>
  );
}