import { API_URL_V1 } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { ChangeEvent, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "./ui/button";

const AddBlog = () => {
  const [searchParams, _] = useSearchParams();
  const title = searchParams.get("title") ?? "";
  const url = searchParams.get("url") ?? "";
  const [newTitle, setNewTitle] = useState<string>(title);

  const addBlog = useMutation({
    mutationKey: ["addBlog"],
    mutationFn: async () => {
      const res = await axios.post(`${API_URL_V1}/notion/add`, {
        title: newTitle,
        url,
      });
      console.log({ res });
      return res.data;
    },
    onSuccess: (data) => {
      window.location.hash = `#/blog/${data.id}`;
    },
  });
  return (
    <div>
      <div className="w-full border rounded">
        <input
          type="text"
          placeholder="New title"
          value={title}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setNewTitle(e.target.value)
          }
          className="h-full p-2 w-full border-none focus:outline-none text-lg font-semibold text-slate-700"
        />
      </div>
      <Button size="sm" className="mt-2" onClick={() => addBlog.mutate()}>
        Save
      </Button>
    </div>
  );
};

export default AddBlog;
