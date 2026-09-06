import { Video } from "lucide-react";
import { ContentPage } from "@/components/ui/content-page";
export default function Page() { return <ContentPage eyebrow="Медиа" title="Видео" description="Репортажи, трансляции и образовательные видео федерации." trail={[{label:"Медиа",href:"/media"},{label:"Видео"}]} icon={Video} items={["Трансляции", "Репортажи", "Интервью", "Обучающие материалы", "Видео мероприятий"]} />; }
