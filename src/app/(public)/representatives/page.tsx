import type { Metadata } from "next";
import { MapPinned } from "lucide-react";
import { ContentPage } from "@/components/ui/content-page";
export const metadata: Metadata = { title: "Представители" };
export default function Page() { return <ContentPage eyebrow="Города и районы" title="Представители федерации" description="Поиск ответственного представителя федерации по городу или району Республики Крым." trail={[{label:"Представители"}]} icon={MapPinned} items={["Карта Республики Крым", "Поиск по городу", "Поиск по району", "Карточки представителей", "Контакты с согласия", "Статус территории без представителя"]} note="Персональные контакты публикуются только после получения согласия человека." />; }
