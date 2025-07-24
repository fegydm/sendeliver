// ./front/src/components/ui/input/input.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./input.ui";

const meta: Meta<typeof Input> = {
  title: "UI/Input",
  component: Input,
  argTypes: {
    variant: {
      control: {
        type: "select",
        options: ["default", "search"],
      },
    },
    state: {
      control: {
        type: "select",
        options: ["normal", "error", "success"],
      },
    },
    label: {
      control: "text",
    },
    error: {
      control: "text",
    },
    placeholder: {
      control: "text",
    },
  },
};

export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    label: "Default Input",
    variant: "default",
    state: "normal",
    placeholder: "Type here...",
  },
};

export const Search: Story = {
  args: {
    label: "Search Input",
    variant: "search",
    state: "normal",
    placeholder: "Search here...",
  },
};

export const WithError: Story = {
  args: {
    label: "Input with Error",
    variant: "default",
    state: "error",
    error: "This field is required.",
    placeholder: "Enter value...",
  },
};

export const SuccessState: Story = {
  args: {
    label: "Input with Success State",
    variant: "default",
    state: "success",
    placeholder: "Everything looks good!",
  },
};
