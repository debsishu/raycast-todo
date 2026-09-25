import { Action, ActionPanel, Alert, Detail, Icon, Keyboard, confirmAlert, useNavigation } from "@raycast/api";
import { useState } from "react";
import { Scratchpad, ScratchpadStore } from "../storage";
import { ScratchpadForm } from "./ScratchpadForm";

// Pushed full-width view of one pad. Pushed views don't re-render from the parent's state,
// so it keeps its own copy of the pad and updates it alongside the store on edit.
export function ScratchpadView({ pad: initial, store }: { pad: Scratchpad; store: ScratchpadStore }) {
  const [pad, setPad] = useState(initial);
  const { pop } = useNavigation();

  return (
    <Detail
      navigationTitle={pad.title}
      markdown={pad.content || "_Empty — press ↵ to edit_"}
      actions={
        <ActionPanel>
          <Action.Push
            title="Edit Scratchpad"
            icon={Icon.Pencil}
            target={
              <ScratchpadForm
                pad={pad}
                onSubmit={async (title, content) => {
                  setPad({ ...pad, title, content, updatedAt: Date.now() });
                  await store.save(pad.id, title, content);
                }}
              />
            }
          />
          <Action.CopyToClipboard title="Copy Content" content={pad.content} shortcut={Keyboard.Shortcut.Common.Copy} />
          <DeleteScratchpadAction pad={pad} store={store} onDeleted={pop} />
        </ActionPanel>
      }
    />
  );
}

export function DeleteScratchpadAction({
  pad,
  store,
  onDeleted,
}: {
  pad: Scratchpad;
  store: ScratchpadStore;
  onDeleted?: () => void;
}) {
  return (
    <Action
      title="Delete Scratchpad"
      icon={Icon.Trash}
      style={Action.Style.Destructive}
      shortcut={{ modifiers: ["ctrl"], key: "x" }}
      onAction={async () => {
        if (
          await confirmAlert({
            title: `Delete “${pad.title}”?`,
            message: "This can't be undone.",
            primaryAction: { title: "Delete", style: Alert.ActionStyle.Destructive },
          })
        ) {
          await store.remove(pad.id);
          onDeleted?.();
        }
      }}
    />
  );
}
