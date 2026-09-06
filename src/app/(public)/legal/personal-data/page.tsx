import { FileLock2 } from "lucide-react";
import { ContentPage } from "@/components/ui/content-page";
export default function Page() { return <ContentPage eyebrow="Правовая информация" title="Обработка персональных данных" description="Порядок получения согласий и безопасной обработки данных посетителей сайта." trail={[{label:"Персональные данные"}]} icon={FileLock2} items={["Основания обработки", "Согласие", "Данные несовершеннолетних", "Отзыв согласия", "Защита данных", "Контакты"]} />; }
