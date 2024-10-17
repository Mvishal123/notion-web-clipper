import { Link, Route, Routes } from "react-router-dom";
import Blog from "./components/blog";
import { buttonVariants } from "./components/ui/button";

import "./App.css";
import EditBlog from "./components/edit-blog";
import Home from "./components/home";
import AddBlog from "./components/add-blog";

const App = () => {
  return (
    <div className="p-3 font-sans">
      <div className="flex items-center justify-between py-2 border-b">
        <h1 className="text-lg font-bold text-slate-800">
          Vishal&apos;s clipper
        </h1>
        <Link
          className={buttonVariants({ size: "sm", variant: "secondary" })}
          to="#/home"
        >
          Home
        </Link>
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
