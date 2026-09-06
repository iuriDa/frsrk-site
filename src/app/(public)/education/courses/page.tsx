import { BookOpen } from "lucide-react";
import { ContentPage } from "@/components/ui/content-page";
export default function Page() { return <ContentPage eyebrow="Обучение" title="Курсы" description="Образовательные программы для специалистов федерации." trail={[{label:"Обучение",href:"/education"},{label:"Курсы"}]} icon={BookOpen} items={["Каталог курсов", "Программа", "Формат обучения", "Требования", "Регистрация", "Итоговая аттестация"]} />; }
