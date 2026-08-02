"use client";

import { format, parseISO } from "date-fns";
import { enUS, fr } from "date-fns/locale";
import { MessageCircle, SendHorizonal } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  useReservationMessages,
  useSendReservationMessage,
} from "@/hooks/useReservationMessages";
import { cn } from "@/lib/utils";

const DATE_FNS_LOCALES = { en: enUS, fr } as const;
const MAX_MESSAGE_LENGTH = 2000;

type ReservationChatDialogProps = {
  reservationId: string;
  boatName: string;
};

export function ReservationChatDialog({
  reservationId,
  boatName,
}: ReservationChatDialogProps) {
  const t = useTranslations("Pages.ProfilePage");
  const locale = useLocale();
  const { data: currentUser } = useCurrentUser();
  const [open, setOpen] = useState(false);
  const [draftMessage, setDraftMessage] = useState("");
  const messageListEndRef = useRef<HTMLDivElement | null>(null);

  const { data: messages = [], isLoading: messagesLoading } =
    useReservationMessages(open ? reservationId : null);
  const sendMessage = useSendReservationMessage();

  const dateFnsLocale =
    DATE_FNS_LOCALES[locale as keyof typeof DATE_FNS_LOCALES] ?? enUS;

  useEffect(() => {
    if (open && messages.length > 0) {
      messageListEndRef.current?.scrollIntoView({ block: "end" });
    }
  }, [open, messages.length]);

  const handleSend = async () => {
    const content = draftMessage.trim();

    if (!currentUser || content.length === 0) {
      return;
    }

    try {
      await sendMessage.mutateAsync({
        reservationId,
        senderId: currentUser.id,
        content,
      });
      setDraftMessage("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("chat_error"));
    }
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button
          className="rounded-md bg-[#1a2b48] text-white hover:bg-[#14213a]"
          size="sm"
          type="button"
        >
          <MessageCircle aria-hidden className="size-4" />
          {t("chat_cta")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("chat_title")}</DialogTitle>
          <DialogDescription>
            {t("chat_description", { boat: boatName })}
          </DialogDescription>
        </DialogHeader>

        <div className="flex h-72 flex-col gap-2 overflow-y-auto rounded-lg border border-neutral-200 bg-[#f7f8fa] p-3">
          {messagesLoading ? (
            <p className="text-sm text-neutral-500">{t("chat_loading")}</p>
          ) : null}

          {!messagesLoading && messages.length === 0 ? (
            <p className="m-auto text-center text-sm text-neutral-500">
              {t("chat_empty")}
            </p>
          ) : null}

          {messages.map((message) => {
            const isMine = message.sender_id === currentUser?.id;

            return (
              <div
                className={cn(
                  "flex max-w-[80%] flex-col gap-0.5",
                  isMine ? "self-end items-end" : "self-start items-start",
                )}
                key={message.id}
              >
                <div
                  className={cn(
                    "rounded-2xl px-3 py-2 text-sm leading-relaxed",
                    isMine
                      ? "rounded-br-sm bg-[#D68A6E] text-white"
                      : "rounded-bl-sm border border-neutral-200 bg-white text-neutral-800",
                  )}
                >
                  {message.content}
                </div>
                <span className="px-1 text-[10px] text-neutral-400">
                  {format(parseISO(message.created_at), "dd MMM, HH:mm", {
                    locale: dateFnsLocale,
                  })}
                </span>
              </div>
            );
          })}
          <div ref={messageListEndRef} />
        </div>

        <form
          className="flex items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSend();
          }}
        >
          <Input
            aria-label={t("chat_input_placeholder")}
            maxLength={MAX_MESSAGE_LENGTH}
            onChange={(event) => setDraftMessage(event.target.value)}
            placeholder={t("chat_input_placeholder")}
            value={draftMessage}
          />
          <Button
            aria-label={t("chat_send")}
            className="shrink-0 bg-[#D68A6E] text-white hover:bg-[#c57d5f]"
            disabled={sendMessage.isPending || draftMessage.trim().length === 0}
            size="icon"
            type="submit"
          >
            <SendHorizonal aria-hidden className="size-4" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
