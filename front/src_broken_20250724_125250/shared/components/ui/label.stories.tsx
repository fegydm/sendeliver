// ./front/src/components/ui/abel/abel.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Label } from "./abel.ui";

const meta: Meta<typeof Label> = {
  title: "UI/Label",
  component: Label,
  argTypes: {
    variant: {
      control: {
        type: "select",
        options: ["default", "error", "success"],
      },
    },
    htmlFor: {
      control: "text",
    },
    children: {
      control: "text",
    },
  },
};

export default meta;

type Story = StoryObj<typeof Label>;

export const Default: Story = {
  args: {
    variant: "default",
    htmlFor: "example",
    children: "Default Label",
  },
};

export const Error: Story = {
  args: {
    variant: "error",
    htmlFor: "example-error",
    children: "Error Label",
  },
};

export const Success: Story = {
  args: {
    variant: "success",
    htmlFor: "example-success",
    children: "Success Label",
  },
};
