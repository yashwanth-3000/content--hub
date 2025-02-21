"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal,
  Twitter,
  Instagram,
  Linkedin,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import Link from "next/link";

type TerminalLineType = "command" | "success" | "error" | "info";

export interface CalendarDay {
  date: string;
  dateObj: Date;
  tweet: string;
  linkedin: string;
  instagram: string;
}

interface CalendarViewProps {
  calendarContent: CalendarDay[];
  onSelectDay: (day: CalendarDay) => void;
}

// --------------------- CalendarView Component ---------------------
function CalendarView({ calendarContent, onSelectDay }: CalendarViewProps) {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());

  useEffect(() => {
    if (calendarContent.length > 0) {
      const firstEventDate = calendarContent[0].dateObj;
      setCurrentYear(firstEventDate.getFullYear());
      setCurrentMonth(firstEventDate.getMonth());
    }
  }, [calendarContent]);

  const monthStart = new Date(currentYear, currentMonth, 1);
  const firstDayIndex = monthStart.getDay();
  const calendarCells: Date[] = [];
  const startDate = new Date(currentYear, currentMonth, 1 - firstDayIndex);
  for (let i = 0; i < 42; i++) {
    const cellDate = new Date(startDate);
    cellDate.setDate(startDate.getDate() + i);
    calendarCells.push(cellDate);
  }
  const weeks = [];
  for (let i = 0; i < calendarCells.length; i += 7) {
    weeks.push(calendarCells.slice(i, i + 7));
  }

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const handlePrevMonth = () => {
    const newMonth = currentMonth - 1;
    if (newMonth < 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(newMonth);
    }
  };

  const handleNextMonth = () => {
    const newMonth = currentMonth + 1;
    if (newMonth > 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(newMonth);
    }
  };

  const monthName = monthStart.toLocaleString("default", { month: "long" });

  return (
    <motion.div
      className="p-6 rounded-xl border border-cyan-500/20 shadow-xl"
      style={{ background: "rgba(17, 24, 39, 0.9)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <button
          onClick={handlePrevMonth}
          className="text-cyan-400 hover:text-cyan-300 transition-transform duration-200 hover:scale-110"
        >
          &lt;
        </button>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          {monthName} {currentYear}
        </h2>
        <button
          onClick={handleNextMonth}
          className="text-cyan-400 hover:text-cyan-300 transition-transform duration-200 hover:scale-110"
        >
          &gt;
        </button>
      </motion.div>

      <div className="grid grid-cols-7 text-center text-sm font-medium text-cyan-400 mb-3 pb-2 border-b border-cyan-500/20">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {weeks.map((week, weekIndex) =>
          week.map((day, dayIndex) => {
            const event = calendarContent.find((ev) =>
              isSameDay(ev.dateObj, day)
            );
            const isActive = !!event;
            const isCurrentMonth = day.getMonth() === currentMonth;

            return (
              <motion.div
                key={`${weekIndex}-${dayIndex}`}
                className={`h-20 rounded-lg p-1.5 cursor-pointer transition-all
                  ${
                    isCurrentMonth
                      ? isActive
                        ? "bg-gray-800/80 hover:bg-gray-700/80 border border-cyan-500/30 shadow-md"
                        : "bg-gray-900/50 border border-gray-700/50"
                      : "bg-gray-900 border border-gray-800/50"
                  }
                  relative group`}
                onClick={() => {
                  if (isActive) onSelectDay(event!);
                }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                whileHover={
                  isActive
                    ? {
                        scale: 1.05,
                        boxShadow: "0 0 15px rgba(34, 211, 238, 0.2)",
                      }
                    : {}
                }
              >
                <div
                  className={`text-xs ${
                    isCurrentMonth && isActive ? "text-cyan-400" : "text-gray-500"
                  } font-medium`}
                >
                  {day.getDate()}
                </div>
                {isActive && (
                  <div className="mt-1.5 flex justify-center gap-1.5 opacity-90">
                    {event.tweet.trim() && (
                      <Twitter className="h-4 w-4 text-cyan-400/90 hover:text-cyan-300 transition-colors" />
                    )}
                    {event.linkedin.trim() && (
                      <Linkedin className="h-4 w-4 text-blue-400/90 hover:text-blue-300 transition-colors" />
                    )}
                    {event.instagram.trim() && (
                      <Instagram className="h-4 w-4 text-pink-400/90 hover:text-pink-300 transition-colors" />
                    )}
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}

// ------------------------- Page Component -------------------------
export default function Page() {
  // Left panel states
  const [twitterUsername, setTwitterUsername] = useState("");
  const [instagramUsername, setInstagramUsername] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [achievement, setAchievement] = useState("");
  const [numDays, setNumDays] = useState(1);

  // Terminal state
  const [terminalLines, setTerminalLines] = useState<
    { text: string; type: TerminalLineType }[]
  >([]);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Calendar content state
  const [calendarContent, setCalendarContent] = useState<CalendarDay[]>([]);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalLines]);

  // Add terminal line with animation
  const addTerminalLine = (text: string, type: TerminalLineType = "info") => {
    setTerminalLines((prev) => [...prev, { text, type }]);
  };

  // Helper to format dates for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Handle form submission: validate and generate calendar content
  const handleGenerateCalendar = (e: React.FormEvent) => {
    e.preventDefault();
    setTerminalLines([]);
    setCalendarContent([]);

    if (!achievement || (!twitterUsername && !instagramUsername && !linkedinUrl)) {
      addTerminalLine(
        "Error: Please provide your goal and at least one social media account.",
        "error"
      );
      return;
    }
    if (numDays < 1 || numDays > 30) {
      addTerminalLine("Error: Number of days must be between 1 and 30.", "error");
      return;
    }

    if (twitterUsername) {
      addTerminalLine(
        `Checking database for Twitter: @${twitterUsername}...`,
        "command"
      );
    }
    if (instagramUsername) {
      addTerminalLine(
        `Checking database for Instagram: @${instagramUsername}...`,
        "command"
      );
    }
    if (linkedinUrl) {
      addTerminalLine(`Verifying LinkedIn URL: ${linkedinUrl}...`, "command");
    }
    addTerminalLine(`User goal: ${achievement}`, "info");

    const today = new Date();
    const generatedContent: CalendarDay[] = [];

    for (let i = 0; i < numDays; i++) {
      const currentDate = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
      const formattedDate = formatDate(currentDate);

      const tweet = twitterUsername
        ? `Day ${i + 1} (${formattedDate}): "${achievement}" advice for @${twitterUsername}.`
        : "";
      const linkedin = linkedinUrl
        ? `Day ${i + 1} (${formattedDate}): Professional tip on "${achievement}". Check out ${linkedinUrl}.`
        : "";
      const instagram = instagramUsername
        ? `Day ${i + 1} (${formattedDate}): Visual inspiration on "${achievement}" for @${instagramUsername}.`
        : "";

      generatedContent.push({
        date: formattedDate,
        dateObj: currentDate,
        tweet,
        linkedin,
        instagram,
      });
    }
    setCalendarContent(generatedContent);
    addTerminalLine(
      `Calendar content generated for ${numDays} day(s).`,
      "success"
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#111827",
        fontFamily: "monospace",
      }}
    >
      {/* Global CRT & Keyframe Styles */}
      <style jsx global>{`
        @keyframes glow {
          0% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
          100% {
            opacity: 0.3;
          }
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .crt-effect::after {
          content: " ";
          display: block;
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
          background: linear-gradient(
              rgba(18, 16, 16, 0) 50%,
              rgba(0, 0, 0, 0.25) 50%
            ),
            linear-gradient(
              90deg,
              rgba(255, 0, 0, 0.06),
              rgba(0, 255, 0, 0.02),
              rgba(0, 0, 255, 0.06)
            );
          z-index: 999;
          pointer-events: none;
          background-size: 100% 2px, 3px 100%;
        }
      `}</style>

      <div className="crt-effect h-screen flex overflow-hidden">
        {/* ----------------- Left Panel: Form & Terminal ----------------- */}
        <motion.div
          className="w-1/2 flex flex-col border-r border-cyan-500/20"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          style={{ background: "rgba(31,41,55,0.5)" }}
        >
          {/* Form Section */}
          <motion.div
            className="p-8 border-b border-cyan-500/20"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <Link
                href="/choose-post-type"
                className="mr-2 hover:text-cyan-300 transition-colors"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1 rounded-lg hover:bg-cyan-500/10"
                >
                  <ArrowLeft className="h-6 w-6 text-cyan-400" />
                </motion.div>
              </Link>
              <Twitter className="text-cyan-400 h-8 w-8" />
              <Instagram className="text-pink-500 h-8 w-8" />
              <Linkedin className="text-blue-500 h-8 w-8" />
              <h1 className="text-2xl font-bold text-cyan-400">
                SOCIAL CONTENT CALENDAR
              </h1>
            </div>
            <form onSubmit={handleGenerateCalendar} className="space-y-4">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={twitterUsername}
                  onChange={(e) => setTwitterUsername(e.target.value)}
                  placeholder="Twitter username (without @) - optional"
                  className="w-1/2 px-4 py-3 bg-gray-800 rounded-lg border border-cyan-500/30 text-cyan-300 placeholder-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <input
                  type="text"
                  value={instagramUsername}
                  onChange={(e) => setInstagramUsername(e.target.value)}
                  placeholder="Instagram username (without @) - optional"
                  className="w-1/2 px-4 py-3 bg-gray-800 rounded-lg border border-cyan-500/30 text-cyan-300 placeholder-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div className="flex gap-4">
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="LinkedIn URL - optional"
                  className="w-1/2 px-4 py-3 bg-gray-800 rounded-lg border border-cyan-500/30 text-cyan-300 placeholder-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <input
                  type="number"
                  value={numDays}
                  onChange={(e) => setNumDays(Number(e.target.value))}
                  placeholder="Number of days (max 30)"
                  className="w-1/2 px-4 py-3 bg-gray-800 rounded-lg border border-cyan-500/30 text-cyan-300 placeholder-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  min={1}
                  max={30}
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-cyan-400 mb-2">
                  What do you want to achieve?
                </label>
                <textarea
                  value={achievement}
                  onChange={(e) => setAchievement(e.target.value)}
                  placeholder="Enter your goal or objective..."
                  className="w-full px-4 py-3 bg-gray-800 rounded-lg border border-cyan-500/30 text-cyan-300 placeholder-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 h-24"
                  required
                />
              </div>
              <motion.button
                type="submit"
                className="w-full px-6 py-3 bg-cyan-500/10 text-cyan-300 rounded-lg border border-cyan-500/30 hover:bg-cyan-500/20 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                GENERATE CALENDAR CONTENT
              </motion.button>
            </form>
          </motion.div>

          {/* Terminal Section */}
          <motion.div
            className="flex-1 bg-black/50 p-6 overflow-y-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-4 text-cyan-400">
              <Terminal className="h-5 w-5" />
              <span className="text-sm">AI TERMINAL</span>
            </div>
            <div className="space-y-2 text-sm">
              <AnimatePresence>
                {terminalLines.map((line, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className={`${
                      line.type === "command"
                        ? "text-cyan-300"
                        : line.type === "success"
                        ? "text-green-400"
                        : line.type === "error"
                        ? "text-red-400"
                        : "text-cyan-200"
                    }`}
                  >
                    {line.type === "command" && (
                      <span className="text-cyan-500 mr-2">$</span>
                    )}
                    <ReactMarkdown className="inline">
                      {line.text}
                    </ReactMarkdown>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={terminalEndRef} />
            </div>
          </motion.div>
        </motion.div>

        {/* ------------------ Right Panel: Calendar View ------------------ */}
        <motion.div
          className="w-1/2 p-8 overflow-y-auto relative"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          style={{ background: "rgba(17,24,39,0.9)" }}
        >
          {calendarContent.length === 0 ? (
            <div className="text-cyan-500/50">
              Your calendar content will appear here once generated.
            </div>
          ) : (
            <CalendarView
              calendarContent={calendarContent}
              onSelectDay={setSelectedDay}
            />
          )}
        </motion.div>

        {/* ----------------- Modal for Detailed Day View with Social Media Previews ----------------- */}
        <AnimatePresence>
          {selectedDay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-900 p-8 rounded-lg relative max-w-lg w-full shadow-xl"
              >
                <button
                  onClick={() => setSelectedDay(null)}
                  className="absolute top-2 right-2 text-cyan-400 text-2xl focus:outline-none"
                >
                  &times;
                </button>
                <h2 className="text-2xl font-bold text-cyan-400 mb-4">
                  {selectedDay.date}
                </h2>
                {/* Social Media Preview Cards */}
                <div className="space-y-4">
                  {selectedDay.tweet.trim() && (
                    <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-cyan-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Twitter className="h-6 w-6 text-cyan-400" />
                        <span className="text-cyan-300 font-semibold">
                          Twitter Preview
                        </span>
                      </div>
                      <div className="mb-2">
                        <span className="block text-gray-400 text-xs uppercase">
                          Content Idea
                        </span>
                        <p className="text-cyan-200 text-sm">
                          {selectedDay.tweet}
                        </p>
                      </div>
                      <div>
                        <span className="block text-gray-400 text-xs uppercase">
                          Example Tweet
                        </span>
                        <p className="text-cyan-200 text-sm">
                          {selectedDay.tweet}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedDay.linkedin.trim() && (
                    <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-blue-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Linkedin className="h-6 w-6 text-blue-400" />
                        <span className="text-blue-300 font-semibold">
                          LinkedIn Preview
                        </span>
                      </div>
                      <div className="mb-2">
                        <span className="block text-gray-400 text-xs uppercase">
                          Content Idea
                        </span>
                        <p className="text-blue-200 text-sm">
                          {selectedDay.linkedin}
                        </p>
                      </div>
                      <div>
                        <span className="block text-gray-400 text-xs uppercase">
                          Example Post
                        </span>
                        <p className="text-blue-200 text-sm">
                          {selectedDay.linkedin}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedDay.instagram.trim() && (
                    <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-pink-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Instagram className="h-6 w-6 text-pink-400" />
                        <span className="text-pink-300 font-semibold">
                          Instagram Preview
                        </span>
                      </div>
                      <div className="mb-2">
                        <span className="block text-gray-400 text-xs uppercase">
                          Content Idea
                        </span>
                        <p className="text-pink-200 text-sm">
                          {selectedDay.instagram}
                        </p>
                      </div>
                      <div>
                        <span className="block text-gray-400 text-xs uppercase">
                          Example Post
                        </span>
                        <p className="text-pink-200 text-sm">
                          {selectedDay.instagram}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
