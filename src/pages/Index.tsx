import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Dashboard } from "@/components/Dashboard";

const Index = () => {
  const [activeNav, setActiveNav] = useState("dashboard");

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />
      <Dashboard />
    </div>
  );
};

export default Index;
