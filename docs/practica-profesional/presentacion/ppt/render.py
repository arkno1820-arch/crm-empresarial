import os, subprocess, sys, importlib
sys.path.insert(0, os.path.dirname(__file__))
AQUI = os.path.dirname(os.path.abspath(__file__))
EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

def render(nombres=None):
    todos = {}
    for mod in ("infografias1", "infografias2", "infografias3", "infografias4"):
        try:
            m = importlib.import_module(mod)
            todos.update(getattr(m, "INFOGRAFIAS_" + mod[-1]))
        except ModuleNotFoundError:
            pass
    for nombre, fn in todos.items():
        if nombres and nombre not in nombres:
            continue
        svg = os.path.join(AQUI, "svg", nombre + ".svg")
        png = os.path.join(AQUI, "img", nombre + ".png")
        with open(svg, "w", encoding="utf-8", newline="\n") as f:
            f.write(fn())
        subprocess.run([EDGE, "--headless", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1.5",
                        "--window-size=1860,800", "--screenshot=" + png, "file:///" + svg.replace("\\", "/")],
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=120)
        print("ok", nombre, os.path.getsize(png) // 1024, "KB")

if __name__ == "__main__":
    render(sys.argv[1:] or None)
