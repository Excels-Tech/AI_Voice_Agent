import { useEffect, useState } from "react";
import { Phone, CheckCircle2, AlertTriangle, Mic, X } from "lucide-react";

export interface NotificationToastProps {
  id: string;
  title: string;
  description: string;
  icon: "call" | "success" | "warning" | "recording";
  onDismiss: (id: string) => void;
}

export function NotificationToast({
  id,
  title,
  description,
  icon,
  onDismiss,
}: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 10);

    // Auto dismiss after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onDismiss(id), 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  const getIconComponent = () => {
    switch (icon) {
      case "call":
        return Phone;
      case "success":
        return CheckCircle2;
      case "warning":
        return AlertTriangle;
      case "recording":
        return Mic;
    }
  };

  const getIconColor = () => {
    switch (icon) {
      case "call":
        return "text-blue-400 bg-blue-500/20 border-blue-500/50";
      case "success":
        return "text-orange-400 bg-orange-500/20 border-orange-500/50";
      case "warning":
        return "text-red-400 bg-red-500/20 border-red-500/50";
      case "recording":
        return "text-green-400 bg-green-500/20 border-green-500/50";
    }
  };

  const IconComponent = getIconComponent();
  const iconColor = getIconColor();

  return (
    <div
      className={`bg-slate-900 border border-slate-800 rounded-lg shadow-2xl p-4 min-w-[320px] max-w-md transition-all duration-300 ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`size-10 rounded-lg flex items-center justify-center shrink-0 border ${iconColor}`}>
          <IconComponent className="size-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white mb-1">{title}</p>
          <p className="text-slate-400 text-sm">{description}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onDismiss(id), 300);
          }}
          className="text-slate-500 hover:text-slate-300 transition-colors"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
