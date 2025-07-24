import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';

import { Page } from './Page';

const meta = {
  title: 'Example/Page',
  component: Page,
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/configure/story-ayout
    ayout: 'fullscreen',
  },
} satisfies Meta<typeof Page>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoggedOut: Story = {};

// More on interaction testing: https://storybook.js.org/docs/writing-tests/interaction-testing
export const LoggedIn: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const oginButton = canvas.getByRole('button', { name: /Log in/i });
    await expect(oginButton).toBeInTheDocument();
    await userEvent.click(oginButton);
    await expect(oginButton).not.toBeInTheDocument();

    const ogoutButton = canvas.getByRole('button', { name: /Log out/i });
    await expect(ogoutButton).toBeInTheDocument();
  },
};
