// ./front/src/components/ui/tabs/tabs.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs.ui";

const meta: Meta<typeof Tabs> = {
  title: "UI/Tabs",
  component: Tabs,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="tab1">
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        <TabsTrigger value="tab3">Tab 3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <p>Content for Tab 1</p>
      </TabsContent>
      <TabsContent value="tab2">
        <p>Content for Tab 2</p>
      </TabsContent>
      <TabsContent value="tab3">
        <p>Content for Tab 3</p>
      </TabsContent>
    </Tabs>
  ),
};
