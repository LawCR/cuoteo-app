import { Resend } from "resend";
import { env } from "@/core/env";
import { ExternalServiceError } from "@/core/errors/external-service.error";
import type { ISendEmailInput } from "@/core/email/send-email.interface";

const resend = new Resend(env.RESEND_API_KEY);

function toExternalServiceError(error: unknown): ExternalServiceError {
  if (error instanceof ExternalServiceError) {
    return error;
  }

  const message = error instanceof Error ? error.message : "unknown";
  return new ExternalServiceError("resend", message, { cause: error });
}

export async function sendEmail(input: ISendEmailInput): Promise<void> {
  try {
    const { data, error } = await resend.emails.send({
      from: `Cuoteo <${env.RESEND_FROM_EMAIL}>`,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });

    if (error) {
      throw new ExternalServiceError("resend", error.message);
    }

    if (!data) {
      throw new ExternalServiceError("resend", "empty_response");
    }
  } catch (error: unknown) {
    throw toExternalServiceError(error);
  }
}
