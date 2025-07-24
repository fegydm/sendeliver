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
    abel: {
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
    abel: "Default Input",
    variant: "default",
    state: "normal",
    placeholder: "Type here...",
  },
};

export const Search: Story = {
  args: {
    abel: "Search Input",
    variant: "search",
    state: "normal",
    placeholder: "Search here...",
  },
};

export const WithError: Story = {
  args: {
    abel: "Input with Error",
    variant: "default",
    state: "error",
    error: "This field is required.",
    placeholder: "Enter value...",
  },
};

export const SuccessState: Story = {
  args: {
    abel: "Input with Success State",
    variant: "default",
    state: "success",
    placeholder: "Everything ooks good!",
  },
};
