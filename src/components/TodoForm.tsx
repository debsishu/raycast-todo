import { Action, ActionPanel, Form, useNavigation } from "@raycast/api";
import { Todo } from "../storage";

export function TodoForm({ todo, onSubmit }: { todo: Todo; onSubmit: (title: string) => void }) {
  const { pop } = useNavigation();

  return (
    <Form
      navigationTitle="Edit Todo"
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Save"
            onSubmit={({ title }: { title: string }) => {
              if (!title.trim()) return;
              onSubmit(title.trim());
              pop();
            }}
          />
        </ActionPanel>
      }
    >
      <Form.TextField id="title" title="Title" defaultValue={todo.title} />
    </Form>
  );
}
