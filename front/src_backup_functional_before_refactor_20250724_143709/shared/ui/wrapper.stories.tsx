// ./components/ui/wrapper/wrapper.stories.tsx

import { Meta, StoryObj } from "@storybook/react";
import { Wrapper } from "./wrapper.ui";

const meta: Meta<typeof Wrapper> = {
  title: "UI/Wrapper",
  component: Wrapper,
  argTypes: {
    variant: {
      control: {
        type: "select",
        options: ["modal", "drawer", "popup"],
      },
    },
    closeOnOutsideClick: {
      control: "boolean",
    },
    className: {
      control: "text",
    },
    style: {
      control: "object",
    },
  },
};

export default meta;

type Story = StoryObj<typeof Wrapper>;

export const Modal: Story = {
  args: {
    variant: "modal",
    closeOnOutsideClick: true,
    className: "",
    children: (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold">Modal Content</h2>
        <p>This is an example of a modal.</p>
      </div>
    ),
  },
};

export const Drawer: Story = {
  args: {
    variant: "drawer",
    closeOnOutsideClick: true,
    className: "",
    children: (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold">Drawer Content</h2>
        <p>This is an example of a drawer.</p>
      </div>
    ),
  },
};

export const Popup: Story = {
  args: {
    variant: "popup",
    closeOnOutsideClick: true,
    className: "",
    children: (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold">Popup Content</h2>
        <p>This is an example of a popup.</p>
      </div>
    ),
  },
};
