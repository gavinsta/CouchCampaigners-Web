import { useNavigate, useRouteError } from "react-router-dom";
import { Button } from "@chakra-ui/react";
export default function ErrorPage() {
  const error: any = useRouteError();
  console.error(error);
  const navigate = useNavigate();
  return (
    <div>
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>{error.statusText || error.message}</i>
      </p>
      <Button onClick={() => {
        navigate("/")
      }}>
        Back to Main Page
      </Button>
    </div>
  );
}