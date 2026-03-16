import { PropsWithChildren } from 'react';
import '@/app.css';
import { Preset } from './presets';
import { ThemeProvider } from './context/ThemeContext';

const App = ({ children }: PropsWithChildren) => {
  return (
    <ThemeProvider>
      <Preset>{children}</Preset>
    </ThemeProvider>
  );
};

export default App;
