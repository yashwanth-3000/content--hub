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
    path: "https://github.com/yashwanth-3000/content--hub",
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
    path: "https://lablab.ai/event/generative-ai-hackathon-with-ibm-granite/content-hub/content-hub",
    newTab: true,
  },
];
export default menuData;
