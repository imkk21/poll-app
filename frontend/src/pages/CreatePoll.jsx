import { useState } from "react";
import { createPoll } from "../utils/api";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, X, Sparkles } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function CreatePoll() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async () => {
    const valid = options.filter(o => o.trim());
    
    if (!question.trim()) {
      toast.error("Please enter a poll question", {
        icon: "❓",
        style: {
          borderRadius: "12px",
          background: "#333",
          color: "#fff",
        },
      });
      return;
    }

    if (valid.length < 2) {
      toast.error("Add at least 2 options", {
        icon: "⚠️",
        style: {
          borderRadius: "12px",
          background: "#333",
          color: "#fff",
        },
      });
      return;
    }

    setIsCreating(true);

    try {
      const creatorId = uuidv4();
      localStorage.setItem("creatorId", creatorId);

      const poll = await createPoll({
        question,
        options: valid,
        creatorId
      });

      toast.success("Poll created successfully!", {
        icon: "🎉",
        style: {
          borderRadius: "12px",
          background: "#10b981",
          color: "#fff",
        },
      });

      setTimeout(() => {
        navigate(`/poll/${poll._id}`);
      }, 500);
    } catch (err) {
      toast.error("Failed to create poll. Try again!", {
        icon: "😞",
        style: {
          borderRadius: "12px",
          background: "#ef4444",
          color: "#fff",
        },
      });
      setIsCreating(false);
    }
  };

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, ""]);
    } else {
      toast("Maximum 10 options allowed", {
        icon: "ℹ️",
        style: {
          borderRadius: "12px",
          background: "#333",
          color: "#fff",
        },
      });
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    } else {
      toast.error("Minimum 2 options required", {
        icon: "⚠️",
        style: {
          borderRadius: "12px",
          background: "#333",
          color: "#fff",
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <Toaster position="top-center" />
      
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative max-w-2xl mx-auto px-6 py-12">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/")}
          className="mb-8 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="backdrop-blur-lg bg-white/70 border border-white/30 rounded-3xl shadow-2xl p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
              Create Your Poll
            </h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Poll Question
              </label>
              <input
                type="text"
                placeholder="What's your question?"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                className="w-full px-4 py-3 bg-white/80 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all text-gray-800 placeholder-gray-400"
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1">
                {question.length}/200 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Poll Options
              </label>
              <AnimatePresence>
                {options.map((option, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-3"
                  >
                    <div className="relative group">
                      <input
                        type="text"
                        placeholder={`Option ${i + 1}`}
                        value={option}
                        onChange={e => {
                          const copy = [...options];
                          copy[i] = e.target.value;
                          setOptions(copy);
                        }}
                        className="w-full px-4 py-3 pr-12 bg-white/80 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-gray-800 placeholder-gray-400"
                        maxLength={100}
                      />
                      {options.length > 2 && (
                        <button
                          onClick={() => removeOption(i)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <button
                onClick={addOption}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 transition-all flex items-center justify-center gap-2 font-medium"
              >
                <Plus className="w-5 h-5" />
                Add Option
              </button>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreate}
              disabled={isCreating}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
            >
              <span className="relative z-10">
                {isCreating ? "Creating..." : "Create Poll"}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </motion.button>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}
