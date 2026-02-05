import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ConversationList } from "@/components/messages/conversation-list";

export default async function MessagesPage() {
  const t = await getTranslations();
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t("messages.inbox")}</h1>
      </div>

      <ConversationList />
    </div>
  );
}
