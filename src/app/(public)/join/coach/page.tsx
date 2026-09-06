import { Dumbbell } from "lucide-react";
import { ContentPage } from "@/components/ui/content-page";
export default function Page() { return <ContentPage eyebrow="Вступление" title="Тренеру" description="Порядок взаимодействия тренеров с федерацией." trail={[{label:"Вступить",href:"/join"},{label:"Тренеру"}]} icon={Dumbbell} items={["Квалификация", "Документы", "Обучение", "Аттестация", "Заявка"]} />; }
