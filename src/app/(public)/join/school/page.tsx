import { School } from "lucide-react";
import { ContentPage } from "@/components/ui/content-page";
export default function Page() { return <ContentPage eyebrow="Вступление" title="Школе или образовательной организации" description="Форматы сотрудничества школ с федерацией." trail={[{label:"Вступить",href:"/join"},{label:"Школе"}]} icon={School} items={["Секция в школе", "Фестиваль", "Мастер-класс", "Обучение педагогов", "Соревнования", "Заявка на сотрудничество"]} />; }
