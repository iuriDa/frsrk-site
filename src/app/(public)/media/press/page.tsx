import { Newspaper } from "lucide-react";
import { ContentPage } from "@/components/ui/content-page";
export default function Page() { return <ContentPage eyebrow="Медиа" title="СМИ о федерации" description="Публикации, интервью и репортажи о развитии спортивной скакалки в Крыму." trail={[{label:"Медиа",href:"/media"},{label:"СМИ о федерации"}]} icon={Newspaper} items={["Публикации", "Телевизионные сюжеты", "Радиоэфиры", "Интервью", "Ссылки на источники"]} />; }
