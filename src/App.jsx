import "./App.css";
import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import InteractiveBackground from "./InteractiveBackground";

const qrTypes = {
  website: {
    name: "Website",
    label: "Website address",
    placeholder: "https://example.com",
    inputType: "url",
  },

  text: {
    name: "Text",
    label: "Your message",
    placeholder: "Enter your message",
    inputType: "text",
  },

  email: {
    name: "Email",
    label: "Email address",
    placeholder: "name@example.com",
    inputType: "email",
  },

  phone: {
    name: "Phone",
    label: "Phone number",
    placeholder: "+91 98765 43210",
    inputType: "tel",
  },

  wifi: {
    name: "Wi-Fi",
    label: "Wi-Fi details",
    placeholder: "Network name",
    inputType: "text",
  },
};

function App() {
  const [selectedType, setSelectedType] = useState("website");
  const [content, setContent] = useState("");
  const [qrSize, setQrSize] = useState(320);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("qr-lab-theme") === "dark";
  });

  useEffect(() => {
    localStorage.setItem(
      "qr-lab-theme",
      isDarkMode ? "dark" : "light"
    );
  }, [isDarkMode]);

  const currentType = qrTypes[selectedType];

  const qrValue = (() => {
    if (!content.trim()) {
      return "";
    }

    if (selectedType === "email") {
      return `mailto:${content}`;
    }

    if (selectedType === "phone") {
      return `tel:${content}`;
    }

    return content;
  })();

  return (
    <main className={`app ${isDarkMode ? "dark-mode" : ""}`}>
      <InteractiveBackground content={content} />

      {/* ==================== HEADER ==================== */}

      <header className="navbar">
        <div className="brand">
          <a href="/" className="logo">
            QR//LAB
          </a>

          <span className="brand-tag">
            QR DESIGN STUDIO
          </span>
        </div>

        <nav className="nav-links" aria-label="Main navigation">
          <a href="#create" className="nav-link active">
            Create
          </a>

          <a href="#patterns" className="nav-link">
            Patterns
          </a>

          <a href="#recent" className="nav-link">
            Recent
          </a>
        </nav>

        <button
          className="theme-button"
          type="button"
          onClick={() => setIsDarkMode((current) => !current)}
          aria-label={
            isDarkMode
              ? "Switch to light mode"
              : "Switch to dark mode"
          }
        >
          {isDarkMode ? "☀" : "☾"}

          <span className="sr-only">
            {isDarkMode
              ? "Switch to light mode"
              : "Switch to dark mode"}
          </span>
        </button>
      </header>
      {/* ==================== INTRO ==================== */}

      <section className="intro">
        <p className="eyebrow">QR CODE DESIGN STUDIO</p>

        <h1>MAKE IT SCANNABLE.</h1>

        <p className="hero-description">
          Create beautiful QR codes that anyone can use.
        </p>
      </section>

      {/* ==================== QR CREATOR ==================== */}

      <section className="content-section" id="create">
        <div className="content-editor">

          {/* ==================== LEFT SIDE ==================== */}

          <div className="content-controls">

            <div className="section-heading">
              <p className="eyebrow">STEP 01</p>

              <h2>WHAT DO YOU WANT TO SHARE?</h2>
            </div>

            {/* QR TYPE SELECTOR */}

            <div className="type-selector">
              {Object.entries(qrTypes).map(([type, config]) => (
                <button
                  key={type}
                  type="button"
                  className={`type-button ${selectedType === type ? "active" : ""
                    }`}
                  onClick={() => setSelectedType(type)}
                >
                  {config.name}
                </button>
              ))}
            </div>

            {/* CONTENT INPUT */}

            <div className="input-group">
              <label htmlFor="qr-content">
                {currentType.label}
              </label>

              <input
                id="qr-content"
                type={currentType.inputType}
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder={currentType.placeholder}
              />
            </div>

            {/* QR SIZE CONTROL */}

            <div className="design-control">
              <div className="control-header">
                <label htmlFor="qr-size">
                  QR SIZE
                </label>

                <output htmlFor="qr-size">
                  {qrSize}px
                </output>
              </div>

              <input
                id="qr-size"
                type="range"
                min="128"
                max="512"
                step="16"
                value={qrSize}
                onChange={(event) => {
                  setQrSize(Number(event.target.value));
                }}
              />
            </div>

          </div>

          {/* ==================== RIGHT SIDE / PREVIEW ==================== */}

          <div className="content-preview">
            <div className="preview-card">

              <div className="preview-header">
                <span>LIVE PREVIEW</span>

                <span className="status">
                  ● READY
                </span>
              </div>

              <div
                className="qr-placeholder"
                role="img"
                aria-label={
                  qrValue
                    ? `QR code preview for ${currentType.name}`
                    : "QR code preview"
                }
              >
                {qrValue ? (
                  <div
                    className="qr-canvas-wrapper"
                    style={{
                      "--qr-size": `${qrSize}px`,
                    }}
                  >
                    <QRCodeCanvas
                      value={qrValue}
                      size={qrSize}
                      bgColor="#F7F5EF"
                      fgColor="#111111"
                      level="M"
                      includeMargin
                    />
                  </div>
                ) : (
                  <span>QR</span>
                )}
              </div>

              <div className="preview-footer">
                <span>{qrSize}PX</span>

                <span>•</span>

                <span>ERROR M</span>
              </div>

            </div>
          </div>

        </div>
      </section>

    </main>
  );
}

export default App;