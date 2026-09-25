import { Action, ActionPanel, Alert, Icon, List, Toast, confirmAlert, showToast, Keyboard } from "@raycast/api";
import { ReactNode } from "react";
import { TodoStore } from "../storage";
import { TodoForm } from "./TodoForm";

type Props = { store: TodoStore; searchText: string; clearSearch: () => void; globalActions: ReactNode };

export function TodoTab({ store, searchText, clearSearch, globalActions }: Props) {
  const query = searchText.trim();
  const open = store.todos.filter((t) => !t.completedAt && t.title.toLowerCase().includes(query.toLowerCase()));

  const addTodo = async () => {
    await store.add(query);
    clearSearch();
  };

  const markDone = async (id: string) => {
    await store.complete(id);
    await showToast({
      style: Toast.Style.Success,
      title: "Marked done",
      primaryAction: { title: "Undo", onAction: (toast) => (store.reopen(id), toast.hide()) },
    });
  };

  return (
    <>
      {query && (
        <List.Item
          icon={Icon.PlusCircle}
          title={`Add “${query}”`}
          actions={
            <ActionPanel>
              <Action title="Add Todo" icon={Icon.Plus} onAction={addTodo} />
              {globalActions}
            </ActionPanel>
          }
        />
      )}
      {open.length === 0 && !query && (
        <List.EmptyView
          icon={Icon.CheckList}
          title="No todos"
          description="Type in the search bar and press ↵ to add one"
          actions={<ActionPanel>{globalActions}</ActionPanel>}
        />
      )}
      {open.map((todo) => (
        <List.Item
          key={todo.id}
          icon={Icon.Circle}
          title={todo.title}
          accessories={[{ date: new Date(todo.createdAt), tooltip: "Created" }]}
          actions={
            <ActionPanel>
              <Action title="Mark Done" icon={Icon.CheckCircle} onAction={() => markDone(todo.id)} />
              <Action.Push
                title="Edit Todo"
                icon={Icon.Pencil}
                shortcut={Keyboard.Shortcut.Common.Edit}
                target={<TodoForm todo={todo} onSubmit={(title) => store.rename(todo.id, title)} />}
              />
              <Action.CopyToClipboard title="Copy Title" content={todo.title} />
              <Action
                title="Delete Todo"
                icon={Icon.Trash}
                style={Action.Style.Destructive}
                shortcut={{ modifiers: ["ctrl"], key: "x" }}
                onAction={async () => {
                  if (
                    await confirmAlert({
                      title: "Delete todo?",
                      message: todo.title,
                      primaryAction: { title: "Delete", style: Alert.ActionStyle.Destructive },
                    })
                  )
                    await store.remove([todo.id]);
                }}
              />
              {globalActions}
            </ActionPanel>
          }
        />
      ))}
    </>
  );
}
