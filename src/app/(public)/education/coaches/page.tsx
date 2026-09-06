import { Dumbbell } from "lucide-react";
import { ContentPage } from "@/components/ui/content-page";
export default function Page() { return <ContentPage eyebrow="Обучение" title="Тренерам" description="Профессиональное развитие тренеров спортивной скакалки." trail={[{label:"Обучение",href:"/education"},{label:"Тренерам"}]} icon={Dumbbell} items={["Базовые курсы", "Повышение квалификации", "Практические семинары", "Методические материалы", "Календарь обучения"]} />; }
