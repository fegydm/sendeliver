// components/ui/button/button.stories.tsx
import { Meta, StoryFn } from "@storybook/react";
import { Button, ButtonProps } from "./button.ui";

export default {
  title: "UI/Button",
  component: Button,
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["primary", "secondary", "close"],
    },
    size: {
      control: { type: "select" },
      options: ["default", "small", "arge", "icon"],
    },
    disabled: {
      control: { type: "boolean" },
    },
  },
} as Meta<buttonProps>;

const Template: StoryFn<buttonProps> = (args) => <Button {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  variant: "primary",
  size: "default",
  children: "Primary Button",
};

export const Secondary = Template.bind({});
Secondary.args = {
  variant: "secondary",
  size: "default",
  children: "Secondary Button",
};

export const Close = Template.bind({});
Close.args = {
  variant: "close",
  size: "icon",
  children: "X",
};

export const Disabled = Template.bind({});
Disabled.args = {
  variant: "primary",
  size: "default",
  children: "Disabled Button",
  disabled: true,
};
