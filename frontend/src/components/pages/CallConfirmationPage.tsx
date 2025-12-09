import { Calendar, Clock, Mail, Phone, Building2, MapPin, CheckCircle2, ArrowLeft, Download, ExternalLink, Sparkles, User } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { motion } from "motion/react";
import { CalendarProviderMenu } from "../CalendarProviderMenu";
import { useEffect, useState } from "react";

interface CallConfirmationPageProps {
  onBack: () => void;
  callDetails: {
    name: string;
    email: string;
    phone: string;
    company: string;
    preferredDate: string;
    preferredTime: string;
    timezone: string;
    topic: string;
  };
}

export function CallConfirmationPage({ onBack, callDetails }: CallConfirmationPageProps) {
  const [assignedAgent, setAssignedAgent] = useState<{name: string; type: string} | null>(null);

  useEffect(() => {
    // Get the assigned agent from the most recent scheduled call
    const calls = JSON.parse(localStorage.getItem('scheduledCalls') || '[]');
    const mostRecentCall = calls[calls.length - 1];
    if (mostRecentCall?.assignedAgent) {
      setAssignedAgent(mostRecentCall.assignedAgent);
    }
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <ArrowLeft className="size-4 mr-2" />
              Back to Partners
            </Button>
            <Badge className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-400 border-emerald-500/50">
              <CheckCircle2 className="size-3 mr-1" />
              Call Scheduled
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Success Message */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="size-20 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle2 className="size-10 text-white" />
            </motion.div>
            <h1 className="text-white text-3xl md:text-5xl mb-4">Call Scheduled Successfully!</h1>
            <p className="text-slate-400 text-lg md:text-xl">
              We've received your request and sent a confirmation email to <span className="text-cyan-400">{callDetails.email}</span>
            </p>
          </div>

          {/* Call Details Card */}
          <Card className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border-slate-800 mb-6">
            <CardHeader>
              <CardTitle className="text-white text-2xl flex items-center gap-2">
                <Sparkles className="size-6 text-cyan-400" />
                Your Scheduled Call Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date & Time */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="size-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shrink-0">
                    <Calendar className="size-6 text-white" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Date</p>
                    <p className="text-white text-lg">{formatDate(callDetails.preferredDate)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="size-12 rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center shrink-0">
                    <Clock className="size-6 text-white" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Time</p>
                    <p className="text-white text-lg">
                      {formatTime(callDetails.preferredTime)}
                      {callDetails.timezone && (
                        <span className="text-slate-400 text-sm ml-2">
                          ({callDetails.timezone.split('/')[1]?.replace('_', ' ')})
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-slate-800">
                <div className="flex items-start gap-4">
                  <div className="size-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shrink-0">
                    <Mail className="size-6 text-white" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Email</p>
                    <p className="text-white">{callDetails.email}</p>
                  </div>
                </div>

                {callDetails.phone && (
                  <div className="flex items-start gap-4">
                    <div className="size-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shrink-0">
                      <Phone className="size-6 text-white" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Phone</p>
                      <p className="text-white">{callDetails.phone}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Company & Topic */}
              {(callDetails.company || callDetails.topic || assignedAgent) && (
                <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-slate-800">
                  {callDetails.company && (
                    <div className="flex items-start gap-4">
                      <div className="size-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shrink-0">
                        <Building2 className="size-6 text-white" />
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm mb-1">Company</p>
                        <p className="text-white">{callDetails.company}</p>
                      </div>
                    </div>
                  )}

                  {callDetails.topic && (
                    <div className="flex items-start gap-4">
                      <div className="size-12 rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center shrink-0">
                        <MapPin className="size-6 text-white" />
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm mb-1">Topic</p>
                        <p className="text-white">{callDetails.topic}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Assigned Agent */}
              {assignedAgent && (
                <div className="pt-6 border-t border-slate-800">
                  <div className="flex items-start gap-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg p-4">
                    <div className="size-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shrink-0">
                      <User className="size-6 text-white" />
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Assigned AI Agent</p>
                      <p className="text-white text-lg mb-1">{assignedAgent.name}</p>
                      <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50 text-xs">
                        Auto-assigned based on your topic
                      </Badge>
                      <p className="text-slate-400 text-sm mt-2">
                        This AI agent will automatically call you at the scheduled time
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid md:grid-cols-2 gap-4 mb-12">
            <CalendarProviderMenu callDetails={callDetails} />
            <Button
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white h-12"
              onClick={() => window.open(`mailto:${callDetails.email}`, '_blank')}
            >
              <ExternalLink className="size-5 mr-2" />
              Open Email Client
            </Button>
          </div>

          {/* Next Steps */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white text-xl">What Happens Next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="size-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shrink-0 text-white text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="text-white mb-1">Email Confirmation</h4>
                    <p className="text-slate-400 text-sm">
                      You'll receive a confirmation email with calendar invite and meeting link within 5 minutes
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="size-8 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center shrink-0 text-white text-sm">
                    2
                  </div>
                  <div>
                    <h4 className="text-white mb-1">Partnership Team Review</h4>
                    <p className="text-slate-400 text-sm">
                      Our partnership team will review your information and prepare for the call
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="size-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shrink-0 text-white text-sm">
                    3
                  </div>
                  <div>
                    <h4 className="text-white mb-1">Call Reminder</h4>
                    <p className="text-slate-400 text-sm">
                      We'll send a reminder email 24 hours before your scheduled call with the video conference link
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="size-8 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shrink-0 text-white text-sm">
                    4
                  </div>
                  <div>
                    <h4 className="text-white mb-1">Partnership Discussion</h4>
                    <p className="text-slate-400 text-sm">
                      Join the video call to discuss partnership opportunities, answer questions, and explore next steps
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support Info */}
          <div className="mt-8 p-6 bg-gradient-to-r from-purple-900/20 to-cyan-900/20 border border-purple-500/30 rounded-xl text-center">
            <p className="text-slate-300 mb-2">
              Need to reschedule or have questions?
            </p>
            <p className="text-slate-400 text-sm">
              Contact us at <span className="text-cyan-400">partners@voiceai.com</span> or call{' '}
              <span className="text-cyan-400">+1 (555) 123-4567</span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}