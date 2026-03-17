import { lazy, Suspense } from "react";
import "./App.css";
import Chatbot from "./components/Chatbot";

const CharacterModel = lazy(() => import("./components/Character"));
const MainContainer = lazy(() => import("./components/MainContainer"));
import { LoadingProvider } from "./context/LoadingProvider";

const App = () => {
  return (
    <>
      <LoadingProvider>
        <Suspense>
          <MainContainer>
            <Suspense>
              <CharacterModel />
            </Suspense>
          </MainContainer>
          <Chatbot />
        </Suspense>
      </LoadingProvider>
    </>
  );
};

export default App;
