import { Building2 } from "lucide-react";
import { ContentPage } from "@/components/ui/content-page";
export default function Page() { return <ContentPage eyebrow="Вступление" title="Клубу" description="Порядок присоединения клуба или секции к работе федерации." trail={[{label:"Вступить",href:"/join"},{label:"Клубу"}]} icon={Building2} items={["Требования к клубу", "Документы", "Ответственное лицо", "Проверка данных", "Публикация в каталоге"]} />; }
