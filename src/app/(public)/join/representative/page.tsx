import { MapPinned } from "lucide-react";
import { ContentPage } from "@/components/ui/content-page";
export default function Page() { return <ContentPage eyebrow="Вступление" title="Стать представителем" description="Порядок подачи кандидатуры представителя федерации в городе или районе." trail={[{label:"Вступить",href:"/join"},{label:"Представителю"}]} icon={MapPinned} items={["Требования", "Территория ответственности", "Документы", "Собеседование", "Решение федерации"]} />; }
