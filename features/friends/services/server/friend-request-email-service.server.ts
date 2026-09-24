import { sendEmail } from "@/core/email/send-email";
import type { IFriendRequestReceivedEmailInput } from "@/features/friends/interfaces/friend-request-email.interface";
import {
  buildFriendRequestReceivedEmailHtml,
  buildFriendRequestReceivedEmailSubject,
  buildFriendRequestReceivedEmailText,
} from "@/features/friends/utils/friend-request-email.utils";

export async function sendFriendRequestReceivedEmail(
  input: IFriendRequestReceivedEmailInput,
): Promise<void> {
  await sendEmail({
    to: input.toEmail,
    subject: buildFriendRequestReceivedEmailSubject(input.fromName),
    html: buildFriendRequestReceivedEmailHtml(input),
    text: buildFriendRequestReceivedEmailText(input),
  });
}
