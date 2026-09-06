import { Presentation } from "lucide-react";
import { ContentPage } from "@/components/ui/content-page";
export default function Page() { return <ContentPage eyebrow="Обучение" title="Семинары" description="Очные и дистанционные семинары федерации." trail={[{label:"Обучение",href:"/education"},{label:"Семинары"}]} icon={Presentation} items={["Ближайшие семинары", "Архив", "Программа", "Документы", "Регистрация", "Материалы после обучения"]} />; }
