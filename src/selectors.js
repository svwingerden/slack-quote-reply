export const SELECTORS = {
  message: ".c-message_kit__message",
  listItem: ".c-virtual_list__item",
  sender: ".c-message__sender_button",
  timestamp: "a.c-timestamp",
  body: ".c-message__body",
  richSection: ".p-rich_text_section",
  composer: ".ql-editor",
  primaryPane: ".p-workspace__primary_view",
  threadPane: ".p-flexpane",
  hoverActions: ".c-message_actions__container",
  // Best-guess for the composer's link-unfurl preview remove button — verify
  // against live Slack (inspect the preview's ✕) and adjust if it misses.
  unfurlRemove:
    'button[data-qa="unfurl_preview_delete"], button[aria-label*="Remove attachment" i], button[aria-label*="Remove preview" i]',
};
