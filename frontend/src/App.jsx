import React, { useState } from "react";
import TickerGallery from "../components/TickerGallery"; 
import Controls from "../components/Controls";
import Footer from "../components/Footer";
import "./styles.css";

export default function App(){
  const [selection, setSelection] = useState([]);
  return (
    <div>
      <header className="header">
        <div className="container">
          <div className="title">Investment Portfolio Optimization</div>
        </div>
      </header>

      <main className="container">
        <div className="grid">
          <TickerGallery selection={selection} setSelection={setSelection} />
          <Controls selection={selection} />
        </div>
      </main>

      <Footer />
    </div>
  );
}