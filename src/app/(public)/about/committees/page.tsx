import { PanelsTopLeft } from "lucide-react";
import { ContentPage } from "@/components/ui/content-page";
export default function Page() { return <ContentPage eyebrow="О федерации" title="Комиссии" description="Рабочие органы федерации по спортивным, судейским, образовательным и организационным вопросам." trail={[{label:"О федерации",href:"/about"},{label:"Комиссии"}]} icon={PanelsTopLeft} items={["Судейская комиссия", "Тренерско-методическая комиссия", "Комиссия по соревнованиям", "Комиссия по развитию", "Медиа и коммуникации"]} />; }
