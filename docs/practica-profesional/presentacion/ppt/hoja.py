import sys, glob, os
from PIL import Image
nombres = sys.argv[2:]
out = sys.argv[1]
ims = [Image.open("img/%s.png" % n).convert("RGB") for n in nombres]
w = 1000
ims = [i.resize((w, int(i.height * w / i.width))) for i in ims]
cols = 2
rows = (len(ims) + 1) // 2
h = max(i.height for i in ims)
hoja = Image.new("RGB", (cols * w + 10, rows * h + 10 * (rows - 1)), (40, 40, 40))
for k, i in enumerate(ims):
    hoja.paste(i, ((k % cols) * (w + 10), (k // cols) * (h + 10)))
hoja.save(out)
