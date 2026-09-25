import { Action, ActionPanel, Form, useNavigation } from "@raycast/api";
import { Scratchpad } from "../storage";

type Values = { title: string; content: string };

export function ScratchpadForm({
  pad,
  onSubmit,
}: {
  pad?: Scratchpad;
  onSubmit: (title: string, content: string) => Promise<void>;
}) {
  const { pop } = useNavigation();

  return (
    <Form
      navigationTitle={pad ? `Edit ${pad.title}` : "New Scratchpad"}
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Save"
            onSubmit={async ({ title, content }: Values) => {
              await onSubmit(title.trim() || "Untitled", content);
              pop();
            }}
          />
        </ActionPanel>
      }
    >
      <Form.TextField id="title" title="Title" placeholder="Untitled" defaultValue={pad?.title} />
      <Form.TextArea
        id="content"
        title="Content"
        placeholder="Write anything (markdown supported)"
        enableMarkdown
        defaultValue={pad?.content}
      />
    </Form>
  );
}
