// front/src/components/playground/component-playground.component.tsx
import React from "react";
import GeneralModal from "@/components/modals/general.modal";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card.ui";

interface ComponentPlaygroundProps {
  isOpen: boolean;
  onClose: () => void;
  component: "card" | "button" | "input"; // we can add other components
}

const ComponentPlayground: React.FC<ComponentPlaygroundProps> = ({
  isOpen,
  onClose,
  component,
}) => {
  const renderContent = () => {
    switch (component) {
      case "card":
        return (
          <div className="space-y-8">
            <section>
              <h3 className="text-lg font-semibold mb-4">Default Card</h3>
              <Card>
                <CardContent>
                  <CardTitle>Default Card Title</CardTitle>
                  <CardDescription>Default card description</CardDescription>
                </CardContent>
              </Card>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-4">Destructive Card</h3>
              <Card variant="destructive">
                <CardContent>
                  <CardTitle>Destructive Card Title</CardTitle>
                  <CardDescription>
                    Destructive card description
                  </CardDescription>
                </CardContent>
              </Card>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-4">Success Card</h3>
              <Card variant="success">
                <CardContent>
                  <CardTitle>Success Card Title</CardTitle>
                  <CardDescription>Success card description</CardDescription>
                </CardContent>
              </Card>
            </section>
          </div>
        );
      // Place for next components
      default:
        return <div>Select a component to preview</div>;
    }
  };

  return (
    <GeneralModal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-6">
        <h2 className="text-xl font-bold">
          {component.charAt(0).toUpperCase() + component.slice(1)} Component
          Variants
        </h2>
        {renderContent()}
      </div>
    </GeneralModal>
  );
};

export default ComponentPlayground;
