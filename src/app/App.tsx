import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import { RoleProvider } from "@/hooks/useRole";
import { router } from "./router";

export default function App() {
  return (
    <ThemeProvider>
      <RoleProvider>
        <RouterProvider router={router} />
      </RoleProvider>
    </ThemeProvider>
  );
}

