"use client";

import { Calendar, MapPin, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  activityType: string;
  location: string;
  verified: boolean;
  assetCount?: number;
  imageUrl?: string;
}

interface ImpactTimelineProps {
  events: TimelineEvent[];
  onSelectEvent?: (id: string) => void;
}

export function ImpactTimeline({ events, onSelectEvent }: ImpactTimelineProps) {
  return (
    <div className="relative border-l border-white/10 ml-4 pl-6 space-y-8 my-4">
      {events.map((event) => (
        <div key={event.id} className="relative group">
          {/* Timeline node */}
          <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-slate-900 border-2 border-emerald-400 group-hover:bg-emerald-400 transition-colors shadow-sm" />

          {/* Card */}
          <div
            onClick={() => onSelectEvent?.(event.id)}
            className="p-4 rounded-xl border border-white/5 bg-slate-800/40 hover:border-white/10 hover:bg-slate-800/60 backdrop-blur-sm transition-all cursor-pointer space-y-2.5"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <Calendar className="w-3.5 h-3.5" />
                {event.date}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 ${
                  event.verified
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                }`}
              >
                {event.verified ? (
                  <>
                    <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-2.5 h-2.5" /> Pending
                  </>
                )}
              </span>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
                {event.title}
              </h4>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                {event.description}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                {event.location}
              </span>
              <span className="text-emerald-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                View Evidence <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
