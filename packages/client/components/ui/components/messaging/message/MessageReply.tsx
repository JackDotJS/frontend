import { BiSolidFile } from "solid-icons/bi";
import { Match, Switch } from "solid-js";
import { Show } from "solid-js";
import { styled as styledL } from "solid-styled-components";

import type { Message } from "revolt.js";
import { styled } from "styled-system/jsx";

import { useTranslation } from "@revolt/i18n";
import { TextWithEmoji } from "@revolt/markdown";

import {
  Avatar,
  ColouredText,
  NonBreakingText,
  OverflowingText,
} from "../../design";
import {
  Typography,
  generateTypographyCSS,
} from "../../design/atoms/display/Typography";

interface Props {
  /**
   * Message that was replied to
   */
  message?: Message;

  /**
   * Whether it was mentioned
   */
  mention?: boolean;

  /**
   * Whether to hide the left side reply indicator
   */
  noDecorations?: boolean;
}

export const Base = styledL("div", "Reply") <Pick<Props, "noDecorations">>`
  min-width: 0;
  flex-grow: 1;
  display: flex;
  user-select: none;
  align-items: center;

  margin-inline-end: ${(props) => (props.noDecorations ? "0" : "12px")};
  margin-inline-start: ${(props) => (props.noDecorations ? "0" : "30px")};

  ${(props) => generateTypographyCSS(props.theme!, "reply")}

  gap: ${(props) => props.theme!.gap.md};

  a:link {
    text-decoration: none;
  }

  &::before {
    display: ${(props) => (props.noDecorations ? "none" : "block")};

    content: "";
    width: 22px;
    height: 8px;

    flex-shrink: 0;
    align-self: flex-end;

    border-inline-start: 2px solid var(--unset-bg);
    border-top: 2px solid var(--unset-bg);
  }
`;

const Attachments = styledL.em`
  display: inline-flex;
  align-items: center;
  gap: ${(props) => props.theme!.gap.sm};
  color: var(--unset-fg);
  white-space: nowrap;
`;

/**
 * Information text
 */
const InfoText = styledL.a`
  color: var(--unset-fg);
`;

/**
 * Hidden text to improve copying
 */
const HiddenCopyText = styledL.span`
  user-select: text;
  opacity: 0;
  position: absolute;
`;

/**
 * Link styling
 */
const Link = styled("a", {
  base: {
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    gap: "var(--gap-md)",
  },
});

/**
 * Message being replied to
 */
export function MessageReply(props: Props) {
  const t = useTranslation();

  /**
   * Generates hidden text string for copying
   * TODO: needs i18n
   */
  const getHiddenText = () => {
    if (props.message == null) return "";

    if (props.message.author && props.message.author.relationship === "Blocked") {
      return "Replying to blocked user";
    }

    const strComponents = [
      t("app.main.channel.reply.replying") + " " + props.message!.username + ":",
    ];

    if (props.message.attachments) {
      const attString = props.message!.attachments!.length > 1
        ? t("app.main.channel.misc.sent_multiple_files")
        : t("app.main.channel.misc.sent_file");

      strComponents.push("[" + attString + "]");
    }

    if (props.message!.content) {
      strComponents.push(props.message!.content!)
    }

    // backup option if there's no text content or attachments
    if (strComponents.length === 1) {
      strComponents.push(`<empty>`);
    }

    return strComponents.join(" ");
  }

  return (
    <Base noDecorations={props.noDecorations}>
      <HiddenCopyText>
        {getHiddenText()}
        <br />
      </HiddenCopyText>
      <Switch
        fallback={<InfoText>{t("app.main.channel.misc.not_loaded")}</InfoText>}
      >
        <Match when={props.message?.author?.relationship === "Blocked"}>
          {t("app.main.channel.misc.blocked_user")}
        </Match>
        <Match when={props.message}>
          <Avatar src={props.message!.avatarURL} size={14} />
          <NonBreakingText>
            <ColouredText
              colour={props.message!.roleColour!}
              clip={props.message!.roleColour?.includes("gradient")}
            >
              <Typography variant="username">
                {props.mention && "@"}
                {props.message!.username}
              </Typography>
            </ColouredText>
          </NonBreakingText>
          <Link href={props.message!.path}>
            <Show when={props.message!.attachments}>
              <Attachments>
                <BiSolidFile size={16} />
                {props.message!.attachments!.length > 1
                  ? t("app.main.channel.misc.sent_multiple_files")
                  : t("app.main.channel.misc.sent_file")}
              </Attachments>
            </Show>
            <Show when={props.message!.content}>
              <OverflowingText>
                <TextWithEmoji content={props.message!.content!} />
              </OverflowingText>
            </Show>
          </Link>
        </Match>
      </Switch>
    </Base>
  );
}
