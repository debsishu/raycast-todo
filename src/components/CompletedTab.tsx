import { Action, ActionPanel, Alert, Icon, List, confirmAlert } from "@raycast/api";
import { ReactNode } from "react";
import { Todo, TodoStore } from "../storage";

type Props = { store: TodoStore; searchText: string; globalActions: ReactNode };

function dayKey(ts: number) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function dayTitle(ts: number) {
  const now = new Date();
  if (dayKey(ts) === dayKey(now.getTime())) return "Today";
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  if (dayKey(ts) === dayKey(yesterday.getTime())) return "Yesterday";
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: d.getFullYear() === now.getFullYear() ? undefined : "numeric",
  });
}

export function CompletedTab({ store, searchText, globalActions }: Props) {
  const query = searchText.trim().toLowerCase();
  const done = store.todos
    .filter((t): t is Todo & { completedAt: number } => !!t.completedAt && t.title.toLowerCase().includes(query))
    .sort((a, b) => b.completedAt - a.completedAt);

  // Already sorted newest-first, so days come out in order.
  const days = new Map<string, typeof done>();
  for (const todo of done) {
    const key = dayKey(todo.completedAt);
    days.set(key, [...(days.get(key) ?? []), todo]);
  }

  if (done.length === 0) {
    return (
      <List.EmptyView
        icon={Icon.CheckCircle}
        title={query ? "No matches" : "Nothing completed yet"}
        actions={<ActionPanel>{globalActions}</ActionPanel>}
      />
    );
  }

  return (
    <>
      {[...days.values()].map((todos) => {
        const title = dayTitle(todos[0].completedAt);
        return (
          <List.Section key={title} title={title} subtitle={`${todos.length}`}>
            {todos.map((todo) => (
              <List.Item
                key={todo.id}
                icon={{ source: Icon.CheckCircle, tintColor: "#34C759" }}
                title={todo.title}
                accessories={[
                  {
                    text: new Date(todo.completedAt).toLocaleTimeString(undefined, {
                      hour: "numeric",
                      minute: "2-digit",
                    }),
                    tooltip: "Completed",
                  },
                ]}
                actions={
                  <ActionPanel>
                    <Action title="Mark Not Done" icon={Icon.Circle} onAction={() => store.reopen(todo.id)} />
                    <Action.CopyToClipboard title="Copy Title" content={todo.title} />
                    <Action
                      title="Delete Todo"
                      icon={Icon.Trash}
                      style={Action.Style.Destructive}
                      shortcut={{ modifiers: ["ctrl"], key: "x" }}
                      onAction={() => store.remove([todo.id])}
                    />
                    <Action
                      title={`Delete All from ${title}`}
                      icon={Icon.Trash}
                      style={Action.Style.Destructive}
                      shortcut={{ modifiers: ["ctrl", "shift"], key: "x" }}
                      onAction={async () => {
                        if (
                          await confirmAlert({
                            title: `Delete ${todos.length} completed todo(s) from ${title}?`,
                            primaryAction: { title: "Delete", style: Alert.ActionStyle.Destructive },
                          })
                        )
                          await store.remove(todos.map((t) => t.id));
                      }}
                    />
                    {globalActions}
                  </ActionPanel>
                }
              />
            ))}
          </List.Section>
        );
      })}
    </>
  );
}
