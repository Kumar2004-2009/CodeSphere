import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { returncode } from "../../utils/defaultcode";

function EditorFun(props) {
  const [curcode, setcurcode] = useState(returncode(props.codeidx));

  useEffect(() => {
    setcurcode(returncode(props.codeidx));
  }, [props.codeidx]);

  useEffect(() => {
    if (!props.socket) return;
    const onCode = (mssg) => {
      setcurcode(mssg);
      props.changeCode(mssg);
    };
    props.socket.on("recivecode", onCode);
    return () => props.socket.off("recivecode", onCode);
  }, [props.socket, props.changeCode]);

  function handleChange(value) {
    props.changeCode(value);
    if (props.socket) {
      props.socket.emit("sendCode", value);
    }
  }

  return (
    <div id="main" style={{ height: "100%" }}>
      <Editor
        height="100%"
        width="100%"
        defaultLanguage="cpp"
        value={curcode}
        theme={props.theme}
        onChange={handleChange}
      />
    </div>
  );
}

export default EditorFun;
