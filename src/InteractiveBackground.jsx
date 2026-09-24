import { useEffect, useMemo, useRef } from "react";

const COLUMNS = 32;
const ROWS = 18;
const TOTAL_MODULES = COLUMNS * ROWS;

function createPattern(text) {
    let hash = 0;

    for (let i = 0; i < text.length; i++) {
        hash = (hash << 5) - hash + text.charCodeAt(i);
        hash |= 0;
    }

    return Array.from({ length: TOTAL_MODULES }, (_, index) => {
        const value =
            Math.abs(hash * (index + 11) + index * index * 17) % 23;

        return value < 4;
    });
}

function InteractiveBackground({ content }) {
    const moduleRefs = useRef([]);

    const pattern = useMemo(() => {
        return createPattern(content);
    }, [content]);

    useEffect(() => {
        const handlePointerMove = (event) => {
            moduleRefs.current.forEach((module, index) => {
                if (!module) return;

                const column = index % COLUMNS;
                const row = Math.floor(index / COLUMNS);

                const moduleX =
                    ((column + 0.5) / COLUMNS) * window.innerWidth;

                const moduleY =
                    ((row + 0.5) / ROWS) * window.innerHeight;

                const distanceX = event.clientX - moduleX;
                const distanceY = event.clientY - moduleY;

                const distance = Math.sqrt(
                    distanceX * distanceX + distanceY * distanceY
                );

                const radius = 180;

                if (distance < radius) {
                    const strength = 1 - distance / radius;

                    const moveX =
                        (distanceX / radius) * strength * 12;

                    const moveY =
                        (distanceY / radius) * strength * 12;

                    module.style.transform = `translate(${moveX}px, ${moveY}px)`;

                    module.style.opacity = `${0.08 + strength * 0.5}`;

                    if (strength > 0.65) {
                        module.style.backgroundColor = "var(--color-black)";
                    } else {
                        module.style.backgroundColor = "var(--color-module)";
                    }
                } else {
                    module.style.transform = "translate(0, 0)";

                    module.style.opacity = pattern[index]
                        ? "0.16"
                        : "0.055";

                    module.style.backgroundColor = "var(--color-module)";
                }
            });
        };

        window.addEventListener("pointermove", handlePointerMove);

        return () => {
            window.removeEventListener(
                "pointermove",
                handlePointerMove
            );
        };
    }, [pattern]);

    return (
        <div className="interactive-background" aria-hidden="true">
            <div className="qr-module-grid">
                {Array.from(
                    { length: TOTAL_MODULES },
                    (_, index) => (
                        <span
                            key={index}
                            ref={(element) => {
                                moduleRefs.current[index] = element;
                            }}
                            className={`qr-module ${pattern[index]
                                ? "qr-module-active"
                                : ""
                                }`}
                        />
                    )
                )}
            </div>
        </div>
    );
}

export default InteractiveBackground;