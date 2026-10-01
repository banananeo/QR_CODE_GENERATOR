import "./App.css";
import { useEffect, useRef, useState } from "react";
import { getScanWarnings } from "./getScanWarnings";
import {
  renderCustomQR,
  createCustomQRSVG,
  getModuleCount,
} from "./customQrRenderer";
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
const qrPatternStyles = {
  classic: "square",
  rounded: "rounded",
  dots: "dots",
  pixel: "classy",
  diamond: "classy-rounded",
  grid: "square",
};

const qrPatterns = [
  {
    id: "classic",
    name: " Classic ",
    description: " Original QR style ",
  },

  {
    id: "rounded",
    name: " Rounded ",
    description: " Soft corners ",
  },

  {
    id: "dots",
    name: " Dots ",
    description: " Circular modules ",
  },

  {
    id: "pixel",
    name: " Pixel",
    description: " Sharp blocks ",
  },

  {
    id: "diamond",
    name: " Diamond ",
    description: " Angular modules ",
  },

  {
    id: "grid",
    name: " Grid ",
    description: " Structured modules ",
  },
];
const qrPresets = [
  {
    id: "classic",
    name: "Classic",
    description: "Clean & balanced",
    foregroundColor: "#111111",
    backgroundColor: "#F7F5EF",
    qrPattern: "classic",
  },
  {
    id: "ink",
    name: "Ink",
    description: "Sharp & minimal",
    foregroundColor: "#111111",
    backgroundColor: "#FFFFFF",
    qrPattern: "pixel",
  },
  {
    id: "acid",
    name: "Acid",
    description: "Bold & electric",
    foregroundColor: "#111111",
    backgroundColor: "#D7FF3F",
    qrPattern: "dots",
  },
  {
    id: "night",
    name: "Night",
    description: "Dark & crisp",
    foregroundColor: "#F7F5EF",
    backgroundColor: "#111111",
    qrPattern: "diamond",
  },
];
const normalizeUrl = (value) => {
  const trimmed = value.trim();

  // keep it as typed if it already has a scheme (http://, https://, ftp://)
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
};

/* ==================== MAIN ==================== */

function App() {
  /* ==================== STATE ==================== */
  const [showScrollButton, setShowScrollButton] = useState(true);
  const [copied, setCopied] = useState(false);
  const [selectedType, setSelectedType] = useState("website");
  const [content, setContent] = useState("");
  //Wifi-QR
  const escapeWifi = (value) => value.replace(/([\\;,:"])/g, "\\$1");
  const [wifiPassword, setWifiPassword] = useState("");
  const [wifiSecurity, setWifiSecurity] = useState("WPA");
  //QR Size 
  const [qrSize, setQrSize] = useState(320);
  //Error Correction 
  const [errorCorrection, setErrorCorrection] = useState("M");
  //QR Margin
  const [qrMargin, setQrMargin] = useState(16);
  //QR Pattern
  const [qrPattern, setQrPattern] = useState("classic");
  const [error, setError] = useState("");
  //
  const [showErrorInfo, setShowErrorInfo] = useState(false);
  //Foreground Color
  const [foregroundColor, setForegroundColor] =
    useState("#111111");
  //Background Color
  const [backgroundColor, setBackgroundColor] =
    useState("#F7F5EF");
  //Dark Mode
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("qr-lab-theme") === "dark";
  });

  /* ==================== REFS ==================== */

  const qrCanvasRef = useRef(null);
  /* ==================== QR TYPE ==================== */

  const currentType = qrTypes[selectedType];
  const validateContent = (value, type) => {
    const trimmed = value.trim();

    if (!trimmed) {
      return "";
    }

    if (type === "website") {
      if (/\s/.test(trimmed)) {
        return "Website address can't contain spaces.";
      }

      try {
        const url = new URL(normalizeUrl(trimmed));

        if (!["http:", "https:"].includes(url.protocol)) {
          return "Please enter a valid HTTP or HTTPS URL.";
        }

        const labels = url.hostname.split(".");
        const tld = labels[labels.length - 1];

        if (labels.length < 2 || tld.length < 2) {
          return "Please enter a valid website, like www.example.com";
        }
      } catch {
        return "Please enter a valid website, like www.example.com";
      }
    }

    if (type === "email") {
      const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(trimmed)) {
        return "Please enter a valid email address.";
      }
    }

    if (type === "phone") {
      const phonePattern =
        /^[+]?[\d\s()-]{7,20}$/;

      if (!phonePattern.test(trimmed)) {
        return "Please enter a valid phone number.";
      }
    }

    if (type === "wifi") {
      if (trimmed.length < 2) {
        return "Please enter a valid Wi-Fi network name.";
      }
    }

    return "";
  };

  /* ==================== QR VALUE ==================== */

  const qrValue = (() => {
    if (!content.trim()) {
      return "";
    }
    if (selectedType === "wifi") {
      const ssid = escapeWifi(content.trim());

      if (wifiSecurity === "nopass") {
        return `WIFI:T:nopass;S:${ssid};;`;
      }

      return `WIFI:T:${wifiSecurity};S:${ssid};P:${escapeWifi(wifiPassword)};;`;
    }

    if (selectedType === "email") {
      return `mailto:${content}`;
    }

    if (selectedType === "phone") {
      return `tel:${content}`;
    }
    if (selectedType === "website") {
      return normalizeUrl(content);
    }

    return content;

    return content;
  })();

  const saveRecentQR = () => {
    if (!qrValue || error) return;

    const newQR = {
      id: Date.now(),
      type: selectedType,
      content,
      qrSize,
      qrPattern,
      foregroundColor,
      backgroundColor,
      errorCorrection,
      qrMargin,
    };

    setRecentQRCodes((current) => {
      const filtered = current.filter(
        (item) =>
          !(
            item.type === newQR.type &&
            item.content === newQR.content
          )
      );

      const updated = [newQR, ...filtered].slice(0, 6);

      localStorage.setItem(
        "qr-lab-recent",
        JSON.stringify(updated)
      );

      return updated;
    });
  };
  const reuseRecentQR = (qr) => {
    setSelectedType(qr.type);
    setContent(qr.content);
    setQrSize(qr.qrSize);
    setQrPattern(qr.qrPattern);
    setForegroundColor(qr.foregroundColor);
    setBackgroundColor(qr.backgroundColor);
    setErrorCorrection(qr.errorCorrection);
    setQrMargin(qr.qrMargin);
    setError("");
  };
  /* ==================== GRADIENT ==================== */
  const [gradientEnabled, setGradientEnabled] = useState(false);
  const [gradientStart, setGradientStart] = useState("#111111");
  const [gradientEnd, setGradientEnd] = useState("#A89BFF");

  /* ==================== SCAN RELIABILITY ==================== */
  const moduleCount = qrValue
    ? getModuleCount(qrValue, errorCorrection)
    : null;

  const tooLong = Boolean(qrValue) && moduleCount === null;

  const moduleSize = moduleCount
    ? (qrSize - qrMargin * 2) / moduleCount
    : Infinity;

  const scanWarnings =
    qrValue && !tooLong
      ? getScanWarnings({
        foregroundColor,
        backgroundColor,
        gradientEnabled,
        gradientStart,
        gradientEnd,
        margin: qrMargin,
        moduleSize,
        pattern: qrPattern,
        errorCorrection,
      })
      : [];

  /* ==================== PRESETS ==================== */
  const applyPreset = (preset) => {
    setForegroundColor(preset.foregroundColor);
    setBackgroundColor(preset.backgroundColor);
    setQrPattern(preset.qrPattern);
  };


  /* ==================== DARK MODE ==================== */

  useEffect(() => {
    localStorage.setItem(
      "qr-lab-theme",
      isDarkMode ? "dark" : "light"
    );
  }, [isDarkMode]);
  useEffect(() => {
    const preview = document.querySelector(".preview-card");

    if (!preview) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowScrollButton(!entry.isIntersecting);
      },
      {
        threshold: 0.2,
      }
    );

    observer.observe(preview);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const generateQR = async () => {
      if (!qrCanvasRef.current || !qrValue || tooLong) {
        return;
      }

      const canvas = await renderCustomQR({
        value: qrValue,
        size: qrSize,
        foregroundColor,
        backgroundColor,
        pattern: qrPattern,
        margin: qrMargin,
        errorCorrection,
        gradientEnabled,
        gradientStart,
        gradientEnd,
      });

      if (cancelled || !canvas) {
        return;
      }

      const container = qrCanvasRef.current;

      container.innerHTML = "";
      container.appendChild(canvas);
    };

    generateQR();

    return () => {
      cancelled = true;
    };
  }, [
    qrValue,
    qrSize,
    qrPattern,
    foregroundColor,
    backgroundColor,
    qrMargin,
    errorCorrection,
    gradientEnabled,
    gradientStart,
    gradientEnd,
  ]);

  /* ==================== COPY ==================== */
  const copyToClipboard = async () => {
    const canvas = qrCanvasRef.current?.querySelector("canvas");
    if (!canvas || !qrValue || error) return;

    try {
      const blobPromise = new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) =>
            blob ? resolve(blob) : reject(new Error("Could not create image")),
          "image/png"
        );
      });

      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blobPromise }),
      ]);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      setCopied(false);
    }
  };

  /* ==================== DOWNLOAD PNG ==================== */


  const downloadPNG = () => {
    const canvas = qrCanvasRef.current?.querySelector("canvas");
    if (!canvas || !qrValue || error) {
      return;
    }

    saveRecentQR();

    const link = document.createElement("a");

    link.download = `qr-lab-${selectedType}.png`;
    link.href = canvas.toDataURL("image/png");

    link.click();
  };

  const downloadSVG = () => {
    if (!qrValue || error) return;

    saveRecentQR();

    const svgString = createCustomQRSVG({
      value: qrValue,
      size: qrSize,
      foregroundColor,
      backgroundColor,
      pattern: qrPattern,
      margin: qrMargin,
      errorCorrection,
      gradientEnabled,
      gradientStart,
      gradientEnd,

    });

    if (!svgString) return;

    const blob = new Blob(
      [svgString],
      { type: "image/svg+xml;charset=utf-8" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.download = `qr-lab-${selectedType}.svg`;
    link.href = url;

    link.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);

  };

  /* LOCAL STORAGE */
  const [recentQRCodes, setRecentQRCodes] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("qr-lab-recent") || "[]"
      );
    } catch {
      return [];
    }
  });

  /* ==================== RENDER ==================== */

  return (
    <main className={`app ${isDarkMode ? "dark-mode" : ""}`}>
      <button
        type="button"
        className="mobile-scroll-button"
        onClick={() => {
          document.querySelector(".preview-card")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }}
        aria-label="Scroll to QR preview"
      >
        SCROLL TO QR
      </button>

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
                    onClick={() => {
                      setSelectedType(type);
                      setContent("");
                      setError("");
                      setWifiPassword("");
                      setWifiSecurity("WPA")
                    }}
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
                onChange={(event) => {
                  const value = event.target.value;
                  setContent(value);
                  setError(validateContent(value, selectedType));
                }}
                placeholder={currentType.placeholder}
                className={error ? "input-error" : ""}
              />
              {error && <p className="error-message">{error}</p>}
            </div>
            {selectedType === "wifi" && (
              <>
                <div className="design-control">
                  <div className="control-header">
                    <span>SECURITY</span>
                  </div>

                  <div className="option-row">
                    {[
                      ["WPA", "WPA/WPA2"],
                      ["WEP", "WEP"],
                      ["nopass", "None"],
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        className={`option-button ${wifiSecurity === value ? "active" : ""}`}
                        onClick={() => setWifiSecurity(value)}
                      >
                        <strong>{label}</strong>
                      </button>
                    ))}
                  </div>
                </div>

                {wifiSecurity !== "nopass" && (
                  <div className="input-group">
                    <label htmlFor="wifi-password">Password</label>

                    <input
                      id="wifi-password"
                      type="text"
                      value={wifiPassword}
                      onChange={(event) => setWifiPassword(event.target.value)}
                      placeholder="Network password"
                    />
                  </div>
                )}
              </>
            )}

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

            {/* ==================== ERROR CORRECTION ==================== */}

            <div className="design-control">
              <div className="control-header">
                <span>ERROR CORRECTION</span>


                <div className="info-trigger">
                  <output>{errorCorrection}</output>

                  <button
                    type="button"
                    className="info-button"
                    onClick={() =>
                      setShowErrorInfo((current) => !current)
                    }
                    aria-label="Learn about error correction"
                    aria-expanded={showErrorInfo}
                  >
                    ?
                  </button>
                </div>

              </div>
              {showErrorInfo && (
                <div className="info-box">
                  <strong>HOW DOES THIS WORK?</strong>

                  <p>
                    Error correction helps your QR code stay
                    scannable even when part of it is damaged
                    or covered.
                  </p>

                  <span>
                    L = less recovery&nbsp;&nbsp; H = more recovery
                  </span>
                </div>
              )}

              <div className="option-row">
                {["L", "M", "Q", "H"].map((level) => (
                  <button
                    key={level}
                    type="button"
                    className={`option-button ${errorCorrection === level ? "active" : ""
                      }`}
                    onClick={() => setErrorCorrection(level)}
                  >
                    <strong>{level}</strong>

                    <span>
                      {level === "L"
                        ? "Low"
                        : level === "M"
                          ? "Medium"
                          : level === "Q"
                            ? "Quartile"
                            : "High"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            {/* ==================== QR MARGIN ==================== */}

            <div className="design-control">
              <div className="control-header">
                <label htmlFor="qr-margin">
                  QR MARGIN
                </label>

                <output htmlFor="qr-margin">
                  {qrMargin}px
                </output>
              </div>

              <input
                id="qr-margin"
                type="range"
                min="0"
                max="40"
                step="4"
                value={qrMargin}
                onChange={(event) =>
                  setQrMargin(Number(event.target.value))
                }
              />

              <p className="control-hint">
                Controls the clear space around the QR code.
              </p>
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



                  </div>

                </div>
                <div className="gradient-control">

                  <div className="control-header">
                    <span>GRADIENT</span>

                    <button
                      type="button"
                      className={`gradient-toggle ${gradientEnabled ? "active" : ""}`}
                      onClick={() => setGradientEnabled((current) => !current)}
                      aria-pressed={gradientEnabled}
                    >
                      {gradientEnabled ? "ON" : "OFF"}
                    </button>
                  </div>

                  {gradientEnabled && (
                    <div className="gradient-options">

                      <label className="color-control">
                        <span>START</span>

                        <input
                          type="color"
                          value={gradientStart}
                          onChange={(event) => setGradientStart(event.target.value)}
                        />
                      </label>

                      <label className="color-control">
                        <span>END</span>

                        <input
                          type="color"
                          value={gradientEnd}
                          onChange={(event) => setGradientEnd(event.target.value)}
                        />
                      </label>

                    </div>
                  )}

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
            {/* ==================== VISUAL PRESETS ==================== */}

            <div className="preset-section">

              <div className="design-label">
                <span>VISUAL PRESETS</span>
                <span>01 / 04</span>
              </div>

              <div className="preset-grid">
                {qrPresets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    className="preset-card"
                    onClick={() => applyPreset(preset)}
                  >
                    <div className="preset-preview">
                      <div
                        className={`preset-preview preset-preview-${preset.qrPattern}`}
                        style={{
                          "--preset-foreground": preset.foregroundColor,
                          "--preset-background": preset.backgroundColor,
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

                    <div className="preset-info">
                      <strong>{preset.name}</strong>
                      <span>{preset.description}</span>
                    </div>

                    <span className="preset-arrow">→</span>
                  </button>
                ))}
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

                {(() => {
                  let label = "● SCANNABLE";
                  let tone = "ok";

                  if (!qrValue) {
                    label = "● EMPTY";
                    tone = "empty";
                  } else if (error || tooLong) {
                    label = "● INVALID";
                    tone = "bad";
                  } else if (scanWarnings.length > 0) {
                    label = "● CHECK";
                    tone = "warn";
                  }

                  return <span className={`status status-${tone}`}>{label}</span>;
                })()}
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
                    <div
                      ref={qrCanvasRef}
                      className="qr-styled-output"
                    />
                  </div>
                ) : (
                  <span>
                    QR
                  </span>
                )}
              </div>
              {tooLong && (
                <div className="scan-warning scan-warning-error" role="alert">
                  <strong>CONTENT TOO LONG</strong>
                  <p>
                    This much data can't fit in a QR code at this error correction level.
                    Shorten it or lower the error correction.
                  </p>
                </div>
              )}

              {scanWarnings.length > 0 && (
                <div className="scan-warning" role="status">
                  <strong>⚠ SCAN WARNING</strong>
                  <ul>
                    {scanWarnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

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
                <button
                  type="button"
                  className="download-button copy-button"
                  onClick={copyToClipboard}
                  disabled={!qrValue || !!error}
                >
                  {copied ? "COPIED ✓" : "COPY IMAGE"}
                </button>

              </div>

            </div>

          </div>

        </div>
      </section>
      {/* ==================== RECENT QR CODES ==================== */}

      <section className="recent-section" id="recent">
        <div className="section-heading">
          <p className="eyebrow">RECENT</p>

          <h2>YOUR RECENT QR.</h2>
        </div>

        {recentQRCodes.length === 0 ? (
          <div className="recent-empty">
            <span>NO SAVED QR CODES YET.</span>
            <p>
              Download a QR code and it will appear here.
            </p>
          </div>
        ) : (
          <div className="recent-grid">
            {recentQRCodes.map((qr) => (
              <button
                key={qr.id}
                type="button"
                className="recent-card"
                onClick={() => reuseRecentQR(qr)}
              >
                <div className="recent-card-index">
                  {qr.type.toUpperCase()}
                </div>

                <div className="recent-card-content">
                  <strong>
                    {qr.content}
                  </strong>

                  <span>
                    {qr.qrPattern.toUpperCase()} · {qr.qrSize}px
                  </span>
                </div>

                <span className="recent-card-action">
                  REUSE →
                </span>
              </button>
            ))}
          </div>
        )}
      </section>
      <footer className="site-footer">
        <span>© 2026 QR//LAB   </span>
        <a
          href="https://github.com/banananeo/QR_CODE_GENERATOR"
          target="_blank"
          rel="noopener noreferrer"
          className="github-link"
        >
          GITHUB ↗
        </a>
      </footer>
    </main >
  );
}

export default App;