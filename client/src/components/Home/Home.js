import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import Typewriter from "typewriter-effect";

const Logo = ({ className = "h-8 w-8" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      className="stroke-indigo-600"
      strokeWidth="2"
      strokeDasharray="4 4"
    />
    <path
      d="M8 9L5 12L8 15"
      className="stroke-pink-600"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 9L19 12L16 15"
      className="stroke-pink-600"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14 7L10 17"
      className="stroke-indigo-600"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

function Home() {
  const [name, setName] = useState("");
  const [roomid, setRoomid] = useState("");
  const history = useHistory();

  const handlesubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !roomid.trim()) {
      return;
    }
    history.push(`/ide/${name.trim()}-${roomid.trim()}`);
  };

  const handleGenerateRoom = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let id = "";
    for (let i = 0; i < 8; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setRoomid("room-" + id);
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen w-full overflow-hidden bg-slate-50">
      {/* Animated light gradient background */}
      <div className="absolute inset-0 z-0 bg-gradient-to-tr from-slate-100 via-indigo-50 to-pink-50 animate-pulse duration-1000"></div>
      
      <div className="relative z-10 w-full max-w-md p-8 mx-4 bg-white/75 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl shadow-indigo-100/50 hover:shadow-indigo-200/50 transition-all duration-300 transform hover:-translate-y-1">
        <div className="flex flex-col items-center mb-8">
          <Logo className="h-16 w-16 mb-4 animate-bounce" />
          <div className="text-center font-extrabold text-4xl leading-tight bg-gradient-to-r from-indigo-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            <Typewriter
              options={{
                strings: ["CodeSphere", "Real-time IDE", "Compile Instantly"],
                autoStart: true,
                loop: true,
                delay: 80,
                deleteSpeed: 50,
              }}
            />
          </div>
          <p className="text-slate-500 text-center mt-3 text-sm font-medium">
            Collaborate. Code. Execute. In isolated Docker sandboxes.
          </p>
        </div>

        <form onSubmit={handlesubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-bold text-slate-600 tracking-wider uppercase">
              Username
            </label>
            <input
              className="w-full px-4 py-3 text-slate-800 bg-white/80 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 placeholder-slate-400 transition-all duration-200"
              type="text"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-bold text-slate-600 tracking-wider uppercase">
              Room ID
            </label>
            <div className="flex gap-2">
              <input
                className="flex-1 px-4 py-3 text-slate-800 bg-white/80 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 placeholder-slate-400 transition-all duration-200"
                type="text"
                placeholder="e.g. room-xyz123"
                value={roomid}
                onChange={(e) => setRoomid(e.target.value)}
                required
              />
              <button
                type="button"
                className="px-4 py-3 bg-indigo-50 text-indigo-600 hover:bg-indigo-100/80 active:scale-95 border border-indigo-100 font-semibold text-sm rounded-xl transition-all duration-150"
                onClick={handleGenerateRoom}
                title="Generate Random Room ID"
              >
                Generate
              </button>
            </div>
          </div>

          <div className="mt-2">
            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-pink-600 text-white font-semibold text-lg rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200"
            >
              Join Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Home;
