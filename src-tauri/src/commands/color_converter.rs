use serde::Serialize;

#[derive(Serialize)]
pub struct RgbColor {
    pub r: u8,
    pub g: u8,
    pub b: u8,
}

#[derive(Serialize)]
pub struct HslColor {
    pub h: f64,
    pub s: f64,
    pub l: f64,
}

#[derive(Serialize)]
pub struct ColorResult {
    pub hex: String,
    pub rgb: RgbColor,
    pub hsl: HslColor,
    pub rgba: String,
    pub hsla: String,
}

fn hex_to_rgb(hex: &str) -> Result<(u8, u8, u8), String> {
    let hex = hex.trim_start_matches('#');
    if hex.len() != 6 && hex.len() != 3 {
        return Err("无效的 HEX 颜色".to_string());
    }
    let hex = if hex.len() == 3 {
        format!(
            "{}{}{}{}{}{}",
            &hex[0..1], &hex[0..1], &hex[1..2], &hex[1..2], &hex[2..3], &hex[2..3]
        )
    } else {
        hex.to_string()
    };
    let r = u8::from_str_radix(&hex[0..2], 16).map_err(|_| "无效的 HEX 值".to_string())?;
    let g = u8::from_str_radix(&hex[2..4], 16).map_err(|_| "无效的 HEX 值".to_string())?;
    let b = u8::from_str_radix(&hex[4..6], 16).map_err(|_| "无效的 HEX 值".to_string())?;
    Ok((r, g, b))
}

fn rgb_to_hsl(r: u8, g: u8, b: u8) -> (f64, f64, f64) {
    let r = r as f64 / 255.0;
    let g = g as f64 / 255.0;
    let b = b as f64 / 255.0;
    let max = r.max(g).max(b);
    let min = r.min(g).min(b);
    let l = (max + min) / 2.0;

    if (max - min).abs() < f64::EPSILON {
        return (0.0, 0.0, (l * 100.0).round());
    }

    let d = max - min;
    let s = if l > 0.5 {
        d / (2.0 - max - min)
    } else {
        d / (max + min)
    };
    let h = if (max - r).abs() < f64::EPSILON {
        ((g - b) / d + if g < b { 6.0 } else { 0.0 }) * 60.0
    } else if (max - g).abs() < f64::EPSILON {
        ((b - r) / d + 2.0) * 60.0
    } else {
        ((r - g) / d + 4.0) * 60.0
    };

    (h.round(), (s * 100.0).round(), (l * 100.0).round())
}

#[tauri::command]
pub fn convert_color(input: String, format: String) -> Result<ColorResult, String> {
    let (r, g, b) = match format.as_str() {
        "hex" => hex_to_rgb(&input)?,
        "rgb" => {
            let cleaned = input
                .replace("rgb(", "")
                .replace(")", "")
                .replace(",", " ");
            let parts: Vec<&str> = cleaned.split_whitespace().collect();
            if parts.len() != 3 {
                return Err("无效的 RGB 格式，请使用 'r, g, b' 格式".to_string());
            }
            let r = parts[0]
                .parse::<u8>()
                .map_err(|_| "R 值无效".to_string())?;
            let g = parts[1]
                .parse::<u8>()
                .map_err(|_| "G 值无效".to_string())?;
            let b = parts[2]
                .parse::<u8>()
                .map_err(|_| "B 值无效".to_string())?;
            (r, g, b)
        }
        "hsl" => {
            let cleaned = input
                .replace("hsl(", "")
                .replace(")", "")
                .replace("%", "")
                .replace(",", " ");
            let parts: Vec<&str> = cleaned.split_whitespace().collect();
            if parts.len() != 3 {
                return Err("无效的 HSL 格式，请使用 'h, s, l' 格式".to_string());
            }
            let h: f64 = parts[0].parse().map_err(|_| "H 值无效".to_string())?;
            let s: f64 = parts[1]
                .parse::<f64>()
                .map_err(|_| "S 值无效".to_string())?
                / 100.0;
            let l: f64 = parts[2]
                .parse::<f64>()
                .map_err(|_| "L 值无效".to_string())?
                / 100.0;
            // HSL to RGB
            let hsl_to_rgb = |h: f64, s: f64, l: f64| -> (u8, u8, u8) {
                if s == 0.0 {
                    let v = (l * 255.0).round() as u8;
                    return (v, v, v);
                }
                let q = if l < 0.5 {
                    l * (1.0 + s)
                } else {
                    l + s - l * s
                };
                let p = 2.0 * l - q;
                let hue_to_rgb = |p: f64, q: f64, mut t: f64| -> f64 {
                    if t < 0.0 {
                        t += 1.0;
                    }
                    if t > 1.0 {
                        t -= 1.0;
                    }
                    if t < 1.0 / 6.0 {
                        return p + (q - p) * 6.0 * t;
                    }
                    if t < 1.0 / 2.0 {
                        return q;
                    }
                    if t < 2.0 / 3.0 {
                        return p + (q - p) * (2.0 / 3.0 - t) * 6.0;
                    }
                    p
                };
                let h_norm = h / 360.0;
                let r = (hue_to_rgb(p, q, h_norm + 1.0 / 3.0) * 255.0).round() as u8;
                let g = (hue_to_rgb(p, q, h_norm) * 255.0).round() as u8;
                let b = (hue_to_rgb(p, q, h_norm - 1.0 / 3.0) * 255.0).round() as u8;
                (r, g, b)
            };
            hsl_to_rgb(h, s, l)
        }
        _ => return Err(format!("不支持的格式: {}", format)),
    };

    let hex = format!("#{:02x}{:02x}{:02x}", r, g, b);
    let (h, s, l) = rgb_to_hsl(r, g, b);

    Ok(ColorResult {
        hex,
        rgb: RgbColor { r, g, b },
        hsl: HslColor { h, s, l },
        rgba: format!("rgba({}, {}, {}, 1)", r, g, b),
        hsla: format!("hsla({}, {}%, {}%, 1)", h, s, l),
    })
}
