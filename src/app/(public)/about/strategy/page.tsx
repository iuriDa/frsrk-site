import { Target } from "lucide-react";
import { ContentPage } from "@/components/ui/content-page";
export default function Page() { return <ContentPage eyebrow="О федерации" title="Стратегия развития" description="Цели и приоритеты развития спортивной скакалки на территории Республики Крым." trail={[{label:"О федерации",href:"/about"},{label:"Стратегия"}]} icon={Target} items={["Массовое вовлечение", "Подготовка сборной", "Развитие клубов", "Обучение тренеров и судей", "Региональные мероприятия", "Цифровая инфраструктура"]} />; }
