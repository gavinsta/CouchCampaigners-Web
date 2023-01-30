import { ChakraProvider } from "@chakra-ui/react";
import TraitMaker from "./traitmaker/TraitMaker";
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import AllApps from "./pages/AllApps";
import ErrorPage from "./pages/ErrorPage";
const router = createBrowserRouter([
  {
    path: "/",
    element: <AllApps />,
    errorElement: <ErrorPage />
  },
  {
    path: "/traitMaker",
    element: <TraitMaker />
  }
], {
  basename: "/assetmaker"
});
function App() {
  return (
    <ChakraProvider>

      <header >Asset Maker</header>
      <RouterProvider router={router} />
    </ChakraProvider>
  );
}

export default App;
