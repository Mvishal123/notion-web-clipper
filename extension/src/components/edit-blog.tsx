import { API_URL_V1, queryClient } from "@/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Edit, Link2, Loader2, Trash } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Loader from "./loader";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import { ItemDataType } from "@/types";
import { ChangeEvent, useState } from "react";

const EditBlog = () => {
  const { id } = useParams();
  const [editMode, setEditMode] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>("");

  const { data, isPending } = useQuery({
    queryKey: ["blog", id],
    queryFn: async () => {
      const data = await axios.get(`${API_URL_V1}/notion/${id}`);
      return data.data.data;
    },
  });

  const updateData = useMutation({
    mutationKey: ["updateBlog", id],
    mutationFn: async (newData: Partial<ItemDataType>) => {
      const res = await axios.put(`${API_URL_V1}/notion/update/${id}`, {
        newData,
      });
      console.log({ res });

      if (res.data) {
        return res.data;
      }
    },
    onSettled() {
      setEditMode(false);
    },

    async onSuccess(newData) {
      await queryClient.setQueryData(["blog", id], newData);
    },
  });

  const deleteBlog = useMutation({
    mutationKey: ["deleteBlog", id],
    mutationFn: async () => {
      const res = await axios.put(`${API_URL_V1}/notion/delete/${id}`);
      console.log({ res });

      if (res.data) {
        return res.data;
      }
    },
    onSettled() {
      window.location.hash = "#/blog";
    },
  });

  const handleTitleUpdate = () => {
    updateData.mutate({ title: newTitle });
  };

  const handleDeleteBlog = () => {
    deleteBlog.mutate();
  };

  const handleCheckChange = (e: boolean) => {
    const status = e ? "Done" : "Not started";
    updateData.mutate({ status });
  };

  if (isPending) return <Loader />;

  return (
    <div className="py-3 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between ">
          <h2 className="font-bold text-slate-800">Title</h2>
          <Link
            to={data.url}
            target="_blank"
            className="text-text-slate-500 hover:bg-slate-50 p-2 rounded-lg"
          >
            <Link2 className="size-4" />
          </Link>
        </div>
        <div>
          {editMode ? (
            <div>
              <div className="w-full border rounded">
                <input
                  type="text"
                  placeholder="New title"
                  defaultValue={data.title}
                  value={newTitle}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setNewTitle(e.target.value)
                  }
                  className="h-full p-2 w-full border-none focus:outline-none text-lg font-semibold text-slate-700"
                />
              </div>
              <div className="flex items-center gap-4 mt-2">
                <Button
                  size="sm"
                  onClick={handleTitleUpdate}
                  disabled={updateData.isPending}
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setEditMode(false);
                    setNewTitle(data.title);
                  }}
                  disabled={updateData.isPending}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="font-bold text-slate-800 text-xl">{data.title}</p>
          )}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          <Switch
            defaultChecked={data.status === "Done"}
            onCheckedChange={handleCheckChange}
            disabled={updateData.isPending}
            id="status"
          />
          <label className="text-slate-800 font-semibold" htmlFor="status">
            Status
          </label>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setEditMode(true)}>
            <Edit className="size-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDeleteBlog}
            disabled={deleteBlog.isPending}
          >
            {deleteBlog.isPending ? (
              <Loader2 className="size-3 text-red-500 animate-spin" />
            ) : (
              <Trash className="size-3 text-red-500" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditBlog;
