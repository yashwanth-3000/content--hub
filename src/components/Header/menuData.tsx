import { Menu } from "@/types/menu";

const menuData: Menu[] = [
  {
    id: 1,
    title: "Home",
    path: "/",
    newTab: false,
  },
  {
    id: 2,
    title: "Github",
    path: "https://github.com/yashwanth-3000/tweet-synth",
    newTab: true,
  },
  {
    id: 4,
    title: "Gallery",
    path: "/gallery",
    newTab: true,
  },
  {
    id: 3,
    title: "About",
    path: "/about",
    newTab: false,
  },
  {
    id: 5,
    title: "Lablab.ai",
    path: "https://dev.to/yashwanth_krishna_6b86250/tweetsynth-ai-agents-powered-tweets-that-sound-like-you-3lfg",
    newTab: true,
  },
];
export default menuData;
