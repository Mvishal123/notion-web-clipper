import { API_URL_V1 } from "@/utils";
import axios from "axios";
import { useEffect, useState } from "react";
import Loader from "./loader";

function App() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  //   const [data, setData] = useState<{ title: string; url: string }>({
  //     title: "",
  //     url: "",
  //   });

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
            const id = res.data.data.id;
            return (window.location.hash = `#/blog/${id}`);
          }
          setIsLoading(false);
          return (window.location.hash = `#/blog/add?title=${title}&url=${encodeURIComponent(
            currentUrl
          )}`);
        }
      );
    }
    init();
  }, []);

  if (isLoading) return <Loader />;
  if (!isLoading) return <div>BLOG PAGE</div>;
}

export default App;
