import QRCode from "qrcode";

const PATTERN_TYPES = {
    classic: "classic",
    dots: "dots",
    diamond: "diamond",
    cross: "cross",
    hex: "hex",
    pixel: "pixel",
};

function drawModule(ctx, type, x, y, size, color) {
    ctx.fillStyle = color;

    switch (type) {
        case "dots":
            ctx.beginPath();
            ctx.arc(
                x + size / 2,
                y + size / 2,
                size * 0.42,
                0,
                Math.PI * 2
            );
            ctx.fill();
            break;

        case "diamond":
            ctx.beginPath();
            ctx.moveTo(x + size / 2, y);
            ctx.lineTo(x + size, y + size / 2);
            ctx.lineTo(x + size / 2, y + size);
            ctx.lineTo(x, y + size / 2);
            ctx.closePath();
            ctx.fill();
            break;

        case "cross": {
            const thickness = size * 0.36;
            const offset = (size - thickness) / 2;

            ctx.fillRect(x + offset, y, thickness, size);
            ctx.fillRect(x, y + offset, size, thickness);
            break;
        }

        case "hex": {
            const centerX = x + size / 2;
            const centerY = y + size / 2;
            const radius = size * 0.48;

            ctx.beginPath();

            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 3) * i;
                const pointX =
                    centerX + radius * Math.cos(angle);
                const pointY =
                    centerY + radius * Math.sin(angle);

                if (i === 0) {
                    ctx.moveTo(pointX, pointY);
                } else {
                    ctx.lineTo(pointX, pointY);
                }
            }

            ctx.closePath();
            ctx.fill();
            break;
        }

        case "pixel": {
            const padding = size * 0.15;

            ctx.fillRect(
                x + padding,
                y + padding,
                size - padding * 2,
                size - padding * 2
            );
            break;
        }

        default:
            ctx.fillRect(x, y, size, size);
    }
}

function drawFinderPattern(
    ctx,
    x,
    y,
    moduleSize,
    color,
    background
) {
    const size = moduleSize * 7;

    ctx.fillStyle = background;
    ctx.fillRect(x, y, size, size);

    ctx.fillStyle = color;
    ctx.fillRect(x, y, size, size);

    ctx.fillStyle = background;
    ctx.fillRect(
        x + moduleSize,
        y + moduleSize,
        moduleSize * 5,
        moduleSize * 5
    );

    ctx.fillStyle = color;
    ctx.fillRect(
        x + moduleSize * 2,
        y + moduleSize * 2,
        moduleSize * 3,
        moduleSize * 3
    );
}

function drawFinderSVG(
    parts,
    x,
    y,
    moduleSize,
    color,
    background
) {
    const size = moduleSize * 7;

    parts.push(
        `<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${background}"/>`
    );

    parts.push(
        `<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${color}"/>`
    );

    parts.push(
        `<rect x="${x + moduleSize}" y="${y + moduleSize}" width="${moduleSize * 5}" height="${moduleSize * 5}" fill="${background}"/>`
    );

    parts.push(
        `<rect x="${x + moduleSize * 2}" y="${y + moduleSize * 2}" width="${moduleSize * 3}" height="${moduleSize * 3}" fill="${color}"/>`
    );
}

function moduleToSVG(
    parts,
    type,
    x,
    y,
    size,
    color
) {
    switch (type) {
        case "dots": {
            parts.push(
                `<circle cx="${x + size / 2}" cy="${y + size / 2}" r="${size * 0.42}" fill="${color}"/>`
            );
            break;
        }

        case "diamond": {
            const points = [
                `${x + size / 2},${y}`,
                `${x + size},${y + size / 2}`,
                `${x + size / 2},${y + size}`,
                `${x},${y + size / 2}`,
            ].join(" ");

            parts.push(
                `<polygon points="${points}" fill="${color}"/>`
            );
            break;
        }

        case "cross": {
            const thickness = size * 0.36;
            const offset = (size - thickness) / 2;

            parts.push(
                `<rect x="${x + offset}" y="${y}" width="${thickness}" height="${size}" fill="${color}"/>`
            );

            parts.push(
                `<rect x="${x}" y="${y + offset}" width="${size}" height="${thickness}" fill="${color}"/>`
            );

            break;
        }

        case "hex": {
            const centerX = x + size / 2;
            const centerY = y + size / 2;
            const radius = size * 0.48;

            const points = [];

            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 3) * i;

                points.push(
                    `${centerX + radius * Math.cos(angle)},${centerY + radius * Math.sin(angle)}`
                );
            }

            parts.push(
                `<polygon points="${points.join(" ")}" fill="${color}"/>`
            );

            break;
        }

        case "pixel": {
            const padding = size * 0.15;

            parts.push(
                `<rect x="${x + padding}" y="${y + padding}" width="${size - padding * 2}" height="${size - padding * 2}" fill="${color}"/>`
            );

            break;
        }

        default:
            parts.push(
                `<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${color}"/>`
            );
    }
}

export async function renderCustomQR({
    value,
    size = 320,
    foregroundColor = "#111111",
    backgroundColor = "#F7F5EF",
    pattern = "classic",
    margin = 16,
    errorCorrection = "M",
    gradientEnabled = false,
    gradientStart = "#111111",
    gradientEnd = "#A89BFF",

}) {
    if (!value) return null;

    const qr = QRCode.create(value, {
        errorCorrectionLevel: errorCorrection,
    });

    const moduleCount = qr.modules.size;
    const canvas = document.createElement("canvas");

    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");
    let moduleFill = foregroundColor;

    if (gradientEnabled) {
        const gradient = ctx.createLinearGradient(
            margin,
            margin,
            size - margin,
            size - margin
        );

        gradient.addColorStop(0, gradientStart);
        gradient.addColorStop(1, gradientEnd);

        moduleFill = gradient;
    }

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, size, size);

    const availableSize = size - margin * 2;
    const moduleSize = availableSize / moduleCount;

    const selectedPattern =
        PATTERN_TYPES[pattern] || "classic";

    for (let row = 0; row < moduleCount; row++) {
        for (let column = 0; column < moduleCount; column++) {
            if (!qr.modules.get(row, column)) continue;

            const x = margin + column * moduleSize;
            const y = margin + row * moduleSize;

            const isFinderArea =
                (column < 7 && row < 7) ||
                (column >= moduleCount - 7 && row < 7) ||
                (column < 7 && row >= moduleCount - 7);

            if (isFinderArea) continue;

            drawModule(ctx, selectedPattern, x, y, moduleSize, moduleFill);
        }
    }

    drawFinderPattern(
        ctx,
        margin,
        margin,
        moduleSize,
        foregroundColor,
        backgroundColor
    );

    drawFinderPattern(
        ctx,
        margin + (moduleCount - 7) * moduleSize,
        margin,
        moduleSize,
        foregroundColor,
        backgroundColor
    );

    drawFinderPattern(
        ctx,
        margin,
        margin + (moduleCount - 7) * moduleSize,
        moduleSize,
        foregroundColor,
        backgroundColor
    );

    return canvas;
}

export function createCustomQRSVG({
    value,
    size = 320,
    foregroundColor = "#111111",
    backgroundColor = "#F7F5EF",
    pattern = "classic",
    margin = 16,
    errorCorrection = "M",
}) {
    if (!value) return null;

    const qr = QRCode.create(value, {
        errorCorrectionLevel: errorCorrection,
    });

    const moduleCount = qr.modules.size;
    const availableSize = size - margin * 2;
    const moduleSize = availableSize / moduleCount;

    const selectedPattern =
        PATTERN_TYPES[pattern] || "classic";

    const parts = [];

    parts.push(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`
    );

    parts.push(
        `<rect width="${size}" height="${size}" fill="${backgroundColor}"/>`
    );

    for (let row = 0; row < moduleCount; row++) {
        for (let column = 0; column < moduleCount; column++) {
            if (!qr.modules.get(row, column)) continue;

            const x = margin + column * moduleSize;
            const y = margin + row * moduleSize;

            const isFinderArea =
                (column < 7 && row < 7) ||
                (column >= moduleCount - 7 && row < 7) ||
                (column < 7 && row >= moduleCount - 7);

            if (isFinderArea) continue;

            moduleToSVG(
                parts,
                selectedPattern,
                x,
                y,
                moduleSize,
                foregroundColor
            );
        }
    }

    drawFinderSVG(
        parts,
        margin,
        margin,
        moduleSize,
        foregroundColor,
        backgroundColor
    );

    drawFinderSVG(
        parts,
        margin + (moduleCount - 7) * moduleSize,
        margin,
        moduleSize,
        foregroundColor,
        backgroundColor
    );

    drawFinderSVG(
        parts,
        margin,
        margin + (moduleCount - 7) * moduleSize,
        moduleSize,
        foregroundColor,
        backgroundColor
    );

    parts.push("</svg>");

    return parts.join("");
}

