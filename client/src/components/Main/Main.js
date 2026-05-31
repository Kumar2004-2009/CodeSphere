import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams } from "react-router-dom";
import axios from "axios";
import { returncode } from "../../utils/defaultcode";
import Editor from "../Editor/Editor";
import Input from "../Input/input";
import Output from "../output/output";
import io from "socket.io-client";
import { API_URL, SOCKET_URL } from "../../config";

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

function Main() {
  const [language, setLanguage] = useState("C++");
  const [codeidx, setCodeidx] = useState(1);
  const [theme, setTheme] = useState("vs-light");
  const [code, setCode] = useState(returncode(1));
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const [socket, setSocket] = useState(null);
  const { user } = useParams();

  useEffect(() => {
    console.log("Connecting to socket at URL:", SOCKET_URL);
    const socketInstance = io.connect(SOCKET_URL);
    setSocket(socketInstance);

    const parts = user.split("-");
    const username = parts[0];
    const userroomid = parts.slice(1).join("-");

    console.log(`Emitting joinroom for ${username} to room ${userroomid}`);
    socketInstance.emit("joinroom", { username, roomid: userroomid });

    const onJoined = (name) => {
      console.log(`Received joinedmssg for ${name}`);
      toast.success(`${name} has joined the Room`);
    };
    const onLeft = (name) => {
      console.log(`Received leavemssg for ${name}`);
      toast.warning(`${name} has left the Room`);
    };
    const onInput = (mssg) => {
      console.log("Received getInput:", mssg);
      setInput(mssg);
    };
    const onLanguage = (x) => {
      console.log("Received getLanguage:", x);
      setCodeidx(x);
      setCode(returncode(x));
      if (x === 1) setLanguage("C++");
      else if (x === 2) setLanguage("Python");
      else if (x === 3) setLanguage("Javascript");
      else setLanguage("Java");
    };

    socketInstance.on("joinedmssg", onJoined);
    socketInstance.on("leavemssg", onLeft);
    socketInstance.on("getInput", onInput);
    socketInstance.on("getLanguage", onLanguage);

    return () => {
      console.log("Disconnecting socket...");
      socketInstance.off("joinedmssg", onJoined);
      socketInstance.off("leavemssg", onLeft);
      socketInstance.off("getInput", onInput);
      socketInstance.off("getLanguage", onLanguage);
      socketInstance.disconnect();
    };
  }, [user]);

  function changeLanguage(x) {
    setCodeidx(x);
    setCode(returncode(x));
    if (x === 1) setLanguage("C++");
    else if (x === 2) setLanguage("Python");
    else if (x === 3) setLanguage("Javascript");
    else setLanguage("Java");
    if (socket) {
      socket.emit("sendLanguage", x);
    }
  }

  function changeTheme() {
    setTheme((t) => (t === "vs-light" ? "vs-dark" : "vs-light"));
  }

  async function sendCodetoServer() {
    setRunning(true);
    setOutput("Running...");
    try {
      const { data } = await axios.post(`${API_URL}/`, {
        code,
        lang: "cpp",
        input,
      });
      setOutput(data);
    } catch (err) {
      const msg =
        err.response?.data ||
        err.message ||
        "Failed to run code. Is the server running on port 4000?";
      setOutput(String(msg));
      toast.error("Run failed — check server is up");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-50">
      <nav className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200 shadow-sm shadow-slate-100/30 h-[65px] z-10">
        <a href="/" className="flex items-center gap-2 group">
          <Logo className="h-8 w-8 group-hover:rotate-12 transition-transform duration-300" />
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
            CodeSphere
          </span>
        </a>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 active:scale-95 border border-slate-200 rounded-xl transition-all"
            onClick={changeTheme}
          >
            {theme === "vs-light" ? "Dark Mode" : "Light Mode"}
          </button>

          <div className="relative inline-block text-left">
            <button
              type="button"
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 active:scale-95 border border-slate-200 rounded-xl transition-all flex items-center gap-1.5"
              onClick={() => setLangOpen(!langOpen)}
            >
              <span>{language}</span>
              <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {langOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setLangOpen(false)}></div>
                <div className="absolute right-0 mt-2 w-40 rounded-xl bg-white border border-slate-200 shadow-xl z-20 overflow-hidden py-1">
                  <button
                    onClick={() => { changeLanguage(1); setLangOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 active:bg-slate-100 font-medium transition-colors"
                  >
                    C++
                  </button>
                  <button
                    onClick={() => { changeLanguage(2); setLangOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 active:bg-slate-100 font-medium transition-colors"
                  >
                    Python
                  </button>
                  <button
                    onClick={() => { changeLanguage(3); setLangOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 active:bg-slate-100 font-medium transition-colors"
                  >
                    Javascript
                  </button>
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-pink-600 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95 disabled:opacity-50 disabled:scale-100 rounded-xl transition-all"
            onClick={sendCodetoServer}
            disabled={running}
          >
            {running ? "Running..." : "Run Code"}
          </button>
        </div>
      </nav>

      <ToastContainer />

      <div className="flex flex-row h-[calc(100vh-65px)] bg-slate-50 p-4 gap-4">
        <div className="w-2/3 h-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm shadow-slate-100/50">
          <Editor
            theme={theme}
            codeidx={codeidx}
            socket={socket}
            changeCode={setCode}
          />
        </div>
        <div className="w-1/3 h-full flex flex-col gap-4">
          <Input changeInput={setInput} socket={socket} input={input} />
          <Output output={output} />
        </div>
      </div>
    </div>
  );
}

export default Main;
