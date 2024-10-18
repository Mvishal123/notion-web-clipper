import { Route, Routes } from "react-router-dom";
import Blog from "./components/blog";
import { Button } from "./components/ui/button";

import "./App.css";
import AddBlog from "./components/add-blog";
import EditBlog from "./components/edit-blog";
import Home from "./components/home";

const App = () => {
  return (
    <div className="p-3 font-sans">
      <div className="flex items-center justify-between py-2 border-b">
        <h1 className="text-lg font-bold text-slate-800">
          Vishal&apos;s clipper
        </h1>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            window.location.hash = "#/home";
          }}
        >
          Home
        </Button>
      </div>
      <Routes>
        <Route index element={<Blog />} />
        <Route path="/home" element={<Home />} />
        <Route path="/blog/:id" element={<EditBlog />} />
        <Route path="/blog/add" element={<AddBlog />} />
      </Routes>
    </div>
  );
};

export default App;
