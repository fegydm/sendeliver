// src/components/ui/card/card.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import Card, {
  CardContent,
  CardTitle,
  CardDescription,
} from "./card.component";

const meta = {
  title: "UI/Card",
  component: Card,
  parameters: {
    layout: "centered",
  },
} as Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card>
      <CardContent>
        <CardTitle>Default Card</CardTitle>
        <CardDescription>This is a basic card component</CardDescription>
      </CardContent>
    </Card>
  ),
};

export const Destructive: Story = {
  render: () => (
    <Card variant="destructive">
      <CardContent>
        <CardTitle>Destructive Card</CardTitle>
        <CardDescription>Used for warnings or errors</CardDescription>
      </CardContent>
    </Card>
  ),
};
