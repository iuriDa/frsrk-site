import { Images } from "lucide-react";
import { ContentPage } from "@/components/ui/content-page";
export default function Page() { return <ContentPage eyebrow="Медиа" title="Фотографии" description="Официальные фотогалереи мероприятий федерации." trail={[{label:"Медиа",href:"/media"},{label:"Фотографии"}]} icon={Images} items={["Галереи по годам", "Связь с мероприятиями", "Подписи и авторство", "Согласия на публикацию", "Оптимизированные изображения"]} />; }
