import React from "react";

function Input(props) {
  function handleChange(newVal) {
    props.changeInput(newVal.target.value);
    if (props.socket) {
      props.socket.emit("sendInput", newVal.target.value, () =>
        console.log("Input sent")
      );
    }
  }

  return (
    <div className="flex flex-col h-[calc(50%-0.375rem)] bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm shadow-slate-100/30">
      <div className="flex items-center h-[35px] px-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
        <span>Input</span>
      </div>
      <textarea
        className="h-[calc(100%-35px)] w-full p-4 text-sm font-mono text-slate-800 bg-white resize-none outline-none focus:ring-0"
        onChange={handleChange}
        value={props.input}
        placeholder="Type inputs here..."
      ></textarea>
    </div>
  );
}

export default Input;
