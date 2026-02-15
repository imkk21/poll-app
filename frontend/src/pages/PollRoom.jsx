import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPoll, closePoll } from "../utils/api";
import { socket } from "../utils/socket";
import { v4 as uuidv4 } from "uuid";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Share2,
  Lock,
  CheckCircle2,
  Users,
  Copy,
  Plus
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function PollRoom() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [poll, setPoll] = useState(null);
  const [voted, setVoted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);

  let voterId = localStorage.getItem("voterId");
  if (!voterId) {
    voterId = uuidv4();
    localStorage.setItem("voterId", voterId);
  }

  useEffect(() => {
    const loadPoll = async () => {
      try {
        const data = await getPoll(id);
        if (!data || data.message) {
          setError("Poll not found");
          setLoading(false);
          return;
        }
        setPoll(data);
        if (data.voters.includes(voterId)) setVoted(true);
        setLoading(false);
      } catch {
        setError("Failed to load poll");
        setLoading(false);
      }
    };

    loadPoll();
    socket.emit("join_poll", id);

    socket.on("poll_update", updated => {
      setPoll(updated);
      if (updated.voters.includes(voterId)) setVoted(true);
    });

    socket.on("vote_error", msg => {
      toast.error(msg, {
        icon: "⚠️",
        style: {
          borderRadius: "12px",
          background: "#ef4444",
          color: "#fff"
        }
      });
    });

    return () => {
      socket.off("poll_update");
      socket.off("vote_error");
    };
  }, [id]);

  // ✅ FIX: optimistic vote update
  const handleVote = (optionId) => {
    if (voted || !poll.isActive) return;

    setSelectedOption(optionId);
    setVoted(true);

    // optimistic UI update
    setPoll(prev => ({
      ...prev,
      options: prev.options.map(o =>
        o.optionId === optionId
          ? { ...o, votes: o.votes + 1 }
          : o
      )
    }));

    socket.emit("vote", {
      pollId: id,
      optionId,
      voterId
    });

    toast.success("Vote recorded!", {
      icon: "✅",
      style: {
        borderRadius: "12px",
        background: "#10b981",
        color: "#fff"
      }
    });
  };

  const handleClosePoll = async () => {
    try {
      await closePoll(id);
      toast.success("Poll closed successfully", {
        icon: "🔒",
        style: {
          borderRadius: "12px",
          background: "#333",
          color: "#fff"
        }
      });
    } catch {
      toast.error("Failed to close poll", {
        style: {
          borderRadius: "12px",
          background: "#ef4444",
          color: "#fff"
        }
      });
    }
  };

  const copyShareLink = () => {
    const shareLink = `${window.location.origin}/poll/${id}`;
    navigator.clipboard.writeText(shareLink);
    toast.success("Link copied to clipboard!", {
      icon: "📋",
      style: {
        borderRadius: "12px",
        background: "#10b981",
        color: "#fff"
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading poll...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center px-6">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Poll Not Found
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const totalVotes = poll.options.reduce((s, o) => s + o.votes, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <Toaster position="top-center" />

      <div className="relative max-w-3xl mx-auto px-6 py-12">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/")}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-lg bg-white/70 border border-white/30 rounded-3xl shadow-2xl p-8 mb-6"
        >
          {!poll.isActive && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <Lock className="w-5 h-5 text-red-600" />
              <span className="text-red-700 font-semibold">
                This poll is closed
              </span>
            </div>
          )}

          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {poll.question}
          </h2>

          <div className="flex items-center gap-4 text-sm text-gray-600 mb-8">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>
                {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
              </span>
            </div>
            {voted && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                <span>You voted</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <AnimatePresence>
              {poll.options.map((option, idx) => {
                const percent = totalVotes
                  ? Math.round((option.votes / totalVotes) * 100)
                  : 0;

                const isSelected = selectedOption === option.optionId;
                const canVote = !voted && poll.isActive;

                return (
                  <motion.div
                    key={option.optionId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="relative"
                  >
                    <button
                      onClick={() => canVote && handleVote(option.optionId)}
                      disabled={!canVote}
                      className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left relative overflow-hidden group ${
                        canVote
                          ? "hover:border-purple-500 hover:shadow-md cursor-pointer border-gray-200 bg-white/80"
                          : "cursor-not-allowed border-gray-200 bg-white/50"
                      } ${isSelected ? "border-purple-500 shadow-md" : ""}`}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="absolute inset-0 bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 opacity-60"
                      />

                      <div className="relative z-10 flex items-center justify-between">
                        <span className="font-semibold text-gray-800">
                          {option.text}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600">
                            {option.votes}{" "}
                            {option.votes === 1 ? "vote" : "votes"}
                          </span>
                          <span className="text-lg font-bold text-purple-600">
                            {percent}%
                          </span>
                        </div>
                      </div>
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="backdrop-blur-lg bg-white/70 border border-white/30 rounded-3xl shadow-xl p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <Share2 className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-gray-800">Share this poll</h3>
          </div>

          <div className="flex gap-2">
            <input
              value={`${window.location.origin}/poll/${id}`}
              readOnly
              className="flex-1 px-4 py-3 bg-white/80 border-2 border-gray-200 rounded-xl text-gray-600 text-sm"
              onClick={e => e.target.select()}
            />
            <button
              onClick={copyShareLink}
              className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 font-medium"
            >
              <Copy className="w-4 h-4" />
              Copy
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex gap-3"
        >
          {poll.isActive && (
            <button
              onClick={handleClosePoll}
              className="flex-1 py-3 bg-white/70 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Close Poll
            </button>
          )}

          <button
            onClick={() => navigate("/create")}
            className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create New Poll
          </button>
        </motion.div>
      </div>
    </div>
  );
}