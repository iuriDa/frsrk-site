import { PersonStanding } from "lucide-react";
import { ContentPage } from "@/components/ui/content-page";
export default function Page() { return <ContentPage eyebrow="Вступление" title="Спортсмену" description="Информация о порядке участия спортсмена в деятельности федерации." trail={[{label:"Вступить",href:"/join"},{label:"Спортсмену"}]} icon={PersonStanding} items={["Требования", "Необходимые документы", "Согласия", "Порядок рассмотрения", "Контакты"]} />; }
