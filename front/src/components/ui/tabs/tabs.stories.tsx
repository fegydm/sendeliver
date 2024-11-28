// ./front/src/components/ui/tabs/tabs.stories.tsx
import React from "react";
import { Meta, Story } from "@storybook/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./index";

const meta: Meta = {
  title: "UI/Tabs",
  component: Tabs,
};

export default meta;

export const Default: Story = () => (
  <Tabs defaultValue="tab1">
    <TabsList>
      <TabsTrigger value="tab1">Tab 1</TabsTrigger>
      <TabsTrigger value="tab2">Tab 2</TabsTrigger>
      <TabsTrigger value="tab3">Tab 3</TabsTrigger>
    </TabsList>
    <TabsContent value="tab1">Content for Tab 1</TabsContent>
    <TabsContent value="tab2">Content for Tab 2</TabsContent>
    <TabsContent value="tab3">Content for Tab 3</TabsContent>
  </Tabs>
);
