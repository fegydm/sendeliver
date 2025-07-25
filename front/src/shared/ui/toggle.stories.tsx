// src/components/Toggle.stories.tsx
import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import Toggle, { ToggleProps } from "./toggle.ui";

export default {
  title: "Components/Toggle",
  component: Toggle,
} as Meta;

const Template: StoryFn<ToggleProps> = (args) => <Toggle {...args} />;

export const Default = Template.bind({});
Default.args = {
  initialState: false,
};

export const Checked = Template.bind({});
Checked.args = {
  initialState: true,
};
