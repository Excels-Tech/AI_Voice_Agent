import { useEffect, useState } from 'react';
import { toast } from 'sonner@2.0.3';
import { Phone, Calendar, AlertCircle } from 'lucide-react';

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
  triggeredAt?: string;
}

// Intelligent agent assignment based on topic and need
export function assignAgentToCall(callDetails: {
  topic: string;
  company: string;
  name: string;
}): { id: string; name: string; type: string; reason: string } {
  const topic = callDetails.topic?.toLowerCase() || '';
  
  // Define agent types and their expertise
  const agents = [
    {
      id: 'agent-partnerships',
      name: 'Partnership Specialist',
      type: 'partnerships',
      keywords: ['partner', 'partnership', 'collaborate', 'agency', 'reseller', 'referral', 'commission'],
      reason: 'Specializes in partnership opportunities and collaboration'
    },
    {
      id: 'agent-sales',
      name: 'Sales Executive',
      type: 'sales',
      keywords: ['pricing', 'plan', 'purchase', 'buy', 'quote', 'demo', 'trial', 'enterprise'],
      reason: 'Expert in pricing, plans, and sales inquiries'
    },
    {
      id: 'agent-technical',
      name: 'Technical Support',
      type: 'technical',
      keywords: ['api', 'integration', 'technical', 'code', 'webhook', 'setup', 'configure', 'development'],
      reason: 'Handles technical questions and integration support'
    },
    {
      id: 'agent-onboarding',
      name: 'Onboarding Specialist',
      type: 'onboarding',
      keywords: ['getting started', 'setup', 'onboard', 'new', 'begin', 'start', 'tutorial', 'guide'],
      reason: 'Assists with platform setup and onboarding'
    },
    {
      id: 'agent-support',
      name: 'Customer Success',
      type: 'support',
      keywords: ['help', 'support', 'issue', 'problem', 'question', 'assistance', 'trouble'],
      reason: 'Provides general support and assistance'
    }
  ];

  // Score each agent based on topic match
  let bestAgent = agents[0];
  let bestScore = 0;

  for (const agent of agents) {
    let score = 0;
    for (const keyword of agent.keywords) {
      if (topic.includes(keyword)) {
        score++;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestAgent = agent;
    }
  }

  // Default to partnerships agent if no specific match (since we're on Partners page)
  if (bestScore === 0) {
    bestAgent = agents[0]; // Partnership Specialist
  }

  return {
    id: bestAgent.id,
    name: bestAgent.name,
    type: bestAgent.type,
    reason: bestAgent.reason
  };
}

// Calculate time until call
function getTimeUntilCall(date: string, time: string): number {
  const callDateTime = new Date(`${date}T${time}`);
  const now = new Date();
  return callDateTime.getTime() - now.getTime();
}

// Format time remaining
function formatTimeRemaining(milliseconds: number): string {
  const minutes = Math.floor(milliseconds / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  return 'now';
}

interface CallSchedulerServiceProps {
  onCallTriggered?: (call: ScheduledCall) => void;
}

export function CallSchedulerService({ onCallTriggered }: CallSchedulerServiceProps) {
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // Check for calls to trigger every 30 seconds
    const checkInterval = setInterval(() => {
      checkAndTriggerCalls();
    }, 30000); // 30 seconds

    // Initial check
    checkAndTriggerCalls();

    return () => clearInterval(checkInterval);
  }, []);

  const checkAndTriggerCalls = () => {
    if (isChecking) return;
    setIsChecking(true);

    try {
      const calls: ScheduledCall[] = JSON.parse(localStorage.getItem('scheduledCalls') || '[]');
      const now = new Date();

      calls.forEach((call, index) => {
        if (call.status !== 'scheduled') return;

        const callDateTime = new Date(`${call.preferredDate}T${call.preferredTime}`);
        const timeUntil = callDateTime.getTime() - now.getTime();

        // Trigger call if it's time (within 1 minute of scheduled time)
        if (timeUntil <= 60000 && timeUntil > -60000) {
          triggerCall(call, index);
        }
        // Send reminder 15 minutes before
        else if (timeUntil > 0 && timeUntil <= 900000 && !call.reminderSent) {
          sendReminder(call, index);
        }
      });
    } catch (error) {
      console.error('Error checking scheduled calls:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const triggerCall = (call: ScheduledCall, index: number) => {
    // Update call status
    const calls: ScheduledCall[] = JSON.parse(localStorage.getItem('scheduledCalls') || '[]');
    calls[index] = {
      ...call,
      status: 'in-progress',
      triggeredAt: new Date().toISOString()
    };
    localStorage.setItem('scheduledCalls', JSON.stringify(calls));

    // Create a call log entry
    const callLogs = JSON.parse(localStorage.getItem('callLogs') || '[]');
    const newCallLog = {
      id: `call-${Date.now()}`,
      customerName: call.name,
      phoneNumber: call.phone || 'N/A',
      duration: '0:00',
      status: 'in-progress',
      type: 'outbound',
      agent: call.assignedAgent?.name || 'Partnership Specialist',
      timestamp: new Date().toISOString(),
      sentiment: 'neutral',
      transcript: `Initiating scheduled partnership call with ${call.name} from ${call.company || 'their company'}.`,
      scheduledCallId: call.id,
      topic: call.topic
    };
    callLogs.unshift(newCallLog);
    localStorage.setItem('callLogs', JSON.stringify(callLogs));

    // Show notification
    toast.success('Scheduled Call Started!', {
      description: `${call.assignedAgent?.name || 'Agent'} is now calling ${call.name}`,
      icon: <Phone className="size-5 text-emerald-400" />,
      duration: 10000
    });

    // Callback
    if (onCallTriggered) {
      onCallTriggered(calls[index]);
    }

    // Simulate call completion after 5 minutes
    setTimeout(() => {
      completeCall(call.id);
    }, 300000);
  };

  const sendReminder = (call: ScheduledCall, index: number) => {
    const calls: ScheduledCall[] = JSON.parse(localStorage.getItem('scheduledCalls') || '[]');
    calls[index] = { ...call, reminderSent: true } as any;
    localStorage.setItem('scheduledCalls', JSON.stringify(calls));

    const timeUntil = getTimeUntilCall(call.preferredDate, call.preferredTime);
    
    toast.info('Upcoming Scheduled Call', {
      description: `Call with ${call.name} in ${formatTimeRemaining(timeUntil)}`,
      icon: <Calendar className="size-5 text-cyan-400" />,
      duration: 8000
    });
  };

  const completeCall = (callId: string) => {
    // Update scheduled call status
    const calls: ScheduledCall[] = JSON.parse(localStorage.getItem('scheduledCalls') || '[]');
    const callIndex = calls.findIndex(c => c.id === callId);
    
    if (callIndex !== -1) {
      calls[callIndex].status = 'completed';
      localStorage.setItem('scheduledCalls', JSON.stringify(calls));

      // Update call log
      const callLogs = JSON.parse(localStorage.getItem('callLogs') || '[]');
      const logIndex = callLogs.findIndex((log: any) => log.scheduledCallId === callId);
      
      if (logIndex !== -1) {
        callLogs[logIndex].status = 'completed';
        callLogs[logIndex].duration = '5:23';
        callLogs[logIndex].sentiment = 'positive';
        callLogs[logIndex].transcript += '\n\nCall completed successfully. Partnership opportunities discussed.';
        localStorage.setItem('callLogs', JSON.stringify(callLogs));
      }

      toast.success('Call Completed', {
        description: 'Partnership call finished successfully',
        duration: 5000
      });
    }
  };

  return null; // This is a service component, no UI
}

// Export helper to get upcoming calls
export function getUpcomingCalls(): ScheduledCall[] {
  const calls: ScheduledCall[] = JSON.parse(localStorage.getItem('scheduledCalls') || '[]');
  const now = new Date();
  
  return calls
    .filter(call => {
      if (call.status !== 'scheduled') return false;
      const callDateTime = new Date(`${call.preferredDate}T${call.preferredTime}`);
      return callDateTime > now;
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.preferredDate}T${a.preferredTime}`);
      const dateB = new Date(`${b.preferredDate}T${b.preferredTime}`);
      return dateA.getTime() - dateB.getTime();
    });
}

// Export helper to check if a call should trigger soon
export function shouldShowCallReminder(): { show: boolean; call?: ScheduledCall; timeUntil?: number } {
  const calls = getUpcomingCalls();
  
  for (const call of calls) {
    const timeUntil = getTimeUntilCall(call.preferredDate, call.preferredTime);
    
    // Show reminder if call is within 5 minutes
    if (timeUntil > 0 && timeUntil <= 300000) {
      return { show: true, call, timeUntil };
    }
  }
  
  return { show: false };
}
