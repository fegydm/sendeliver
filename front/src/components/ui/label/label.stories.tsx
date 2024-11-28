// ./front/src/components/ui/label/label.stories.tsx
import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { Label } from "./label.ui";

export default {
  title: "Components/Label",
  component: Label,
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "error", "success"],
    },
    children: {
      control: "text",
      defaultValue: "Sample Label",
    },
  },
} as Meta;

const Template: StoryFn<typeof Label> = (args) => <Label {...args} />;

export const Default = Template.bind({});
Default.args = {
  variant: "default",
};

export const Error = Template.bind({});
Error.args = {
  variant: "error",
};

export const Success = Template.bind({});
Success.args = {
  variant: "success",
};
