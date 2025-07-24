// ./front/src/components/ui/card/card.stories.tsx
/**
 * Storybook Stories for Card Component
 */

import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardContent, CardTitle, CardDescription } from "./card.ui";

const meta: Meta<typeof Card> = {
  title: "UI/Card",
  component: Card,
  argTypes: {
    variant: {
      control: {
        type: "select",
        options: ["default", "destructive", "success", "warning"],
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    variant: "default",
    children: (
      <>
        <CardContent>
          <CardTitle>Default Card</CardTitle>
          <CardDescription>This is a default card description.</CardDescription>
        </CardContent>
      </>
    ),
  },
};

export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: (
      <>
        <CardContent>
          <CardTitle>Destructive Card</CardTitle>
          <CardDescription>
            This card indicates a destructive action or error.
          </CardDescription>
        </CardContent>
      </>
    ),
  },
};

export const Success: Story = {
  args: {
    variant: "success",
    children: (
      <>
        <CardContent>
          <CardTitle>Success Card</CardTitle>
          <CardDescription>
            This card represents a successful state or message.
          </CardDescription>
        </CardContent>
      </>
    ),
  },
};

export const Warning: Story = {
  args: {
    variant: "warning",
    children: (
      <>
        <CardContent>
          <CardTitle>Warning Card</CardTitle>
          <CardDescription>
            This card warns about a specific condition.
          </CardDescription>
        </CardContent>
      </>
    ),
  },
};
