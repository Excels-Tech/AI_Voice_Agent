import { Calendar, Download, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { addToCalendar } from "../utils/calendarUtils";
import { toast } from "sonner@2.0.3";

interface CalendarProviderMenuProps {
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
  buttonClassName?: string;
  buttonText?: string;
}

export function CalendarProviderMenu({ 
  callDetails, 
  buttonClassName,
  buttonText = "Add to Calendar" 
}: CalendarProviderMenuProps) {
  
  const handleAddToCalendar = (provider: 'google' | 'outlook' | 'yahoo' | 'ics') => {
    const event = {
      title: `VoiceAI Partnership Call - ${callDetails.name}`,
      description: `Partnership discussion with ${callDetails.name}${callDetails.company ? ` from ${callDetails.company}` : ''}\n\n${callDetails.topic ? `Topic: ${callDetails.topic}\n` : ''}Contact: ${callDetails.email}${callDetails.phone ? `\nPhone: ${callDetails.phone}` : ''}\n\nJoin the video conference using the link sent to your email.`,
      location: 'Video Conference (Link will be sent via email)',
      startDate: callDetails.preferredDate,
      startTime: callDetails.preferredTime,
      timezone: callDetails.timezone,
      attendeeEmail: callDetails.email,
      organizer: {
        name: 'VoiceAI Partnership Team',
        email: 'partners@voiceai.com'
      }
    };

    try {
      addToCalendar(event, provider);
      
      if (provider === 'ics') {
        toast.success('Calendar file downloaded!', {
          description: 'Open the file to add the event to your calendar'
        });
      } else {
        toast.success(`Opening ${provider.charAt(0).toUpperCase() + provider.slice(1)} Calendar`, {
          description: 'Add the event in your calendar'
        });
      }
    } catch (error) {
      console.error('Error adding to calendar:', error);
      toast.error('Failed to add to calendar', {
        description: 'Please try again or download the .ics file'
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={buttonClassName || "bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-700 text-white h-12 px-4 py-2 rounded-md inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"}
        >
          <Download className="size-5 mr-2" />
          {buttonText}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-800">
        <DropdownMenuLabel className="text-slate-300">Select Calendar Provider</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-800" />
        
        <DropdownMenuItem 
          onClick={() => handleAddToCalendar('google')}
          className="text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer"
        >
          <ExternalLink className="size-4 mr-2 text-cyan-400" />
          Google Calendar
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleAddToCalendar('outlook')}
          className="text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer"
        >
          <ExternalLink className="size-4 mr-2 text-blue-400" />
          Outlook Calendar
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleAddToCalendar('yahoo')}
          className="text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer"
        >
          <ExternalLink className="size-4 mr-2 text-purple-400" />
          Yahoo Calendar
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-slate-800" />
        
        <DropdownMenuItem 
          onClick={() => handleAddToCalendar('ics')}
          className="text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer"
        >
          <Download className="size-4 mr-2 text-emerald-400" />
          Download .ics file
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}