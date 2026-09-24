import { env } from "@/core/env";
import {
  APP_NAME,
  FRIEND_REQUESTS_INBOX_PATH,
} from "@/features/friends/constants/friends.constants";
import type { IFriendRequestReceivedEmailInput } from "@/features/friends/interfaces/friend-request-email.interface";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function friendRequestInboxUrl(): string {
  return `${env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")}${FRIEND_REQUESTS_INBOX_PATH}`;
}

export function buildFriendRequestReceivedEmailSubject(
  fromName: string,
): string {
  return `${fromName} te envió una solicitud de amistad en ${APP_NAME}`;
}

export function buildFriendRequestReceivedEmailText(
  input: IFriendRequestReceivedEmailInput,
): string {
  const inboxUrl = friendRequestInboxUrl();

  return [
    `Hola,`,
    ``,
    `${input.fromName} (@${input.fromUsername}) te envió una solicitud de amistad en ${APP_NAME}.`,
    ``,
    `Entra a tu bandeja para aceptar o rechazar. Si no conoces a esta persona, puedes rechazar la solicitud.`,
    ``,
    `Ver solicitudes: ${inboxUrl}`,
    ``,
    `— ${APP_NAME}`,
  ].join("\n");
}

export function buildFriendRequestReceivedEmailHtml(
  input: IFriendRequestReceivedEmailInput,
): string {
  const inboxUrl = escapeHtml(friendRequestInboxUrl());
  const fromName = escapeHtml(input.fromName);
  const fromUsername = escapeHtml(input.fromUsername);

  return `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Solicitud de amistad en ${APP_NAME}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f3fafa;font-family:Georgia,'Times New Roman',serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3fafa;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
            <tr>
              <td style="padding:0 8px 20px;text-align:center;">
                <p style="margin:0;font-size:13px;letter-spacing:0.18em;text-transform:uppercase;color:#1f7a7a;font-family:ui-sans-serif,system-ui,sans-serif;">
                  ${APP_NAME}
                </p>
              </td>
            </tr>
            <tr>
              <td style="background-color:#ffffff;border-radius:16px;border:1px solid #d7e8e8;padding:36px 32px;">
                <p style="margin:0 0 8px;font-size:13px;color:#5b6b6b;font-family:ui-sans-serif,system-ui,sans-serif;">
                  Nueva solicitud de amistad
                </p>
                <h1 style="margin:0 0 20px;font-size:26px;line-height:1.25;color:#163333;font-weight:normal;">
                  ${fromName} quiere agregarte
                </h1>
                <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#2c3d3d;">
                  Recibiste una solicitud de
                  <strong>${fromName}</strong>
                  <span style="color:#5b6b6b;">(@${fromUsername})</span>
                  en ${APP_NAME}.
                </p>
                <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#5b6b6b;">
                  Entra a tu bandeja para aceptar o rechazar. Si no reconoces a esta persona, puedes rechazarla sin problema.
                </p>
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="border-radius:10px;background-color:#1f7a7a;">
                      <a href="${inboxUrl}" style="display:inline-block;padding:14px 22px;font-family:ui-sans-serif,system-ui,sans-serif;font-size:15px;font-weight:600;color:#f7fffe;text-decoration:none;">
                        Ver solicitudes
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin:24px 0 0;font-size:12px;line-height:1.5;color:#7a8a8a;font-family:ui-sans-serif,system-ui,sans-serif;">
                  Si el botón no funciona, copia este enlace:<br />
                  <a href="${inboxUrl}" style="color:#1f7a7a;word-break:break-all;">${inboxUrl}</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 8px 0;text-align:center;">
                <p style="margin:0;font-size:12px;line-height:1.5;color:#7a8a8a;font-family:ui-sans-serif,system-ui,sans-serif;">
                  Este correo es solo informativo. No respondas a este mensaje.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
