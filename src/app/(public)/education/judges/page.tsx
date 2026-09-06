import { Scale } from "lucide-react";
import { ContentPage } from "@/components/ui/content-page";
export default function Page() { return <ContentPage eyebrow="Обучение" title="Судьям" description="Подготовка, аттестация и обновление знаний судей." trail={[{label:"Обучение",href:"/education"},{label:"Судьям"}]} icon={Scale} items={["Курсы подготовки", "Практика судейства", "Аттестации", "Правила и обновления", "Методические материалы"]} />; }
