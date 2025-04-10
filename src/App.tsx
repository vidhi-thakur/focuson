import Todo from "./components/Todo";
import "./App.css";
// import { useState } from "react";
// import Setting from "./components/Setting";

function App() {
  // const [isSettingOpen, setIsSettingOpen] = useState<boolean>(false);
  // const redirectToSetting = (): void => {
  //   setIsSettingOpen(true);
  // }
  // const handleBack = (): void => {
  //   setIsSettingOpen(false);
  // }
  return (
    <div className="App">
      {/* {isSettingOpen ? <Setting handleBack={handleBack} /> : <Todo redirectToSetting={redirectToSetting} />} */}

      <Todo redirectToSetting={() => { }} />
    </div>
  );
}

export default App;
