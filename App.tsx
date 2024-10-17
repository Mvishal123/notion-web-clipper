import axios from "axios";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import "./App.css";
import { ItemDataType } from "./types";
import { API_URL_V1 } from "./utils";

function App() {
  const [isPresent, setIsPresent] = useState<boolean>(false);
  const [data, setData] = useState<ItemDataType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // const { isLoading, data: listData } = useQuery({
  //   queryKey: ["list"],
  //   queryFn: async () => {
  //     const res = await axios.get(`${API_URL_V1}/notion/list`);
  //     return res.data;
  //   },
  // });

  useEffect(() => {
    async function init() {
      await chrome.tabs.query(
        {
          active: true,
          currentWindow: true,
        },
        async (tabs) => {
          const currentTab = tabs[0];
          const currentUrl = currentTab.url;
          const title = currentTab.title;

          if (!currentTab || !currentUrl) return;

          const res = await axios.get(`${API_URL_V1}/notion`, {
            params: {
              url: encodeURIComponent(currentUrl ?? ""),
            },
          });

          if (res?.data?.data?.present) {
            setIsPresent(true);
            setData({
              id: res.data.data.id,
              title: title,
              url: currentUrl,
              status: res.data.data.status,
            } as ItemDataType);
          }

          setIsLoading(false);
        }
      );
    }
    init();
  }, []);

  console.log({ isPresent, data });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (isPresent) {
    return (
      <div>
        <h2 className="text-lg font-semibold">{data?.title}</h2>
        <div className="">
          <div>Status</div>
          <input
            type="checkbox"
            checked={data?.status === "Done"}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              if (e.target.checked) {
              }
            }}
          />
        </div>
      </div>
    );
  }

  return <div className="">{JSON.stringify(data)}</div>;
}

export default App;
