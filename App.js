import React, { useState, useEffect } from 'react';
import SplashScreen from './src/screens/SplashScreen';
import MainScreen from './src/screens/MainScreen';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // 5 sekúnd zamatovej Larii
    const timer = setTimeout(() => setShowSplash(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Rozhodovacia logika (Mozog appky)
  if (showSplash) {
    return <SplashScreen />;
  }

  return <MainScreen />;
}