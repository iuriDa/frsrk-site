import type { Metadata } from "next";
import { GraduationCap } from "lucide-react";
import { ContentPage } from "@/components/ui/content-page";
export const metadata: Metadata = { title: "Обучение" };
export default function Page() { return <ContentPage eyebrow="Образовательная система" title="Обучение тренеров и судей" description="Семинары, курсы, аттестации и методические материалы в единой структуре." trail={[{label:"Обучение"}]} icon={GraduationCap} items={["Тренерам", "Судьям", "Семинары", "Курсы", "Аттестации", "Методические материалы"]} links={[{label:"Тренерам",href:"/education/coaches"},{label:"Судьям",href:"/education/judges"},{label:"Семинары",href:"/education/seminars"}]} />; }
