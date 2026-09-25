import { Action, ActionPanel, Icon, Keyboard, List } from "@raycast/api";
import { ReactNode } from "react";
import { ScratchpadStore } from "../storage";
import { ScratchpadForm } from "./ScratchpadForm";
import { DeleteScratchpadAction, ScratchpadView } from "./ScratchpadView";

type Props = { store: ScratchpadStore; searchText: string; globalActions: ReactNode };

export function ScratchpadsTab({ store, searchText, globalActions }: Props) {
  const query = searchText.trim().toLowerCase();
  const pads = store.pads
    .filter((p) => p.title.toLowerCase().includes(query) || p.content.toLowerCase().includes(query))
    .sort((a, b) => b.updatedAt - a.updatedAt);

  if (pads.length === 0) {
    return (
      <List.EmptyView
        icon={Icon.Document}
        title={query ? "No matches" : "No scratchpads"}
        description={query ? undefined : "Press ⌘N to create one"}
        actions={<ActionPanel>{globalActions}</ActionPanel>}
      />
    );
  }

  return (
    <>
      {pads.map((pad) => (
        <List.Item
          key={pad.id}
          icon={Icon.Document}
          title={pad.title}
          subtitle={pad.content.split("\n").find((line) => line.trim())}
          accessories={[{ date: new Date(pad.updatedAt), tooltip: "Last edited" }]}
          actions={
            <ActionPanel>
              <Action.Push
                title="Open Scratchpad"
                icon={Icon.Eye}
                target={<ScratchpadView pad={pad} store={store} />}
              />
              <Action.Push
                title="Edit Scratchpad"
                icon={Icon.Pencil}
                shortcut={Keyboard.Shortcut.Common.Edit}
                target={<ScratchpadForm pad={pad} onSubmit={(title, content) => store.save(pad.id, title, content)} />}
              />
              <Action.CopyToClipboard
                title="Copy Content"
                content={pad.content}
                shortcut={Keyboard.Shortcut.Common.Copy}
              />
              <DeleteScratchpadAction pad={pad} store={store} />
              {globalActions}
            </ActionPanel>
          }
        />
      ))}
    </>
  );
}
