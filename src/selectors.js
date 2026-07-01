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
  // The composer's draft link-unfurl preview card, and its ✕. The ✕ mounts
  // only while the card is hovered, so the remover synthesizes hover first.
  unfurlPreview: ".p-draft_unfurls",
  unfurlRemove: ".p-draft_unfurls__remove_btn_times, .p-draft_unfurls__remove_btn",
};
