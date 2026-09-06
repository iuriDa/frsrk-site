import { ScrollText } from "lucide-react";
import { ContentPage } from "@/components/ui/content-page";
export default function Page() { return <ContentPage eyebrow="Правовая информация" title="Пользовательское соглашение" description="Правила использования сайта и опубликованных материалов." trail={[{label:"Пользовательское соглашение"}]} icon={ScrollText} items={["Общие положения", "Права и обязанности", "Использование материалов", "Ответственность", "Обратная связь"]} />; }
