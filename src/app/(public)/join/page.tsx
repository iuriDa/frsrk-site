import type { Metadata } from "next";
import { UserPlus } from "lucide-react";
import { ContentPage } from "@/components/ui/content-page";
export const metadata: Metadata = { title: "Вступить в федерацию" };
export default function Page() { return <ContentPage eyebrow="Участие" title="Вступить в федерацию" description="Выберите подходящий формат взаимодействия с федерацией." trail={[{label:"Вступить в федерацию"}]} icon={UserPlus} items={["Спортсмену", "Тренеру", "Судье", "Клубу", "Спортивной школе", "Образовательной организации", "Представителю города или района"]} links={[{label:"Спортсмену",href:"/join/athlete"},{label:"Тренеру",href:"/join/coach"},{label:"Клубу",href:"/join/club"},{label:"Представителю",href:"/join/representative"}]} />; }
