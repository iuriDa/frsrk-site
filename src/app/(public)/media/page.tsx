import type { Metadata } from "next";
import { Camera } from "lucide-react";
import { ContentPage } from "@/components/ui/content-page";
export const metadata: Metadata = { title: "Медиа" };
export default function Page() { return <ContentPage eyebrow="Медиа" title="Фото, видео и СМИ" description="Медиатека федерации без отдельного публичного раздела «Фирменные материалы»." trail={[{label:"Медиа"}]} icon={Camera} items={["Фотографии", "Видео", "СМИ о федерации", "Для СМИ — после утверждения материалов"]} links={[{label:"Фотографии",href:"/media/photos"},{label:"Видео",href:"/media/videos"},{label:"СМИ о федерации",href:"/media/press"}]} />; }
