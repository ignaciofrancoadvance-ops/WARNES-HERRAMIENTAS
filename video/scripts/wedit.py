#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
WEDIT — Editor de video de WARNES HERRAMIENTAS manejado por Claude Code.

Uso:
  python3 wedit.py microcorte  input.mp4 [-o salida.mp4]   # saca silencios (jump cuts)
  python3 wedit.py subtitulos  input.mp4 [--srt f.srt]     # subtitulos con tu estilo
  python3 wedit.py broll       input.mp4 [--srt f.srt]     # inserta imagenes por palabra
  python3 wedit.py vertical    input.mp4                    # reencuadra a 9:16
  python3 wedit.py editar      input.mp4                    # pipeline COMPLETO
  python3 wedit.py transcribir input.mp4                    # genera .srt (si hay modelo)

La configuracion vive en video/config/style.yaml y video/config/keywords.yaml
"""
import argparse, os, re, sys, subprocess, unicodedata, json, tempfile
import yaml

# --------------------------------------------------------------------------
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))   # .../video
CONFIG = os.path.join(ROOT, "config")
FONTS = os.path.join(ROOT, "fonts")

def ffmpeg_bin():
    import imageio_ffmpeg
    return imageio_ffmpeg.get_ffmpeg_exe()

FF = ffmpeg_bin()

def run(cmd, **kw):
    return subprocess.run(cmd, capture_output=True, text=True, **kw)

def load_cfg():
    with open(os.path.join(CONFIG, "style.yaml"), encoding="utf-8") as f:
        style = yaml.safe_load(f)
    kw_path = os.path.join(CONFIG, "keywords.yaml")
    keywords = {}
    if os.path.exists(kw_path):
        with open(kw_path, encoding="utf-8") as f:
            keywords = (yaml.safe_load(f) or {}).get("palabras", {}) or {}
    return style, keywords

def duration(path):
    r = run([FF, "-i", path, "-f", "null", "-"])
    m = re.search(r"Duration:\s*(\d+):(\d+):(\d+\.\d+)", r.stderr)
    if not m:
        return 0.0
    h, mm, ss = m.groups()
    return int(h)*3600 + int(mm)*60 + float(ss)

def norm(s):
    """minusculas, sin acentos, sin puntuacion — para matchear palabras."""
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9ñ ]", "", s).strip()

# --------------------------------------------------------------------------
# TRANSCRIPCION  ->  lista de palabras [(texto, inicio, fin)]
# --------------------------------------------------------------------------
def parse_srt(path):
    """Lee un .srt y devuelve palabras aproximadas por reparto lineal."""
    words = []
    blocks = re.split(r"\n\s*\n", open(path, encoding="utf-8").read().strip())
    def ts(t):
        h, m, rest = t.split(":")
        s, ms = rest.replace(".", ",").split(",")
        return int(h)*3600 + int(m)*60 + int(s) + int(ms)/1000
    for b in blocks:
        lines = [l for l in b.splitlines() if l.strip()]
        if len(lines) < 2:
            continue
        tm = re.search(r"(\d+:\d+:\d+[.,]\d+)\s*-->\s*(\d+:\d+:\d+[.,]\d+)", b)
        if not tm:
            continue
        start, end = ts(tm.group(1)), ts(tm.group(2))
        text = " ".join(lines[2:]) if re.match(r"^\d+$", lines[0]) else " ".join(lines[1:])
        toks = text.split()
        if not toks:
            continue
        step = (end - start) / len(toks)
        for i, w in enumerate(toks):
            words.append((w, start + i*step, start + (i+1)*step))
    return words

def transcribe(path):
    """Devuelve palabras con timestamps. Usa faster-whisper si hay modelo;
    si no, intenta un .srt hermano; si no hay, devuelve []."""
    srt = os.path.splitext(path)[0] + ".srt"
    try:
        from faster_whisper import WhisperModel
        model = WhisperModel(os.environ.get("WHISPER_MODEL", "small"),
                             device="cpu", compute_type="int8")
        segments, _ = model.transcribe(path, word_timestamps=True, language="es")
        words = []
        for seg in segments:
            for w in (seg.words or []):
                words.append((w.word.strip(), w.start, w.end))
        if words:
            return words
    except Exception as e:
        sys.stderr.write(f"[transcribir] modelo no disponible ({e.__class__.__name__}); "
                         f"busco {os.path.basename(srt)}\n")
    if os.path.exists(srt):
        return parse_srt(srt)
    return []

def cmd_transcribir(args):
    words = transcribe(args.input)
    if not words:
        print("No pude transcribir (sin modelo ni .srt). Ver notas en README.")
        return 1
    out = os.path.splitext(args.input)[0] + ".srt"
    write_srt(words, out)
    print(f"SRT generado: {out}  ({len(words)} palabras)")
    return 0

def write_srt(words, path, per=4):
    def fmt(t):
        h = int(t//3600); m = int((t%3600)//60); s = t%60
        return f"{h:02d}:{m:02d}:{s:06.3f}".replace(".", ",")
    lines, idx = [], 1
    for i in range(0, len(words), per):
        grp = words[i:i+per]
        lines.append(str(idx))
        lines.append(f"{fmt(grp[0][1])} --> {fmt(grp[-1][2])}")
        lines.append(" ".join(w[0] for w in grp))
        lines.append("")
        idx += 1
    open(path, "w", encoding="utf-8").write("\n".join(lines))

# --------------------------------------------------------------------------
# MICROCORTE  — saca silencios (jump cuts) con silencedetect
# --------------------------------------------------------------------------
def detect_silences(path, noise_db, min_dur):
    r = run([FF, "-i", path, "-af",
             f"silencedetect=noise={noise_db}dB:d={min_dur}", "-f", "null", "-"])
    sil = []
    start = None
    for m in re.finditer(r"silence_(start|end):\s*([0-9.]+)", r.stderr):
        if m.group(1) == "start":
            start = float(m.group(2))
        elif start is not None:
            sil.append((start, float(m.group(2))))
            start = None
    return sil

def keep_segments(total, silences, margin):
    """Complemento de los silencios = tramos hablados a conservar."""
    keep, cur = [], 0.0
    for s, e in silences:
        a = max(cur, 0.0)
        b = max(s + margin, a)
        if b - a > 0.05:
            keep.append((a, min(b, total)))
        cur = max(cur, e - margin)
    if total - cur > 0.05:
        keep.append((cur, total))
    return keep

def cmd_microcorte(args, cfg=None):
    style = (cfg or load_cfg()[0])
    mc = style["microcorte"]
    total = duration(args.input)
    sil = detect_silences(args.input, mc["umbral_silencio_db"], mc["duracion_min_silencio"])
    keep = keep_segments(total, sil, mc["margen"])
    out = args.output or default_out(args.input, "microcorte")
    if not keep:
        print("No se detectaron silencios; copio el video tal cual.")
        run([FF, "-y", "-i", args.input, "-c", "copy", out])
        return out
    # filter_complex: trim de cada segmento + concat
    parts, vlab, alab = [], [], []
    for i, (a, b) in enumerate(keep):
        parts.append(f"[0:v]trim={a}:{b},setpts=PTS-STARTPTS[v{i}];")
        parts.append(f"[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS[a{i}];")
        vlab.append(f"[v{i}]"); alab.append(f"[a{i}]")
    fc = "".join(parts) + "".join(v+a for v, a in zip(vlab, alab))
    fc += f"concat=n={len(keep)}:v=1:a=1[v][a]"
    cmd = [FF, "-y", "-i", args.input, "-filter_complex", fc,
           "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-preset", "veryfast",
           "-crf", "20", "-c:a", "aac", out]
    r = run(cmd)
    if r.returncode != 0:
        sys.stderr.write(r.stderr[-1500:]); raise SystemExit("microcorte fallo")
    kept = sum(b-a for a, b in keep)
    print(f"Microcorte OK: {total:.1f}s -> {kept:.1f}s "
          f"(saque {total-kept:.1f}s en {len(sil)} silencios) -> {out}")
    return out

# --------------------------------------------------------------------------
# SUBTITULOS  — genera un .ass con tu tipografia/estilo y lo quema
# --------------------------------------------------------------------------
def hex_to_ass(h):
    """#RRGGBB -> &HAABBGGRR (ASS usa BGR). Devuelve opaco."""
    h = h.lstrip("#")
    r, g, b = h[0:2], h[2:4], h[4:6]
    return f"&H00{b}{g}{r}".upper()

def build_ass(words, style, size_ref_h=1920):
    sub = style["subtitulos"]
    W = style["formato"]["ancho"]; H = style["formato"]["alto"]
    font = sub["fuente"]
    size = int(sub["tamano"] * H / size_ref_h)
    primary = hex_to_ass(sub["color_texto"])
    highlight = hex_to_ass(sub["color_resaltado"])
    outline = hex_to_ass(sub["color_borde"])
    marginv = int(H * (100 - sub["posicion_vertical"]) / 100)
    per = sub["max_palabras_linea"]
    up = sub.get("mayusculas", False)
    header = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 2

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Def,{font},{size},{primary},{primary},{outline},&H00000000,1,0,0,0,100,100,0,0,1,{sub['grosor_borde']},{sub['sombra']},2,60,60,{marginv},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    def t(x):
        h = int(x//3600); m = int((x%3600)//60); s = x%60
        return f"{h:d}:{m:02d}:{s:05.2f}"
    events = []
    for i in range(0, len(words), per):
        grp = words[i:i+per]
        start, end = grp[0][1], grp[-1][2]
        if sub["estilo"] == "karaoke":
            # resalta palabra por palabra con \k y color activo
            txt = ""
            for w, ws, we in grp:
                dur_cs = max(1, int((we - ws) * 100))
                word = w.upper() if up else w
                txt += (r"{\k" + str(dur_cs) +
                        r"\1c" + highlight + r"}" + word + r"{\1c" + primary + r"} ")
            txt = txt.strip()
        else:
            joined = " ".join(w for w, _, _ in grp)
            txt = joined.upper() if up else joined
        events.append(f"Dialogue: 0,{t(start)},{t(end)},Def,,0,0,0,,{txt}")
    return header + "\n".join(events) + "\n"

def cmd_subtitulos(args, cfg=None, src=None):
    style = (cfg or load_cfg()[0])
    src = src or args.input
    words = transcribe(src)
    out = args.output or default_out(src, "sub")
    if not words:
        print("Sin transcripcion: no puedo poner subtitulos. Genera un .srt primero.")
        return src
    ass_path = os.path.splitext(out)[0] + ".ass"
    open(ass_path, "w", encoding="utf-8").write(build_ass(words, style))
    vf = f"subtitles={shell_escape(ass_path)}:fontsdir={shell_escape(FONTS)}"
    r = run([FF, "-y", "-i", src, "-vf", vf,
             "-c:v", "libx264", "-preset", "veryfast", "-crf", "20",
             "-c:a", "copy", out])
    if r.returncode != 0:
        sys.stderr.write(r.stderr[-1500:]); raise SystemExit("subtitulos fallo")
    print(f"Subtitulos OK -> {out}")
    return out

def shell_escape(p):
    return p.replace("\\", "\\\\").replace(":", "\\:").replace("'", "\\'")

# --------------------------------------------------------------------------
# B-ROLL  — inserta imagen/clip cuando se dice una palabra clave
# --------------------------------------------------------------------------
def find_broll_hits(words, keywords):
    hits = []
    kmap = {norm(k): v for k, v in keywords.items()}
    joined = [(norm(w), s, e) for w, s, e in words]
    for i, (w, s, e) in enumerate(joined):
        if w in kmap:
            hits.append((w, s, e, kmap[w]))
        # frases de 2 palabras
        if i+1 < len(joined):
            two = w + " " + joined[i+1][0]
            if two in kmap:
                hits.append((two, s, joined[i+1][2], kmap[two]))
    return hits

def cmd_broll(args, cfg=None, src=None):
    style, keywords = (cfg or load_cfg())
    src = src or args.input
    words = transcribe(src)
    out = args.output or default_out(src, "broll")
    hits = find_broll_hits(words, keywords) if words else []
    if not hits:
        print("Sin coincidencias de palabras clave (o sin transcripcion). Copio igual.")
        run([FF, "-y", "-i", src, "-c", "copy", out]); return out
    bcfg = style["broll"]; W = style["formato"]["ancho"]
    inputs = ["-i", src]; filt = []; last = "0:v"
    for idx, (word, s, e, meta) in enumerate(hits):
        f = meta.get("archivo")
        path = f if os.path.isabs(f) else os.path.join(ROOT, f)
        if not os.path.exists(path):
            sys.stderr.write(f"[broll] falta {path}, salto '{word}'\n"); continue
        dur = float(meta.get("duracion", bcfg["duracion_default"]))
        modo = meta.get("modo", bcfg["modo"])
        es_video = os.path.splitext(path)[1].lower() in (
            ".mp4", ".mov", ".webm", ".mkv", ".avi", ".m4v")
        n = (idx+1)
        if es_video:
            # clip real: se reproduce durante la ventana (audio del b-roll se descarta)
            inputs += ["-i", path]
            prep = f"trim=0:{dur:.2f},setpts=PTS-STARTPTS+{s}/TB,"
        else:
            # imagen fija: se repite el frame durante la ventana
            inputs += ["-loop", "1", "-t", f"{dur:.2f}", "-i", path]
            prep = ""
        if modo == "fullscreen":
            filt.append(f"[{n}:v]{prep}scale={W}:-1,setsar=1[b{idx}];")
            filt.append(f"[{last}][b{idx}]overlay=(W-w)/2:(H-h)/2:"
                        f"enable='between(t,{s},{s+dur})'[v{idx}];")
        else:
            bw = int(W * bcfg["ancho_pct"]/100)
            filt.append(f"[{n}:v]{prep}scale={bw}:-1,setsar=1[b{idx}];")
            filt.append(f"[{last}][b{idx}]overlay=(W-w)/2:H*0.08:"
                        f"enable='between(t,{s},{s+dur})'[v{idx}];")
        last = f"v{idx}"
    if not filt:
        run([FF, "-y", "-i", src, "-c", "copy", out]); return out
    fc = "".join(filt).rstrip(";")
    cmd = [FF, "-y"] + inputs + ["-filter_complex", fc, "-map", f"[{last}]",
           "-map", "0:a?", "-c:v", "libx264", "-preset", "veryfast", "-crf", "20",
           "-c:a", "copy", out]
    r = run(cmd)
    if r.returncode != 0:
        sys.stderr.write(r.stderr[-1500:]); raise SystemExit("broll fallo")
    print(f"B-roll OK: {len(hits)} insertos ({', '.join(h[0] for h in hits)}) -> {out}")
    return out

# --------------------------------------------------------------------------
# VERTICAL 9:16  y  LOGO
# --------------------------------------------------------------------------
def cmd_vertical(args, cfg=None, src=None):
    style = (cfg or load_cfg()[0]); src = src or args.input
    W = style["formato"]["ancho"]; H = style["formato"]["alto"]
    out = args.output or default_out(src, "vertical")
    vf = (f"scale={W}:{H}:force_original_aspect_ratio=increase,"
          f"crop={W}:{H},setsar=1")
    r = run([FF, "-y", "-i", src, "-vf", vf, "-c:v", "libx264",
             "-preset", "veryfast", "-crf", "20", "-c:a", "copy", out])
    if r.returncode != 0:
        sys.stderr.write(r.stderr[-1500:]); raise SystemExit("vertical fallo")
    print(f"Vertical 9:16 OK -> {out}")
    return out

def add_logo(src, style, out):
    lg = style["logo"]
    path = lg["archivo"] if os.path.isabs(lg["archivo"]) else os.path.join(ROOT, lg["archivo"])
    if not os.path.exists(path):
        sys.stderr.write(f"[logo] no encuentro {path}, salto\n"); return src
    W = style["formato"]["ancho"]
    lw = int(W * lg["ancho_pct"]/100); m = int(W * lg["margen_pct"]/100)
    pos = {"arriba-izquierda": f"{m}:{m}", "arriba-derecha": f"W-w-{m}:{m}",
           "abajo-izquierda": f"{m}:H-h-{m}", "abajo-derecha": f"W-w-{m}:H-h-{m}"}[lg["posicion"]]
    fc = (f"[1:v]scale={lw}:-1,format=rgba,colorchannelmixer=aa={lg['opacidad']}[lg];"
          f"[0:v][lg]overlay={pos}[v]")
    r = run([FF, "-y", "-i", src, "-i", path, "-filter_complex", fc,
             "-map", "[v]", "-map", "0:a?", "-c:v", "libx264", "-preset", "veryfast",
             "-crf", "20", "-c:a", "copy", out])
    if r.returncode != 0:
        sys.stderr.write(r.stderr[-1500:]); return src
    print(f"Logo OK -> {out}")
    return out

# --------------------------------------------------------------------------
# PIPELINE COMPLETO
# --------------------------------------------------------------------------
def default_out(inp, tag):
    base = os.path.splitext(os.path.basename(inp))[0]
    d = os.path.join(ROOT, "output")
    os.makedirs(d, exist_ok=True)
    return os.path.join(d, f"{base}__{tag}.mp4")

def cmd_editar(args):
    style, keywords = load_cfg()
    cfg = (style, keywords)
    cur = args.input
    class A:  # mini-args para reusar los comandos
        pass
    def step(fn, src, **extra):
        a = A(); a.input = src; a.output = None
        for k, v in extra.items(): setattr(a, k, v)
        return fn(a, **({"cfg": cfg} if fn is cmd_broll else {"cfg": style}), src=src) \
               if fn is not cmd_microcorte else fn(a, cfg=style)
    # 1) microcorte
    if style["microcorte"]["activado"]:
        a = A(); a.input = cur; a.output = None
        cur = cmd_microcorte(a, cfg=style)
    # 2) vertical
    if style["formato"]["aspecto"] == "9:16":
        a = A(); a.input = cur; a.output = None
        cur = cmd_vertical(a, cfg=style, src=cur)
    # 3) b-roll
    if style["broll"]["activado"]:
        a = A(); a.input = cur; a.output = None
        cur = cmd_broll(a, cfg=cfg, src=cur)
    # 4) subtitulos
    if style["subtitulos"]["activados"]:
        a = A(); a.input = cur; a.output = None
        cur = cmd_subtitulos(a, cfg=style, src=cur)
    # 5) logo
    if style["logo"]["activado"]:
        out = default_out(args.input, "final")
        cur = add_logo(cur, style, out)
    # salida final
    final = default_out(args.input, "FINAL")
    if cur != final:
        run([FF, "-y", "-i", cur, "-c", "copy", final])
    print(f"\n==> VIDEO FINAL: {final}")
    return 0

# --------------------------------------------------------------------------
def main():
    p = argparse.ArgumentParser(description="WEDIT — editor de video WARNES")
    sub = p.add_subparsers(dest="cmd", required=True)
    for name in ["microcorte", "subtitulos", "broll", "vertical", "editar", "transcribir"]:
        sp = sub.add_parser(name)
        sp.add_argument("input")
        sp.add_argument("-o", "--output", default=None)
        sp.add_argument("--srt", default=None)
    a = p.parse_args()
    fns = {"microcorte": lambda: cmd_microcorte(a),
           "subtitulos": lambda: cmd_subtitulos(a),
           "broll": lambda: cmd_broll(a),
           "vertical": lambda: cmd_vertical(a),
           "editar": lambda: cmd_editar(a),
           "transcribir": lambda: cmd_transcribir(a)}
    sys.exit(fns[a.cmd]() or 0)

if __name__ == "__main__":
    main()
