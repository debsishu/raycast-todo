import { Action, Icon, Keyboard, List } from "@raycast/api";
import { useState } from "react";
import { CompletedTab } from "./components/CompletedTab";
import { ScratchpadForm } from "./components/ScratchpadForm";
import { ScratchpadsTab } from "./components/ScratchpadsTab";
import { TodoTab } from "./components/TodoTab";
import { useScratchpads, useTodos } from "./storage";

const TODOS = "todos";
const COMPLETED = "completed";
const SCRATCHPADS = "scratchpads";

const PLACEHOLDERS: Record<string, string> = {
  [TODOS]: "Search or add a todo…",
  [COMPLETED]: "Search completed…",
  [SCRATCHPADS]: "Search scratchpads…",
};

export default function Command() {
  const todos = useTodos();
  const pads = useScratchpads();
  const [tab, setTab] = useState(TODOS);
  const [searchText, setSearchText] = useState("");

  const switchTab = (value: string) => {
    setTab(value);
    setSearchText("");
  };

  const globalActions = (
    <Action.Push
      title="New Scratchpad"
      icon={Icon.NewDocument}
      shortcut={Keyboard.Shortcut.Common.New}
      target={
        <ScratchpadForm
          onSubmit={async (title, content) => {
            await pads.create(title, content);
            switchTab(SCRATCHPADS);
          }}
        />
      }
    />
  );

  return (
    <List
      isLoading={todos.isLoading || pads.isLoading}
      filtering={false}
      searchText={searchText}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder={PLACEHOLDERS[tab]}
      searchBarAccessory={
        <List.Dropdown tooltip="Switch tab" value={tab} onChange={switchTab}>
          <List.Dropdown.Item title="Todos" value={TODOS} icon={Icon.List} />
          <List.Dropdown.Item title="Completed" value={COMPLETED} icon={Icon.CheckCircle} />
          <List.Dropdown.Item title="Scratchpads" value={SCRATCHPADS} icon={Icon.Document} />
        </List.Dropdown>
      }
    >
      {tab === TODOS && (
        <TodoTab
          store={todos}
          searchText={searchText}
          clearSearch={() => setSearchText("")}
          globalActions={globalActions}
        />
      )}
      {tab === COMPLETED && <CompletedTab store={todos} searchText={searchText} globalActions={globalActions} />}
      {tab === SCRATCHPADS && <ScratchpadsTab store={pads} searchText={searchText} globalActions={globalActions} />}
    </List>
  );
}
