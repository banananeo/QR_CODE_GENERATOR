import "./App.css";
import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
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

    <main className="app">

      {/* Header */}
      <header className="navbar">
        <a href="/" className="logo">
          QR//LAB
        </a>

        <nav className="nav-links" aria-label="Main navigation">
          <a href="#create">Create</a>
          <a href="#recent">Recent</a>
        </nav>

        <button className="theme-button" type="button">
          ◐
          <span className="sr-only">Toggle theme</span>
        </button>
      </header>


      {/* Hero */}
      <section className="intro">
        <p className="eyebrow">QR CODE DESIGN STUDIO</p>

        <h1>MAKE IT SCANNABLE.</h1>

        <p className="hero-description">
          Create beautiful QR codes that anyone can use.
        </p>
      </section>


      {/* Content */}
      <section className="content-section" id="create">
        <div className="content-editor">
          <div className="content-controls">
            <div className="section-heading">
              <p className="eyebrow">STEP 01</p>
              <h2>WHAT DO YOU WANT TO SHARE?</h2>
            </div>

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

            <div className="input-group">
              <label htmlFor="qr-content">{currentType.label}</label>

              <input
                id="qr-content"
                type={currentType.inputType}
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder={currentType.placeholder}
              />
            </div>
          </div>

          <div className="content-preview">
            <div className="preview-card">
              <div className="preview-header">
                <span>LIVE PREVIEW</span>
                <span className="status">● READY</span>
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
                  <QRCodeCanvas
                    value={qrValue}
                    size={320}
                    bgColor="#F7F5EF"
                    fgColor="#111111"
                    level="M"
                    includeMargin
                  />
                ) : (
                  <span>QR</span>
                )}
              </div>

              <div className="preview-footer">
                <span>320PX</span>
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