import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Home from "./components/Home/Home";
import Main from "./components/Main/Main";
import { BrowserRouter, Route, Switch } from "react-router-dom";

const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Switch>
        <Route path="/" exact component={Home} />
        <Route path="/ide/:user" exact component={Main} />
      </Switch>
    </BrowserRouter>
  </React.StrictMode>
);
