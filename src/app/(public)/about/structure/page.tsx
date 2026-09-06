import { Network } from "lucide-react";
import { ContentPage } from "@/components/ui/content-page";
export default function Page() { return <ContentPage eyebrow="О федерации" title="Структура федерации" description="Органы управления, комиссии и распределение ответственности внутри федерации." trail={[{label:"О федерации",href:"/about"},{label:"Структура"}]} icon={Network} items={["Общее собрание", "Правление", "Исполнительные органы", "Судейская коллегия", "Тренерский совет", "Комиссии"]} />; }
