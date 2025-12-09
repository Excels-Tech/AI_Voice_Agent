import { Calendar, Clock, User, Phone, ChevronRight, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

interface ScheduledCall {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  preferredDate: string;
  preferredTime: string;
  timezone: string;
  topic: string;
  assignedAgent: {
    id: string;
    name: string;
    type: string;
  } | null;
  status: 'scheduled' | 'in-progress' | 'completed' | 'missed';
  scheduledAt: string;
}

export function UpcomingCallsWidget() {
  const [upcomingCalls, setUpcomingCalls] = useState<ScheduledCall[]>([]);

  useEffect(() => {
    loadUpcomingCalls();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadUpcomingCalls, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadUpcomingCalls = () => {
    const calls: ScheduledCall[] = JSON.parse(localStorage.getItem('scheduledCalls') || '[]');
    const now = new Date();
    
    const upcoming = calls
      .filter(call => {
        if (call.status !== 'scheduled') return false;
        const callDateTime = new Date(`${call.preferredDate}T${call.preferredTime}`);
        return callDateTime > now;
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.preferredDate}T${a.preferredTime}`);
        const dateB = new Date(`${b.preferredDate}T${b.preferredTime}`);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 3); // Show only next 3 calls

    setUpcomingCalls(upcoming);
  };

  const formatDateTime = (date: string, time: string) => {
    const callDate = new Date(`${date}T${time}`);
    const now = new Date();
    const diffMs = callDate.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    let timeUntil = '';
    if (diffDays > 0) {
      timeUntil = `in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      timeUntil = `in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    } else if (diffMins > 0) {
      timeUntil = `in ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
    } else {
      timeUntil = 'starting soon';
    }

    const formattedDate = callDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    return { formattedDate, timeUntil, isUrgent: diffMins <= 15 };
  };

  if (upcomingCalls.length === 0) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-slate-300 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
          <Calendar className="size-5 text-cyan-600 dark:text-cyan-400" />
          Upcoming Scheduled Calls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcomingCalls.map((call, index) => {
          const { formattedDate, timeUntil, isUrgent } = formatDateTime(call.preferredDate, call.preferredTime);
          
          return (
            <motion.div
              key={`upcoming-call-${call.id}-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border ${
                isUrgent 
                  ? 'bg-orange-100 dark:bg-orange-500/10 border-orange-300 dark:border-orange-500/50' 
                  : 'bg-white dark:bg-slate-800/50 border-slate-300 dark:border-slate-700'
              } hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-slate-900 dark:text-white truncate">{call.name}</h4>
                    {isUrgent && (
                      <Badge className="bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-500/50 text-xs">
                        Soon
                      </Badge>
                    )}
                  </div>
                  
                  {call.company && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1 truncate">{call.company}</p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-500 mb-2">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {formattedDate}
                    </span>
                    <span className={isUrgent ? 'text-orange-600 dark:text-orange-400 font-medium' : ''}>
                      {timeUntil}
                    </span>
                  </div>

                  {call.assignedAgent && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs border-cyan-500/50 text-cyan-600 dark:text-cyan-400">
                        <User className="size-3 mr-1" />
                        {call.assignedAgent.name}
                      </Badge>
                    </div>
                  )}
                </div>

                {isUrgent && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <Sparkles className="size-5 text-orange-600 dark:text-orange-400" />
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}