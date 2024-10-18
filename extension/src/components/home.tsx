import { ItemDataType } from "@/types";
import { API_URL_V1 } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import Loader from "./loader";
import { Button } from "./ui/button";

const Home = () => {
  const [filterType, setFilterType] = useState<"All" | "Done" | "Not started">(
    "All"
  );
  const [renderData, setRenderData] = useState<ItemDataType[]>([]);
  const { isPending, data } = useQuery({
    queryKey: ["readingList"],
    queryFn: async () => {
      const res = await axios.get(`${API_URL_V1}/notion/list`);
      setRenderData(res.data.data);
      return res.data.data;
    },
  });

  const filterHandler = (type: "All" | "Done" | "Not started") => {
    if (type === "All") {
      setRenderData(data);
      setFilterType("All");
    } else if (type === "Done") {
      setRenderData(
        data.filter((item: ItemDataType) => item.status === "Done")
      );
      setFilterType("Done");
    } else {
      setRenderData(
        data.filter((item: ItemDataType) => item.status === "Not started")
      );
      setFilterType("Not started");
    }
  };

  if (isPending) return <Loader />;

  return (
    <div className="h-[300px] overflow-auto mt-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <input
            type="radio"
            id="All"
            name="status-filter"
            className="accent-black p-1"
            onChange={() => filterHandler("All")}
            checked={filterType === "All"}
          />
          <label htmlFor="All">All</label>
        </div>
        <div className="flex items-center gap-1">
          <input
            type="radio"
            id="Done"
            name="status-filter"
            className="accent-black p-1"
            onChange={() => filterHandler("Done")}
          />
          <label htmlFor="Done">Done</label>
        </div>
        <div className="flex items-center gap-1">
          <input
            type="radio"
            id="Not started"
            name="status-filter"
            className="accent-black p-1"
            onChange={() => filterHandler("Not started")}
          />
          <label htmlFor="Not started">Not started</label>
        </div>
      </div>
      <div className="space-y-2 mt-3">
        {data && renderData.map((item: ItemDataType) => <Item data={item} />)}
      </div>
    </div>
  );
};

export default Home;

export const Item = ({ data }: { data: ItemDataType }) => {
  return (
    <div className="p-2 flex items-center justify-between rounded bg-slate-50 border-[1px] border-slate-100">
      <div className="flex-1 text-xs font-semibold">{data.title}</div>
      <Button
        variant="outline"
        size="icon"
        onClick={() => {
          window.location.hash = `#/blog/${data.id}`;
        }}
        className="size-5"
      >
        <ArrowUpRight size={3} />
      </Button>
    </div>
  );
};
