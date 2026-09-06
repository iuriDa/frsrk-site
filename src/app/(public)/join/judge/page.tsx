import { Scale } from "lucide-react";
import { ContentPage } from "@/components/ui/content-page";
export default function Page() { return <ContentPage eyebrow="Вступление" title="Судье" description="Подготовка и включение в судейскую работу федерации." trail={[{label:"Вступить",href:"/join"},{label:"Судье"}]} icon={Scale} items={["Требования", "Обучение", "Практика", "Аттестация", "Документы"]} />; }
