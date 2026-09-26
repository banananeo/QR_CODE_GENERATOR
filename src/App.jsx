import "./App.css";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import InteractiveBackground from "./InteractiveBackground";
import { useEffect, useRef, useState } from "react";

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

const qrPatterns = [
  {
    id: "classic",
    name: "Classic",
    description: "Original QR style",
  },

  {
    id: "rounded",
    name: "Rounded",
    description: "Soft corners",
  },

  {
    id: "dots",
    name: "Dots",
    description: "Circular modules",
  },

  {
    id: "pixel",
    name: "Pixel",
    description: "Sharp blocks",
  },

  {
    id: "diamond",
    name: "Diamond",
    description: "Angular modules",
  },

  {
    id: "grid",
    name: "Grid",
    description: "Structured modules",
  },
];
function App() {
  /* ==================== STATE ==================== */

  const [selectedType, setSelectedType] = useState("website");
  const [content, setContent] = useState("");
  const [qrSize, setQrSize] = useState(320);
  const [qrPattern, setQrPattern] = useState("classic");

  const [foregroundColor, setForegroundColor] =
    useState("#111111");

  const [backgroundColor, setBackgroundColor] =
    useState("#F7F5EF");

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("qr-lab-theme") === "dark";
  });

  /* ==================== REFS ==================== */

  const qrCanvasRef = useRef(null);
  const qrSvgRef = useRef(null);

  /* ==================== DARK MODE ==================== */

  useEffect(() => {
    localStorage.setItem(
      "qr-lab-theme",
      isDarkMode ? "dark" : "light"
    );
  }, [isDarkMode]);

  /* ==================== QR TYPE ==================== */

  const currentType = qrTypes[selectedType];

  /* ==================== QR VALUE ==================== */

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

  /* ==================== DOWNLOAD PNG ==================== */

  const downloadPNG = () => {
    if (!qrCanvasRef.current || !qrValue) {
      return;
    }

    const canvas = qrCanvasRef.current;

    const link = document.createElement("a");

    link.download = `qr-lab-${selectedType}.png`;
    link.href = canvas.toDataURL("image/png");

    link.click();
  };

  /* ==================== DOWNLOAD SVG ==================== */

  const downloadSVG = () => {
    if (!qrSvgRef.current || !qrValue) {
      return;
    }

    const svg = qrSvgRef.current;

    const serializer = new XMLSerializer();

    const svgString = serializer.serializeToString(svg);

    const blob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.download = `qr-lab-${selectedType}.svg`;
    link.href = url;

    link.click();

    URL.revokeObjectURL(url);
  };

  /* ==================== RENDER ==================== */

  return (
    <main className={`app ${isDarkMode ? "dark-mode" : ""}`}>
      <InteractiveBackground content={content} />

      {/* ==================== HEADER ==================== */}

      <header className="navbar">
        <div className="brand">
          <a href="/" className="logo">
            QR//LAB
          </a>
        </div>

        <nav
          className="nav-links"
          aria-label="Main navigation"
        >
          <a
            href="#create"
            className="nav-link active"
          >
            Create
          </a>

          <a
            href="#patterns"
            className="nav-link"
          >
            Patterns
          </a>

          <a
            href="#recent"
            className="nav-link"
          >
            Recent
          </a>
        </nav>

        <button
          className="theme-button"
          type="button"
          onClick={() =>
            setIsDarkMode((current) => !current)
          }
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
        <p className="eyebrow">
          QR CODE GENERATOR
        </p>

        <h1>THE ART OF THE SCAN.</h1>

        <p className="hero-description">
          Create beautiful QR codes that anyone can use.
        </p>
      </section>

      {/* ==================== QR CREATOR ==================== */}

      <section
        className="content-section"
        id="create"
      >
        <div className="content-editor">

          {/* ==================== LEFT SIDE ==================== */}

          <div className="content-controls">

            {/* ==================== STEP 01 ==================== */}

            <div className="section-heading">
              <p className="eyebrow">
                STEP 01
              </p>

              <h2>
                WHAT DO YOU WANT TO SHARE?
              </h2>
            </div>

            {/* ==================== QR TYPE SELECTOR ==================== */}

            <div className="type-selector">
              {Object.entries(qrTypes).map(
                ([type, config]) => (
                  <button
                    key={type}
                    type="button"
                    className={`type-button ${selectedType === type
                      ? "active"
                      : ""
                      }`}
                    onClick={() =>
                      setSelectedType(type)
                    }
                  >
                    {config.name}
                  </button>
                )
              )}
            </div>

            {/* ==================== CONTENT INPUT ==================== */}

            <div className="input-group">
              <label htmlFor="qr-content">
                {currentType.label}
              </label>

              <input
                id="qr-content"
                type={currentType.inputType}
                value={content}
                onChange={(event) =>
                  setContent(event.target.value)
                }
                placeholder={currentType.placeholder}
              />
            </div>

            {/* ==================== QR SIZE ==================== */}

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
                onChange={(event) =>
                  setQrSize(
                    Number(event.target.value)
                  )
                }
              />
            </div>

            {/* ==================== STEP 02 ==================== */}

            <div className="design-section">

              <div className="section-heading">
                <p className="eyebrow">
                  STEP 02
                </p>

                <h2>
                  DESIGN YOUR QR.
                </h2>
              </div>

              <div className="color-design">

                {/* ==================== COLOR SYSTEM HEADER ==================== */}

                <div className="design-label">
                  <span>
                    COLOR SYSTEM
                  </span>

                  <span>
                    01 / 02
                  </span>
                </div>

                {/* ==================== COLOR CARDS ==================== */}

                <div className="color-controls">

                  {/* ==================== FOREGROUND ==================== */}

                  <div className="color-card">

                    <div className="color-card-top">
                      <span className="color-index">
                        01
                      </span>

                      <span className="color-name">
                        QR COLOR
                      </span>
                    </div>

                    <div className="color-preview-row">

                      <label
                        htmlFor="foreground-color"
                        className="color-swatch"
                        style={{
                          backgroundColor:
                            foregroundColor,
                        }}
                      >
                        <input
                          id="foreground-color"
                          type="color"
                          value={foregroundColor}
                          onChange={(event) =>
                            setForegroundColor(
                              event.target.value
                            )
                          }
                        />
                      </label>

                      <div className="color-value">
                        <strong>
                          {foregroundColor}
                        </strong>

                        <span>
                          FOREGROUND MODULES
                        </span>
                      </div>

                    </div>

                    <div
                      className="mini-pattern foreground-pattern"
                      style={{
                        backgroundColor:
                          foregroundColor,
                      }}
                    >
                      <span />
                      <span />
                      <span />
                      <span />
                      <span />
                      <span />
                      <span />
                      <span />
                      <span />
                    </div>

                  </div>

                  {/* ==================== BACKGROUND ==================== */}

                  <div className="color-card">

                    <div className="color-card-top">
                      <span className="color-index">
                        02
                      </span>

                      <span className="color-name">
                        PAPER COLOR
                      </span>
                    </div>

                    <div className="color-preview-row">

                      <label
                        htmlFor="background-color"
                        className="color-swatch"
                        style={{
                          backgroundColor:
                            backgroundColor,
                        }}
                      >
                        <input
                          id="background-color"
                          type="color"
                          value={backgroundColor}
                          onChange={(event) =>
                            setBackgroundColor(
                              event.target.value
                            )
                          }
                        />
                      </label>

                      <div className="color-value">
                        <strong>
                          {backgroundColor}
                        </strong>

                        <span>
                          QR BACKGROUND
                        </span>
                      </div>

                    </div>

                    <div
                      className="mini-pattern background-pattern"
                      style={{
                        backgroundColor:
                          backgroundColor,
                      }}
                    >
                      <span />
                      <span />
                      <span />
                      <span />
                      <span />
                      <span />
                      <span />
                      <span />
                      <span />
                    </div>

                  </div>

                </div>

                {/* ==================== QUICK PALETTES ==================== */}

                <div className="quick-palettes">

                  <div className="design-label">
                    <span>
                      QUICK PALETTES
                    </span>
                  </div>

                  <div className="palette-list">

                    {/* MONO */}

                    <button
                      type="button"
                      className="palette"
                      onClick={() => {
                        setForegroundColor(
                          "#111111"
                        );

                        setBackgroundColor(
                          "#F7F5EF"
                        );
                      }}
                    >
                      <span
                        className="palette-preview"
                        style={{
                          background:
                            "linear-gradient(90deg, #111111 50%, #F7F5EF 50%)",
                        }}
                      />

                      MONO
                    </button>

                    {/* ACID */}

                    <button
                      type="button"
                      className="palette"
                      onClick={() => {
                        setForegroundColor(
                          "#111111"
                        );

                        setBackgroundColor(
                          "#D7FF3F"
                        );
                      }}
                    >
                      <span
                        className="palette-preview"
                        style={{
                          background:
                            "linear-gradient(90deg, #111111 50%, #D7FF3F 50%)",
                        }}
                      />

                      ACID
                    </button>

                    {/* NIGHT */}

                    <button
                      type="button"
                      className="palette"
                      onClick={() => {
                        setForegroundColor(
                          "#F7F5EF"
                        );

                        setBackgroundColor(
                          "#111111"
                        );
                      }}
                    >
                      <span
                        className="palette-preview"
                        style={{
                          background:
                            "linear-gradient(90deg, #F7F5EF 50%, #111111 50%)",
                        }}
                      />

                      NIGHT
                    </button>

                  </div>


                </div>
                <div className="pattern-section" id="patterns">

                  <div className="design-label">
                    <span>QR PATTERNS</span>
                    <span>03 / 06</span>
                  </div>

                  <div className="pattern-grid">

                    {qrPatterns.map((pattern) => (
                      <button
                        key={pattern.id}
                        type="button"
                        className={`pattern-card ${qrPattern === pattern.id
                          ? "active"
                          : ""
                          }`}
                        onClick={() =>
                          setQrPattern(pattern.id)
                        }
                      >

                        <div
                          className={`pattern-preview pattern-${pattern.id}`}
                        >
                          <span />
                          <span />
                          <span />
                          <span />
                          <span />
                          <span />
                          <span />
                          <span />
                          <span />
                        </div>

                        <div className="pattern-info">
                          <strong>
                            {pattern.name}
                          </strong>

                          <span>
                            {pattern.description}
                          </span>
                        </div>

                      </button>
                    ))}

                  </div>

                </div>


              </div>

            </div>

          </div>

          {/* ==================== RIGHT SIDE / PREVIEW ==================== */}

          <div className="content-preview">

            <div className="preview-card">

              {/* ==================== PREVIEW HEADER ==================== */}

              <div className="preview-header">
                <span>
                  LIVE PREVIEW
                </span>

                <span className="status">
                  ● READY
                </span>
              </div>

              {/* ==================== QR PREVIEW ==================== */}

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
                      bgColor={backgroundColor}
                      fgColor={foregroundColor}
                      level="m"
                      includeMargin
                    />
                  </div>
                ) : (
                  <span>
                    QR
                  </span>
                )}
              </div>

              {/* ==================== HIDDEN SVG SOURCE ==================== */}

              <div
                className="qr-svg-source"
                aria-hidden="true"
                style={{
                  display: "none",
                }}
              >
                {qrValue && (
                  <QRCodeSVG
                    ref={qrSvgRef}
                    value={qrValue}
                    size={qrSize}
                    bgColor={
                      backgroundColor
                    }
                    fgColor={
                      foregroundColor
                    }
                    level="M"
                    includeMargin
                  />
                )}
              </div>

              {/* ==================== DOWNLOAD ==================== */}

              <div className="preview-footer">
                <span>
                  DOWNLOAD YOUR QR
                </span>
              </div>

              <div className="download-actions">

                <button
                  type="button"
                  className="download-button"
                  onClick={downloadPNG}
                  disabled={!qrValue}
                >
                  PNG
                </button>

                <button
                  type="button"
                  className="download-button"
                  onClick={downloadSVG}
                  disabled={!qrValue}
                >
                  SVG
                </button>

              </div>

            </div>

          </div>

        </div>
      </section>
    </main>
  );
}

export default App;